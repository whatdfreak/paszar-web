// ============================================================
// PASzar — Admin Dashboard Layout (Server Component)
// ============================================================
// Struktur: Sidebar (kiri, fixed di desktop) + Main Content (kanan)
// Responsif: Mobile = kolom tunggal (sidebar tersembunyi),
//            Desktop (md+) = dua kolom flex
// ============================================================

import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
