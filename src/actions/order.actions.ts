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

// ── Valid status transitions (Fase 1 — WhatsApp flow) ─────────
// Mencegah admin menetapkan status yang tidak logis.
const VALID_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
];

// ── Update Order Status ───────────────────────────────────────

export async function updateOrderStatus(
  orderId: string,
  newStatus: string
): Promise<ActionResult<{ id: string; status: OrderStatus }>> {
  try {
    await requireSession();

    if (!orderId) {
      return { success: false, error: "ID pesanan tidak valid." };
    }

    // Validasi value status agar tidak ada injeksi enum sembarangan
    if (!VALID_STATUSES.includes(newStatus as OrderStatus)) {
      return {
        success: false,
        error: "Status pesanan tidak valid.",
      };
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus as OrderStatus },
      select: { id: true, status: true },
    });

    revalidatePath("/dashboard");
    revalidatePath("/pesanan");
    revalidatePath("/dashboard/pesanan");

    return { success: true, data: updated };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Unauthorized: Silakan login kembali." };
    }
    // Prisma "record not found"
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      return { success: false, error: "Pesanan tidak ditemukan." };
    }
    console.error("[updateOrderStatus]", err);
    return { success: false, error: "Terjadi kesalahan saat memperbarui status pesanan." };
  }
}
