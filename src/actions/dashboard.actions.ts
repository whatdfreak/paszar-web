"use server";

// ============================================================
// PASzar — Dashboard Search Server Action
// ============================================================
// Mencari produk dan pesanan langsung dari PostgreSQL via Prisma.
// Dilindungi session check (A3) dan validasi Zod (A4).
// ============================================================

import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

const searchSchema = z.object({
  query: z.string().trim().min(1).max(100),
});

export interface SearchProductHit {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  isActive: boolean;
  categoryName: string;
}

export interface SearchOrderHit {
  id: string;
  orderCode: string;
  customerName: string;
  customerCity: string;
  totalAmount: number;
  status: OrderStatus;
}

export interface DashboardSearchResult {
  products: SearchProductHit[];
  orders: SearchOrderHit[];
}

export async function searchDashboard(
  rawQuery: string
): Promise<DashboardSearchResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const parsed = searchSchema.safeParse({ query: rawQuery });
  if (!parsed.success) {
    return { products: [], orders: [] };
  }

  const q = parsed.data.query;

  const [products, orders] = await Promise.all([
    prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { category: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
      take: 5,
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        image: true,
        isActive: true,
        category: { select: { name: true } },
      },
    }),

    prisma.order.findMany({
      where: {
        OR: [
          { orderCode: { contains: q, mode: "insensitive" } },
          { customerName: { contains: q, mode: "insensitive" } },
          { customerCity: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderCode: true,
        customerName: true,
        customerCity: true,
        totalAmount: true,
        status: true,
      },
    }),
  ]);

  return {
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      image: p.image,
      isActive: p.isActive,
      categoryName: p.category.name,
    })),
    orders,
  };
}
