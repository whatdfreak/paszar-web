"use server";

// ============================================================
// PASzar — Product Server Actions
// ============================================================
// AUDIT v2 — Backend Hardening:
//   ✅ Session guard pada SETIAP action (requireSession)
//   ✅ Zod validation pada create & update
//   ✅ deleteProduct: Pre-flight check riwayat pesanan
//      → Jika produk pernah dibeli: SOFT-DELETE (isActive: false)
//        untuk menjaga integritas data OrderItem historis
//      → Jika belum pernah dibeli: HARD-DELETE aman
//   ✅ Revalidate paths mencakup semua halaman relevan
//   ✅ Slug collision handling pada create & update
// ============================================================

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  CreateProductSchema,
  UpdateProductSchema,
  type CreateProductInput,
  type UpdateProductInput,
} from "@/validations/product.schema";

// CUID validator — digunakan untuk semua ID parameter
const cuidSchema = z.string().cuid("ID tidak valid.");

// ── Helpers ───────────────────────────────────────────────────

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  return session;
}

// Revalidate semua halaman yang menampilkan data produk
const PRODUCT_PATHS = [
  "/dashboard",
  "/dashboard/produk",
  "/katalog",
];

function revalidateProductPaths() {
  PRODUCT_PATHS.forEach((p) => revalidatePath(p));
}

// ── Create Product ────────────────────────────────────────────

export async function createProduct(
  input: CreateProductInput
): Promise<ActionResult<{ id: string; name: string; slug: string }>> {
  try {
    await requireSession();

    const parsed = CreateProductSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { name, description, story, price, stock, categoryId, image, isActive } =
      parsed.data;

    // Slug collision resolution: tambahkan timestamp suffix jika clash
    let slug = toSlug(name);
    const clash = await prisma.product.findUnique({ where: { slug } });
    if (clash) slug = `${slug}-${Date.now()}`;

    const product = await prisma.product.create({
      data: { name, slug, description, story, price, stock, categoryId, image, isActive },
      select: { id: true, name: true, slug: true },
    });

    revalidateProductPaths();
    return { success: true, data: product };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Unauthorized: Silakan login kembali." };
    }
    console.error("[createProduct]", err);
    return { success: false, error: "Terjadi kesalahan saat membuat produk." };
  }
}

// ── Update Product ────────────────────────────────────────────

export async function updateProduct(
  input: UpdateProductInput
): Promise<ActionResult<{ id: string; name: string; slug: string }>> {
  try {
    await requireSession();

    const parsed = UpdateProductSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { id, name, ...rest } = parsed.data;

    const updateData: Record<string, unknown> = { ...rest };

    if (name) {
      let slug = toSlug(name);
      const clash = await prisma.product.findFirst({
        where: { slug, NOT: { id } },
      });
      if (clash) slug = `${slug}-${Date.now()}`;
      updateData.name = name;
      updateData.slug = slug;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, slug: true },
    });

    revalidateProductPaths();
    return { success: true, data: product };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Unauthorized: Silakan login kembali." };
    }
    // Produk tidak ditemukan (P2025)
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      return { success: false, error: "Produk tidak ditemukan." };
    }
    console.error("[updateProduct]", err);
    return { success: false, error: "Terjadi kesalahan saat memperbarui produk." };
  }
}

// ── Delete Product ────────────────────────────────────────────
//
// INTEGRITAS DATA — Strategi "Smart Delete":
//
// Produk yang sudah pernah dibeli memiliki relasi ke OrderItem.
// Skema menggunakan onDelete: Restrict pada relasi Product → OrderItem,
// artinya hard-delete akan gagal (P2003) untuk produk yang sudah dipesan.
//
// Strategi yang diterapkan:
//   1. Pre-flight: Cek apakah produk memiliki riwayat pesanan.
//   2. Ada riwayat → SOFT-DELETE: set isActive: false.
//      → Data pesanan historis tetap utuh.
//      → Produk tidak lagi tampil di katalog publik.
//      → Admin mendapat pesan informatif (bukan error).
//   3. Tidak ada riwayat → HARD-DELETE: hapus permanen.

export async function deleteProduct(
  id: string
): Promise<ActionResult<{ id: string; softDeleted?: boolean }>> {
  try {
    await requireSession();

    // Validasi format CUID sebelum menyentuh database
    const idParsed = cuidSchema.safeParse(id);
    if (!idParsed.success) return { success: false, error: "ID produk tidak valid." };

    // ── Pre-flight: Cek riwayat pesanan ─────────────────────────
    const orderItemCount = await prisma.orderItem.count({
      where: { productId: idParsed.data },
    });

    if (orderItemCount > 0) {
      // SOFT-DELETE: Produk pernah dibeli — jaga integritas data historis
      await prisma.product.update({
        where: { id: idParsed.data },
        data: { isActive: false },
      });

      revalidateProductPaths();
      return {
        success: true,
        data: { id: idParsed.data, softDeleted: true },
      };
    }

    // HARD-DELETE: Produk belum pernah dibeli — aman untuk dihapus
    await prisma.product.delete({ where: { id: idParsed.data } });

    revalidateProductPaths();
    return { success: true, data: { id: idParsed.data, softDeleted: false } };

  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Unauthorized: Silakan login kembali." };
    }
    // Produk tidak ditemukan (P2025)
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      return { success: false, error: "Produk tidak ditemukan." };
    }
    console.error("[deleteProduct]", err);
    return { success: false, error: "Terjadi kesalahan saat menghapus produk." };
  }
}

// ── Toggle Product Active ─────────────────────────────────────

export async function toggleProductActive(
  id: string
): Promise<ActionResult<{ id: string; isActive: boolean }>> {
  try {
    await requireSession();

    // Validasi format CUID
    const idParsed = cuidSchema.safeParse(id);
    if (!idParsed.success) return { success: false, error: "ID produk tidak valid." };


    const current = await prisma.product.findUnique({
      where: { id: idParsed.data },
      select: { isActive: true },
    });

    if (!current) return { success: false, error: "Produk tidak ditemukan." };

    const updated = await prisma.product.update({
      where: { id: idParsed.data },
      data: { isActive: !current.isActive },
      select: { id: true, isActive: true },
    });

    revalidateProductPaths();
    return { success: true, data: updated };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Unauthorized: Silakan login kembali." };
    }
    console.error("[toggleProductActive]", err);
    return { success: false, error: "Terjadi kesalahan saat mengubah status produk." };
  }
}
