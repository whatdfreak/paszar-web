import { z } from "zod";

// ── Item dalam keranjang ──────────────────────────────────────
const CheckoutItemSchema = z.object({
  productId: z.string().cuid("productId tidak valid."),
  productName: z.string().min(1, "productName tidak boleh kosong."),
  productPrice: z.coerce.number().int().min(0, "productPrice tidak valid."),
  quantity: z.coerce.number().int().min(1, "quantity minimal 1."),
});

// ── Payload checkout dari pengunjung ─────────────────────────
export const CheckoutSchema = z.object({
  customerName: z.string().min(2, "Nama minimal 2 karakter.").max(100),
  customerPhone: z
    .string()
    .min(8, "Nomor HP tidak valid.")
    .max(20, "Nomor HP terlalu panjang.")
    .regex(/^[0-9+\-\s()]+$/, "Format nomor HP tidak valid."),
  customerAddress: z.string().min(5, "Alamat terlalu pendek.").max(500),
  customerCity: z.string().min(2, "Kota wajib diisi.").max(100),
  customerProvince: z.string().min(2, "Provinsi wajib diisi.").max(100),
  customerPostalCode: z
    .string()
    .min(5, "Kode pos tidak valid.")
    .max(10)
    .regex(/^\d+$/, "Kode pos hanya boleh berisi angka."),
  notes: z.string().max(500).optional(),
  items: z
    .array(CheckoutItemSchema)
    .min(1, "Keranjang tidak boleh kosong."),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;
export type CheckoutItem = z.infer<typeof CheckoutItemSchema>;
