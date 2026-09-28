// ============================================================
// PASzar — NextAuth Route Handler
// ============================================================
// Menangani semua request ke /api/auth/* (login, logout, session)
// Referensi: docs/architecture.md — API Routes yang diizinkan
// ============================================================

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
