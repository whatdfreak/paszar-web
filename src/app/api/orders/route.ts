import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { CheckoutSchema } from "@/validations/order.schema";
import { generateWhatsAppUrl } from "@/lib/whatsapp";

// ── In-memory idempotency store (MVP — sufficient for low-traffic) ─────────
// Key: idempotencyKey string  |  Value: { orderCode, waUrl, timestamp }
// TTL: 10 minutes — cukup mencegah double-submit satu sesi checkout
const idempotencyCache = new Map<
  string,
  { orderCode: string; waUrl: string; timestamp: number }
>();
const IDEMPOTENCY_TTL_MS = 10 * 60 * 1000; // 10 menit

function pruneIdempotencyCache() {
  const now = Date.now();
  for (const [key, val] of idempotencyCache.entries()) {
    if (now - val.timestamp > IDEMPOTENCY_TTL_MS) {
      idempotencyCache.delete(key);
    }
  }
}

// ── Cryptographic Order Code Generator ────────────────────────────────────
function generateOrderCode(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const random = randomBytes(3).toString("hex").toUpperCase(); // 6 hex chars
  return `PZ-${date}-${random}`;
}

// ── POST /api/orders ───────────────────────────────────────────────────────
// Public endpoint — tidak butuh autentikasi.
// Perlindungan:
//   1. Zod validation (termasuk honeypot anti-bot & range input)
//   2. Server-side price & stock verification (termasuk agregasi productId ganda)
//   3. Idempotency Key (anti double-submit)
//   4. Atomic $transaction untuk Order + OrderItems
//   5. Generate waUrl di server (ADMIN_WHATSAPP_NUMBER / StoreSetting aman)

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Format permintaan tidak valid." },
      { status: 400 }
    );
  }

  try {
    // ── 1. Zod Validation ──────────────────────────────────────────────────
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
      _honeypot,
      items,
    } = parsed.data;

    if (_honeypot.trim().length > 0) {
      return NextResponse.json(
        { success: false, error: "Permintaan tidak valid." },
        { status: 400 }
      );
    }

    // ── 2. Idempotency Check ────────────────────────────────────────────────
    const idempotencyKey = request.headers.get("X-Idempotency-Key");
    if (idempotencyKey) {
      pruneIdempotencyCache();
      const cached = idempotencyCache.get(idempotencyKey);
      if (cached) {
        return NextResponse.json(
          {
            success: true,
            orderCode: cached.orderCode,
            waUrl: cached.waUrl,
          },
          { status: 200 }
        );
      }
    }

    // ── 3. SERVER-SIDE PRICE & STOCK VERIFICATION ─────────────────────────
    const qtyByProductId = new Map<string, number>();
    for (const item of items) {
      qtyByProductId.set(
        item.productId,
        (qtyByProductId.get(item.productId) ?? 0) + item.quantity
      );
    }
    const productIds = Array.from(qtyByProductId.keys());

    const [dbProducts, storeSetting] = await Promise.all([
      prisma.product.findMany({
        where: {
          id: { in: productIds },
          isActive: true,
        },
        select: { id: true, name: true, price: true, stock: true },
      }),
      prisma.storeSetting.findUnique({
        where: { id: "default" },
        select: { whatsappNumber: true },
      }),
    ]);

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    for (const item of items) {
      const dbProduct = productMap.get(item.productId);

      if (!dbProduct) {
        return NextResponse.json(
          {
            success: false,
            error: `Produk tidak tersedia: "${item.productName}". Silakan refresh halaman.`,
          },
          { status: 409 }
        );
      }

      if (dbProduct.price !== item.productPrice) {
        return NextResponse.json(
          {
            success: false,
            error: `Harga produk "${dbProduct.name}" telah berubah. Silakan refresh halaman dan coba lagi.`,
          },
          { status: 409 }
        );
      }

      const requestedTotalQty = qtyByProductId.get(item.productId) ?? item.quantity;
      if (dbProduct.stock < requestedTotalQty) {
        return NextResponse.json(
          {
            success: false,
            error: `Stok "${dbProduct.name}" tidak mencukupi. Tersisa ${dbProduct.stock} pcs, diminta ${requestedTotalQty} pcs.`,
          },
          { status: 409 }
        );
      }
    }

    // Hitung ulang total DARI DATA SERVER
    const totalAmount = items.reduce((sum, item) => {
      const dbProduct = productMap.get(item.productId)!;
      return sum + dbProduct.price * item.quantity;
    }, 0);

    // ── 4. Generate Order Code (Cryptographic) ─────────────────────────────
    let orderCode = generateOrderCode();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.order.findUnique({ where: { orderCode } });
      if (!existing) break;
      orderCode = generateOrderCode();
      attempts++;
    }

    // ── 5. Buat Order + OrderItems dalam satu Prisma $transaction ──────────
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
          notes: notes || null,
          totalAmount,
          items: {
            create: items.map((item) => {
              const dbProduct = productMap.get(item.productId)!;
              return {
                productId: item.productId,
                productName: dbProduct.name,
                productPrice: dbProduct.price,
                quantity: item.quantity,
                subtotal: dbProduct.price * item.quantity,
              };
            }),
          },
        },
        include: {
          items: true,
        },
      });
    });

    const waUrl = generateWhatsAppUrl(
      order,
      order.items,
      storeSetting?.whatsappNumber
    );

    // ── 6. Simpan ke idempotency cache ────────────────────────────────────
    if (idempotencyKey) {
      idempotencyCache.set(idempotencyKey, {
        orderCode: order.orderCode,
        waUrl,
        timestamp: Date.now(),
      });
    }

    return NextResponse.json(
      { success: true, orderCode: order.orderCode, waUrl },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/orders]", err);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.",
      },
      { status: 500 }
    );
  }
}
