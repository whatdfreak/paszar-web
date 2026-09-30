import type { Order, OrderItem } from "@prisma/client";

// ── Helpers ───────────────────────────────────────────────────

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ── WhatsApp Message Generator ────────────────────────────────

/**
 * Membuat URL wa.me dengan pesan pesanan yang sudah diformat.
 *
 * @param order  - Row Order dari Prisma (termasuk kolom pelanggan & totalAmount)
 * @param items  - Array OrderItem (snapshot nama & harga produk)
 * @returns      - URL wa.me yang siap dibuka di browser/link
 */
export function generateWhatsAppUrl(
  order: Order,
  items: OrderItem[]
): string {
  const adminNumber =
    process.env.ADMIN_WHATSAPP_NUMBER ?? "6281234567890";

  // ── Susun baris item ─────────────────────────────────────────
  const itemLines = items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.productName} — ${item.quantity} pcs x ${formatRupiah(item.productPrice)} = ${formatRupiah(item.subtotal)}`
    )
    .join("\n");

  // ── Baris catatan (opsional) ─────────────────────────────────
  const notesLine = order.notes
    ? `\n*Catatan:* ${order.notes}`
    : "";

  // ── Rakit pesan lengkap ──────────────────────────────────────
  const message = [
    `*Pesanan Baru — PASzar Koperasi Lapas Kupang*`,
    ``,
    `*Kode Pesanan:* ${order.orderCode}`,
    ``,
    `*Daftar Item:*`,
    itemLines,
    ``,
    `*Total Pembayaran:* ${formatRupiah(order.totalAmount)}`,
    ``,
    `*Data Pengiriman:*`,
    `Nama    : ${order.customerName}`,
    `HP      : ${order.customerPhone}`,
    `Alamat  : ${order.customerAddress}`,
    `Kota    : ${order.customerCity}`,
    `Provinsi: ${order.customerProvince}`,
    `Kode Pos: ${order.customerPostalCode}`,
    notesLine,
    ``,
    `Mohon konfirmasi ketersediaan produk. Terima kasih!`,
  ]
    .join("\n")
    .trim();

  return `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;
}
