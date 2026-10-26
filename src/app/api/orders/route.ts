import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { CheckoutSchema } from "@/validations/order.schema";

// ── In-memory idempotency store (MVP — sufficient for low-traffic) ─────────
// Key: idempotencyKey string  |  Value: { orderCode, timestamp }
// TTL: 10 minutes — cukup mencegah double-submit satu sesi checkout
const idempotencyCache = new Map<string, { orderCode: string; timestamp: number }>();
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
// Menggunakan crypto.randomBytes — CSPRNG, bukan Math.random() yang lemah.
// Format: PZ-YYYYMMDD-XXXXXX (6 hex chars dari 3 random bytes)
function generateOrderCode(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const random = randomBytes(3).toString("hex").toUpperCase(); // 6 hex chars
  return `PZ-${date}-${random}`;
}

// ── POST /api/orders ───────────────────────────────────────────────────────
// Public endpoint — tidak butuh autentikasi.
// Perlindungan:
//   1. Zod validation (format & range input)
//   2. Server-side price & stock verification (anti-manipulation)
//   3. Idempotency Key (anti double-submit)
//   4. Atomic $transaction untuk Order + OrderItems

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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
      items,
    } = parsed.data;

    // ── 2. Idempotency Check ────────────────────────────────────────────────
    // Jika klien mengirim X-Idempotency-Key yang sama dua kali (double-submit / lag),
    // kembalikan result yang sama tanpa membuat pesanan baru.
    const idempotencyKey = request.headers.get("X-Idempotency-Key");
    if (idempotencyKey) {
      pruneIdempotencyCache(); // bersihkan entry kadaluarsa
      const cached = idempotencyCache.get(idempotencyKey);
      if (cached) {
        return NextResponse.json(
          { success: true, orderCode: cached.orderCode },
          { status: 200 } // 200 OK (bukan 201) — menandakan ini idempoten
        );
      }
    }

    // ── 3. SERVER-SIDE PRICE & STOCK VERIFICATION ─────────────────────────
    // JANGAN percaya harga atau ID dari client. Ambil data aktual dari DB.
    const productIds = items.map((i) => i.productId);

    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true, // Tolak produk yang tidak aktif / sudah dihapus
      },
      select: { id: true, name: true, price: true, stock: true },
    });

    // Buat map untuk lookup O(1)
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Validasi setiap item
    for (const item of items) {
      const dbProduct = productMap.get(item.productId);

      // Produk tidak ditemukan atau tidak aktif
      if (!dbProduct) {
        return NextResponse.json(
          { success: false, error: `Produk tidak tersedia: "${item.productName}". Silakan refresh halaman.` },
          { status: 409 }
        );
      }

      // Deteksi manipulasi harga
      if (dbProduct.price !== item.productPrice) {
        return NextResponse.json(
          {
            success: false,
            error: `Harga produk "${dbProduct.name}" telah berubah. Silakan refresh halaman dan coba lagi.`,
          },
          { status: 409 } // 409 Conflict — data sudah stale
        );
      }

      // Stok tidak cukup saat order dibuat
      if (dbProduct.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Stok "${dbProduct.name}" tidak mencukupi. Tersisa ${dbProduct.stock} pcs, diminta ${item.quantity} pcs.`,
          },
          { status: 409 }
        );
      }
    }

    // Hitung ulang total DARI DATA SERVER — tidak dari client sama sekali
    const totalAmount = items.reduce((sum, item) => {
      const dbProduct = productMap.get(item.productId)!;
      return sum + dbProduct.price * item.quantity;
    }, 0);

    // ── 4. Generate Order Code (Cryptographic) ─────────────────────────────
    let orderCode = generateOrderCode();

    // Sangat kecil kemungkinan clash, tapi tetap handle
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
          notes,
          totalAmount,
          items: {
            create: items.map((item) => {
              const dbProduct = productMap.get(item.productId)!;
              return {
                productId: item.productId,
                productName: dbProduct.name,   // Gunakan nama dari DB, bukan client
                productPrice: dbProduct.price, // Gunakan harga dari DB, bukan client
                quantity: item.quantity,
                subtotal: dbProduct.price * item.quantity, // Hitung ulang di server
              };
            }),
          },
        },
        select: {
          id: true,
          orderCode: true,
        },
      });
    });

    // ── 6. Simpan ke idempotency cache ────────────────────────────────────
    if (idempotencyKey) {
      idempotencyCache.set(idempotencyKey, {
        orderCode: order.orderCode,
        timestamp: Date.now(),
      });
    }

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
