import { z } from "zod";

// ── Create ────────────────────────────────────────────────────
export const CreateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama kategori minimal 2 karakter.")
    .max(80, "Nama kategori maksimal 80 karakter."),
  description: z
    .string()
    .trim()
    .max(500, "Deskripsi maksimal 500 karakter.")
    .optional(),
  sortOrder: z.coerce
    .number()
    .int("Urutan tampil harus bilangan bulat.")
    .min(1, "Urutan tampil minimal 1.")
    .max(1000, "Urutan tampil maksimal 1000.")
    .default(1),
});

// ── Update (partial) ─────────────────────────────────────────
export const UpdateCategorySchema = CreateCategorySchema.partial().extend({
  id: z.string().cuid("ID tidak valid."),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
