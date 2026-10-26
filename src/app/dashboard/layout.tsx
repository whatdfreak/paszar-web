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

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ── Secondary session guard (defence-in-depth) ────────────
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-row bg-slate-50">
      {/* ── Sidebar ── */}
      <AdminSidebar />

      {/* ── Main Content ── */}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Spacer untuk hamburger button di mobile */}
        <div className="md:hidden h-14" aria-hidden="true" />
        {children}
      </main>
    </div>
  );
}

