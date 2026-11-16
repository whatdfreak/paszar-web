// ============================================================
// PASzar — Dashboard Overview (Server Component)
// ============================================================
// Data 100% real-time dari PostgreSQL via Prisma (tanpa dummy data).
// Auto-refresh di client menggunakan router.refresh() agar tetap
// mematuhi arsitektur Next.js App Router (tanpa API route internal).
// ============================================================

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import Overview, {
  type DailySalesPoint,
  type TopProductItem,
  type LowStockProductItem,
  type RecentOrderItem,
  type CategorySalesItem,
  type OrderPipelineCount,
} from "./Overview";

export const dynamic = "force-dynamic";

const REVENUE_STATUSES: OrderStatus[] = [
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.COMPLETED,
];

const ACTION_NEEDED_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
];

const LOW_STOCK_THRESHOLD = 5;

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  });
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const now = new Date();
  const startOf30Days = new Date(now);
  startOf30Days.setDate(now.getDate() - 29);
  startOf30Days.setHours(0, 0, 0, 0);

  const startOf60Days = new Date(now);
  startOf60Days.setDate(now.getDate() - 59);
  startOf60Days.setHours(0, 0, 0, 0);

  const [
    productCount,
    categoryCount,
    orderCount,
    revenueAggregate,
    lowStockCount,
    lowStockProductsRaw,
    statusGroups,
    ordersLast60Days,
    topOrderItems,
    revenueOrderItems,
    recentOrdersRaw,
    actionOrdersRaw,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.category.count(),
    prisma.order.count(),

    prisma.order.aggregate({
      where: { status: { in: REVENUE_STATUSES } },
      _sum: { totalAmount: true },
      _count: { id: true },
    }),

    prisma.product.count({
      where: {
        isActive: true,
        stock: { lte: LOW_STOCK_THRESHOLD },
      },
    }),

    prisma.product.findMany({
      where: {
        isActive: true,
        stock: { lte: LOW_STOCK_THRESHOLD },
      },
      orderBy: [{ stock: "asc" }, { updatedAt: "desc" }],
      take: 5,
      select: {
        id: true,
        name: true,
        stock: true,
        price: true,
        image: true,
        category: { select: { name: true } },
      },
    }),

    prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    }),

    prisma.order.findMany({
      where: {
        createdAt: { gte: startOf60Days },
        status: { in: REVENUE_STATUSES },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
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
      orderBy: {
        _sum: { quantity: "desc" },
      },
      take: 4,
    }),

    prisma.orderItem.findMany({
      where: {
        order: { status: { in: REVENUE_STATUSES } },
      },
      select: {
        quantity: true,
        subtotal: true,
        product: {
          select: {
            category: {
              select: { name: true },
            },
          },
        },
      },
    }),

    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderCode: true,
        customerName: true,
        customerPhone: true,
        customerAddress: true,
        customerCity: true,
        customerProvince: true,
        customerPostalCode: true,
        notes: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            productName: true,
            productPrice: true,
            quantity: true,
            subtotal: true,
          },
        },
      },
    }),

    prisma.order.findMany({
      where: {
        status: {
          in: [
            OrderStatus.PENDING,
            OrderStatus.CONFIRMED,
            OrderStatus.PROCESSING,
          ],
        },
      },
      take: 5,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        orderCode: true,
        customerName: true,
        customerPhone: true,
        customerAddress: true,
        customerCity: true,
        customerProvince: true,
        customerPostalCode: true,
        notes: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            productName: true,
            productPrice: true,
            quantity: true,
            subtotal: true,
          },
        },
      },
    }),
  ]);

  // ── Top Products lookup ──────────────────────────────────────
  const topProductIds = topOrderItems.map((item) => item.productId);
  const topProductRecords =
    topProductIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: topProductIds } },
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            image: true,
            category: { select: { name: true } },
          },
        })
      : [];

  const productMap = new Map(topProductRecords.map((p) => [p.id, p]));
  const topProducts: TopProductItem[] = topOrderItems
    .map((item) => {
      const product = productMap.get(item.productId);
      if (!product) return null;
      return {
        id: product.id,
        name: product.name,
        categoryName: product.category.name,
        price: product.price,
        stock: product.stock,
        image: product.image,
        sold: item._sum.quantity ?? 0,
        revenue: item._sum.subtotal ?? 0,
      };
    })
    .filter((item): item is TopProductItem => item !== null);

  // ── Daily Sales Series (30 hari terakhir) & Period Comparison ─
  const dailyMap = new Map<string, { revenue: number; orders: number }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    dailyMap.set(toDateKey(d), { revenue: 0, orders: 0 });
  }

  let current30Revenue = 0;
  let previous30Revenue = 0;

  for (const order of ordersLast60Days) {
    if (order.createdAt >= startOf30Days) {
      current30Revenue += order.totalAmount;
      const key = toDateKey(order.createdAt);
      const existing = dailyMap.get(key);
      if (existing) {
        existing.revenue += order.totalAmount;
        existing.orders += 1;
      }
    } else {
      previous30Revenue += order.totalAmount;
    }
  }

  const dailySales30: DailySalesPoint[] = Array.from(dailyMap.entries()).map(
    ([dateKey, stats]) => {
      const [y, m, d] = dateKey.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      return {
        date: dateKey,
        label: formatShortDate(dateObj),
        revenue: stats.revenue,
        orders: stats.orders,
      };
    }
  );

  // ── Category Sales Breakdown ─────────────────────────────────
  const categoryMap = new Map<string, { revenue: number; units: number }>();
  for (const item of revenueOrderItems) {
    const catName = item.product.category.name;
    const current = categoryMap.get(catName) ?? { revenue: 0, units: 0 };
    current.revenue += item.subtotal;
    current.units += item.quantity;
    categoryMap.set(catName, current);
  }
  const categorySales: CategorySalesItem[] = Array.from(categoryMap.entries())
    .map(([name, val]) => ({
      name,
      revenue: val.revenue,
      units: val.units,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // ── Pipeline Counts ──────────────────────────────────────────
  const statusCountMap = new Map<OrderStatus, number>();
  for (const group of statusGroups) {
    statusCountMap.set(group.status, group._count.id);
  }

  const pendingOrderCount = ACTION_NEEDED_STATUSES.reduce(
    (sum, status) => sum + (statusCountMap.get(status) ?? 0),
    0
  );

  const pipelineCounts: OrderPipelineCount = {
    PENDING: statusCountMap.get(OrderStatus.PENDING) ?? 0,
    CONFIRMED: statusCountMap.get(OrderStatus.CONFIRMED) ?? 0,
    PROCESSING: statusCountMap.get(OrderStatus.PROCESSING) ?? 0,
    SHIPPED: statusCountMap.get(OrderStatus.SHIPPED) ?? 0,
    COMPLETED: statusCountMap.get(OrderStatus.COMPLETED) ?? 0,
    CANCELLED: statusCountMap.get(OrderStatus.CANCELLED) ?? 0,
  };

  // ── Serialization ────────────────────────────────────────────
  const totalRevenue = revenueAggregate._sum.totalAmount ?? 0;
  const revenueOrderCount = revenueAggregate._count.id;
  const averageOrderValue =
    revenueOrderCount > 0 ? Math.round(totalRevenue / revenueOrderCount) : 0;

  const revenueGrowthPct =
    previous30Revenue > 0
      ? Math.round(
          ((current30Revenue - previous30Revenue) / previous30Revenue) * 100
        )
      : null;

  const lowStockProducts: LowStockProductItem[] = lowStockProductsRaw.map(
    (p) => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
      price: p.price,
      image: p.image,
      categoryName: p.category.name,
    })
  );

  const recentOrders: RecentOrderItem[] = recentOrdersRaw.map((o) => ({
    id: o.id,
    orderCode: o.orderCode,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    customerAddress: o.customerAddress,
    customerCity: o.customerCity,
    customerProvince: o.customerProvince,
    customerPostalCode: o.customerPostalCode,
    notes: o.notes,
    totalAmount: o.totalAmount,
    status: o.status,
    itemCount: o.items.length,
    createdAt: o.createdAt.toISOString(),
    items: o.items,
  }));

  const actionOrders: RecentOrderItem[] = actionOrdersRaw.map((o) => ({
    id: o.id,
    orderCode: o.orderCode,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    customerAddress: o.customerAddress,
    customerCity: o.customerCity,
    customerProvince: o.customerProvince,
    customerPostalCode: o.customerPostalCode,
    notes: o.notes,
    totalAmount: o.totalAmount,
    status: o.status,
    itemCount: o.items.length,
    createdAt: o.createdAt.toISOString(),
    items: o.items,
  }));

  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Selamat Pagi" : hour < 17 ? "Selamat Siang" : "Selamat Malam";
  const adminName = session.user?.name?.split(" ")[0] ?? "Admin";

  return (
    <Overview
      greeting={greeting}
      adminName={adminName}
      lastSyncedAt={now.toISOString()}
      totalRevenue={totalRevenue}
      current30Revenue={current30Revenue}
      revenueGrowthPct={revenueGrowthPct}
      averageOrderValue={averageOrderValue}
      revenueOrderCount={revenueOrderCount}
      orderCount={orderCount}
      pendingOrderCount={pendingOrderCount}
      productCount={productCount}
      categoryCount={categoryCount}
      lowStockCount={lowStockCount}
      lowStockThreshold={LOW_STOCK_THRESHOLD}
      dailySales30={dailySales30}
      pipelineCounts={pipelineCounts}
      categorySales={categorySales}
      topProducts={topProducts}
      lowStockProducts={lowStockProducts}
      recentOrders={recentOrders}
      actionOrders={actionOrders}
    />
  );
}
