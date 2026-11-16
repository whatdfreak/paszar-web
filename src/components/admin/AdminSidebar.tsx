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
import { useAdminI18n } from "@/lib/admin-i18n";
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
  Settings,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

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
  badgeCount,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  badgeCount?: number;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  const showBadge = typeof badgeCount === "number" && badgeCount > 0;
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

        <div className="relative flex-shrink-0">
          <Icon
            size={18}
            strokeWidth={isActive ? 2.5 : 2}
            className={`transition-colors ${isActive ? "text-[#0B1C30]" : "text-slate-400"}`}
          />
          {collapsed && showBadge && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white" />
          )}
        </div>

        {/* Trik Teks Animasi: Memainkan Max-Width & Opacity */}
        <span
          className={`whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            collapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[200px] opacity-100 ml-3 flex-1"
          }`}
        >
          {item.label}
        </span>

        {!collapsed && showBadge && (
          <span className="ml-auto px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold leading-none tabular-nums">
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        )}
      </Link>

      {collapsed && (
        <Tooltip
          label={showBadge ? `${item.label} (${badgeCount})` : item.label}
        />
      )}
    </div>
  );
}

// ── Sidebar Content ───────────────────────────────────────────
function SidebarContent({
  collapsed,
  pendingOrderCount,
  onToggleCollapse,
  onClose,
  onLogoutRequest,
}: {
  collapsed: boolean;
  pendingOrderCount?: number;
  onToggleCollapse?: () => void;
  onClose?: () => void;
  onLogoutRequest: () => void;
}) {
  const pathname = usePathname();
  const { t } = useAdminI18n();
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const dynamicNavGroups = [
    {
      groupLabel: t.sidebar.general,
      items: [
        { label: t.sidebar.overview, href: "/dashboard", icon: LayoutDashboard },
      ] as NavItem[],
    },
    {
      groupLabel: t.sidebar.catalog,
      items: [
        { label: t.sidebar.products, href: "/dashboard/produk", icon: Package },
        { label: t.sidebar.categories, href: "/dashboard/kategori", icon: Tags },
      ] as NavItem[],
    },
    {
      groupLabel: t.sidebar.sales,
      items: [
        { label: t.sidebar.orders, href: "/dashboard/pesanan", icon: ShoppingBag },
      ] as NavItem[],
    },
  ];

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
        {dynamicNavGroups.map((group) => (
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
                  badgeCount={
                    item.href === "/dashboard/pesanan"
                      ? pendingOrderCount
                      : undefined
                  }
                  onClick={onClose}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer: Settings & Logout ── */}
      <div className="flex-shrink-0 border-t border-slate-100 p-3 space-y-1">
        <NavLink
          item={{
            label: t.sidebar.settings,
            href: "/dashboard/pengaturan",
            icon: Settings,
          }}
          isActive={isActive("/dashboard/pengaturan")}
          collapsed={collapsed}
          onClick={onClose}
        />

        <div className="relative group w-full flex justify-center">
          <button
            type="button"
            onClick={onLogoutRequest}
            className={`
              relative flex items-center rounded-md transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-sm font-medium mx-auto overflow-hidden
              text-slate-500 hover:text-rose-600 hover:bg-rose-50
              ${collapsed ? "w-10 h-10 justify-center px-0" : "w-full h-10 px-3"}
            `}
          >
            <LogOut size={18} strokeWidth={2} className="flex-shrink-0" />
            <span
              className={`whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                collapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[200px] opacity-100 ml-3"
              }`}
            >
              {t.sidebar.logout}
            </span>
          </button>
          {collapsed && <Tooltip label={t.sidebar.logout} />}
        </div>
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────
export function AdminSidebar({
  pendingOrderCount = 0,
}: {
  pendingOrderCount?: number;
}) {
  const { t } = useAdminI18n();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/login" });
  };

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
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-slate-200 shadow-2xl transform transition-transform duration-300 ease-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors z-50"
        >
          <X size={18} strokeWidth={2} />
        </button>
        <SidebarContent
          collapsed={false}
          pendingOrderCount={pendingOrderCount}
          onClose={() => setIsMobileOpen(false)}
          onLogoutRequest={() => {
            setIsMobileOpen(false);
            setShowLogoutModal(true);
          }}
        />
      </aside>

      {/* Desktop Sidebar (Master Container Width Animation) */}
      <aside
        className={`hidden md:flex md:flex-col flex-shrink-0 bg-white border-r border-slate-200 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] h-screen sticky top-0
          ${collapsed ? "w-[72px]" : "w-56"}`}
      >
        <SidebarContent
          collapsed={collapsed}
          pendingOrderCount={pendingOrderCount}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          onLogoutRequest={() => setShowLogoutModal(true)}
        />
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
            onClick={isLoggingOut ? undefined : () => setShowLogoutModal(false)}
          />
          <div className="relative bg-white rounded-xl border border-slate-200 shadow-xl p-6 w-full max-w-sm animate-soft-enter">
            <div className="flex items-center justify-center w-11 h-11 rounded-full bg-rose-50 mx-auto mb-4">
              <LogOut size={20} className="text-rose-600" strokeWidth={2} />
            </div>
            <h3 className="text-[15px] font-bold text-slate-900 text-center mb-1.5">
              {t.sidebar.logoutTitle}
            </h3>
            <p className="text-xs text-slate-500 text-center mb-5 leading-relaxed">
              {t.sidebar.logoutDesc}
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 h-9 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {t.sidebar.logoutCancel}
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleConfirmLogout}
                className="flex-1 h-9 rounded-lg bg-[#0B1C30] hover:bg-[#132944] text-xs font-medium text-white transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? t.sidebar.loggingOut : t.sidebar.logoutConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
