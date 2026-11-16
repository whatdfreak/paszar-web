"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import {
  Bell,
  RefreshCw,
  Wallet,
  ShoppingBag,
  TrendingUp,
  Package,
  AlertTriangle,
  ArrowRight,
  Plus,
  Image as ImageIcon,
  BarChart3,
  Clock,
  CheckCircle2,
  Search,
  ChevronRight,
  X,
  Loader2,
  User,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
} from "lucide-react";
import { updateOrderStatus } from "@/actions/order.actions";
import { useAdminI18n } from "@/lib/admin-i18n";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  searchDashboard,
  type DashboardSearchResult,
} from "@/actions/dashboard.actions";

// ---------------------------------------------------------------------------
// Exported Types (dikonsumsi oleh Server Component page.tsx)
// ---------------------------------------------------------------------------
export interface DailySalesPoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface TopProductItem {
  id: string;
  name: string;
  categoryName: string;
  price: number;
  stock: number;
  image: string;
  sold: number;
  revenue: number;
}

export interface LowStockProductItem {
  id: string;
  name: string;
  categoryName: string;
  stock: number;
  price: number;
  image: string;
}

export interface OrderItemDetail {
  id: string;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}

export interface RecentOrderItem {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerProvince: string;
  customerPostalCode: string;
  notes: string | null;
  totalAmount: number;
  status: OrderStatus;
  itemCount: number;
  createdAt: string;
  items: OrderItemDetail[];
}

export interface CategorySalesItem {
  name: string;
  revenue: number;
  units: number;
}

export interface OrderPipelineCount {
  PENDING: number;
  CONFIRMED: number;
  PROCESSING: number;
  SHIPPED: number;
  COMPLETED: number;
  CANCELLED: number;
}

export interface OverviewProps {
  greeting: string;
  adminName: string;
  lastSyncedAt: string;
  totalRevenue: number;
  current30Revenue: number;
  revenueGrowthPct: number | null;
  averageOrderValue: number;
  revenueOrderCount: number;
  orderCount: number;
  pendingOrderCount: number;
  productCount: number;
  categoryCount: number;
  lowStockCount: number;
  lowStockThreshold: number;
  dailySales30: DailySalesPoint[];
  pipelineCounts: OrderPipelineCount;
  categorySales: CategorySalesItem[];
  topProducts: TopProductItem[];
  lowStockProducts: LowStockProductItem[];
  recentOrders: RecentOrderItem[];
  actionOrders: RecentOrderItem[];
}

// ---------------------------------------------------------------------------
// Formatters & Status Mapping
// ---------------------------------------------------------------------------
const formatIDR = (amount: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatCompactIDR = (amount: number): string => {
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1).replace(".", ",")} M`;
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1).replace(".", ",")} jt`;
  }
  if (amount >= 1_000) {
    return `Rp ${Math.round(amount / 1_000)} rb`;
  }
  return `Rp ${amount}`;
};

