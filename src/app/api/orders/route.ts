import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CheckoutSchema } from "@/validations/order.schema";

// ── Helpers ───────────────────────────────────────────────────

/** Generates a unique order code: PZ-YYYYMMDD-XXXXX */
function generateOrderCode(): string {
  const now = new Date();
  const date = now
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, ""); // YYYYMMDD
  const random = Math.random()
    .toString(36)
    .substring(2, 7)
    .toUpperCase(); // 5 chars
  return `PZ-${date}-${random}`;
}

// ── POST /api/orders ──────────────────────────────────────────
// Public — tidak butuh autentikasi. Dibuat saat pengunjung checkout.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validasi input dengan Zod v4
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      customerName,
      customerPhone,
      customerAddress,
      customerCity,
      customerProvince,
      customerPostalCode,
      notes,
      items,
    } = parsed.data;

    // 2. Hitung total di server (jangan percaya client)
    const totalAmount = items.reduce(
      (sum, item) => sum + item.productPrice * item.quantity,
      0
    );

    // 3. Generate kode pesanan unik
    let orderCode = generateOrderCode();

    // Sangat kecil kemungkinan clash, tapi tetap handle dengan loop
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.order.findUnique({ where: { orderCode } });
      if (!existing) break;
      orderCode = generateOrderCode();
      attempts++;
    }

    // 4. Buat Order + OrderItems dalam satu transaction
    const order = await prisma.$transaction(async (tx) => {
      return tx.order.create({
        data: {
          orderCode,
          customerName,
          customerPhone,
          customerAddress,
          customerCity,
          customerProvince,
          customerPostalCode,
          notes,
          totalAmount,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              productPrice: item.productPrice,
              quantity: item.quantity,
              subtotal: item.productPrice * item.quantity,
            })),
          },
        },
        select: {
          id: true,
          orderCode: true,
        },
      });
    });

    return NextResponse.json(
      { success: true, orderCode: order.orderCode },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/orders]", err);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan saat memproses pesanan. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
