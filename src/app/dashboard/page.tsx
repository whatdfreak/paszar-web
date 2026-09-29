// ============================================================
// PASzar — Dashboard (Enterprise SaaS Standard)
// ============================================================
// Cards: rounded-lg, 3-layer diffused shadow, navy accent
// Table: Enterprise data-grid with strong header separation
// Header: Clean hierarchy, badge-less date chip
// ============================================================

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Package,
  Tags,
  ShoppingBag,
  ArrowUpRight,
  Activity,
  CalendarDays,
} from "lucide-react";

// ── Stat Card ────────────────────────────────────────────────
function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  trendUp = true,
}: {
  label: string;
  value: number;
  unit: string;
  icon: React.ElementType;
  trend: string;
  trendUp?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col gap-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.04),0_1px_6px_-1px_rgba(0,0,0,0.04)]">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.08em]">
          {label}
        </p>
        <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
          <Icon size={15} strokeWidth={2} className="text-[#0B1C30]" />
        </div>
      </div>

      {/* Value */}
      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[28px] font-bold text-slate-900 leading-none tracking-tight tabular-nums">
            {value.toLocaleString("id-ID")}
          </span>
          <span className="text-xs font-medium text-slate-400 mb-0.5">{unit}</span>
        </div>
      </div>

      {/* Trend */}
      <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100">
        <span
          className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
            trendUp ? "text-emerald-600" : "text-red-500"
          }`}
        >
          <ArrowUpRight size={12} strokeWidth={2.5} className={trendUp ? "" : "rotate-180"} />
          {trend}
        </span>
        <span className="text-[11px] text-slate-400">from last month</span>
      </div>
    </div>
  );
}

// ── Status Config ─────────────────────────────────────────────
const statusConfig: Record<string, { label: string; dot: string; text: string }> = {
  PENDING:    { label: "Pending",    dot: "bg-amber-400",   text: "text-amber-700" },
  CONFIRMED:  { label: "Confirmed",  dot: "bg-blue-500",    text: "text-blue-700"  },
  PROCESSING: { label: "Processing", dot: "bg-violet-500",  text: "text-violet-700"},
  SHIPPED:    { label: "Shipped",    dot: "bg-indigo-500",  text: "text-indigo-700"},
  COMPLETED:  { label: "Completed",  dot: "bg-emerald-500", text: "text-emerald-700"},
  CANCELLED:  { label: "Cancelled",  dot: "bg-red-400",     text: "text-red-600"   },
};

// ── Page ─────────────────────────────────────────────────────
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [productCount, categoryCount, orderCount] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
  ]);

  const recentOrders = await prisma.order.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderCode: true,
      customerName: true,
      totalAmount: true,
      status: true,
      createdAt: true,
    },
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-6 mb-6 border-b border-slate-200 gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.08em] mb-1">
            Admin Dashboard
          </p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
            {greeting}, {session.user.name.split(" ")[0]}.
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Here&apos;s an overview of your store&apos;s performance.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-md px-3 py-2 shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] flex-shrink-0">
          <CalendarDays size={13} strokeWidth={2} className="text-slate-400" />
          {new Date().toLocaleDateString("en-GB", {
            weekday: "short", day: "numeric", month: "short", year: "numeric",
          })}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Products"   value={productCount}   unit="items"  icon={Package}     trend="12%" trendUp={true} />
        <StatCard label="Total Categories" value={categoryCount}  unit="types"  icon={Tags}        trend="2%"  trendUp={true} />
        <StatCard label="Total Orders"     value={orderCount}     unit="orders" icon={ShoppingBag} trend="8%"  trendUp={orderCount > 0} />
      </div>

      {/* ── Split Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Recent Transactions (Enterprise Data-Grid) ── */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-[0_1px_2px_0_rgba(0,0,0,0.04),0_1px_6px_-1px_rgba(0,0,0,0.04)] flex flex-col">
          {/* Card header */}
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-200">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recent Transactions</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Last {recentOrders.length} orders</p>
            </div>
            <button className="text-[11px] font-semibold text-[#0B1C30] border border-slate-200 rounded-md px-3 py-1.5 hover:bg-slate-50 transition-colors">
              View all
            </button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* Table Head — strong separation */}
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-200">
                  <th className="px-5 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.08em] whitespace-nowrap">
                    Order ID
                  </th>
                  <th className="px-5 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.08em]">
                    Customer
                  </th>
                  <th className="px-5 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.08em]">
                    Date
                  </th>
                  <th className="px-5 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.08em] text-right">
                    Amount
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
                      No recent orders found.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const s = statusConfig[order.status] ?? {
                      label: order.status, dot: "bg-slate-400", text: "text-slate-600",
                    };
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/60 transition-colors duration-100 group">
                        <td className="px-5 py-3 text-[11px] font-mono font-medium text-slate-500 whitespace-nowrap">
                          {order.orderCode}
                        </td>
                        <td className="px-5 py-3 text-sm font-medium text-slate-900 max-w-[160px] truncate">
                          {order.customerName}
                        </td>
                        <td className="px-5 py-3 text-xs font-normal text-slate-400 whitespace-nowrap">
                          {order.createdAt.toLocaleDateString("en-GB", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-3 text-sm font-semibold text-slate-900 text-right tabular-nums whitespace-nowrap">
                          Rp{order.totalAmount.toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {/* Dot + label status — data-grid style */}
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${s.text}`}>
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

        {/* ── Activity Panel ── */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgba(0,0,0,0.04),0_1px_6px_-1px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center gap-2">
            <Activity size={14} strokeWidth={2} className="text-[#0B1C30]" />
            <h2 className="text-sm font-semibold text-slate-900">Activity</h2>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-10 h-10 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center mb-3">
              <Activity size={16} strokeWidth={1.5} className="text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-700">All clear</p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-[180px]">
              No pending actions. You&apos;ll be notified when attention is needed.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