const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; badgeClass: string }
> = {
  PENDING: {
    label: "Menunggu",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  CONFIRMED: {
    label: "Dikonfirmasi",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  PROCESSING: {
    label: "Dikemas",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  SHIPPED: {
    label: "Dikirim",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  COMPLETED: {
    label: "Selesai",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  CANCELLED: {
    label: "Dibatalkan",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  WAITING_PAYMENT: {
    label: "Menunggu Bayar",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  PAID: {
    label: "Dibayar",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  PAYMENT_FAILED: {
    label: "Gagal",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  REFUNDED: {
    label: "Refund",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

function formatTimeHHMM(iso: string): string {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateID(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function CustomChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload: DailySalesPoint }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="bg-[#0B1C30] text-white rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-medium text-slate-300 mb-0.5">{label}</p>
      <p className="font-semibold text-white">{formatIDR(point.revenue)}</p>
      <p className="text-slate-400">{point.orders} pesanan aktif</p>
    </div>
  );
}

function MiniTickBars({
  values,
  accentClass = "bg-[#0B1C30]",
}: {
  values: number[];
  accentClass?: string;
}) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-[2px] h-5" aria-hidden="true">
      {values.map((val, idx) => {
        const heightPct =
          val > 0 ? Math.max(24, Math.round((val / max) * 100)) : 20;
        return (
          <span
            key={idx}
            className={`w-[3px] rounded-full ${val > 0 ? accentClass : "bg-slate-200"
              }`}
            style={{ height: `${heightPct}%` }}
          />
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function Overview({
  greeting,
  adminName,
  lastSyncedAt,
  totalRevenue,
  current30Revenue,
  revenueGrowthPct,
  averageOrderValue,
  revenueOrderCount,
  orderCount,
  pendingOrderCount,
  productCount,
  categoryCount,
  lowStockCount,
  lowStockThreshold,
  dailySales30,
  pipelineCounts,
  categorySales,
  topProducts,
  lowStockProducts,
  recentOrders,
  actionOrders,
}: OverviewProps) {
  const router = useRouter();
  const { lang, t, switchLang } = useAdminI18n();
  const [isRefreshing, startRefresh] = useTransition();
  const [chartRange, setChartRange] = useState<"7D" | "30D">("30D");
  const [productTab, setProductTab] = useState<"top" | "lowStock">(
    lowStockProducts.length > 0 && topProducts.length === 0 ? "lowStock" : "top"
  );
  const [orderTab, setOrderTab] = useState<"queue" | "recent">(
    actionOrders.length > 0 ? "queue" : "recent"
  );
  const [selectedOrder, setSelectedOrder] = useState<RecentOrderItem | null>(
    null
  );
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(
    null
  );
  const [orderFeedback, setOrderFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Search state (sinkron real dengan PostgreSQL via Server Action)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<DashboardSearchResult>({
    products: [],
    orders: [],
  });
  const searchRef = useRef<HTMLDivElement>(null);

  // Notifikasi Bell state
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Standar SaaS: revalidate saat tab kembali aktif jika data > 2 menit,
  // tanpa polling agresif tiap 60 detik yang mengganggu user saat bekerja.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const elapsedMs = Date.now() - new Date(lastSyncedAt).getTime();
        if (elapsedMs >= 120_000) {
          startRefresh(() => {
            router.refresh();
          });
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [lastSyncedAt, router]);

  // Debounced DB search via Server Action
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await searchDashboard(trimmed);
        if (!cancelled) {
          setSearchResults(res);
          setSearchOpen(true);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleManualRefresh = () => {
    startRefresh(() => {
      router.refresh();
    });
  };

  const getNextOrderStep = (
    status: OrderStatus
  ): { nextStatus: OrderStatus; label: string } | null => {
    if (status === "PENDING")
      return { nextStatus: "CONFIRMED", label: t.overview.stepConfirm };
    if (status === "CONFIRMED")
      return { nextStatus: "PROCESSING", label: t.overview.stepPack };
    if (status === "PROCESSING")
      return { nextStatus: "SHIPPED", label: t.overview.stepShip };
    if (status === "SHIPPED")
      return { nextStatus: "COMPLETED", label: t.overview.stepComplete };
    return null;
  };

  const handleQuickOrderStatus = async (
    orderId: string,
    targetStatus: OrderStatus,
    orderCode: string
  ) => {
    setOrderFeedback(null);
    setProcessingOrderId(orderId);
    try {
      const res = await updateOrderStatus(orderId, targetStatus);
      if (res.success) {
        setOrderFeedback({
          type: "success",
          message: `Pesanan ${orderCode} diperbarui ke "${ORDER_STATUS_META[res.data.status]?.label ?? res.data.status}".`,
        });
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) =>
            prev ? { ...prev, status: res.data.status } : null
          );
        }
        router.refresh();
      } else {
        setOrderFeedback({ type: "error", message: res.error });
      }
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Chart data
  const chartData =
    chartRange === "7D" ? dailySales30.slice(-7) : dailySales30;
  const chartTotalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
  const chartTotalOrders = chartData.reduce((sum, d) => sum + d.orders, 0);
  const hasChartActivity = chartTotalRevenue > 0 || chartTotalOrders > 0;

  // Mini tick bars untuk Stat Cards
  const last12Days = dailySales30.slice(-12);
  const revenueTicks = last12Days.map((d) => d.revenue);
  const orderTicks = last12Days.map((d) => d.orders);
  const aovTicks = last12Days.map((d) =>
    d.orders > 0 ? Math.round(d.revenue / d.orders) : 0
  );
  const healthyStockCount = Math.max(productCount - lowStockCount, 0);
  const catalogTicks = Array.from({ length: 12 }, (_, idx) =>
    idx < Math.round((healthyStockCount / Math.max(productCount, 1)) * 12)
      ? 1
      : 0
  );

  // Donut Chart Status Pesanan
  const statusSegments = [
    {
      name: t.statuses.PENDING,
      value: pipelineCounts.PENDING + pipelineCounts.CONFIRMED,
      color: "#0B1C30",
    },
    {
      name: t.statuses.PROCESSING,
      value: pipelineCounts.PROCESSING,
      color: "#475569",
    },
    {
      name: t.statuses.SHIPPED,
      value: pipelineCounts.SHIPPED,
      color: "#94a3b8",
    },
    {
      name: t.statuses.COMPLETED,
      value: pipelineCounts.COMPLETED,
      color: "#10b981",
    },
    {
      name: t.statuses.CANCELLED,
      value: pipelineCounts.CANCELLED,
      color: "#e2e8f0",
    },
  ];
  const activeDonutData = statusSegments.filter((s) => s.value > 0);
  const totalNotifications = pendingOrderCount + lowStockCount;
  const hasSearchHits =
    searchResults.products.length > 0 || searchResults.orders.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===== 1. TOP UTILITY BAR (Tinggi h-16 sejajar persis dengan garis Sidebar) ===== */}
      <div className="bg-white border-b border-slate-200 h-16 px-5 md:px-6 flex items-center">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Breadcrumb akurat: PASzar > Overview */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-slate-500"
          >
            <span className="font-semibold text-slate-700">PASzar</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-medium text-slate-900">
              {t.overview.title}
            </span>
          </nav>

          {/* Right Controls: Live DB Search + Refresh + Bell */}
          <div className="flex items-center gap-2">
            {/* Search Input + Live DB Dropdown */}
            <div className="relative hidden sm:block" ref={searchRef}>
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => {
                  if (searchQuery.trim()) setSearchOpen(true);
                }}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  if (val.trim()) {
                    setIsSearching(true);
                    setSearchOpen(true);
                  } else {
                    setIsSearching(false);
                    setSearchOpen(false);
                    setSearchResults({ products: [], orders: [] });
                  }
                }}
                placeholder={t.overview.searchPlaceholder}
                aria-label={t.overview.searchPlaceholder}
                className="w-56 lg:w-72 h-8 pl-8 pr-7 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-colors"
              />
              {isSearching ? (
                <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
              ) : (
                searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchOpen(false);
                    }}
                    aria-label="Hapus pencarian"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )
              )}

              {/* Search Results Popover (100% dari Prisma DB) */}
              {searchOpen && searchQuery.trim().length > 0 && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  {isSearching ? (
                    <div className="px-4 py-5 text-center text-xs text-slate-500">
                      Mencari di database...
                    </div>
                  ) : hasSearchHits ? (
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {searchResults.products.length > 0 && (
                        <div className="py-2">
                          <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Produk ({searchResults.products.length})
                          </p>
                          {searchResults.products.map((p) => (
                            <Link
                              key={p.id}
                              href={`/dashboard/produk/${p.id}`}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 transition-colors"
                            >
                              {p.image ? (
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-8 h-8 rounded object-cover border border-slate-200 shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                  <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-900 truncate">
                                  {p.name}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate">
                                  {p.categoryName} · {formatIDR(p.price)}
                                </p>
                              </div>
                              <span className="text-[11px] text-slate-500 shrink-0">
                                Stok {p.stock}
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}

                      {searchResults.orders.length > 0 && (
                        <div className="py-2">
                          <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Pesanan ({searchResults.orders.length})
                          </p>
                          {searchResults.orders.map((o) => (
                            <Link
                              key={o.id}
                              href="/dashboard/pesanan"
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-slate-50 transition-colors"
                            >
                              <div className="min-w-0">
                                <p className="text-xs font-mono font-semibold text-slate-900 truncate">
                                  {o.orderCode}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate">
                                  {o.customerName} · {o.customerCity}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-xs font-medium text-slate-900">
                                  {formatIDR(o.totalAmount)}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {ORDER_STATUS_META[o.status]?.label ?? o.status}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="px-4 py-5 text-center text-xs text-slate-500">
                      Tidak ditemukan hasil untuk &ldquo;{searchQuery}&rdquo;
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              title={`Sinkronisasi terakhir ${formatTimeHHMM(lastSyncedAt)}`}
              aria-label="Muat ulang data"
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-medium transition-colors disabled:opacity-60"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-slate-900" : ""}`}
              />
              <span className="hidden md:inline">
                {isRefreshing ? "Sync..." : formatTimeHHMM(lastSyncedAt)}
              </span>
            </button>

            {/* Notification Bell + Popover */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                aria-label="Notifikasi toko"
                className="relative w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {totalNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {totalNotifications > 9 ? "9+" : totalNotifications}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">
                      Notifikasi Operasional
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {totalNotifications} perlu perhatian
                    </span>
                  </div>

                  {totalNotifications > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {pendingOrderCount > 0 && (
                        <Link
                          href="/dashboard/pesanan"
                          onClick={() => setNotifOpen(false)}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900">
                              {pendingOrderCount} Pesanan Menunggu Diproses
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Konfirmasi pesanan masuk agar segera dikemas.
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-1" />
                        </Link>
                      )}

                      {lowStockCount > 0 && (
                        <Link
                          href="/dashboard/produk"
                          onClick={() => setNotifOpen(false)}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900">
                              {lowStockCount} Produk Stok Kritis (≤{" "}
                              {lowStockThreshold})
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Segera perbarui stok agar tetap tersedia di
                              katalog.
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-1" />
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                      <p className="text-xs font-medium text-slate-700">
                        Semua operasional aman
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Tidak ada pesanan tertunda atau stok menipis.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Language Switcher (ID | EN) */}
            <div
              role="group"
              aria-label="Pilih bahasa admin"
              className="inline-flex items-center bg-slate-100 border border-slate-200/80 p-0.5 rounded-lg h-8"
            >
              {(["id", "en"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => switchLang(code)}
                  className={`px-2 py-1 text-[11px] font-semibold uppercase rounded-md transition-colors cursor-pointer ${
                    lang === code
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTAINER ===== */}
      <div className="p-5 md:p-6 max-w-7xl mx-auto space-y-4 animate-soft-enter">
        {/* ===== 2. HERO HEADER ROW (Simple & Minimalis) ===== */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {t.overview.title}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === "en"
                ? greeting
                    .replace("Selamat Pagi", t.overview.greetingMorning)
                    .replace("Selamat Siang", t.overview.greetingAfternoon)
                    .replace("Selamat Malam", t.overview.greetingEvening)
                : greeting}
              , {adminName}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="inline-flex bg-slate-100 border border-slate-200/80 p-0.5 rounded-lg">
              {(["7D", "30D"] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setChartRange(range)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${chartRange === range
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  {range === "7D" ? t.overview.days7 : t.overview.days30}
                </button>
              ))}
            </div>

            <Link
              href="/dashboard/produk/baru"
              className="inline-flex items-center gap-1.5 bg-[#0B1C30] hover:bg-[#132944] text-white rounded-lg h-8 px-3 text-xs font-medium shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.overview.addProduct}</span>
            </Link>
          </div>
        </header>

        {/* ===== 2b. SUBTLE ACTION STRIP ===== */}
        {pendingOrderCount > 0 && (
          <div className="bg-white border border-slate-200 border-l-[3px] border-l-orange-500 rounded-xl shadow-sm px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
              <span className="font-semibold text-slate-900">
                {pendingOrderCount} {t.overview.actionStripTitle}
              </span>
              <span className="text-slate-500 hidden sm:inline">
                {t.overview.actionStripHint}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="#overview-orders"
                onClick={() => setOrderTab("queue")}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700"
              >
                {t.overview.processHere}
              </a>
              <span className="text-slate-300">|</span>
              <Link
                href="/dashboard/pesanan"
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                {t.overview.openOrdersPage} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {/* ===== 3. COMPACT STAT CARDS ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                {t.overview.activeRevenue}
              </span>
              <Wallet className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="flex items-end justify-between gap-2 mt-1.5">
              <div>
                <p className="text-xl font-bold text-slate-900 leading-tight">
                  {formatCompactIDR(totalRevenue)}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {revenueGrowthPct !== null ? (
                    <span
                      className={`font-medium ${revenueGrowthPct >= 0
                        ? "text-emerald-600"
                        : "text-rose-600"
                        }`}
                    >
                      {revenueGrowthPct >= 0
                        ? `↑ ${revenueGrowthPct}%`
                        : `↓ ${Math.abs(revenueGrowthPct)}%`}{" "}
                      {t.overview.vs30dAgo}
                    </span>
                  ) : (
                    <span>30d: {formatCompactIDR(current30Revenue)}</span>
                  )}
                </p>
              </div>
              <MiniTickBars values={revenueTicks} accentClass="bg-[#0B1C30]" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                {t.overview.totalOrders}
              </span>
              <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="flex items-end justify-between gap-2 mt-1.5">
              <div>
                <p className="text-xl font-bold text-slate-900 leading-tight">
                  {orderCount}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {pendingOrderCount > 0 ? (
                    <span className="text-blue-600 font-medium">
                      {pendingOrderCount} {t.overview.needsProcessing}
                    </span>
                  ) : (
                    <span>
                      {revenueOrderCount} {t.overview.activeOrdersCount}
                    </span>
                  )}
                </p>
              </div>
              <MiniTickBars values={orderTicks} accentClass="bg-slate-700" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                {t.overview.avgOrder}
              </span>
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="flex items-end justify-between gap-2 mt-1.5">
              <div>
                <p className="text-xl font-bold text-slate-900 leading-tight">
                  {formatCompactIDR(averageOrderValue)}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {t.overview.perActiveTx}
                </p>
              </div>
              <MiniTickBars values={aovTicks} accentClass="bg-slate-600" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                {t.overview.activeProducts}
              </span>
              <Package className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="flex items-end justify-between gap-2 mt-1.5">
              <div>
                <p className="text-xl font-bold text-slate-900 leading-tight">
                  {productCount}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {lowStockCount > 0 ? (
                    <span className="text-orange-600 font-medium">
                      {lowStockCount} {t.overview.criticalStock}
                    </span>
                  ) : (
                    <span>
                      {categoryCount} {t.overview.categoriesSafe}
                    </span>
                  )}
                </p>
              </div>
              <MiniTickBars
                values={catalogTicks}
                accentClass={
                  lowStockCount > 0 ? "bg-orange-500" : "bg-emerald-500"
                }
              />
            </div>
          </div>
        </div>

        {/* ===== 4. ANALYTICS CENTER (Grid 12: Grafik 8 + Donut Status 4) ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Kiri (8 Col): Bar Chart Aktivitas & Omzet Harian */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {t.overview.dailyRevenueTitle}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formatIDR(chartTotalRevenue)} {t.overview.fromActiveOrders}{" "}
                  {chartTotalOrders} {t.overview.activeOrdersCount} (
                  {chartRange === "7D"
                    ? t.overview.last7Days
                    : t.overview.last30Days}
                  )
                </p>
              </div>
              {categorySales.length > 0 && (
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-[#0B1C30]" />
                  <span>Top: {categorySales[0].name}</span>
                </div>
              )}
            </div>

            {hasChartActivity ? (
              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 6, right: 4, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={16}
                    />
                    <YAxis
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={60}
                      tickFormatter={(v: number) => formatCompactIDR(v)}
                    />
                    <Tooltip
                      content={<CustomChartTooltip />}
                      cursor={{ fill: "#f8fafc" }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#0B1C30"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50 px-4">
                <BarChart3 className="w-7 h-7 text-slate-300 mb-2" />
                <p className="text-xs font-medium text-slate-700">
                  Belum ada omzet pada periode ini
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs">
                  Grafik otomatis terisi saat pesanan berstatus Dikemas,
                  Dikirim, atau Selesai.
                </p>
              </div>
            )}
          </div>

          {/* Kanan (4 Col): Donut Status Pesanan */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {t.overview.orderStatusTitle}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t.overview.orderStatusSub}
                </p>
              </div>
              <Link
                href="/dashboard/pesanan"
                className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline"
              >
                {t.overview.manage}
              </Link>
            </div>

            {orderCount > 0 ? (
              <div className="flex items-center gap-4 my-auto">
                <div className="relative w-32 h-32 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activeDonutData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={54}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {activeDonutData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-lg font-bold text-slate-900 leading-none">
                      {orderCount}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {t.overview.ordersWord}
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-2 text-xs">
                  {statusSegments.map((seg) => {
                    const pct = Math.round((seg.value / orderCount) * 100);
                    return (
                      <div
                        key={seg.name}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="inline-flex items-center gap-1.5 text-slate-600 truncate">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: seg.color }}
                          />
                          <span className="truncate">{seg.name}</span>
                        </span>
                        <span className="tabular-nums text-slate-900 font-medium shrink-0">
                          {seg.value}{" "}
                          <span className="text-slate-400 font-normal">
                            {pct}%
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-center text-slate-500">
                <ShoppingBag className="w-7 h-7 text-slate-300 mb-2" />
                <p className="text-xs font-medium text-slate-700">
                  Belum ada pesanan
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ===== 5. BOTTOM ROW: ANTREAN & TRANSAKSI PESANAN (7) + PREVIEW PRODUK (5) ===== */}
        <div
          id="overview-orders"
          className="grid grid-cols-1 lg:grid-cols-12 gap-3.5"
        >
          {/* Kiri (7 Col): Antrean & Transaksi Pesanan */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="inline-flex bg-slate-100 border border-slate-200/80 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setOrderTab("queue")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 ${
                    orderTab === "queue"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>{t.overview.queueTab}</span>
                  {actionOrders.length > 0 && (
                    <span className="bg-orange-100 text-orange-700 px-1.5 rounded text-[10px] font-semibold">
                      {actionOrders.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setOrderTab("recent")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    orderTab === "recent"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {t.overview.recentTab}
                </button>
              </div>

              <Link
                href="/dashboard/pesanan"
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline px-1.5 py-1.5"
              >
                {t.overview.manageAllOrders}{" "}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {orderFeedback && (
              <div
                className={`mb-3 flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${
                  orderFeedback.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {orderFeedback.type === "success" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  )}
                  {orderFeedback.message}
                </span>
                <button
                  type="button"
                  onClick={() => setOrderFeedback(null)}
                  className="opacity-70 hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {(orderTab === "queue" ? actionOrders : recentOrders).length > 0 ? (
              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      <th className="py-2 pr-3">{t.overview.colCode}</th>
                      <th className="py-2 px-3">{t.overview.colCustomer}</th>
                      <th className="py-2 px-3">{t.overview.colTotal}</th>
                      <th className="py-2 px-3">{t.overview.colStatus}</th>
                      <th className="py-2 pl-3 text-right">
                        {t.overview.colQuickAction}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {(orderTab === "queue" ? actionOrders : recentOrders).map(
                      (order) => {
                        const meta = ORDER_STATUS_META[order.status];
                        const nextStep = getNextOrderStep(order.status);
                        const isBusy = processingOrderId === order.id;

                        return (
                          <tr
                            key={order.id}
                            className="hover:bg-slate-50/70 transition-colors"
                          >
                            <td className="py-2.5 pr-3 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(order)}
                                className="font-mono font-semibold text-slate-900 hover:underline text-left"
                              >
                                {order.orderCode}
                              </button>
                              <p className="text-[11px] text-slate-400">
                                {formatDateID(order.createdAt)}
                              </p>
                            </td>
                            <td className="py-2.5 px-3">
                              <p className="font-medium text-slate-900 truncate max-w-[140px]">
                                {order.customerName}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate max-w-[140px]">
                                {order.customerCity} · {order.itemCount} item
                              </p>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap font-semibold text-slate-900">
                              {formatIDR(order.totalAmount)}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${meta.badgeClass}`}
                              >
                                {t.statuses[order.status]}
                              </span>
                            </td>
                            <td className="py-2.5 pl-3 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                {nextStep && (
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() =>
                                      handleQuickOrderStatus(
                                        order.id,
                                        nextStep.nextStatus,
                                        order.orderCode
                                      )
                                    }
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#0B1C30] hover:bg-[#132944] text-white text-[11px] font-medium transition-colors disabled:opacity-50"
                                  >
                                    {isBusy && (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    )}
                                    <span>{nextStep.label}</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrder(order)}
                                  className="px-2 py-1 rounded-md border border-slate-200 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                >
                                  {t.common.detail}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex-1 py-10 flex flex-col items-center justify-center text-center text-slate-500">
                <CheckCircle2 className="w-7 h-7 text-emerald-400 mb-2" />
                <p className="text-xs font-medium text-slate-700">
                  {orderTab === "queue"
                    ? "Semua pesanan sudah diproses"
                    : "Belum ada transaksi masuk"}
                </p>
              </div>
            )}
          </div>

          {/* Kanan (5 Col): Preview Produk (Terlaris / Stok Kritis) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="inline-flex bg-slate-100 border border-slate-200/80 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setProductTab("top")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${productTab === "top"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  {t.overview.topProductsTab}
                </button>
                <button
                  type="button"
                  onClick={() => setProductTab("lowStock")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1 ${productTab === "lowStock"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  <span>{t.overview.lowStockTab}</span>
                  {lowStockCount > 0 && (
                    <span className="bg-orange-100 text-orange-700 px-1.5 rounded text-[10px] font-semibold">
                      {lowStockCount}
                    </span>
                  )}
                </button>
              </div>

              <Link
                href="/dashboard/produk"
                className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline"
              >
                {t.overview.allProducts}
              </Link>
            </div>

            {productTab === "top" ? (
              topProducts.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {topProducts.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/dashboard/produk/${p.id}`}
                        className="flex items-center gap-3 py-2.5 hover:bg-slate-50/80 -mx-2 px-2 rounded-lg transition-colors"
                      >
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <ImageIcon className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {p.categoryName} · {formatIDR(p.price)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="inline-block bg-slate-100 text-slate-800 text-[11px] font-semibold px-2 py-0.5 rounded">
                            {p.sold} {t.overview.soldWord}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {t.overview.stockWord} {p.stock}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex-1 py-10 flex flex-col items-center justify-center text-center text-slate-500">
                  <Package className="w-7 h-7 text-slate-300 mb-2" />
                  <p className="text-xs font-medium text-slate-700">
                    Belum ada produk terjual
                  </p>
                </div>
              )
            ) : lowStockProducts.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {lowStockProducts.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/dashboard/produk/${p.id}`}
                      className="flex items-center gap-3 py-2.5 hover:bg-slate-50/80 -mx-2 px-2 rounded-lg transition-colors"
                    >
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <ImageIcon className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {p.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {p.categoryName} · {formatIDR(p.price)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border ${p.stock === 0
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-orange-50 text-orange-700 border-orange-200"
                            }`}
                        >
                          {p.stock === 0
                            ? t.overview.outOfStock
                            : `${t.overview.remaining} ${p.stock}`}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {t.overview.restockLink}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex-1 py-10 flex flex-col items-center justify-center text-center text-slate-500">
                <CheckCircle2 className="w-7 h-7 text-emerald-400 mb-2" />
                <p className="text-xs font-medium text-slate-700">
                  Semua stok produk aman
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Order Detail Modal (langsung proses dari Overview) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-slate-100 z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {selectedOrder.orderCode}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${ORDER_STATUS_META[selectedOrder.status].badgeClass}`}
                  >
                    {ORDER_STATUS_META[selectedOrder.status].label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {formatDateID(selectedOrder.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Pelanggan */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedOrder.customerName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedOrder.customerPhone}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {selectedOrder.customerAddress},{" "}
                    {selectedOrder.customerCity},{" "}
                    {selectedOrder.customerProvince}{" "}
                    {selectedOrder.customerPostalCode}
                  </span>
                </div>
                {selectedOrder.notes && (
                  <div className="flex items-start gap-2 text-slate-600 pt-1.5 border-t border-slate-200">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="italic">{selectedOrder.notes}</span>
                  </div>
                )}
              </div>

              {/* Item */}
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-4 py-2.5 bg-white"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="font-semibold text-slate-900 truncate">
                        {item.productName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {item.quantity} × {formatIDR(item.productPrice)}
                      </p>
                    </div>
                    <span className="font-semibold text-slate-900 tabular-nums shrink-0">
                      {formatIDR(item.subtotal)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 font-bold text-slate-900">
                  <span>Total</span>
                  <span>{formatIDR(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <Link
                  href="/dashboard/pesanan"
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline"
                >
                  Kelola di Halaman Orders →
                </Link>
                {(() => {
                  const next = getNextOrderStep(selectedOrder.status);
                  if (!next) return null;
                  const isBusy = processingOrderId === selectedOrder.id;
                  return (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() =>
                        handleQuickOrderStatus(
                          selectedOrder.id,
                          next.nextStatus,
                          selectedOrder.orderCode
                        )
                      }
                      className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-[#0B1C30] hover:bg-[#132944] text-white text-xs font-medium disabled:opacity-50"
                    >
                      {isBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{next.label} Pesanan</span>
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
