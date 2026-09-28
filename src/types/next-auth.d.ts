// ============================================================
// PASzar — NextAuth TypeScript Type Augmentation
// ============================================================
// Memperluas tipe bawaan NextAuth agar properti `id` dikenali
// TypeScript di session.user tanpa error.
// ============================================================

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}
