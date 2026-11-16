"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  toggleProductActive,
  deleteProduct,
  bulkSetProductActive,
  bulkDeleteProducts,
} from "@/actions/product.actions";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { TableCheckbox } from "@/components/admin/TableCheckbox";
import { useAdminI18n } from "@/lib/admin-i18n";
import {
  PencilLine,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Package,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LayoutGrid,
  Table2,
  SlidersHorizontal,
  ArrowUpDown,
  Info,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────

export interface ProductRow {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  isActive: boolean;
  image: string;
  categoryId: string;
  category: { name: string };
  sold: number;
  revenue: number;
  createdAt: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductTableClientProps {
  initialProducts: ProductRow[];
  categories: CategoryOption[];
}

type ViewMode = "table" | "grid";
type StatusFilter = "all" | "inStock" | "lowStock" | "outOfStock" | "inactive";
type SortOption =
  | "newest"
  | "nameAsc"
  | "priceDesc"
  | "priceAsc"
  | "soldDesc"
  | "stockAsc";

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

function getStockStatusBadge(
  product: ProductRow,
  labels: {
    available: string;
    restock: string;
    outOfStock: string;
    inactive: string;
  }
): {
  label: string;
  badgeClass: string;
} {
  if (!product.isActive) {
    return {
      label: labels.inactive,
      badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
    };
  }
  if (product.stock === 0) {
    return {
      label: labels.outOfStock,
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    };
  }
  if (product.stock <= 5) {
    return {
      label: labels.restock,
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }
  return {
    label: labels.available,
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
}

function ProductThumb({
  src,
  alt,
  size = "sm",
}: {
  src: string;
  alt: string;
  size?: "sm" | "lg";
}) {
  const [failed, setFailed] = useState(false);

  if (size === "lg") {
    if (!src || failed) {
      return (
        <div className="w-full aspect-square bg-slate-100 flex items-center justify-center border-b border-slate-100">
          <Package className="w-8 h-8 text-slate-300" />
        </div>
      );
    }
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setFailed(true)}
        className="w-full aspect-square object-cover bg-slate-100 border-b border-slate-100"
      />
    );
  }

  if (!src || failed) {
    return (
      <div className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
        <Package size={15} className="text-slate-400" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="w-9 h-9 rounded-lg object-cover border border-slate-200 bg-slate-100 shrink-0"
    />
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────

function DeleteModal({
  title,
  description,
  onConfirm,
  onCancel,
  loading,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={loading ? undefined : onCancel}
      />
      <div className="relative bg-white rounded-xl border border-slate-200 shadow-xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-rose-50 mx-auto mb-4">
          <Trash2 size={20} className="text-rose-600" strokeWidth={2} />
        </div>
        <h3 className="text-[15px] font-bold text-slate-900 text-center mb-1.5">
          {title}
        </h3>
        <p className="text-xs text-slate-500 text-center mb-5 leading-relaxed">
          {description}
        </p>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-9 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-9 rounded-lg bg-rose-600 text-xs font-medium text-white hover:bg-rose-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────

export default function ProductTableClient({
  initialProducts,
  categories,
}: ProductTableClientProps) {
  const router = useRouter();
  const { t } = useAdminI18n();
  const [products, setProducts] = useState<ProductRow[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showStatistics, setShowStatistics] = useState(true);

  // Dropdown states
  const [openMenu, setOpenMenu] = useState<"view" | "filter" | "sort" | null>(
    null
  );
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Pagination states
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [goToInput, setGoToInput] = useState<string>("");

  // Selection & Bulk states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    mode: "single" | "bulk";
    id?: string;
    name?: string;
    count?: number;
  } | null>(null);
  const [isMutating, startMutation] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Close popovers on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(e.target as Node)
      ) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // ── Real Metrics ────────────────────────────────────────────
  const totalCount = products.length;
  const activeCount = products.filter((p) => p.isActive).length;
  const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
  const totalSold = products.reduce((sum, p) => sum + p.sold, 0);
  const outOfStockCount = products.filter(
    (p) => p.isActive && p.stock === 0
  ).length;
  const lowStockCount = products.filter(
    (p) => p.isActive && p.stock > 0 && p.stock <= 5
  ).length;
  const needRestockCount = outOfStockCount + lowStockCount;

  // ── Filter & Sort ───────────────────────────────────────────
  const q = search.trim().toLowerCase();
  const filteredProducts = products
    .filter((p) => {
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !p.slug.toLowerCase().includes(q) &&
        !p.category.name.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (categoryFilter !== "all" && p.categoryId !== categoryFilter) {
        return false;
      }
      if (statusFilter === "inStock" && (!p.isActive || p.stock <= 5)) {
        return false;
      }
      if (
        statusFilter === "lowStock" &&
        (!p.isActive || p.stock === 0 || p.stock > 5)
      ) {
        return false;
      }
      if (statusFilter === "outOfStock" && (!p.isActive || p.stock > 0)) {
        return false;
      }
      if (statusFilter === "inactive" && p.isActive) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "nameAsc") return a.name.localeCompare(b.name);
      if (sortBy === "priceDesc") return b.price - a.price;
      if (sortBy === "priceAsc") return a.price - b.price;
      if (sortBy === "soldDesc") return b.sold - a.sold;
      if (sortBy === "stockAsc") return a.stock - b.stock;
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

  // ── Pagination Calculation ──────────────────────────────────
  const totalFiltered = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + pageSize
  );

  const pageIds = paginatedProducts.map((p) => p.id);
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

  // ── Handlers ────────────────────────────────────────────────
  const handleToggleActive = async (product: ProductRow) => {
    setFeedback(null);
    setTogglingId(product.id);
    try {
      const result = await toggleProductActive(product.id);
      if (result.success) {
        setProducts((prev) =>
          prev.map((item) =>
            item.id === product.id
              ? { ...item, isActive: result.data.isActive }
              : item
          )
        );
        setFeedback({
          type: "success",
          message: `"${product.name}" sekarang ${
            result.data.isActive ? "Aktif" : "Nonaktif"
          }.`,
        });
        router.refresh();
      } else {
        setFeedback({ type: "error", message: result.error });
      }
    } finally {
      setTogglingId(null);
    }
  };

  const handleBulkStatus = (isActive: boolean) => {
    if (selectedIds.length === 0) return;
    setFeedback(null);
    startMutation(async () => {
      const res = await bulkSetProductActive(selectedIds, isActive);
      if (res.success) {
        const selectedSet = new Set(selectedIds);
        setProducts((prev) =>
          prev.map((p) =>
            selectedSet.has(p.id) ? { ...p, isActive } : p
          )
        );
        setFeedback({
          type: "success",
          message: `${res.data.count} produk berhasil ${
            isActive ? "diaktifkan" : "dinonaktifkan"
          }.`,
        });
        setSelectedIds([]);
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.error });
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setFeedback(null);

    if (deleteTarget.mode === "single" && deleteTarget.id) {
      const targetId = deleteTarget.id;
      const targetName = deleteTarget.name ?? "Produk";
      startMutation(async () => {
        const result = await deleteProduct(targetId);
        if (result.success) {
          if (result.data.softDeleted) {
            setProducts((prev) =>
              prev.map((p) =>
                p.id === targetId ? { ...p, isActive: false } : p
              )
            );
            setFeedback({
              type: "success",
              message: `"${targetName}" memiliki riwayat order sehingga dinonaktifkan.`,
            });
          } else {
            setProducts((prev) => prev.filter((p) => p.id !== targetId));
            setFeedback({
              type: "success",
              message: `"${targetName}" berhasil dihapus permanen.`,
            });
          }
          setSelectedIds((prev) => prev.filter((id) => id !== targetId));
          setDeleteTarget(null);
          router.refresh();
        } else {
          setFeedback({ type: "error", message: result.error });
          setDeleteTarget(null);
        }
      });
      return;
    }

    if (deleteTarget.mode === "bulk" && selectedIds.length > 0) {
      const idsToDelete = [...selectedIds];
      startMutation(async () => {
        const result = await bulkDeleteProducts(idsToDelete);
        if (result.success) {
          setFeedback({
            type: "success",
            message: `${result.data.deleted} produk dihapus, ${result.data.softDeleted} produk dengan histori order dinonaktifkan.`,
          });
          setSelectedIds([]);
          setDeleteTarget(null);
          router.refresh();
          // Reload state from server via router.refresh + optimistic sync
          setProducts((prev) =>
            prev.filter((p) => !idsToDelete.includes(p.id) || p.sold > 0).map((p) =>
              idsToDelete.includes(p.id) ? { ...p, isActive: false } : p
            )
          );
        } else {
          setFeedback({ type: "error", message: result.error });
          setDeleteTarget(null);
        }
      });
    }
  };

  const activeFiltersCount =
    (statusFilter !== "all" ? 1 : 0) + (categoryFilter !== "all" ? 1 : 0);

  // Pagination page numbers
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
      {/* Top Bar sejajar dengan Sidebar */}
      <AdminTopBar
        breadcrumbs={[
          { label: "PASzar", href: "/dashboard" },
          { label: t.products.title },
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
              placeholder="Cari produk atau kategori..."
              aria-label="Cari produk"
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
        {/* Title */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {t.products.title}
            </h1>
          </div>
        </header>

        {/* Action Toolbar Row (Table View | Filter | Sort | Show Statistics --- Export | + Tambah Produk) */}
        <div
          ref={toolbarRef}
          className="flex flex-wrap items-center justify-between gap-2.5"
        >
          <div className="flex flex-wrap items-center gap-2">
            {/* Table View Dropdown */}
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
                <span>{viewMode === "table" ? t.common.tableView : t.common.gridView}</span>
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
                    <Table2 className="w-3.5 h-3.5" /> {t.common.tableView}
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
                    <LayoutGrid className="w-3.5 h-3.5" /> {t.common.gridView}
                  </button>
                </div>
              )}
            </div>

            {/* Filter Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenMenu((m) => (m === "filter" ? null : "filter"))
                }
                className={`inline-flex items-center gap-1.5 h-8 px-2.5 border rounded-lg text-xs font-medium shadow-sm transition-colors ${
                  activeFiltersCount > 0
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filter</span>
                {activeFiltersCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {openMenu === "filter" && (
                <div className="absolute left-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-3.5 space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Status Stok & Publikasi
                    </label>
                    <AdminSelect
                      value={statusFilter}
                      ariaLabel="Filter status stok"
                      onChange={(val) => {
                        setStatusFilter(val as StatusFilter);
                        setCurrentPage(1);
                      }}
                      triggerClassName="w-full inline-flex items-center justify-between gap-2 h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 hover:bg-white transition-colors cursor-pointer"
                      menuClassName="w-full"
                      options={[
                        { value: "all", label: "Semua Status" },
                        { value: "inStock", label: "Tersedia (> 5)" },
                        { value: "lowStock", label: "Restock (1–5)" },
                        { value: "outOfStock", label: "Stok Habis (0)" },
                        { value: "inactive", label: "Nonaktif" },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Kategori
                    </label>
                    <AdminSelect
                      value={categoryFilter}
                      ariaLabel="Filter kategori"
                      onChange={(val) => {
                        setCategoryFilter(val);
                        setCurrentPage(1);
                      }}
                      triggerClassName="w-full inline-flex items-center justify-between gap-2 h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 hover:bg-white transition-colors cursor-pointer"
                      menuClassName="w-full"
                      options={[
                        { value: "all", label: "Semua Kategori" },
                        ...categories.map((cat) => ({
                          value: cat.id,
                          label: cat.name,
                        })),
                      ]}
                    />
                  </div>

                  <div className="pt-1 flex justify-between items-center border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter("all");
                        setCategoryFilter("all");
                        setCurrentPage(1);
                      }}
                      className="text-[11px] font-medium text-slate-500 hover:text-slate-900"
                    >
                      Reset Filter
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenMenu(null)}
                      className="text-[11px] font-semibold text-[#0B1C30]"
                    >
                      Terapkan
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sort Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenMenu((m) => (m === "sort" ? null : "sort"))
                }
                className="inline-flex items-center gap-1.5 h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.common.sort}</span>
              </button>

              {openMenu === "sort" && (
                <div className="absolute left-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1">
                  {(
                    [
                      { key: "newest", label: t.products.sortNewest },
                      { key: "soldDesc", label: t.products.sortTopSelling },
                      { key: "priceDesc", label: t.products.sortPriceDesc },
                      { key: "priceAsc", label: t.products.sortPriceAsc },
                      { key: "stockAsc", label: t.products.sortStockAsc },
                      { key: "nameAsc", label: t.products.sortNameAsc },
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

            {/* Show Statistics Toggle */}
            <label className="inline-flex items-center gap-2 pl-2 cursor-pointer select-none">
              <span className="text-xs font-medium text-slate-600">
                {t.common.showStatistics}
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

          {/* Right Button: + Tambah Produk */}
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/produk/baru"
              className="inline-flex items-center gap-1.5 bg-[#0B1C30] hover:bg-[#132944] text-white rounded-lg h-8 px-3 text-xs font-medium shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.products.add}</span>
            </Link>
          </div>
        </div>

        {/* Feedback Banner */}
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

        {/* Modern Unified Stat Card Strip (seperti referensi) */}
        {showStatistics && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            <div className="p-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span>{t.products.totalProducts}</span>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-1.5 tabular-nums">
                {totalCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                <span className="inline-block bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded">
                  {activeCount} {t.products.activeBadge}
                </span>{" "}
                · {totalCount - activeCount} {t.products.inactiveBadge}
              </p>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span>{t.products.productRevenue}</span>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-1.5 tabular-nums">
                {formatCompactIDR(totalRevenue)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {t.products.revenueSub}
              </p>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span>{t.products.productSold}</span>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-1.5 tabular-nums">
                {totalSold} <span className="text-sm font-medium">pcs</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {t.products.soldSub}
              </p>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span>{t.products.needRestock}</span>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-1.5 tabular-nums">
                {needRestockCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                <span
                  className={`inline-block font-semibold px-1.5 py-0.5 rounded ${
                    outOfStockCount > 0
                      ? "bg-rose-50 text-rose-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {outOfStockCount} {t.products.outOfStockBadge}
                </span>{" "}
                · {lowStockCount} {t.products.lowStockBadge}
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
            placeholder="Cari produk..."
            className="w-full h-9 pl-8 pr-3 bg-white border border-slate-200 rounded-lg text-xs"
          />
        </div>

        {/* Main View: Table or Grid */}
        {paginatedProducts.length > 0 ? (
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
                          ariaLabel="Pilih semua produk di halaman ini"
                        />
                      </th>
                      <th className="px-3 py-3">{t.products.colProduct}</th>
                      <th className="px-3 py-3 hidden md:table-cell">
                        {t.products.colCategory}
                      </th>
                      <th className="px-3 py-3">{t.products.colPrice}</th>
                      <th className="px-3 py-3 hidden lg:table-cell">
                        {t.products.colSold}
                      </th>
                      <th className="px-3 py-3 hidden lg:table-cell">
                        {t.products.colRevenue}
                      </th>
                      <th className="px-3 py-3">{t.products.colStock}</th>
                      <th className="px-3 py-3">{t.products.colStatus}</th>
                      <th className="px-4 py-3 text-right">
                        {t.common.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {paginatedProducts.map((product) => {
                      const isSelected = selectedIds.includes(product.id);
                      const isToggling = togglingId === product.id;
                      const statusMeta = getStockStatusBadge(product, {
                        available: t.products.statusAvailable,
                        restock: t.products.statusRestock,
                        outOfStock: t.products.statusOutOfStock,
                        inactive: t.products.statusInactive,
                      });

                      return (
                        <tr
                          key={product.id}
                          className={`transition-colors ${
                            isSelected
                              ? "bg-orange-50/50"
                              : "hover:bg-slate-50/70"
                          }`}
                        >
                          <td className="pl-4 pr-2 py-2.5">
                            <TableCheckbox
                              checked={isSelected}
                              onChange={() => toggleRowSelection(product.id)}
                              ariaLabel={`Pilih ${product.name}`}
                            />
                          </td>

                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <ProductThumb
                                src={product.image}
                                alt={product.name}
                              />
                              <div className="min-w-0">
                                <Link
                                  href={`/dashboard/produk/${product.id}`}
                                  className="text-[13px] font-semibold text-slate-900 hover:underline block truncate max-w-[210px]"
                                >
                                  {product.name}
                                </Link>
                                <p className="text-[11px] text-slate-400 truncate max-w-[210px] md:hidden">
                                  {product.category.name}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-2.5 hidden md:table-cell text-slate-600">
                            {product.category.name}
                          </td>

                          <td className="px-3 py-2.5 font-medium text-slate-900 tabular-nums whitespace-nowrap">
                            {formatRupiah(product.price)}
                          </td>

                          <td className="px-3 py-2.5 hidden lg:table-cell text-slate-700 tabular-nums whitespace-nowrap">
                            {product.sold} pcs
                          </td>

                          <td className="px-3 py-2.5 hidden lg:table-cell font-medium text-slate-800 tabular-nums whitespace-nowrap">
                            {formatRupiah(product.revenue)}
                          </td>

                          <td className="px-3 py-2.5 font-semibold text-slate-800 tabular-nums">
                            {product.stock}
                          </td>

                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(product)}
                              disabled={isToggling}
                              title={
                                product.isActive
                                  ? "Klik untuk nonaktifkan"
                                  : "Klik untuk aktifkan"
                              }
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer disabled:opacity-60 ${statusMeta.badgeClass}`}
                            >
                              {isToggling && (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              )}
                              <span>{statusMeta.label}</span>
                            </button>
                          </td>

                          <td className="px-4 py-2.5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              <Link
                                href={`/dashboard/produk/${product.id}`}
                                title="Edit produk"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                              >
                                <PencilLine className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteTarget({
                                    mode: "single",
                                    id: product.id,
                                    name: product.name,
                                  })
                                }
                                title="Hapus produk"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {paginatedProducts.map((product) => {
                const statusMeta = getStockStatusBadge(product, {
                  available: t.products.statusAvailable,
                  restock: t.products.statusRestock,
                  outOfStock: t.products.statusOutOfStock,
                  inactive: t.products.statusInactive,
                });
                return (
                  <div
                    key={product.id}
                    className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col"
                  >
                    <ProductThumb
                      src={product.image}
                      alt={product.name}
                      size="lg"
                    />
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">
                            {product.category.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusMeta.badgeClass}`}
                          >
                            {statusMeta.label}
                          </span>
                        </div>
                        <Link
                          href={`/dashboard/produk/${product.id}`}
                          className="text-xs font-bold text-slate-900 hover:underline line-clamp-2"
                        >
                          {product.name}
                        </Link>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {formatRupiah(product.price)}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Stok {product.stock} · Terjual {product.sold} pcs
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <Link
                          href={`/dashboard/produk/${product.id}`}
                          className="flex-1 h-7 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1"
                        >
                          <PencilLine className="w-3 h-3" /> Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({
                              mode: "single",
                              id: product.id,
                              name: product.name,
                            })
                          }
                          className="h-7 px-2 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200"
                          title="Hapus"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm py-14 px-4 text-center flex flex-col items-center">
            <Package className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              {search || activeFiltersCount > 0
                ? "Tidak ada produk yang cocok"
                : "Belum ada produk terdaftar"}
            </p>
            {(search || activeFiltersCount > 0) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                  setCurrentPage(1);
                }}
                className="mt-3 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Reset Filter
              </button>
            )}
          </div>
        )}

        {/* Pagination Footer (Showing per page | Page numbers | Go to page) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 text-xs text-slate-600">
          {/* Left: Showing per page */}
          <div className="flex items-center gap-2">
            <span>{t.common.showingPerPage}</span>
            <AdminSelect
              value={String(pageSize)}
              ariaLabel="Jumlah data per halaman"
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

          {/* Center: Page Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(1)}
              aria-label="Halaman pertama"
              className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Halaman sebelumnya"
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
              aria-label="Halaman berikutnya"
              className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
              aria-label="Halaman terakhir"
              className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Go to page */}
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

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-white border border-slate-200 rounded-xl shadow-xl px-4 py-2.5 flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-900">
            {selectedIds.length} {t.common.selected}
          </span>
          <div className="h-4 w-px bg-slate-200" />
          <button
            type="button"
            disabled={isMutating}
            onClick={() => handleBulkStatus(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> {t.products.activate}
          </button>
          <button
            type="button"
            disabled={isMutating}
            onClick={() => handleBulkStatus(false)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 px-2.5 py-1 rounded-lg transition-colors"
          >
            <EyeOff className="w-3.5 h-3.5" /> {t.products.deactivate}
          </button>
          <button
            type="button"
            disabled={isMutating}
            onClick={() =>
              setDeleteTarget({
                mode: "bulk",
                count: selectedIds.length,
              })
            }
            className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> {t.common.delete}
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

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteModal
          title={
            deleteTarget.mode === "bulk"
              ? `Hapus ${deleteTarget.count} Produk?`
              : "Hapus Produk?"
          }
          description={
            deleteTarget.mode === "bulk"
              ? `${deleteTarget.count} produk terpilih akan dihapus. Produk yang sudah pernah dipesan akan dinonaktifkan otomatis untuk menjaga histori transaksi.`
              : `"${deleteTarget.name}" akan dihapus permanen. Jika sudah pernah dipesan, sistem akan menonaktifkannya secara otomatis.`
          }
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={isMutating}
        />
      )}
    </div>
  );
}
