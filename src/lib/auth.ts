// ============================================================
// PASzar — NextAuth Configuration (Auth.js v4)
// ============================================================
// Referensi: docs/architecture.md (Section 7: Authentication Flow)
// Strategy: JWT (stateless) — tidak menyimpan session ke database
// ============================================================

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

// ── Login Rate Limiter (in-memory, per instance) ─────────────
// Catatan: pada deployment multi-instance/serverless gunakan store
// terpusat (Redis/Upstash) agar limit berlaku global.
const MAX_FAILED_ATTEMPTS = 5; // per kombinasi email + IP
const MAX_FAILED_PER_IP = 20; // per IP (semua email)
const LOCK_WINDOW_MS = 15 * 60 * 1000;
const failedAttempts = new Map<string, { count: number; first: number }>();

// Hash bcrypt valid (cost 12) untuk perbandingan dummy
const DUMMY_HASH = bcrypt.hashSync("paszar-dummy-password", 12);

function isLoginBlocked(key: string): boolean {
  const entry = failedAttempts.get(key);
  if (!entry) return false;
  if (Date.now() - entry.first > LOCK_WINDOW_MS) {
    failedAttempts.delete(key);
    return false;
  }
  const limit = key.startsWith("ip:") ? MAX_FAILED_PER_IP : MAX_FAILED_ATTEMPTS;
  return entry.count >= limit;
}

function recordLoginFailure(key: string): void {
  const now = Date.now();
  const entry = failedAttempts.get(key);
  if (!entry || now - entry.first > LOCK_WINDOW_MS) {
    failedAttempts.set(key, { count: 1, first: now });
  } else {
    entry.count += 1;
  }
}

function clearLoginFailures(key: string): void {
  failedAttempts.delete(key);
}

function passwordFingerprint(hashedPassword: string): string {
  return createHash("sha256").update(hashedPassword).digest("hex").slice(0, 24);
}

export const authOptions: NextAuthOptions = {
  // ── Session ──────────────────────────────────────────────
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 jam
  },

  // ── JWT ──────────────────────────────────────────────────
  jwt: {
    maxAge: 24 * 60 * 60, // 24 jam
  },

  // ── Pages ────────────────────────────────────────────────
  pages: {
    signIn: "/login",
    error: "/login",
  },

  // ── Providers ────────────────────────────────────────────
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, req) {
        // Validasi dasar — credentials wajib ada
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        if (credentials.password.length > 200) return null;

        const email = credentials.email.trim().toLowerCase();
        const forwarded = req?.headers?.["x-forwarded-for"];
        const ip =
          (Array.isArray(forwarded) ? forwarded[0] : forwarded)
            ?.split(",")[0]
            ?.trim() ?? "unknown";
        const rateKeys = [`email:${email}|${ip}`, `ip:${ip}`];

        // Anti brute-force: blokir sementara setelah terlalu banyak gagal
        if (rateKeys.some(isLoginBlocked)) {
          return null;
        }

        // Cari admin berdasarkan email (case-insensitive)
        const admin = await prisma.admin.findFirst({
          where: { email: { equals: email, mode: "insensitive" } },
          select: {
            id: true,
            email: true,
            name: true,
            hashedPassword: true,
          },
        });

        // Selalu jalankan bcrypt (hash dummy jika admin tidak ada)
        // agar waktu respons sama → mencegah user enumeration via timing.
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          admin?.hashedPassword ?? DUMMY_HASH
        );

        if (!admin || !isPasswordValid) {
          rateKeys.forEach(recordLoginFailure);
          return null;
        }

        rateKeys.forEach(clearLoginFailures);

        // Kembalikan objek user tanpa hashedPassword
        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        };
      },
    }),
  ],

  // ── Callbacks ────────────────────────────────────────────
  callbacks: {
    // Masukkan `id` + sidik jari password ke dalam JWT token.
    // Pada setiap pemanggilan, token divalidasi ulang terhadap DB sehingga
    // sesi lama otomatis tidak berlaku setelah password diganti / admin dihapus.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const admin = await prisma.admin.findUnique({
          where: { id: user.id },
          select: { hashedPassword: true },
        });
        token.pv = admin ? passwordFingerprint(admin.hashedPassword) : "";
        token.revoked = false;
        return token;
      }

      if (typeof token.id === "string") {
        const admin = await prisma.admin.findUnique({
          where: { id: token.id },
          select: { hashedPassword: true },
        });
        token.revoked =
          !admin || passwordFingerprint(admin.hashedPassword) !== token.pv;
      }
      return token;
    },

    // Expose `id` dari token ke session object (kosongkan jika dicabut)
    async session({ session, token }) {
      if (token.revoked) {
        return { ...session, user: undefined };
      }
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
