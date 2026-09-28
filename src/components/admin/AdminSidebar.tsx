"use client";

// ============================================================
// PASzar — Admin Sidebar (Responsive)
// ============================================================
// Desktop: Sidebar permanen (w-64) di sisi kiri
// Mobile : Tersembunyi, toggle via Hamburger button
// Design : High-End Minimalist (bg-stone-50, border-stone-200)
// ============================================================

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  LogOut,
  Menu,
  X,
} from "lucide-react";

// ── Definisi Menu ────────────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Produk", href: "/dashboard/produk", icon: Package },
  { label: "Kategori", href: "/dashboard/kategori", icon: Tags },
  { label: "Pesanan", href: "/dashboard/pesanan", icon: ShoppingBag },
];

// ── Komponen NavLink ─────────────────────────────────────────
function NavLink({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-[0.15em]
        font-normal transition-colors duration-150 border-l-2
        ${
          isActive
            ? "border-l-stone-900 bg-stone-100 text-stone-900"
            : "border-l-transparent text-stone-500 hover:text-stone-900 hover:bg-stone-100"
        }
      `}
    >
      <Icon
        size={15}
        strokeWidth={1.5}
        className={isActive ? "text-stone-900" : "text-stone-400"}
      />
      {item.label}
    </Link>
  );
}

// ── Komponen Utama ───────────────────────────────────────────
export function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const closeMobile = () => setIsMobileOpen(false);

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  // ── Inner Sidebar Content ──────────────────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-stone-200">
        <p className="text-[9px] uppercase tracking-[0.4em] text-stone-400 mb-1">
          Koperasi Lapas Kupang
        </p>
        <span
          className="text-xl font-light text-stone-900"
          style={{ fontFamily: "var(--font-display, 'Georgia', serif)" }}
        >
          PASzar
        </span>
      </div>

      {/* Label section */}
      <div className="px-6 pt-6 pb-2">
        <p className="text-[9px] uppercase tracking-[0.35em] text-stone-400">
          Menu
        </p>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={isActive(item.href)}
            onClick={closeMobile}
          />
        ))}
      </nav>

      {/* Footer — Logout */}
      <div className="px-2 pb-6 border-t border-stone-200 pt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-[11px] uppercase
                     tracking-[0.15em] font-normal text-stone-400 hover:text-red-600
                     hover:bg-red-50 transition-colors duration-150 text-left"
        >
          <LogOut size={15} strokeWidth={1.5} />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile: Hamburger Button ──────────────────────── */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-stone-200
                   text-stone-700 hover:bg-stone-50 transition-colors duration-150"
        aria-label="Buka menu"
      >
        <Menu size={18} strokeWidth={1.5} />
      </button>

      {/* ── Mobile: Backdrop Overlay ──────────────────────── */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile: Slide-in Drawer ───────────────────────── */}
      <aside
        className={`
          md:hidden fixed inset-y-0 left-0 z-50 w-64
          bg-stone-50 border-r border-stone-200
          transform transition-transform duration-200 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-label="Menu navigasi mobile"
      >
        {/* Close button */}
        <button
          onClick={closeMobile}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-900
                     transition-colors duration-150"
          aria-label="Tutup menu"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Desktop: Permanent Sidebar ────────────────────── */}
      <aside
        className="hidden md:flex md:flex-col md:w-64 md:min-h-screen
                   bg-stone-50 border-r border-stone-200 flex-shrink-0"
        aria-label="Menu navigasi"
      >
        <SidebarContent />
      </aside>
    </>
  );
}
