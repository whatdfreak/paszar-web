// ============================================================
// PASzar — Admin: Halaman Edit Produk
// ============================================================
// Route: /dashboard/produk/[id]
// Fetches existing product + all categories, renders form
// in edit mode (ProductFormClient with product prop).
// ============================================================

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductFormClient from "@/components/admin/ProductFormClient";

export const metadata: Metadata = {
  title: "Edit Produk — PASzar Admin",
};

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      story: true,
      price: true,
      stock: true,
      image: true,
      isActive: true,
      categoryId: true,
    },
  });
}

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });
}

export default async function EditProdukPage({ params }: Props) {
  const { id } = await params;

  // Detect "baru" special route — handled by baru/page.tsx
  if (id === "baru") return null;

  const [product, categories] = await Promise.all([
    getProductById(id),
    getCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="p-6 md:p-8">
      <ProductFormClient categories={categories} product={product} />
    </div>
  );
}
