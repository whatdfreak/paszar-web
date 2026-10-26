// ============================================================
// PASzar — Admin: Halaman Kelola Kategori (Server Component)
// ============================================================
// Route: /dashboard/kategori
// PRD Ref: Section 4.3 — Kelola Kategori
//   - CRUD kategori (Nama, Slug, Deskripsi, Urutan)
//   - Tampil jumlah produk per kategori
//   - Auth guard handled by middleware.ts
// ============================================================

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import CategoryManagerClient from "@/components/admin/CategoryManagerClient";

export const metadata: Metadata = {
  title: "Kelola Kategori — PASzar Admin",
};

// Always fresh — admin data must not be stale
export const dynamic = "force-dynamic";

async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      sortOrder: true,
      _count: {
        select: { products: true },
      },
    },
  });
}

export default async function KategoriPage() {
  const categories = await getAllCategories();

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <CategoryManagerClient initialCategories={categories} />
    </div>
  );
}
