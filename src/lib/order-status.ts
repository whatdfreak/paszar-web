// ============================================================
// PASzar — Order status transition (pure DB logic, no auth)
// ============================================================
// Dipisahkan dari Server Action agar dapat diuji langsung.
// Auth guard TETAP wajib di pemanggil (order.actions.ts).
// ============================================================

import { OrderStatus, type PrismaClient } from "@prisma/client";

export class OrderBusinessError extends Error {}

// "Stock-committed" = status di mana stok sudah dipotong dari DB.
const STOCK_COMMITTED_STATUSES = new Set<OrderStatus>([
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.COMPLETED,
]);

export function isStockCommitted(status: OrderStatus): boolean {
  return STOCK_COMMITTED_STATUSES.has(status);
}

export async function applyOrderStatusTransition(
  db: PrismaClient,
  orderId: string,
  targetStatus: OrderStatus
): Promise<{ id: string; status: OrderStatus }> {
  return db.$transaction(
    async (tx) => {
      const currentOrder = await tx.order.findUnique({
        where: { id: orderId },
        select: {
          status: true,
          items: {
            select: { productId: true, quantity: true, productName: true },
          },
        },
      });

      if (!currentOrder) {
        throw new OrderBusinessError("Pesanan tidak ditemukan.");
      }

      const currentStatus = currentOrder.status;
      if (currentStatus === targetStatus) {
        return { id: orderId, status: currentStatus };
      }

      const willCommitStock =
        !isStockCommitted(currentStatus) && isStockCommitted(targetStatus);
      const willRestoreStock =
        isStockCommitted(currentStatus) && !isStockCommitted(targetStatus);

      // Compare-and-set: hanya berhasil jika status belum berubah
      const cas = await tx.order.updateMany({
        where: { id: orderId, status: currentStatus },
        data: { status: targetStatus },
      });
      if (cas.count === 0) {
        throw new OrderBusinessError(
          "Status pesanan baru saja berubah. Muat ulang halaman lalu coba lagi."
        );
      }

      if (willCommitStock) {
        for (const item of currentOrder.items) {
          const res = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (res.count === 0) {
            const product = await tx.product.findUnique({
              where: { id: item.productId },
              select: { stock: true, name: true },
            });
            if (!product) {
              throw new OrderBusinessError(
                `Produk tidak ditemukan: ${item.productName}`
              );
            }
            throw new OrderBusinessError(
              `Stok tidak mencukupi untuk "${product.name}". ` +
                `Tersedia: ${product.stock}, dibutuhkan: ${item.quantity}.`
            );
          }
        }
      }

      if (willRestoreStock) {
        for (const item of currentOrder.items) {
          await tx.product.updateMany({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return { id: orderId, status: targetStatus };
    },
    { isolationLevel: "Serializable" }
  );
}
