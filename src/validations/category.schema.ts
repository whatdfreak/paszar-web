import { z } from "zod";

// ── Create ────────────────────────────────────────────────────
export const CreateCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter.")
    .max(80, "Nama maksimal 80 karakter."),
  description: z.string().max(500, "Deskripsi maksimal 500 karakter.").optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

// ── Update (partial) ─────────────────────────────────────────
export const UpdateCategorySchema = CreateCategorySchema.partial().extend({
  id: z.string().cuid("ID tidak valid."),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
