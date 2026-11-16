// ============================================================
// PASzar — Admin: Halaman Daftar Produk (Server Component)
// ============================================================
// Route: /dashboard/produk
// Fetches all products + real sales metrics from DB, renders ProductTableClient.
// ============================================================

import type { Metadata } from "next";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import ProductTableClient, {
  type ProductRow,
} from "@/components/admin/ProductTableClient";

export const metadata: Metadata = {
  title: "Kelola Produk — PASzar Admin",
};

export const dynamic = "force-dynamic";

const REVENUE_STATUSES: OrderStatus[] = [
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.COMPLETED,
];

export default async function ProdukPage() {
  const [productsRaw, categories, salesGroups] = await Promise.all([
    prisma.product.findMany({
      take: 200,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        stock: true,
        isActive: true,
        image: true,
        categoryId: true,
        createdAt: true,
        category: { select: { name: true } },
      },
    }),

    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),

    prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: { status: { in: REVENUE_STATUSES } },
      },
      _sum: {
        quantity: true,
        subtotal: true,
      },
    }),
  ]);

  const salesMap = new Map(
    salesGroups.map((g) => [
      g.productId,
      {
        sold: g._sum.quantity ?? 0,
        revenue: g._sum.subtotal ?? 0,
      },
    ])
  );

  const products: ProductRow[] = productsRaw.map((p) => {
    const metrics = salesMap.get(p.id) ?? { sold: 0, revenue: 0 };
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      stock: p.stock,
      isActive: p.isActive,
      image: p.image,
      categoryId: p.categoryId,
      category: p.category,
      sold: metrics.sold,
      revenue: metrics.revenue,
      createdAt: p.createdAt.toISOString(),
    };
  });

  return <ProductTableClient initialProducts={products} categories={categories} />;
}
