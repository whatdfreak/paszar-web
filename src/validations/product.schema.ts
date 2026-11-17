import { z } from "zod";

const isValidImagePathOrUrl = (val: string): boolean => {
  if (val.startsWith("/uploads/")) {
    return /^\/uploads\/products\/[a-zA-Z0-9-]+\.(jpg|png|webp)$/.test(val);
  }
  try {
    const parsed = new URL(val);
    return parsed.protocol === "https:" && val.length <= 500;
  } catch {
    return false;
  }
};

// ── Create ────────────────────────────────────────────────────
export const CreateProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nama produk minimal 3 karakter.")
    .max(120, "Nama produk maksimal 120 karakter."),
  description: z
    .string()
    .trim()
    .min(10, "Deskripsi minimal 10 karakter.")
    .max(2000, "Deskripsi maksimal 2000 karakter."),
  story: z
    .string()
    .trim()
    .max(2000, "Cerita produk maksimal 2000 karakter.")
    .optional(),
  price: z.coerce
    .number()
    .int("Harga harus bilangan bulat (Rupiah penuh).")
    .min(0, "Harga tidak boleh negatif.")
    .max(1_000_000_000, "Harga maksimal Rp 1.000.000.000."),
  stock: z.coerce
    .number()
    .int("Stok harus bilangan bulat.")
    .min(0, "Stok tidak boleh negatif.")
    .max(100_000, "Stok maksimal 100.000 unit.")
    .default(0),
  categoryId: z.string().cuid("ID kategori tidak valid."),
  image: z
    .string()
    .trim()
    .min(1, "Gambar produk wajib diunggah.")
    .refine(isValidImagePathOrUrl, {
      message: "Format gambar tidak valid.",
    }),
  isActive: z.boolean().default(true),
});

// ── Update (partial) ─────────────────────────────────────────
export const UpdateProductSchema = CreateProductSchema.partial().extend({
  id: z.string().cuid("ID tidak valid."),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
