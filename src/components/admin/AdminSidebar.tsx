"use client";

// ============================================================
// PASzar — Admin Sidebar (Enterprise SaaS)
// ============================================================
// UX Pattern: Smooth 60fps CSS Transitions
// Layout: PanelLeftClose button pushed to the far right
// Tooltip: White background with subtle border and shadow
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
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Building,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navGroups = [
  {
    groupLabel: "General",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    ] as NavItem[],
  },
  {
    groupLabel: "Catalog",
    items: [
      { label: "Products", href: "/dashboard/produk", icon: Package },
      { label: "Categories", href: "/dashboard/kategori", icon: Tags },
    ] as NavItem[],
  },
  {
    groupLabel: "Sales",
    items: [
      { label: "Orders", href: "/dashboard/pesanan", icon: ShoppingBag },
    ] as NavItem[],
  },
];

// ── Tooltip Component (White Theme) ───────────────────────────
function Tooltip({ label }: { label: string }) {
  return (
    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[999] pointer-events-none">
      <div className="relative opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 delay-100">
        <div className="bg-white text-slate-700 border border-slate-200 text-[11px] font-bold px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-sm relative z-10">
          {label}
        </div>
        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-white border-l border-b border-slate-200 transform rotate-45 z-0" />
      </div>
    </div>
  );
}

// ── Nav Link Component (Smooth Transition) ────────────────────
function NavLink({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <div className="relative group flex items-center">
      <Link
        href={item.href}
        onClick={onClick}
        className={`
          relative flex items-center rounded-md transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-sm mx-auto overflow-hidden
          ${collapsed ? "w-10 h-10 justify-center px-0" : "w-full h-10 px-3"}
          ${
            isActive
              ? "bg-[#0B1C30]/[0.06] text-[#0B1C30] font-semibold"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium"
          }
        `}
      >
        {isActive && !collapsed && (
          <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-[#0B1C30]" />
        )}
        
        <Icon
          size={18}
          strokeWidth={isActive ? 2.5 : 2}
          className={`flex-shrink-0 transition-colors ${isActive ? "text-[#0B1C30]" : "text-slate-400"}`}
        />
        
        {/* Trik Teks Animasi: Memainkan Max-Width & Opacity */}
        <span
          className={`whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            collapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[200px] opacity-100 ml-3"
          }`}
        >
          {item.label}
        </span>
      </Link>

      {collapsed && <Tooltip label={item.label} />}
    </div>
  );
}

// ── Sidebar Content ───────────────────────────────────────────
function SidebarContent({
  collapsed,
  onToggleCollapse,
  onClose,
}: {
  collapsed: boolean;
  onToggleCollapse?: () => void;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <div className="flex flex-col h-full bg-white relative">
      
      {/* ── Gemini‑Style Toggle Header (Smooth Crossfade) ── */}
      <div className="flex items-center h-16 flex-shrink-0 border-b border-slate-200 relative overflow-hidden">
        
        {/* State Tertutup (Absolute Centered) */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            collapsed ? "opacity-100 z-10 translate-x-0" : "opacity-0 z-0 -translate-x-8 pointer-events-none"
          }`}
        >
          <div className="relative group/toggle flex items-center justify-center">
            <button
              onClick={onToggleCollapse}
              className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Buka sidebar"
            >
              <div className="absolute flex items-center justify-center w-8 h-8 rounded-lg bg-[#0B1C30] text-white transition-opacity duration-200 group-hover/toggle:opacity-0">
                <Building size={16} strokeWidth={2} />
              </div>
              <PanelLeftOpen
                size={20}
                strokeWidth={2}
                className="absolute text-slate-700 opacity-0 transition-opacity duration-200 group-hover/toggle:opacity-100"
              />
            </button>
            <Tooltip label="Buka sidebar" />
          </div>
        </div>

        {/* State Terbuka (Logo Kiri, Tombol Kanan) */}
        <div
          className={`absolute inset-0 px-4 flex items-center justify-between transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            collapsed ? "opacity-0 z-0 translate-x-8 pointer-events-none" : "opacity-100 z-10 translate-x-0"
          }`}
        >
          <div className="flex items-center gap-2 flex-1">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#0B1C30] text-white">
              <Building size={14} strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-bold text-slate-900 tracking-tight leading-none whitespace-nowrap">
              PASzar
            </span>
          </div>
          
          <button
            onClick={onToggleCollapse}
            className="rounded-md p-1.5 -mr-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            aria-label="Tutup sidebar"
          >
            <PanelLeftClose size={20} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* ── Navigation List ── */}
      {/* Padding dipertahankan konsisten agar tidak ada lompatan layout */}
      <nav className="flex-1 py-4 overflow-x-hidden overflow-y-auto space-y-2 px-3">
        {navGroups.map((group) => (
          <div key={group.groupLabel}>
            
            {/* Smooth Teks Label Group */}
            <div
              className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden whitespace-nowrap ${
                collapsed ? "max-h-0 opacity-0 mb-0" : "max-h-10 opacity-100 mb-2 mt-4"
              }`}
            >
              <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {group.groupLabel}
              </p>
            </div>

            {/* Smooth Divider (Hanya muncul saat collapsed) */}
            <div
              className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${
                collapsed ? "max-h-px opacity-100 mx-2 my-3" : "max-h-0 opacity-0 mx-2 my-0"
              }`}
            >
              <div className="h-px bg-slate-100 w-full" />
            </div>

            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={isActive(item.href)}
                  collapsed={collapsed}
                  onClick={onClose}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer / Logout ── */}
      <div className="flex-shrink-0 border-t border-slate-100 p-3 flex justify-center">
        <div className="relative group w-full flex justify-center">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={`
              relative flex items-center rounded-md transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-sm font-medium mx-auto overflow-hidden
              text-slate-500 hover:text-red-600 hover:bg-red-50
              ${collapsed ? "w-10 h-10 justify-center px-0" : "w-full h-10 px-3"}
            `}
          >
            <LogOut size={18} strokeWidth={2} className="flex-shrink-0" />
            <span
              className={`whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                collapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[200px] opacity-100 ml-3"
              }`}
            >
              Log out
            </span>
          </button>
          {collapsed && <Tooltip label="Log out" />}
        </div>
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────
export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-white rounded-lg border border-slate-200 text-slate-700 shadow-sm"
      >
        <PanelLeftOpen size={18} strokeWidth={2} />
      </button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-[#0B1C30]/40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 shadow-2xl transform transition-transform duration-300 ease-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors z-50"
        >
          <X size={18} strokeWidth={2} />
        </button>
        <SidebarContent collapsed={false} onClose={() => setIsMobileOpen(false)} />
      </aside>

      {/* Desktop Sidebar (Master Container Width Animation) */}
      <aside
        className={`hidden md:flex md:flex-col flex-shrink-0 bg-white border-r border-slate-200 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] h-screen sticky top-0
          ${collapsed ? "w-[72px]" : "w-64"}`}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
      </aside>
    </>
  );
}