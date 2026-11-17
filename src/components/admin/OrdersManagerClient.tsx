"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/actions/order.actions";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { TableCheckbox } from "@/components/admin/TableCheckbox";
import { useAdminI18n } from "@/lib/admin-i18n";
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
  Search,
  Table2,
  LayoutGrid,
  SlidersHorizontal,
  ArrowUpDown,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Loader2,
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
  createdAt: string;
  items: OrderItemRow[];
}

type ViewMode = "table" | "grid";
type OrderSort = "newest" | "oldest" | "totalDesc" | "totalAsc";

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
    dot: "bg-sky-500",
    text: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-200",
  },
  PROCESSING: {
    label: "Diproses",
    dot: "bg-blue-500",
    text: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  SHIPPED: {
    label: "Dikirim",
    dot: "bg-indigo-500",
    text: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
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
    dot: "bg-rose-400",
    text: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
};

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

function formatCompactIDR(amount: number): string {
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

function StatusBadge({
  status,
  label,
}: {
  status: OrderStatus;
  label?: string;
}) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {label ?? cfg.label}
    </span>
  );
}

// ── Inline Status Updater ─────────────────────────────────────

function StatusUpdater({
  orderId,
  currentStatus,
  statusLabels,
  onUpdated,
  onError,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  statusLabels: Record<OrderStatus, string>;
  onUpdated: (id: string, newStatus: OrderStatus) => void;
  onError: (msg: string) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (newStatusValue: string) => {
    const newStatus = newStatusValue as OrderStatus;
    if (newStatus === currentStatus) return;
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        onUpdated(orderId, result.data.status as OrderStatus);
      } else {
        onError(result.error);
      }
    });
  };

  const cfg = STATUS_CONFIG[currentStatus];

  return (
    <div className="inline-flex items-center gap-1.5">
      <AdminSelect
        value={currentStatus}
        disabled={isPending}
        ariaLabel="Ubah status pesanan"
        onChange={handleChange}
        menuClassName="w-40"
        triggerClassName={`inline-flex items-center justify-between gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-semibold border cursor-pointer transition-colors disabled:opacity-60 ${cfg.bg} ${cfg.text} ${cfg.border}`}
        options={STATUS_FLOW.map((s) => ({
          value: s,
          label: statusLabels[s],
        }))}
      />
      {isPending && (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
      )}
    </div>
  );
}

// ── Order Detail Modal ────────────────────────────────────────

