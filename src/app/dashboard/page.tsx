// ============================================================
// PASzar — Dashboard Overview (Server Component)
// ============================================================
// AUDIT v2 — Backend Hardening:
//   ✅ Revenue: aggregate HANYA dari pesanan aktif (PROCESSING/SHIPPED/COMPLETED)
//   ✅ PENDING & CANCELLED dikecualikan dari perhitungan omzet
//   ✅ Low Stock Alert: count produk dengan stock <= 5
//   ✅ Recent Orders: take: 5, orderBy: createdAt desc
//   ✅ Session check redundan sebagai defence-in-depth (middleware sudah guard)
//   ✅ Semua query dijalankan paralel via Promise.all untuk efisiensi
// ============================================================

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import {
  Package,
  Tags,
  ShoppingBag,
  ArrowUpRight,
  Activity,
  CalendarDays,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

// ── Revenue-contributing statuses ─────────────────────────────
// PENDING  → belum pasti, tidak dihitung sebagai omzet
// CANCELLED → gagal, tidak dihitung
// PROCESSING / SHIPPED / COMPLETED → omzet nyata
const REVENUE_STATUSES: OrderStatus[] = [
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.COMPLETED,
];

// ── Low Stock Threshold ───────────────────────────────────────
const LOW_STOCK_THRESHOLD = 5;

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  accent = false,
  alert = false,
}: {
  label: string;
  value: string | number;
  unit: string;
  icon: React.ElementType;
  accent?: boolean;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-5 flex flex-col gap-3 shadow-[0_1px_2px_0_rgba(0,0,0,0.04),0_1px_6px_-1px_rgba(0,0,0,0.04)] ${
        alert
          ? "bg-amber-50 border-amber-200"
          : accent
          ? "bg-[#0B1C30] border-[#0B1C30]"
          : "bg-white border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <p
          className={`text-[11px] font-semibold uppercase tracking-[0.08em] ${
            alert
              ? "text-amber-600"
              : accent
              ? "text-white/60"
              : "text-slate-500"
          }`}
        >
          {label}
        </p>
        <div
          className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${
            alert
              ? "bg-amber-100"
              : accent
              ? "bg-white/10"
              : "bg-slate-50 border border-slate-100"
          }`}
        >
          <Icon
            size={15}
            strokeWidth={2}
            className={
              alert ? "text-amber-600" : accent ? "text-white" : "text-[#0B1C30]"
            }
          />
        </div>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span
          className={`text-[28px] font-bold leading-none tracking-tight tabular-nums ${
            alert
              ? "text-amber-700"
              : accent
              ? "text-white"
              : "text-slate-900"
          }`}
        >
          {typeof value === "number" ? value.toLocaleString("id-ID") : value}
        </span>
        <span
          className={`text-xs font-medium mb-0.5 ${
            alert ? "text-amber-500" : accent ? "text-white/50" : "text-slate-400"
          }`}
        >
          {unit}
        </span>
      </div>
    </div>
  );
}

// ── Status Config ─────────────────────────────────────────────
const statusConfig: Record<string, { label: string; dot: string; text: string }> = {
  PENDING:    { label: "Pending",    dot: "bg-amber-400",   text: "text-amber-700"  },
  CONFIRMED:  { label: "Confirmed",  dot: "bg-blue-500",    text: "text-blue-700"   },
  PROCESSING: { label: "Processing", dot: "bg-violet-500",  text: "text-violet-700" },
  SHIPPED:    { label: "Shipped",    dot: "bg-indigo-500",  text: "text-indigo-700" },
  COMPLETED:  { label: "Completed",  dot: "bg-emerald-500", text: "text-emerald-700"},
  CANCELLED:  { label: "Cancelled",  dot: "bg-red-400",     text: "text-red-600"    },
};

// ── Helpers ───────────────────────────────────────────────────
function formatRupiah(amount: number): string {
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)}jt`;
  }
  if (amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)}rb`;
  }
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

// ── Page ──────────────────────────────────────────────────────
export default async function DashboardPage() {
  // Defence-in-depth: session check di page level
  // (middleware sudah protect, ini lapisan kedua)
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // ── Semua query dijalankan PARALEL untuk efisiensi ────────────
  const [
    productCount,
    categoryCount,
    orderCount,
    revenueAggregate,
    lowStockCount,
    pendingOrderCount,
    recentOrders,
  ] = await Promise.all([
    // Total produk aktif
    prisma.product.count({ where: { isActive: true } }),

    // Total kategori
    prisma.category.count(),

    // Total pesanan (semua status)
    prisma.order.count(),

    // REVENUE: Aggregate HANYA pesanan dengan status aktif
    // PENDING & CANCELLED dikecualikan — tidak merepresentasikan omzet nyata
    prisma.order.aggregate({
      where: { status: { in: REVENUE_STATUSES } },
      _sum: { totalAmount: true },
      _count: { id: true },
    }),

    // LOW STOCK ALERT: Produk aktif dengan stok kritis (≤ threshold)
    prisma.product.count({
      where: {
        isActive: true,
        stock: { lte: LOW_STOCK_THRESHOLD },
      },
    }),

    // Pesanan pending yang butuh tindakan admin
    prisma.order.count({
      where: { status: OrderStatus.PENDING },
    }),

    // Recent orders — take: 5, sorted by newest first
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderCode: true,
        customerName: true,
        totalAmount: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  const totalRevenue = revenueAggregate._sum.totalAmount ?? 0;
  const completedOrderCount = revenueAggregate._count.id;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Selamat pagi" : hour < 17 ? "Selamat siang" : "Selamat malam";
  const firstName = session.user?.name?.split(" ")[0] ?? "Admin";

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-6 mb-6 border-b border-slate-200 gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.08em] mb-1">
            Admin Dashboard
          </p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
            {greeting}, {firstName}.
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Berikut ringkasan kinerja toko Anda hari ini.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-md px-3 py-2 shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] flex-shrink-0">
          <CalendarDays size={13} strokeWidth={2} className="text-slate-400" />
          {new Date().toLocaleDateString("id-ID", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>

      {/* ── Alert Banner: Low Stock ── */}
      {lowStockCount > 0 && (
        <div className="mb-5 flex items-center gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" strokeWidth={2} />
          <p className="text-[13px] text-amber-800">
            <span className="font-bold">{lowStockCount} produk</span> memiliki stok kritis
            (≤ {LOW_STOCK_THRESHOLD} unit). Segera perbarui stok.
          </p>
          <Link
            href="/dashboard/produk"
            className="ml-auto text-[12px] font-bold text-amber-700 border border-amber-300 rounded-md px-3 py-1.5 hover:bg-amber-100 transition-colors whitespace-nowrap flex-shrink-0"
          >
            Kelola Produk →
          </Link>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Revenue Card — accent style */}
        <div className="col-span-2 lg:col-span-1">
          <StatCard
            label="Total Omzet"
            value={formatRupiah(totalRevenue)}
            unit={`dari ${completedOrderCount} pesanan`}
            icon={TrendingUp}
            accent={true}
          />
        </div>
        <StatCard
          label="Produk Aktif"
          value={productCount}
          unit="produk"
          icon={Package}
        />
        <StatCard
          label="Total Pesanan"
          value={orderCount}
          unit="pesanan"
          icon={ShoppingBag}
        />
        {lowStockCount > 0 ? (
          <StatCard
            label="Stok Kritis"
            value={lowStockCount}
            unit={`≤ ${LOW_STOCK_THRESHOLD} unit`}
            icon={AlertTriangle}
            alert={true}
          />
        ) : (
          <StatCard
            label="Kategori"
            value={categoryCount}
            unit="kategori"
            icon={Tags}
          />
        )}
      </div>

      {/* ── Split Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Recent Transactions ── */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-[0_1px_2px_0_rgba(0,0,0,0.04),0_1px_6px_-1px_rgba(0,0,0,0.04)] flex flex-col">
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-200">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Transaksi Terbaru</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {recentOrders.length} pesanan terbaru
              </p>
            </div>
            <Link
              href="/dashboard/pesanan"
              className="text-[11px] font-semibold text-[#0B1C30] border border-slate-200 rounded-md px-3 py-1.5 hover:bg-slate-50 transition-colors"
            >
              Lihat semua
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-200">
                  <th className="px-5 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.08em] whitespace-nowrap">
                    Kode Pesanan
                  </th>
                  <th className="px-5 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.08em]">
                    Pelanggan
                  </th>
                  <th className="px-5 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.08em] hidden md:table-cell">
                    Tanggal
                  </th>
                  <th className="px-5 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.08em] text-right">
                    Total
                  </th>
                  <th className="px-5 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.08em] text-right">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">
                      Belum ada pesanan.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const s = statusConfig[order.status] ?? {
                      label: order.status,
                      dot: "bg-slate-400",
                      text: "text-slate-600",
                    };
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50/60 transition-colors duration-100"
                      >
                        <td className="px-5 py-3 text-[11px] font-mono font-medium text-slate-500 whitespace-nowrap">
                          {order.orderCode}
                        </td>
                        <td className="px-5 py-3 text-sm font-medium text-slate-900 max-w-[140px] truncate">
                          {order.customerName}
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap hidden md:table-cell">
                          {order.createdAt.toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-3 text-sm font-semibold text-slate-900 text-right tabular-nums whitespace-nowrap">
                          Rp{order.totalAmount.toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${s.text}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
                            {s.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Quick Actions Panel ── */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgba(0,0,0,0.04),0_1px_6px_-1px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center gap-2">
            <Activity size={14} strokeWidth={2} className="text-[#0B1C30]" />
            <h2 className="text-sm font-semibold text-slate-900">Ringkasan Status</h2>
          </div>

          <div className="flex-1 p-5 flex flex-col gap-3">
            {/* Pending action counter */}
            {pendingOrderCount > 0 && (
              <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-amber-800">
                    {pendingOrderCount} pesanan menunggu
                  </p>
                  <p className="text-[11px] text-amber-600">Perlu konfirmasi admin</p>
                </div>
                <Link
                  href="/dashboard/pesanan"
                  className="flex-shrink-0 text-[11px] font-bold text-amber-700 hover:underline"
                >
                  Cek →
                </Link>
              </div>
            )}

            {/* Quick links */}
            <div className="space-y-2 mt-1">
              {[
                { label: "Tambah Produk Baru", href: "/dashboard/produk/baru", icon: Package },
                { label: "Kelola Kategori", href: "/dashboard/kategori", icon: Tags },
                { label: "Semua Pesanan", href: "/dashboard/pesanan", icon: ShoppingBag },
              ].map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
                >
                  <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#0B1C30]/[0.06] transition-colors">
                    <Icon size={13} className="text-slate-500 group-hover:text-[#0B1C30]" strokeWidth={2} />
                  </div>
                  <span className="text-[13px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                    {label}
                  </span>
                  <ArrowUpRight size={13} className="ml-auto text-slate-300 group-hover:text-slate-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
