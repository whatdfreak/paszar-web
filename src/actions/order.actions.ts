"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import {
  OrderBusinessError,
  applyOrderStatusTransition,
} from "@/lib/order-status";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const cuidSchema = z.string().cuid();

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

const VALID_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
];

// ── Update Order Status ───────────────────────────────────────
// Logika stok ACID ada di lib/order-status.ts (teruji lewat skrip uji).

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

    const updated = await applyOrderStatusTransition(
      prisma,
      idParsed.data,
      newStatus as OrderStatus
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

    if (typeof err === "object" && err !== null && "code" in err) {
      const code = (err as { code: string }).code;
      if (code === "P2034") {
        return {
          success: false,
          error: "Pesanan sedang diproses permintaan lain. Silakan coba lagi.",
        };
      }
      if (code === "P2025") {
        return {
          success: false,
          error: "Pesanan atau produk tidak ditemukan.",
        };
      }
    }

    console.error("[updateOrderStatus]", err);
    return {
      success: false,
      error: "Terjadi kesalahan saat memperbarui status pesanan.",
    };
  }
}
