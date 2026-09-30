import { z } from "zod";

// ── Create ────────────────────────────────────────────────────
export const CreateProductSchema = z.object({
  name: z
    .string()
    .min(3, "Nama minimal 3 karakter.")
    .max(120, "Nama maksimal 120 karakter."),
  description: z
    .string()
    .min(10, "Deskripsi minimal 10 karakter."),
  story: z.string().optional(),
  price: z.coerce
    .number()
    .int("Harga harus bilangan bulat (Rupiah penuh).")
    .min(0, "Harga tidak boleh negatif."),
  stock: z.coerce
    .number()
    .int("Stok harus bilangan bulat.")
    .min(0, "Stok tidak boleh negatif.")
    .default(0),
  categoryId: z.string().cuid("ID kategori tidak valid."),
  image: z.string().url("Format URL gambar tidak valid."),
  isActive: z.boolean().default(true),
});

// ── Update (partial) ─────────────────────────────────────────
export const UpdateProductSchema = CreateProductSchema.partial().extend({
  id: z.string().cuid("ID tidak valid."),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
