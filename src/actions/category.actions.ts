"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@/validations/category.schema";

const cuidSchema = z.string().cuid("ID tidak valid.");

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

const PATHS = [
  "/dashboard",
  "/dashboard/produk",
  "/dashboard/kategori",
  "/katalog",
];
function revalidateAll() {
  PATHS.forEach((p) => revalidatePath(p));
}

/**
 * Menjaga agar sortOrder seluruh kategori selalu berurutan rapat 1..N
 * tanpa celah (misal 2, 3, 4) dan tanpa duplikat (misal 3, 3).
 */
async function resequenceCategories(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  movedId?: string,
  targetOrder?: number
): Promise<Map<string, number>> {
  const all = await tx.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, sortOrder: true },
  });

  const orderedIds = all.map((c) => c.id);

  if (movedId && targetOrder !== undefined) {
    const filtered = orderedIds.filter((id) => id !== movedId);
    const clampedIndex = Math.max(
      0,
      Math.min(targetOrder - 1, filtered.length)
    );
    filtered.splice(clampedIndex, 0, movedId);

    const orderMap = new Map<string, number>();
    for (let i = 0; i < filtered.length; i++) {
      const id = filtered[i];
      const newOrder = i + 1;
      orderMap.set(id, newOrder);
      await tx.category.update({
        where: { id },
        data: { sortOrder: newOrder },
      });
    }
    return orderMap;
  }

  const orderMap = new Map<string, number>();
  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i];
    const newOrder = i + 1;
    orderMap.set(id, newOrder);
    if (all[i].sortOrder !== newOrder) {
      await tx.category.update({
        where: { id },
        data: { sortOrder: newOrder },
      });
    }
  }
  return orderMap;
}

// ── Create Category ───────────────────────────────────────────

export async function createCategory(
  input: CreateCategoryInput
): Promise<
  ActionResult<{ id: string; name: string; slug: string; sortOrder: number }>
> {
  try {
    await requireSession();

    const parsed = CreateCategorySchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { name, description, sortOrder } = parsed.data;
    const slug = toSlug(name);

    if (!slug) {
      return {
        success: false,
        error: "Nama kategori harus mengandung huruf atau angka yang valid.",
      };
    }

    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          { slug },
          { name: { equals: name, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });
    if (existing) {
      return {
        success: false,
        error: `Kategori "${name}" sudah terdaftar.`,
      };
    }

    const created = await prisma.$transaction(async (tx) => {
      const cat = await tx.category.create({
        data: { name, slug, description: description || null, sortOrder },
        select: { id: true, name: true, slug: true },
      });

      const orderMap = await resequenceCategories(tx, cat.id, sortOrder);
      return {
        ...cat,
        sortOrder: orderMap.get(cat.id) ?? 1,
      };
    });

    revalidateAll();
    return { success: true, data: created };
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
): Promise<
  ActionResult<{ id: string; name: string; slug: string; sortOrder: number }>
> {
  try {
    await requireSession();

    const parsed = UpdateCategorySchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { id, name, description, sortOrder } = parsed.data;

    const existingCat = await prisma.category.findUnique({
      where: { id },
      select: { id: true, sortOrder: true },
    });
    if (!existingCat) {
      return { success: false, error: "Kategori tidak ditemukan." };
    }

    const updateData: {
      name?: string;
      slug?: string;
      description?: string | null;
    } = {};

    if (description !== undefined) {
      updateData.description = description || null;
    }

    if (name) {
      const slug = toSlug(name);
      if (!slug) {
        return {
          success: false,
          error: "Nama kategori harus mengandung huruf atau angka yang valid.",
        };
      }
      const conflict = await prisma.category.findFirst({
        where: {
          NOT: { id },
          OR: [
            { slug },
            { name: { equals: name, mode: "insensitive" } },
          ],
        },
        select: { id: true },
      });
      if (conflict) {
        return {
          success: false,
          error: `Nama kategori "${name}" sudah digunakan kategori lain.`,
        };
      }
      updateData.name = name;
      updateData.slug = slug;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const cat = await tx.category.update({
        where: { id },
        data: updateData,
        select: { id: true, name: true, slug: true, sortOrder: true },
      });

      const orderMap = await resequenceCategories(
        tx,
        sortOrder !== undefined ? id : undefined,
        sortOrder
      );

      return {
        ...cat,
        sortOrder: orderMap.get(cat.id) ?? cat.sortOrder,
      };
    });

    revalidateAll();
    return { success: true, data: updated };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Unauthorized: Silakan login kembali." };
    }
    console.error("[updateCategory]", err);
    return {
      success: false,
      error: "Terjadi kesalahan saat memperbarui kategori.",
    };
  }
}

// ── Delete Category ───────────────────────────────────────────

export async function deleteCategory(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSession();

    const idParsed = cuidSchema.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: "ID kategori tidak valid." };
    }

    const productCount = await prisma.product.count({
      where: { categoryId: idParsed.data },
    });
    if (productCount > 0) {
      return {
        success: false,
        error: `Tidak dapat dihapus: kategori ini masih memiliki ${productCount} produk.`,
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.category.delete({ where: { id: idParsed.data } });
      await resequenceCategories(tx);
    });

    revalidateAll();
    return { success: true, data: { id: idParsed.data } };
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
        error:
          "Tidak dapat dihapus: masih ada produk di dalam kategori ini. Pindahkan atau hapus produk tersebut terlebih dahulu.",
      };
    }
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      return { success: false, error: "Kategori tidak ditemukan." };
    }
    console.error("[deleteCategory]", err);
    return {
      success: false,
      error: "Terjadi kesalahan saat menghapus kategori.",
    };
  }
}
