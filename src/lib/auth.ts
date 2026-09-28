// ============================================================
// PASzar — NextAuth Configuration (Auth.js v4)
// ============================================================
// Referensi: docs/architecture.md (Section 7: Authentication Flow)
// Strategy: JWT (stateless) — tidak menyimpan session ke database
// ============================================================

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

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

      async authorize(credentials) {
        // Validasi dasar — credentials wajib ada
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Cari admin berdasarkan email
        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            hashedPassword: true,
          },
        });

        // Admin tidak ditemukan
        if (!admin) {
          return null;
        }

        // Komparasi password dengan bcrypt
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          admin.hashedPassword
        );

        if (!isPasswordValid) {
          return null;
        }

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
    // Masukkan `id` ke dalam JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    // Expose `id` dari token ke session object
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
