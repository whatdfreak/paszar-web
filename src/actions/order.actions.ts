"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

// ── Helpers ───────────────────────────────────────────────────

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const cuidSchema = z.string().cuid();

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  return session;
}

// ── Valid statuses (Fase 1 — WhatsApp flow) ────────────────────
const VALID_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
];

// ── Inventory State Classification ────────────────────────────
//
// "Stock-committed" = status di mana stok sudah dipotong dari DB.
//
//   PENDING / CONFIRMED  → stok BELUM dipotong
//   PROCESSING           → TITIK PEMOTONGAN
//   SHIPPED / COMPLETED  → stok sudah dipotong
//   CANCELLED            → stok BELUM dipotong (atau sudah dikembalikan)
//
// Logika transisi:
//   non-committed → committed  = DECREMENT stok (+ validasi kecukupan)
//   committed → non-committed  = INCREMENT stok (pengembalian), termasuk
//                                mundur ke PENDING/CONFIRMED/CANCELLED
//   committed → committed      = hanya update status
const STOCK_COMMITTED_STATUSES = new Set<OrderStatus>([
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.COMPLETED,
]);

function isStockCommitted(status: OrderStatus): boolean {
  return STOCK_COMMITTED_STATUSES.has(status);
}

class OrderBusinessError extends Error {}

// ── Update Order Status ───────────────────────────────────────
//
// ACID-compliant via Prisma $transaction (isolation: Serializable).
// Status order dibaca ULANG di dalam transaksi dan diupdate secara
// kondisional (compare-and-set) sehingga dua request bersamaan tidak
// dapat memotong / mengembalikan stok dua kali.

export async function updateOrderStatus(
  orderId: string,
  newStatus: string
): Promise<ActionResult<{ id: string; status: OrderStatus }>> {
  try {
    await requireSession();

    const idParsed = cuidSchema.safeParse(orderId);
    if (!idParsed.success) {
      return { success: false, error: "ID pesanan tidak valid." };
    }

    if (!VALID_STATUSES.includes(newStatus as OrderStatus)) {
      return { success: false, error: "Status pesanan tidak valid." };
    }

    const targetStatus = newStatus as OrderStatus;

    const updated = await prisma.$transaction(
      async (tx) => {
        const currentOrder = await tx.order.findUnique({
          where: { id: idParsed.data },
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
          return { id: idParsed.data, status: currentStatus };
        }

        const willCommitStock =
          !isStockCommitted(currentStatus) && isStockCommitted(targetStatus);
        const willRestoreStock =
          isStockCommitted(currentStatus) && !isStockCommitted(targetStatus);

        // Compare-and-set: hanya berhasil jika status belum berubah
        const cas = await tx.order.updateMany({
          where: { id: idParsed.data, status: currentStatus },
          data: { status: targetStatus },
        });
        if (cas.count === 0) {
          throw new OrderBusinessError(
            "Status pesanan baru saja berubah. Muat ulang halaman lalu coba lagi."
          );
        }

        if (willCommitStock) {
          for (const item of currentOrder.items) {
            // Decrement atomik dengan guard stok (tidak bisa negatif)
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

        return { id: idParsed.data, status: targetStatus };
      },
      { isolationLevel: "Serializable" }
    );

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/pesanan");
    revalidatePath("/dashboard/produk");
    revalidatePath("/katalog");

    return { success: true, data: updated };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Unauthorized: Silakan login kembali." };
    }

    if (err instanceof OrderBusinessError) {
      return { success: false, error: err.message };
    }

    // P2034: write conflict / serialization failure
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2034"
    ) {
      return {
        success: false,
        error: "Pesanan sedang diproses permintaan lain. Silakan coba lagi.",
      };
    }

    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      return { success: false, error: "Pesanan atau produk tidak ditemukan." };
    }

    console.error("[updateOrderStatus]", err);
    return {
      success: false,
      error: "Terjadi kesalahan saat memperbarui status pesanan.",
    };
  }
}
