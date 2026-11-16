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
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
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

    let slug = toSlug(name);
    if (!slug) {
      return {
        success: false,
        error: "Nama produk harus mengandung huruf atau angka yang valid.",
      };
    }

    // Cek duplikasi nama produk (case-insensitive) agar tidak ada produk ganda
    const duplicateName = await prisma.product.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
      select: { id: true },
    });
    if (duplicateName) {
      return {
        success: false,
        error: `Produk dengan nama "${name}" sudah ada di katalog.`,
      };
    }

    // Pastikan kategori benar-benar ada
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });
    if (!categoryExists) {
      return {
        success: false,
        error: "Kategori yang dipilih tidak ditemukan.",
      };
    }

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

    const { id, name, categoryId, ...rest } = parsed.data;

    const updateData: Record<string, unknown> = { ...rest };

    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { id: true },
      });
      if (!categoryExists) {
        return {
          success: false,
          error: "Kategori yang dipilih tidak ditemukan.",
        };
      }
      updateData.categoryId = categoryId;
    }

    if (name) {
      let slug = toSlug(name);
      if (!slug) {
        return {
          success: false,
          error: "Nama produk harus mengandung huruf atau angka yang valid.",
        };
      }
      const duplicateName = await prisma.product.findFirst({
        where: {
          NOT: { id },
          name: { equals: name, mode: "insensitive" },
        },
        select: { id: true },
      });
      if (duplicateName) {
        return {
          success: false,
          error: `Produk dengan nama "${name}" sudah digunakan produk lain.`,
        };
      }
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

// ── Upload Product Image ──────────────────────────────────────

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB (sesuai aturan keamanan S3)
const ALLOWED_MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function hasValidImageMagicBytes(buf: Buffer, mime: string): boolean {
  if (buf.length < 12) return false;
  if (mime === "image/jpeg") {
    return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  }
  if (mime === "image/png") {
    return (
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47
    );
  }
  if (mime === "image/webp") {
    const riff = buf.subarray(0, 4).toString("ascii");
    const webp = buf.subarray(8, 12).toString("ascii");
    return riff === "RIFF" && webp === "WEBP";
  }
  return false;
}

export async function uploadProductImage(
  formData: FormData
): Promise<ActionResult<{ url: string; sizeBytes: number }>> {
  try {
    await requireSession();

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { success: false, error: "File gambar tidak ditemukan." };
    }

    const ext = ALLOWED_MIME_EXT[file.type];
    if (!ext) {
      return {
        success: false,
        error: "Format gambar harus JPG, PNG, atau WebP.",
      };
    }

    if (file.size === 0) {
      return { success: false, error: "File gambar kosong." };
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return {
        success: false,
        error: "Ukuran gambar maksimal 2 MB.",
      };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!hasValidImageMagicBytes(buffer, file.type)) {
      return {
        success: false,
        error: "Isi file tidak valid atau bukan gambar yang diizinkan.",
      };
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(uploadDir, { recursive: true });

    const filename = `${crypto.randomUUID()}.${ext}`;
    await writeFile(path.join(uploadDir, filename), buffer);

    return {
      success: true,
      data: {
        url: `/uploads/products/${filename}`,
        sizeBytes: buffer.byteLength,
      },
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Unauthorized: Silakan login kembali." };
    }
    console.error("[uploadProductImage]", err);
    return {
      success: false,
      error: "Gagal mengunggah gambar produk.",
    };
  }
}

// ── Bulk Actions (Multi-Select) ───────────────────────────────

const bulkIdsSchema = z.array(cuidSchema).min(1, "Pilih minimal 1 produk.").max(100);

export async function bulkSetProductActive(
  ids: string[],
  isActive: boolean
): Promise<ActionResult<{ count: number }>> {
  try {
    await requireSession();
    const parsed = bulkIdsSchema.safeParse(ids);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const res = await prisma.product.updateMany({
      where: { id: { in: parsed.data } },
      data: { isActive },
    });

    revalidateProductPaths();
    return { success: true, data: { count: res.count } };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Unauthorized: Silakan login kembali." };
    }
    console.error("[bulkSetProductActive]", err);
    return { success: false, error: "Gagal memperbarui status produk terpilih." };
  }
}

export async function bulkDeleteProducts(
  ids: string[]
): Promise<ActionResult<{ deleted: number; softDeleted: number }>> {
  try {
    await requireSession();
    const parsed = bulkIdsSchema.safeParse(ids);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const orderedItems = await prisma.orderItem.findMany({
      where: { productId: { in: parsed.data } },
      select: { productId: true },
      distinct: ["productId"],
    });

    const orderedSet = new Set(orderedItems.map((i) => i.productId));
    const toSoftDelete = parsed.data.filter((id) => orderedSet.has(id));
    const toHardDelete = parsed.data.filter((id) => !orderedSet.has(id));

    let softDeleted = 0;
    let deleted = 0;

    if (toSoftDelete.length > 0) {
      const res = await prisma.product.updateMany({
        where: { id: { in: toSoftDelete } },
        data: { isActive: false },
      });
      softDeleted = res.count;
    }

    if (toHardDelete.length > 0) {
      const res = await prisma.product.deleteMany({
        where: { id: { in: toHardDelete } },
      });
      deleted = res.count;
    }

    revalidateProductPaths();
    return { success: true, data: { deleted, softDeleted } };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Unauthorized: Silakan login kembali." };
    }
    console.error("[bulkDeleteProducts]", err);
    return { success: false, error: "Gagal menghapus produk terpilih." };
  }
}
