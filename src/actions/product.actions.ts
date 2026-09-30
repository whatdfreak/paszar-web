"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  CreateProductSchema,
  UpdateProductSchema,
  type CreateProductInput,
  type UpdateProductInput,
} from "@/validations/product.schema";

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

const PATHS = ["/dashboard/produk", "/katalog", "/kelola-produk"];
function revalidateAll() {
  PATHS.forEach((p) => revalidatePath(p));
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

    // Buat slug unik — tambahkan suffix angka jika clash.
    let slug = toSlug(name);
    const clash = await prisma.product.findUnique({ where: { slug } });
    if (clash) slug = slug + "-" + Date.now();

    const product = await prisma.product.create({
      data: { name, slug, description, story, price, stock, categoryId, image, isActive },
      select: { id: true, name: true, slug: true },
    });

    revalidateAll();
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
      if (clash) slug = slug + "-" + Date.now();
      updateData.name = name;
      updateData.slug = slug;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, slug: true },
    });

    revalidateAll();
    return { success: true, data: product };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Unauthorized: Silakan login kembali." };
    }
    console.error("[updateProduct]", err);
    return { success: false, error: "Terjadi kesalahan saat memperbarui produk." };
  }
}

// ── Delete Product ────────────────────────────────────────────

export async function deleteProduct(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSession();

    if (!id) return { success: false, error: "ID produk tidak valid." };

    await prisma.product.delete({ where: { id } });

    revalidateAll();
    return { success: true, data: { id } };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Unauthorized: Silakan login kembali." };
    }
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2003"
    ) {
      return {
        success: false,
        error: "Produk tidak dapat dihapus karena terdapat pada data pesanan.",
      };
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

    if (!id) return { success: false, error: "ID produk tidak valid." };

    const current = await prisma.product.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!current) return { success: false, error: "Produk tidak ditemukan." };

    const updated = await prisma.product.update({
      where: { id },
      data: { isActive: !current.isActive },
      select: { id: true, isActive: true },
    });

    revalidateAll();
    return { success: true, data: updated };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Unauthorized: Silakan login kembali." };
    }
    console.error("[toggleProductActive]", err);
    return { success: false, error: "Terjadi kesalahan saat mengubah status produk." };
  }
}
