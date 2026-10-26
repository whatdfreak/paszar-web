// ============================================================
// PASzar — Admin: Halaman Pesanan Masuk (Server Component)
// ============================================================
// Route: /dashboard/pesanan
// PRD Ref: Section 4.3 — Pesanan
//   - Tabel daftar pesanan (kode, nama, total, status, tgl)
//   - Filter berdasarkan status (via client tabs)
//   - Detail pesanan + ubah status → OrdersManagerClient
// Auth guard: middleware.ts (/dashboard/:path*)
// ============================================================

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import OrdersManagerClient, {
  type OrderRow,
} from "@/components/admin/OrdersManagerClient";

export const metadata: Metadata = {
  title: "Pesanan Masuk — PASzar Admin",
};

// Always fetch fresh — order data changes frequently
export const dynamic = "force-dynamic";

async function getAllOrders(): Promise<OrderRow[]> {
  // PERF: Batasi ke 50 pesanan terbaru untuk performa awal.
  // TODO: Implementasi cursor-based pagination untuk dataset besar.
  const orders = await prisma.order.findMany({
    take: 50,
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
  });

  // Serialize Date to ISO string for client component
  return orders.map((order) => ({
    ...order,
    status: order.status as OrderRow["status"],
    createdAt: order.createdAt.toISOString(),
  }));
}

export default async function PesananPage() {
  const orders = await getAllOrders();

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <OrdersManagerClient initialOrders={orders} />
    </div>
  );
}
