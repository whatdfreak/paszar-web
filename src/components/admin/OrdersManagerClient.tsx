"use client";

// ============================================================
// PASzar — Orders Manager Client (Admin Dashboard)
// ============================================================
// PRD Ref: Section 4.3 — Pesanan
//   - Tabel daftar pesanan (kode, nama, total, status, tgl)
//   - Filter berdasarkan status
//   - Detail pesanan (modal) → daftar item, data pelanggan
//   - Ubah Status Pesanan (dropdown: PENDING→CONFIRMED→...→COMPLETED)
// ============================================================

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/actions/order.actions";
import {
  ShoppingBag,
  ChevronDown,
  X,
  User,
  MapPin,
  Phone,
  FileText,
  Package,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

export interface OrderItemRow {
  id: string;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderRow {
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
  createdAt: string; // ISO string from server
  items: OrderItemRow[];
}

// ── Status Config ─────────────────────────────────────────────

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; dot: string; text: string; bg: string; border: string }
> = {
  PENDING: {
    label: "Pending",
    dot: "bg-amber-400",
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  CONFIRMED: {
    label: "Dikonfirmasi",
    dot: "bg-blue-500",
    text: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  PROCESSING: {
    label: "Diproses",
    dot: "bg-violet-500",
    text: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  SHIPPED: {
    label: "Dikirim",
    dot: "bg-sky-500",
    text: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-200",
  },
  COMPLETED: {
    label: "Selesai",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  CANCELLED: {
    label: "Dibatalkan",
    dot: "bg-red-400",
    text: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
};

// PRD: PENDING→CONFIRMED→PROCESSING→SHIPPED→COMPLETED or →CANCELLED
const STATUS_FLOW: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
];

// ── Helpers ───────────────────────────────────────────────────

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

// ── Status Badge ──────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ── Status Updater (inline dropdown) ─────────────────────────

function StatusUpdater({
  orderId,
  currentStatus,
  onUpdated,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  onUpdated: (id: string, newStatus: OrderStatus) => void;
}) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus;
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        setStatus(result.data.status as OrderStatus);
        onUpdated(orderId, result.data.status as OrderStatus);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <select
          value={status}
          onChange={handleChange}
          disabled={isPending}
          className="appearance-none h-8 pl-3 pr-8 rounded-lg border border-slate-200 text-[12px] font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1C30]/20 focus:border-[#0B1C30]/40 transition-all disabled:opacity-60 cursor-pointer"
        >
          {STATUS_FLOW.map((s) => (
            <option key={s} value={s}>
              {STATUS_CONFIG[s].label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
      {error && (
        <p className="text-[10px] text-red-500 flex items-center gap-1">
          <AlertCircle size={9} /> {error}
        </p>
      )}
      {saved && (
        <p className="text-[10px] text-emerald-600 flex items-center gap-1">
          <CheckCircle2 size={9} /> Disimpan
        </p>
      )}
    </div>
  );
}

// ── Order Detail Modal ────────────────────────────────────────

function OrderDetailModal({
  order,
  onClose,
  onStatusUpdated,
}: {
  order: OrderRow;
  onClose: () => void;
  onStatusUpdated: (id: string, newStatus: OrderStatus) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl mb-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Detail Pesanan
            </p>
            <h3 className="text-[16px] font-bold text-slate-900 font-mono">
              {order.orderCode}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Update */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Status Pesanan
              </p>
              <StatusBadge status={order.status} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Ubah Status
              </p>
              <StatusUpdater
                orderId={order.id}
                currentStatus={order.status}
                onUpdated={onStatusUpdated}
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Package size={12} /> Item Pesanan
            </p>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              {order.items.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between px-4 py-3 ${
                    idx < order.items.length - 1 ? "border-b border-slate-100" : ""
                  }`}
                >
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800">
                      {item.productName}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatRupiah(item.productPrice)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-[13px] font-semibold text-slate-700 tabular-nums">
                    {formatRupiah(item.subtotal)}
                  </span>
                </div>
              ))}
              {/* Total */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200">
                <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
                  Total
                </span>
                <span className="text-[15px] font-bold text-slate-900 tabular-nums">
                  {formatRupiah(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <User size={12} /> Data Pelanggan
            </p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <User size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[12px] text-slate-400">Nama</p>
                  <p className="text-[13px] font-semibold text-slate-800">
                    {order.customerName}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[12px] text-slate-400">Nomor HP</p>
                  <p className="text-[13px] font-semibold text-slate-800">
                    {order.customerPhone}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[12px] text-slate-400">Alamat Pengiriman</p>
                  <p className="text-[13px] font-semibold text-slate-800">
                    {order.customerAddress}
                  </p>
                  <p className="text-[12px] text-slate-600">
                    {order.customerCity}, {order.customerProvince}{" "}
                    {order.customerPostalCode}
                  </p>
                </div>
              </div>
              {order.notes && (
                <div className="flex items-start gap-3">
                  <FileText size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[12px] text-slate-400">Catatan</p>
                    <p className="text-[13px] text-slate-800">{order.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            <span>Dibuat: {formatDate(order.createdAt)}</span>
            <span className="font-mono">{order.id.slice(0, 8)}...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Filter Tabs ───────────────────────────────────────────────

const FILTER_OPTIONS: Array<{ label: string; value: OrderStatus | "ALL" }> = [
  { label: "Semua", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Dikonfirmasi", value: "CONFIRMED" },
  { label: "Diproses", value: "PROCESSING" },
  { label: "Dikirim", value: "SHIPPED" },
  { label: "Selesai", value: "COMPLETED" },
  { label: "Dibatalkan", value: "CANCELLED" },
];

// ── Main Export ───────────────────────────────────────────────

export default function OrdersManagerClient({
  initialOrders,
}: {
  initialOrders: OrderRow[];
}) {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders);
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);

  const handleStatusUpdated = (id: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
    // Also update the detail modal if it's open
    if (selectedOrder?.id === id) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    router.refresh();
  };

  const filtered =
    filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">
          Pesanan Masuk
        </h1>
        <p className="text-[13px] text-slate-500 mt-0.5">
          {orders.length} total pesanan
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        {FILTER_OPTIONS.map(({ label, value }) => {
          const count =
            value === "ALL"
              ? orders.length
              : orders.filter((o) => o.status === value).length;
          const isActive = filter === value;
          return (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-semibold transition-all ${
                isActive
                  ? "bg-[#0B1C30] text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {label}
              {count > 0 && (
                <span
                  className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Table / Empty */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-slate-200">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <ShoppingBag size={24} className="text-slate-400" />
          </div>
          <p className="text-[15px] font-semibold text-slate-700 mb-1">
            Tidak ada pesanan
          </p>
          <p className="text-[13px] text-slate-400">
            {filter === "ALL"
              ? "Pesanan dari pembeli akan muncul di sini."
              : `Tidak ada pesanan dengan status "${STATUS_CONFIG[filter as OrderStatus]?.label}".`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-[0_1px_2px_0_rgba(0,0,0,0.04),0_1px_6px_-1px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em]">
                    Kode Pesanan
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em] hidden sm:table-cell">
                    Pelanggan
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em] hidden md:table-cell">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em] hidden lg:table-cell">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors last:border-0"
                  >
                    {/* Order Code */}
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[13px] font-bold text-slate-800">
                        {order.orderCode}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <p className="text-[13px] font-semibold text-slate-700">
                        {order.customerName}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {order.customerCity}, {order.customerProvince}
                      </p>
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-[13px] font-semibold text-slate-700 tabular-nums">
                        {formatRupiah(order.totalAmount)}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-[12px] text-slate-500">
                        {formatDate(order.createdAt)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={order.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
    </div>
  );
}
