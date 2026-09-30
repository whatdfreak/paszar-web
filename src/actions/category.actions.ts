"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@/validations/category.schema";

// ── Helpers ───────────────────────────────────────────────────

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/** Membuat slug URL-friendly dari string nama. */
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

const PATHS = ["/dashboard/produk", "/dashboard/kategori", "/katalog"];
function revalidateAll() {
  PATHS.forEach((p) => revalidatePath(p));
}

// ── Create Category ───────────────────────────────────────────

export async function createCategory(
  input: CreateCategoryInput
): Promise<ActionResult<{ id: string; name: string; slug: string }>> {
  try {
    await requireSession();

    const parsed = CreateCategorySchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { name, description, sortOrder } = parsed.data;
    const slug = toSlug(name);

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return { success: false, error: `Kategori dengan nama "${name}" sudah ada.` };
    }

    const category = await prisma.category.create({
      data: { name, slug, description, sortOrder },
      select: { id: true, name: true, slug: true },
    });

    revalidateAll();
    return { success: true, data: category };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Unauthorized: Silakan login kembali." };
    }
    console.error("[createCategory]", err);
    return { success: false, error: "Terjadi kesalahan saat membuat kategori." };
  }
}

// ── Update Category ───────────────────────────────────────────

export async function updateCategory(
  input: UpdateCategoryInput
): Promise<ActionResult<{ id: string; name: string; slug: string }>> {
  try {
    await requireSession();

    const parsed = UpdateCategorySchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { id, name, description, sortOrder } = parsed.data;

    const updateData: Record<string, unknown> = {};
    if (description !== undefined) updateData.description = description;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    if (name) {
      const slug = toSlug(name);
      const conflict = await prisma.category.findFirst({
        where: { slug, NOT: { id } },
      });
      if (conflict) {
        return { success: false, error: `Nama "${name}" sudah digunakan kategori lain.` };
      }
      updateData.name = name;
      updateData.slug = slug;
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, slug: true },
    });

    revalidateAll();
    return { success: true, data: category };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Unauthorized: Silakan login kembali." };
    }
    console.error("[updateCategory]", err);
    return { success: false, error: "Terjadi kesalahan saat memperbarui kategori." };
  }
}

// ── Delete Category ───────────────────────────────────────────

export async function deleteCategory(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSession();

    if (!id) return { success: false, error: "ID kategori tidak valid." };

    // Prisma akan throw P2003 (FK constraint) jika masih ada produk.
    await prisma.category.delete({ where: { id } });

    revalidateAll();
    return { success: true, data: { id } };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Unauthorized: Silakan login kembali." };
    }
    // Prisma FK violation code
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2003"
    ) {
      return {
        success: false,
        error: "Kategori tidak bisa dihapus karena masih memiliki produk.",
      };
    }
    console.error("[deleteCategory]", err);
    return { success: false, error: "Terjadi kesalahan saat menghapus kategori." };
  }
}