function OrderDetailModal({
  order,
  onClose,
  onStatusUpdated,
  onError,
}: {
  order: OrderRow;
  onClose: () => void;
  onStatusUpdated: (id: string, newStatus: OrderStatus) => void;
  onError: (msg: string) => void;
}) {
  const { t } = useAdminI18n();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-slate-100 z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-sm font-bold text-slate-900">
                {order.orderCode}
              </span>
              <StatusBadge
                status={order.status}
                label={t.statuses[order.status]}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Dibuat {formatDate(order.createdAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <span className="text-xs font-semibold text-slate-700">
              {t.orders.modalChangeStatus}
            </span>
            <StatusUpdater
              orderId={order.id}
              currentStatus={order.status}
              statusLabels={t.statuses}
              onUpdated={onStatusUpdated}
              onError={onError}
            />
          </div>

          {/* Data Pelanggan */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Data Pelanggan & Pengiriman
            </p>
            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{order.customerName}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{order.customerPhone}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  {order.customerAddress}, {order.customerCity},{" "}
                  {order.customerProvince} {order.customerPostalCode}
                </span>
              </div>
              {order.notes && (
                <div className="flex items-start gap-2 text-slate-600 pt-1.5 border-t border-slate-200">
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="italic">{order.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Daftar Item */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Item Pesanan ({order.items.length})
            </p>
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-4 py-3 text-xs bg-white"
                >
                  <div className="min-w-0 pr-3">
                    <p className="font-semibold text-slate-900 truncate">
                      {item.productName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {item.quantity} × {formatRupiah(item.productPrice)}
                    </p>
                  </div>
                  <span className="font-semibold text-slate-900 tabular-nums shrink-0">
                    {formatRupiah(item.subtotal)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 text-xs font-bold text-slate-900">
                <span>Total Pembayaran</span>
                <span className="tabular-nums">
                  {formatRupiah(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────

export default function OrdersManagerClient({
  initialOrders,
}: {
  initialOrders: OrderRow[];
}) {
  const router = useRouter();
  const { t } = useAdminI18n();
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [statusFilters, setStatusFilters] = useState<OrderStatus[]>([]);
  const [sortBy, setSortBy] = useState<OrderSort>("newest");
  const [showStatistics, setShowStatistics] = useState(true);

  const [openMenu, setOpenMenu] = useState<"view" | "filter" | "sort" | null>(
    null
  );
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Pagination
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [goToInput, setGoToInput] = useState<string>("");

  // Selection & Detail Modal
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailOrder, setDetailOrder] = useState<OrderRow | null>(null);
  const [isMutating, startMutation] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target;
      if (
        target instanceof Element &&
        target.closest('[data-admin-select-menu="true"]')
      ) {
        return;
      }
      if (toolbarRef.current && !toolbarRef.current.contains(target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // ── Real Metrics ────────────────────────────────────────────
  const totalOrders = orders.length;
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const inProgressCount = orders.filter(
    (o) =>
      o.status === "CONFIRMED" ||
      o.status === "PROCESSING" ||
      o.status === "SHIPPED"
  ).length;
  const completedCount = orders.filter((o) => o.status === "COMPLETED").length;
  const activeRevenue = orders
    .filter(
      (o) =>
        o.status === "PROCESSING" ||
        o.status === "SHIPPED" ||
        o.status === "COMPLETED"
    )
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // ── Filter & Sort ───────────────────────────────────────────
  const q = search.trim().toLowerCase();
  const filteredOrders = orders
    .filter((o) => {
      if (
        q &&
        !o.orderCode.toLowerCase().includes(q) &&
        !o.customerName.toLowerCase().includes(q) &&
        !o.customerCity.toLowerCase().includes(q) &&
        !o.customerPhone.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (statusFilters.length > 0 && !statusFilters.includes(o.status)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "oldest") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      if (sortBy === "totalDesc") return b.totalAmount - a.totalAmount;
      if (sortBy === "totalAsc") return a.totalAmount - b.totalAmount;
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

  // ── Pagination ──────────────────────────────────────────────
  const totalFiltered = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + pageSize
  );

  const pageIds = paginatedOrders.map((o) => o.id);
  const allOnPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  const toggleSelectAllPage = () => {
    if (allOnPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleGoToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(goToInput);
    if (!Number.isInteger(num) || num < 1) return;
    setCurrentPage(Math.min(num, totalPages));
    setGoToInput("");
  };

  const handleStatusUpdated = (id: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
    if (detailOrder?.id === id) {
      setDetailOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    setFeedback({
      type: "success",
      message: `Status pesanan diperbarui ke "${STATUS_CONFIG[newStatus].label}".`,
    });
    router.refresh();
  };

  const handleBulkStatusUpdate = (targetStatus: OrderStatus) => {
    if (selectedIds.length === 0) return;
    setFeedback(null);

    startMutation(async () => {
      let updatedCount = 0;
      const updatedMap = new Map<string, OrderStatus>();
      let firstError: string | null = null;

      for (const id of selectedIds) {
        const res = await updateOrderStatus(id, targetStatus);
        if (res.success) {
          updatedCount += 1;
          updatedMap.set(id, res.data.status as OrderStatus);
        } else if (!firstError) {
          firstError = res.error;
        }
      }

      if (updatedMap.size > 0) {
        setOrders((prev) =>
          prev.map((o) =>
            updatedMap.has(o.id) ? { ...o, status: updatedMap.get(o.id)! } : o
          )
        );
      }

      setSelectedIds([]);
      setFeedback(
        firstError
          ? {
              type: "error",
              message: `${updatedCount} pesanan diperbarui. Sebagian gagal: ${firstError}`,
            }
          : {
              type: "success",
              message: `${updatedCount} pesanan berhasil diubah ke "${STATUS_CONFIG[targetStatus].label}".`,
            }
      );
      router.refresh();
    });
  };

  const pageNumbers: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= safePage - 1 && i <= safePage + 1)
    ) {
      pageNumbers.push(i);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <AdminTopBar
        breadcrumbs={[
          { label: "PASzar", href: "/dashboard" },
          { label: t.orders.title },
        ]}
        rightSlot={
          <div className="relative hidden sm:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari kode order, pelanggan, atau kota..."
              aria-label="Cari pesanan"
              className="w-60 lg:w-72 h-8 pl-8 pr-7 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                aria-label="Hapus pencarian"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        }
      />

      <div className="p-5 md:p-6 max-w-7xl mx-auto space-y-4 animate-soft-enter">
        <header>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {t.orders.title}
          </h1>
        </header>

        {/* Action Toolbar Row */}
        <div
          ref={toolbarRef}
          className="flex flex-wrap items-center justify-between gap-2.5"
        >
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenMenu((m) => (m === "view" ? null : "view"))
                }
                className="inline-flex items-center gap-1.5 h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
              >
                {viewMode === "table" ? (
                  <Table2 className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{viewMode === "table" ? "Table View" : "Grid View"}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {openMenu === "view" && (
                <div className="absolute left-0 mt-1.5 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("table");
                      setOpenMenu(null);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                      viewMode === "table"
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Table2 className="w-3.5 h-3.5" /> Table View
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("grid");
                      setOpenMenu(null);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                      viewMode === "grid"
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" /> Grid View
                  </button>
                </div>
              )}
            </div>

            {/* Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenMenu((m) => (m === "filter" ? null : "filter"))
                }
                className={`inline-flex items-center gap-1.5 h-8 px-2.5 border rounded-lg text-xs font-medium shadow-sm transition-colors ${
                  statusFilters.length > 0
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{t.common.filter}</span>
                {statusFilters.length > 0 && (
                  <span className="px-1.5 rounded-full bg-white/20 text-[10px]">
                    {statusFilters.length}
                  </span>
                )}
              </button>

              {openMenu === "filter" && (
                <div className="absolute left-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-3 space-y-2">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {t.orders.colStatus}
                  </p>
                  <div className="space-y-1">
                    {STATUS_FLOW.map((s) => {
                      const checked = statusFilters.includes(s);
                      const count = orders.filter((o) => o.status === s).length;
                      return (
                        <div
                          key={s}
                          onClick={() => {
                            setStatusFilters((prev) =>
                              prev.includes(s)
                                ? prev.filter((item) => item !== s)
                                : [...prev, s]
                            );
                            setCurrentPage(1);
                          }}
                          className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-slate-50 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2.5">
                            <TableCheckbox
                              checked={checked}
                              onChange={() => {}}
                              ariaLabel={t.statuses[s]}
                            />
                            <span className="text-xs text-slate-700 font-medium">
                              {t.statuses[s]}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilters([]);
                        setCurrentPage(1);
                      }}
                      className="text-[11px] font-medium text-slate-500 hover:text-slate-900"
                    >
                      {t.common.resetFilter}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenMenu(null)}
                      className="text-[11px] font-semibold text-[#0B1C30]"
                    >
                      {t.common.apply}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenMenu((m) => (m === "sort" ? null : "sort"))
                }
                className="inline-flex items-center gap-1.5 h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span>Sort</span>
              </button>

              {openMenu === "sort" && (
                <div className="absolute left-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1">
                  {(
                    [
                      { key: "newest", label: "Terbaru" },
                      { key: "oldest", label: "Terlama" },
                      { key: "totalDesc", label: "Total Tertinggi" },
                      { key: "totalAsc", label: "Total Terendah" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.key);
                        setCurrentPage(1);
                        setOpenMenu(null);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                        sortBy === opt.key
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Show Statistics */}
            <label className="inline-flex items-center gap-2 pl-2 cursor-pointer select-none">
              <span className="text-xs font-medium text-slate-600">
                Show Statistics
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={showStatistics}
                onClick={() => setShowStatistics((s) => !s)}
                className={`relative w-8 h-4.5 rounded-full transition-colors ${
                  showStatistics ? "bg-orange-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`block w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
                    showStatistics ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
            </label>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-xs font-medium ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              {feedback.message}
            </span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="opacity-70 hover:opacity-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Unified 4-Col Stat Card Strip */}
        {showStatistics && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            <div className="p-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span>{t.orders.totalOrders}</span>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-1.5 tabular-nums">
                {totalOrders}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                <span className="inline-block bg-amber-50 text-amber-700 font-semibold px-1.5 py-0.5 rounded">
                  {pendingCount} {t.orders.pendingWord}
                </span>{" "}
                {t.orders.waitingConfirm}
              </p>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span>{t.orders.activeRevenue}</span>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-1.5 tabular-nums">
                {formatCompactIDR(activeRevenue)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {t.orders.activeRevenueSub}
              </p>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span>{t.orders.inProgress}</span>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-1.5 tabular-nums">
                {inProgressCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {t.orders.inProgressSub}
              </p>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span>{t.orders.completed}</span>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-1.5 tabular-nums">
                {completedCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {totalOrders > 0
                  ? `${Math.round((completedCount / totalOrders) * 100)}% ${t.orders.fromTotalOrders}`
                  : t.orders.noTxYet}
              </p>
            </div>
          </div>
        )}

        {/* Mobile Search */}
        <div className="relative sm:hidden">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari kode order atau pelanggan..."
            className="w-full h-9 pl-8 pr-3 bg-white border border-slate-200 rounded-lg text-xs"
          />
        </div>

        {/* Table / Grid View */}
        {paginatedOrders.length > 0 ? (
          viewMode === "table" ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                      <th className="pl-4 pr-2 py-3 w-10">
                        <TableCheckbox
                          checked={allOnPageSelected}
                          onChange={toggleSelectAllPage}
                          ariaLabel="Pilih semua pesanan di halaman ini"
                        />
                      </th>
                      <th className="px-3 py-3">{t.orders.colOrderCode}</th>
                      <th className="px-3 py-3">{t.orders.colCustomer}</th>
                      <th className="px-3 py-3 hidden md:table-cell">
                        {t.orders.colItems}
                      </th>
                      <th className="px-3 py-3">{t.orders.colTotal}</th>
                      <th className="px-3 py-3">{t.orders.colStatus}</th>
                      <th className="px-4 py-3 text-right">
                        {t.common.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {paginatedOrders.map((order) => {
                      const isSelected = selectedIds.includes(order.id);
                      return (
                        <tr
                          key={order.id}
                          className={`transition-colors ${
                            isSelected
                              ? "bg-orange-50/50"
                              : "hover:bg-slate-50/70"
                          }`}
                        >
                          <td className="pl-4 pr-2 py-2.5">
                            <TableCheckbox
                              checked={isSelected}
                              onChange={() => toggleRowSelection(order.id)}
                              ariaLabel={`Pilih pesanan ${order.orderCode}`}
                            />
                          </td>

                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setDetailOrder(order)}
                              className="font-mono font-semibold text-slate-900 hover:underline text-left"
                            >
                              {order.orderCode}
                            </button>
                            <p className="text-[11px] text-slate-400">
                              {formatDate(order.createdAt)}
                            </p>
                          </td>

                          <td className="px-3 py-2.5">
                            <p className="font-semibold text-slate-900 truncate max-w-[170px]">
                              {order.customerName}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate max-w-[170px]">
                              {order.customerCity} · {order.customerPhone}
                            </p>
                          </td>

                          <td className="px-3 py-2.5 hidden md:table-cell text-slate-600">
                            <span className="inline-flex items-center gap-1">
                              <Package className="w-3.5 h-3.5 text-slate-400" />
                              {order.items.length} item
                            </span>
                          </td>

                          <td className="px-3 py-2.5 font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                            {formatRupiah(order.totalAmount)}
                          </td>

                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <StatusUpdater
                              orderId={order.id}
                              currentStatus={order.status}
                              statusLabels={t.statuses}
                              onUpdated={handleStatusUpdated}
                              onError={(msg) =>
                                setFeedback({ type: "error", message: msg })
                              }
                            />
                          </td>

                          <td className="px-4 py-2.5 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setDetailOrder(order)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{t.common.detail}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {paginatedOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {order.orderCode}
                      </span>
                      <StatusBadge
                        status={order.status}
                        label={t.statuses[order.status]}
                      />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {order.customerName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {order.customerCity} · {order.items.length} item
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                    <div>
                      <p className="text-sm font-bold text-slate-900 tabular-nums">
                        {formatRupiah(order.totalAmount)}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDetailOrder(order)}
                      className="h-7 px-2.5 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm py-14 px-4 text-center flex flex-col items-center">
            <ShoppingBag className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              {search || statusFilters.length > 0
                ? t.orders.emptyFiltered
                : t.orders.emptyAll}
            </p>
            {(search || statusFilters.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilters([]);
                  setCurrentPage(1);
                }}
                className="mt-3 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                {t.common.resetFilter}
              </button>
            )}
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>{t.common.showingPerPage}</span>
            <AdminSelect
              value={String(pageSize)}
              ariaLabel="Jumlah pesanan per halaman"
              menuClassName="w-20"
              onChange={(val) => {
                setPageSize(Number(val));
                setCurrentPage(1);
              }}
              options={[5, 10, 20, 50].map((size) => ({
                value: String(size),
                label: String(size),
              }))}
            />
            <span className="text-slate-400 hidden md:inline">
              ({totalFiltered === 0 ? 0 : startIndex + 1}–
              {Math.min(startIndex + pageSize, totalFiltered)} dari{" "}
              {totalFiltered})
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(1)}
              className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {pageNumbers.map((num, idx) => {
              const prevNum = pageNumbers[idx - 1];
              const showEllipsis = prevNum !== undefined && num - prevNum > 1;
              return (
                <span key={num} className="inline-flex items-center gap-1">
                  {showEllipsis && (
                    <span className="px-1 text-slate-400">...</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(num)}
                    className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-semibold transition-colors ${
                      num === safePage
                        ? "bg-orange-500 text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {num}
                  </button>
                </span>
              );
            })}

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <form onSubmit={handleGoToPage} className="flex items-center gap-1.5">
            <span>{t.common.goToPage}</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={goToInput}
              onChange={(e) => setGoToInput(e.target.value)}
              placeholder={String(safePage)}
              className="w-12 h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs text-center tabular-nums"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-0.5 h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              <span>{t.common.go}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </form>
        </div>
      </div>

      {/* Floating Bulk Status Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-white border border-slate-200 rounded-xl shadow-xl px-4 py-2.5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-900 pr-1">
            {selectedIds.length} {t.common.selected}
          </span>
          <div className="h-4 w-px bg-slate-200" />
          <button
            type="button"
            disabled={isMutating}
            onClick={() => handleBulkStatusUpdate("CONFIRMED")}
            className="text-xs font-medium text-sky-700 hover:bg-sky-50 px-2 py-1 rounded-lg transition-colors"
          >
            {t.orders.bulkConfirm}
          </button>
          <button
            type="button"
            disabled={isMutating}
            onClick={() => handleBulkStatusUpdate("PROCESSING")}
            className="text-xs font-medium text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
          >
            {t.orders.bulkProcess}
          </button>
          <button
            type="button"
            disabled={isMutating}
            onClick={() => handleBulkStatusUpdate("SHIPPED")}
            className="text-xs font-medium text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors"
          >
            {t.orders.bulkShip}
          </button>
          <button
            type="button"
            disabled={isMutating}
            onClick={() => handleBulkStatusUpdate("COMPLETED")}
            className="text-xs font-medium text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors"
          >
            {t.orders.bulkComplete}
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            aria-label="Batalkan pilihan"
            className="p-1 text-slate-400 hover:text-slate-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
          onStatusUpdated={handleStatusUpdated}
          onError={(msg) => setFeedback({ type: "error", message: msg })}
        />
      )}
    </div>
  );
}
