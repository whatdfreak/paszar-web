// ============================================================
// PASzar — Admin: Halaman Tambah Produk Baru
// ============================================================
// Route: /dashboard/produk/baru
// Fetches categories for dropdown, renders ProductFormClient.
// ============================================================

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductFormClient from "@/components/admin/ProductFormClient";

export const metadata: Metadata = {
  title: "Tambah Produk Baru — PASzar Admin",
};

export const dynamic = "force-dynamic";

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });
}

export default async function TambahProdukPage() {
  const categories = await getCategories();
  return (
    <div className="p-6 md:p-8">
      <ProductFormClient categories={categories} />
    </div>
  );
}
