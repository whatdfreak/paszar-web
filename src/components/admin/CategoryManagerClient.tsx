"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/actions/category.actions";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/validations/category.schema";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { TableCheckbox } from "@/components/admin/TableCheckbox";
import { useAdminI18n } from "@/lib/admin-i18n";
import {
  Plus,
  PencilLine,
  Trash2,
  Tags,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
  Package,
  Table2,
  LayoutGrid,
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

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  _count: { products: number };
}

type ViewMode = "table" | "grid";
type CategoryFilter = "all" | "filled" | "empty";
type CategorySort = "sortOrder" | "nameAsc" | "productsDesc";

// ── Helpers ───────────────────────────────────────────────────

function toSlugPreview(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const inputCls =
  "w-full h-10 px-3 rounded-lg border border-slate-200 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1C30]/15 focus:border-[#0B1C30] transition-all bg-white";

const textareaCls =
  "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1C30]/15 focus:border-[#0B1C30] transition-all bg-white resize-none";

// ── Category Modal (Add / Edit) ───────────────────────────────

function CategoryModal({
  category,
  existingCategories,
  onClose,
  onSaved,
}: {
  category?: CategoryRow;
  existingCategories: CategoryRow[];
  onClose: () => void;
  onSaved: (updated: CategoryRow) => void;
}) {
  const isEdit = Boolean(category);
  const [form, setForm] = useState({
    name: category?.name ?? "",
    description: category?.description ?? "",
    sortOrder:
      category?.sortOrder?.toString() ??
      String(existingCategories.length + 1),
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const slugPreview = toSlugPreview(form.name);

  const handleField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const trimmedName = form.name.trim();
    const trimmedDesc = form.description.trim();
    const parsedOrder = Number(form.sortOrder);

    if (!trimmedName || trimmedName.length < 2) {
      errs.name = "Nama kategori minimal 2 karakter.";
    } else if (trimmedName.length > 80) {
      errs.name = "Nama kategori maksimal 80 karakter.";
    } else if (!slugPreview) {
      errs.name = "Nama harus mengandung huruf atau angka yang valid.";
    } else {
      const duplicate = existingCategories.some(
        (c) => c.slug === slugPreview && c.id !== category?.id
      );
      if (duplicate) {
        errs.name = `Kategori "${trimmedName}" sudah digunakan.`;
      }
    }

    if (trimmedDesc.length > 500) {
      errs.description = "Deskripsi maksimal 500 karakter.";
    }

    if (
      form.sortOrder.trim() === "" ||
      Number.isNaN(parsedOrder) ||
      !Number.isInteger(parsedOrder) ||
      parsedOrder < 1
    ) {
      errs.sortOrder = "Urutan tampil harus bilangan bulat ≥ 1.";
    } else if (parsedOrder > 1000) {
      errs.sortOrder = "Urutan tampil maksimal 1000.";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    startTransition(async () => {
      let result;

      if (isEdit && category) {
        const payload: UpdateCategoryInput = {
          id: category.id,
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          sortOrder: Number(form.sortOrder),
        };
        result = await updateCategory(payload);
      } else {
        const payload: CreateCategoryInput = {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          sortOrder: Number(form.sortOrder),
        };
        result = await createCategory(payload);
      }

      if (result.success) {
        setSuccess(true);
        const updatedRow: CategoryRow = {
          id: result.data.id,
          name: result.data.name,
          slug: result.data.slug,
          description: form.description.trim() || null,
          sortOrder: result.data.sortOrder,
          _count: { products: category?._count?.products ?? 0 },
        };
        setTimeout(() => {
          onSaved(updatedRow);
          onClose();
        }, 650);
      } else {
        setSubmitError(result.error);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={isPending ? undefined : onClose}
      />

      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-[15px] font-bold text-slate-900">
              {isEdit ? "Edit Kategori" : "Tambah Kategori Baru"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit
                ? `Mengubah data "${category?.name}"`
                : "Tambahkan pengelompokan produk untuk katalog."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          {submitError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg px-3 py-2 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg px-3 py-2 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                {isEdit
                  ? "Kategori berhasil diperbarui!"
                  : "Kategori baru berhasil ditambahkan!"}
              </span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Nama Kategori <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {form.name.length}/80
              </span>
            </div>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleField}
              maxLength={80}
              placeholder="Contoh: Tenun Tradisional"
              className={inputCls}
            />
            {slugPreview && (
              <p className="mt-1 text-[11px] text-slate-400">
                Slug URL:{" "}
                <span className="font-mono text-slate-600">{slugPreview}</span>
              </p>
            )}
            {fieldErrors.name && (
              <p className="mt-1 text-[11px] text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Deskripsi
              </label>
              <span className="text-[11px] text-slate-400">
                {form.description.length}/500
              </span>
            </div>
            <textarea
              name="description"
              value={form.description}
              onChange={handleField}
              rows={3}
              maxLength={500}
              placeholder="Deskripsi singkat kategori (opsional)..."
              className={textareaCls}
            />
            {fieldErrors.description && (
              <p className="mt-1 text-[11px] text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {fieldErrors.description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Urutan Tampil
            </label>
            <input
              type="number"
              name="sortOrder"
              min={1}
              max={1000}
              step={1}
              value={form.sortOrder}
              onChange={handleField}
              className={`${inputCls} tabular-nums`}
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Posisi 1 = paling atas. Kategori lain otomatis bergeser agar
              urutan tetap rapat 1–N.
            </p>
            {fieldErrors.sortOrder && (
              <p className="mt-1 text-[11px] text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {fieldErrors.sortOrder}
              </p>
            )}
          </div>

          <div className="pt-2 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 h-9 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 h-9 rounded-lg bg-[#0B1C30] hover:bg-[#132944] text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              {isPending
                ? "Menyimpan..."
                : isEdit
                ? "Simpan Perubahan"
                : "Tambah Kategori"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────

function DeleteCategoryModal({
  category,
  onConfirm,
  onCancel,
  loading,
}: {
  category: CategoryRow;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const hasProducts = category._count.products > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={loading ? undefined : onCancel}
      />
      <div className="relative bg-white rounded-xl border border-slate-200 shadow-xl p-6 w-full max-w-sm">
        <div
          className={`flex items-center justify-center w-11 h-11 rounded-full mx-auto mb-4 ${
            hasProducts ? "bg-amber-50" : "bg-rose-50"
          }`}
        >
          {hasProducts ? (
            <AlertCircle size={20} className="text-amber-600" />
          ) : (
            <Trash2 size={20} className="text-rose-600" />
          )}
        </div>

        <h3 className="text-[15px] font-bold text-slate-900 text-center mb-1.5">
          {hasProducts ? "Kategori Tidak Dapat Dihapus" : "Hapus Kategori?"}
        </h3>

        <p className="text-xs text-slate-500 text-center mb-5 leading-relaxed">
          {hasProducts ? (
            <>
              Kategori{" "}
              <span className="font-semibold text-slate-800">
                &ldquo;{category.name}&rdquo;
              </span>{" "}
              masih digunakan oleh{" "}
              <span className="font-semibold text-slate-800">
                {category._count.products} produk
              </span>
              . Pindahkan atau hapus produk tersebut terlebih dahulu.
            </>
          ) : (
            <>
              Kategori{" "}
              <span className="font-semibold text-slate-800">
                &ldquo;{category.name}&rdquo;
              </span>{" "}
              akan dihapus secara permanen.
            </>
          )}
        </p>

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-9 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {hasProducts ? "Mengerti" : "Batal"}
          </button>
          {!hasProducts && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 h-9 rounded-lg bg-rose-600 text-xs font-medium text-white hover:bg-rose-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Menghapus..." : "Ya, Hapus"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────

export default function CategoryManagerClient({
  initialCategories,
}: {
  initialCategories: CategoryRow[];
}) {
  const router = useRouter();
  const { t } = useAdminI18n();
  const [categories, setCategories] =
    useState<CategoryRow[]>(initialCategories);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [filterBy, setFilterBy] = useState<CategoryFilter>("all");
  const [sortBy, setSortBy] = useState<CategorySort>("sortOrder");
  const [showStatistics, setShowStatistics] = useState(true);

  const [openMenu, setOpenMenu] = useState<"view" | "filter" | "sort" | null>(
    null
  );
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Pagination
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [goToInput, setGoToInput] = useState<string>("");

  // Selection & Modals
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalTarget, setModalTarget] = useState<
    "new" | CategoryRow | null
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);
  const [isMutating, startMutation] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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

  const totalCategories = categories.length;
  const totalLinkedProducts = categories.reduce(
    (sum, c) => sum + c._count.products,
    0
  );
  const emptyCategoriesCount = categories.filter(
    (c) => c._count.products === 0
  ).length;
  const filledCategoriesCount = totalCategories - emptyCategoriesCount;

  const q = search.trim().toLowerCase();
  const filteredCategories = categories
    .filter((c) => {
      if (
        q &&
        !c.name.toLowerCase().includes(q) &&
        !c.slug.toLowerCase().includes(q) &&
        !(c.description ?? "").toLowerCase().includes(q)
      ) {
        return false;
      }
      if (filterBy === "filled" && c._count.products === 0) return false;
      if (filterBy === "empty" && c._count.products > 0) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "nameAsc") return a.name.localeCompare(b.name);
      if (sortBy === "productsDesc")
        return b._count.products - a._count.products;
      return a.sortOrder - b.sortOrder;
    });

  // Pagination calculation
  const totalFiltered = filteredCategories.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedCategories = filteredCategories.slice(
    startIndex,
    startIndex + pageSize
  );

  const pageIds = paginatedCategories.map((c) => c.id);
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

  const handleSaved = (savedRow: CategoryRow) => {
    setCategories((prev) => {
      const others = prev
        .filter((c) => c.id !== savedRow.id)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      const insertIndex = Math.max(
        0,
        Math.min(savedRow.sortOrder - 1, others.length)
      );
      others.splice(insertIndex, 0, savedRow);
      return others.map((c, idx) => ({ ...c, sortOrder: idx + 1 }));
    });
    setFeedback({
      type: "success",
      message: `Kategori "${savedRow.name}" berhasil disimpan di urutan #${savedRow.sortOrder}.`,
    });
    router.refresh();
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setFeedback(null);

    startMutation(async () => {
      const result = await deleteCategory(deleteTarget.id);
      if (result.success) {
        setCategories((prev) =>
          prev
            .filter((c) => c.id !== deleteTarget.id)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((c, idx) => ({ ...c, sortOrder: idx + 1 }))
        );
        setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
        setFeedback({
          type: "success",
          message: `Kategori "${deleteTarget.name}" berhasil dihapus.`,
        });
        setDeleteTarget(null);
        router.refresh();
      } else {
        setFeedback({ type: "error", message: result.error });
        setDeleteTarget(null);
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setFeedback(null);
    const selectedRows = categories.filter((c) => selectedIds.includes(c.id));
    const deletable = selectedRows.filter((c) => c._count.products === 0);
    const blockedCount = selectedRows.length - deletable.length;

    if (deletable.length === 0) {
      setFeedback({
        type: "error",
        message:
          "Kategori terpilih masih memiliki produk terkait dan tidak dapat dihapus.",
      });
      return;
    }

    startMutation(async () => {
      let deletedCount = 0;
      const deletedIds = new Set<string>();
      for (const cat of deletable) {
        const res = await deleteCategory(cat.id);
        if (res.success) {
          deletedCount += 1;
          deletedIds.add(cat.id);
        }
      }
      setCategories((prev) => prev.filter((c) => !deletedIds.has(c.id)));
      setSelectedIds([]);
      setFeedback({
        type: deletedCount > 0 ? "success" : "error",
        message:
          blockedCount > 0
            ? `${deletedCount} kategori kosong dihapus. ${blockedCount} kategori dilewati karena masih memiliki produk.`
            : `${deletedCount} kategori berhasil dihapus.`,
      });
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
          { label: t.categories.title },
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
              placeholder="Cari nama atau slug kategori..."
              aria-label="Cari kategori"
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
            {t.categories.title}
          </h1>
        </header>

        {/* Action Toolbar Row */}
        <div
          ref={toolbarRef}
          className="flex flex-wrap items-center justify-between gap-2.5"
        >
          <div className="flex flex-wrap items-center gap-2">
            {/* Table View */}
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
                  filterBy !== "all"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>

              {openMenu === "filter" && (
                <div className="absolute left-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1">
                  {(
                    [
                      { key: "all", label: "Semua Kategori" },
                      { key: "filled", label: "Terisi Produk" },
                      { key: "empty", label: "Belum Terisi (0)" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        setFilterBy(opt.key);
                        setCurrentPage(1);
                        setOpenMenu(null);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                        filterBy === opt.key
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
                <div className="absolute left-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1">
                  {(
                    [
                      { key: "sortOrder", label: "Urutan Tampil" },
                      { key: "productsDesc", label: "Produk Terbanyak" },
                      { key: "nameAsc", label: "Nama (A–Z)" },
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

          {/* Right Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModalTarget("new")}
              className="inline-flex items-center gap-1.5 bg-[#0B1C30] hover:bg-[#132944] text-white rounded-lg h-8 px-3 text-xs font-medium shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.categories.add}</span>
            </button>
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

        {/* Unified 3-Col Stat Card Strip */}
        {showStatistics && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            <div className="p-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span>{t.categories.totalCategories}</span>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-1.5 tabular-nums">
                {totalCategories}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                <span className="inline-block bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded">
                  {filledCategoriesCount} {t.categories.filledBadge}
                </span>{" "}
                · {emptyCategoriesCount} {t.categories.emptyWord}
              </p>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span>{t.categories.linkedProducts}</span>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-1.5 tabular-nums">
                {totalLinkedProducts}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {t.categories.linkedSub}
              </p>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span>{t.categories.emptyCategories}</span>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-1.5 tabular-nums">
                {emptyCategoriesCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {t.categories.emptySub}
              </p>
            </div>
          </div>
        )}

        {/* Table / Grid View */}
        {paginatedCategories.length > 0 ? (
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
                          ariaLabel="Pilih semua kategori di halaman ini"
                        />
                      </th>
                      <th className="px-3 py-3 w-20">{t.categories.colOrder}</th>
                      <th className="px-3 py-3">{t.categories.colCategory}</th>
                      <th className="px-3 py-3 hidden md:table-cell">
                        {t.categories.colDesc}
                      </th>
                      <th className="px-3 py-3">{t.categories.colProducts}</th>
                      <th className="px-4 py-3 text-right">
                        {t.common.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {paginatedCategories.map((cat) => {
                      const isSelected = selectedIds.includes(cat.id);
                      return (
                        <tr
                          key={cat.id}
                          className={`transition-colors ${
                            isSelected
                              ? "bg-orange-50/50"
                              : "hover:bg-slate-50/70"
                          }`}
                        >
                          <td className="pl-4 pr-2 py-2.5">
                            <TableCheckbox
                              checked={isSelected}
                              onChange={() => toggleRowSelection(cat.id)}
                              ariaLabel={`Pilih ${cat.name}`}
                            />
                          </td>

                          <td className="px-3 py-2.5">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-slate-100 text-slate-700 font-semibold tabular-nums">
                              {cat.sortOrder}
                            </span>
                          </td>

                          <td className="px-3 py-2.5">
                            <p className="text-[13px] font-semibold text-slate-900">
                              {cat.name}
                            </p>
                            <p className="text-[11px] font-mono text-slate-400">
                              /{cat.slug}
                            </p>
                          </td>

                          <td className="px-3 py-2.5 hidden md:table-cell text-slate-500 max-w-xs">
                            <p className="truncate">
                              {cat.description || (
                                <span className="italic text-slate-300">
                                  Tidak ada deskripsi
                                </span>
                              )}
                            </p>
                          </td>

                          <td className="px-3 py-2.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                                cat._count.products > 0
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                            >
                              <Package className="w-3 h-3" />
                              <span>{cat._count.products} produk</span>
                            </span>
                          </td>

                          <td className="px-4 py-2.5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setModalTarget(cat)}
                                title="Edit kategori"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                              >
                                <PencilLine className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(cat)}
                                title="Hapus kategori"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {paginatedCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Urutan #{cat.sortOrder}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {cat._count.products} produk
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400">
                      /{cat.slug}
                    </p>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                      {cat.description || "Tidak ada deskripsi."}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setModalTarget(cat)}
                      className="flex-1 h-7 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1"
                    >
                      <PencilLine className="w-3 h-3" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(cat)}
                      className="h-7 px-2.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200"
                      title="Hapus"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm py-14 px-4 text-center flex flex-col items-center">
            <Tags className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              {search || filterBy !== "all"
                ? "Kategori tidak ditemukan"
                : "Belum ada kategori produk"}
            </p>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Showing per page</span>
            <AdminSelect
              value={String(pageSize)}
              ariaLabel="Jumlah kategori per halaman"
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
            <span>Go to page</span>
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
              <span>Go</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </form>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-white border border-slate-200 rounded-xl shadow-xl px-4 py-2.5 flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-900">
            {selectedIds.length} Dipilih
          </span>
          <div className="h-4 w-px bg-slate-200" />
          <button
            type="button"
            disabled={isMutating}
            onClick={handleBulkDelete}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Hapus Terpilih
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

      {modalTarget && (
        <CategoryModal
          category={modalTarget === "new" ? undefined : modalTarget}
          existingCategories={categories}
          onClose={() => setModalTarget(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <DeleteCategoryModal
          category={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={isMutating}
        />
      )}
    </div>
  );
}
