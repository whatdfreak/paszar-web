// ============================================================
// PASzar — Admin: Halaman Daftar Produk (Server Component)
// ============================================================
// Route: /dashboard/produk
// Fetches all products from DB, renders ProductTableClient.
// Auth guard handled by middleware.ts.
// ============================================================

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductTableClient from "@/components/admin/ProductTableClient";

export const metadata: Metadata = {
  title: "Kelola Produk — PASzar Admin",
};

// No caching — always fresh data for admin.
export const dynamic = "force-dynamic";

async function getAllProducts() {
  // PERF: Batasi ke 100 produk pertama.
  // TODO: Implementasi cursor-based pagination untuk dataset >100 produk.
  return prisma.product.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      stock: true,
      isActive: true,
      image: true,
      // Anti N+1: category name diambil dalam join yang sama
      category: { select: { name: true } },
    },
  });
}

export default async function ProdukPage() {
  const products = await getAllProducts();

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <ProductTableClient initialProducts={products} />
    </div>
  );
}
