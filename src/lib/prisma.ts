// ============================================================
// PASzar — Prisma Client Singleton
// ============================================================
// Referensi: docs/architecture.md (Section 3: Layer Architecture)
// WAJIB: Selalu import prisma dari file ini, jangan buat instance baru.
// Pattern ini mencegah terlalu banyak koneksi database di development
// (karena Next.js melakukan hot-reload yang membuat instance baru).
// ============================================================

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
