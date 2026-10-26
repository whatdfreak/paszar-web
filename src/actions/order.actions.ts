"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

// ── Helpers ───────────────────────────────────────────────────

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

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
// Alur pemotongan stok (ACID):
//   PENDING / CONFIRMED  → stok BELUM dipotong (admin belum konfirmasi fisik)
//   PROCESSING           → TITIK PEMOTONGAN: barang fisik mulai dikemas
//   SHIPPED              → stok sudah dipotong (barang keluar gudang)
//   COMPLETED            → stok sudah dipotong (transaksi selesai)
//
// Logika transisi:
//   non-committed → committed  = DECREMENT stok (+ validasi kecukupan)
//   committed     → CANCELLED  = INCREMENT stok (pengembalian)
//   Transisi lain            = hanya update status, tanpa sentuh stok
//
const STOCK_COMMITTED_STATUSES = new Set<OrderStatus>([
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.COMPLETED,
]);

function isStockCommitted(status: OrderStatus): boolean {
  return STOCK_COMMITTED_STATUSES.has(status);
}

// ── Update Order Status ───────────────────────────────────────
//
// ACID-compliant via Prisma $transaction.
// Operasi inventori dan update status dibungkus dalam satu transaksi:
//   - Jika stok tidak cukup → throw → rollback otomatis → status TIDAK berubah
//   - Jika produk tidak ditemukan → throw → rollback otomatis
//   - Jika semua OK → commit semua perubahan secara atomik

export async function updateOrderStatus(
  orderId: string,
  newStatus: string
): Promise<ActionResult<{ id: string; status: OrderStatus }>> {
  try {
    await requireSession();

    if (!orderId) {
      return { success: false, error: "ID pesanan tidak valid." };
    }

    // Validasi enum — tolak nilai yang tidak dikenal
    if (!VALID_STATUSES.includes(newStatus as OrderStatus)) {
      return { success: false, error: "Status pesanan tidak valid." };
    }

    const targetStatus = newStatus as OrderStatus;

    // ── Step 1: Baca order + items saat ini ───────────────────
    // Dilakukan di luar transaksi (read-only) untuk performa.
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        status: true,
        items: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            productName: true,
          },
        },
      },
    });

    if (!currentOrder) {
      return { success: false, error: "Pesanan tidak ditemukan." };
    }

    const currentStatus = currentOrder.status;

    // Tidak ada perubahan — kembalikan data saat ini tanpa DB write
    if (currentStatus === targetStatus) {
      return {
        success: true,
        data: { id: orderId, status: currentStatus },
      };
    }

    // ── Step 2: Tentukan operasi inventori ────────────────────
    // willCommitStock: non-committed → committed (masuk PROCESSING/SHIPPED/COMPLETED)
    const willCommitStock =
      !isStockCommitted(currentStatus) && isStockCommitted(targetStatus);

    // willRestoreStock: committed → CANCELLED (rollback stok)
    const willRestoreStock =
      isStockCommitted(currentStatus) &&
      targetStatus === OrderStatus.CANCELLED;

    // ── Step 3: Prisma $transaction (ACID) ────────────────────
    const updated = await prisma.$transaction(async (tx) => {

      // ── 3a. DECREMENT STOK ────────────────────────────────────
      // Dipanggil saat pesanan memasuki status "committed" pertama kali.
      if (willCommitStock) {
        for (const item of currentOrder.items) {

          // Baca stok terkini DI DALAM transaksi (row-level consistency)
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { id: true, stock: true, name: true },
          });

          if (!product) {
            // Melempar error → transaksi otomatis di-rollback
            throw new Error(`Produk tidak ditemukan: ${item.productName}`);
          }

          // Guard: stok harus mencukupi sebelum decrement
          if (product.stock < item.quantity) {
            throw new Error(
              `Stok tidak mencukupi untuk "${product.name}". ` +
              `Tersedia: ${product.stock}, dibutuhkan: ${item.quantity}.`
            );
          }

          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // ── 3b. INCREMENT STOK (pengembalian saat CANCEL) ─────────
      if (willRestoreStock) {
        for (const item of currentOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      // ── 3c. Update status pesanan ─────────────────────────────
      // Dieksekusi terakhir — menjadi commit point transaksi.
      return tx.order.update({
        where: { id: orderId },
        data: { status: targetStatus },
        select: { id: true, status: true },
      });

    }); // ── Akhir $transaction ────────────────────────────────────

    // ── Step 4: Revalidate cache ───────────────────────────────
    // Pastikan stok terbaru muncul di katalog publik dan admin dashboard.
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/pesanan");
    revalidatePath("/dashboard/produk");
    revalidatePath("/katalog");

    return { success: true, data: updated };

  } catch (err: unknown) {

    // Unauthorized — bukan server error, kembalikan sebagai 400-level
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Unauthorized: Silakan login kembali." };
    }

    // Stok tidak cukup / produk tidak ditemukan — pesan langsung dari throw
    if (err instanceof Error) {
      if (
        err.message.startsWith("Stok tidak mencukupi") ||
        err.message.startsWith("Produk tidak ditemukan")
      ) {
        return { success: false, error: err.message };
      }
    }

    // Prisma P2025: record not found during update
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
