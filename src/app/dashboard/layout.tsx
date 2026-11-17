// ============================================================
// PASzar — Admin Dashboard Layout (Server Component)
// ============================================================
// Struktur: Sidebar (kiri, fixed di desktop) + Main Content (kanan)
// Responsif: Mobile = kolom tunggal (sidebar tersembunyi),
//            Desktop (md+) = dua kolom flex
//
// SECURITY: Defence-in-depth — secondary session guard di layout.
// Middleware (middleware.ts) adalah lapisan pertama; ini lapisan kedua.
// Jika edge case middleware bypass terjadi, redirect ke /login.
// ============================================================

import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminI18nProvider } from "@/lib/admin-i18n";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ── Secondary session guard (defence-in-depth) ────────────
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const pendingOrderCount = await prisma.order.count({
    where: {
      status: { in: [OrderStatus.PENDING, OrderStatus.CONFIRMED] },
    },
  });

  return (
    <AdminI18nProvider>
      <div className="min-h-screen flex flex-row bg-slate-50">
        {/* ── Sidebar ── */}
        <AdminSidebar pendingOrderCount={pendingOrderCount} />

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0 overflow-auto">
          {/* Spacer untuk hamburger button di mobile */}
          <div className="md:hidden h-14" aria-hidden="true" />
          {children}
        </main>
      </div>
    </AdminI18nProvider>
  );
}

