"use client";

// ============================================================
// PASzar — Category Manager Client (Admin Dashboard)
// ============================================================
// PRD Ref: Section 4.3 — Kelola Kategori
//   - CRUD (Nama, Slug, Deskripsi, Urutan/sortOrder)
//   - Inline Add / Edit Modal
//   - Delete dengan konfirmasi (blocked jika masih ada produk)
// ============================================================

import { useState, useTransition } from "react";
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
import {
  Plus,
  PencilLine,
  Trash2,
  Tags,
  AlertCircle,
  CheckCircle2,
  X,
  GripVertical,
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

// ── Helpers ───────────────────────────────────────────────────

function toSlugPreview(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ── Input Styles ──────────────────────────────────────────────

const inputCls =
  "w-full h-10 px-3 rounded-lg border border-slate-200 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1C30]/20 focus:border-[#0B1C30]/40 transition-all bg-white";

const textareaCls =
  "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1C30]/20 focus:border-[#0B1C30]/40 transition-all bg-white resize-none";

// ── Category Modal (Add / Edit) ───────────────────────────────

function CategoryModal({
  category,
  onClose,
  onSaved,
}: {
  category?: CategoryRow;
  onClose: () => void;
  onSaved: (updated: CategoryRow) => void;
}) {
  const isEdit = !!category;
  const [form, setForm] = useState({
    name: category?.name ?? "",
    description: category?.description ?? "",
    sortOrder: category?.sortOrder?.toString() ?? "0",
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

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      errs.name = "Nama minimal 2 karakter.";
    if (form.description.trim().length > 500)
      errs.description = "Deskripsi maksimal 500 karakter.";
    if (isNaN(Number(form.sortOrder)) || Number(form.sortOrder) < 0)
      errs.sortOrder = "Urutan harus angka ≥ 0.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    startTransition(async () => {
      let result;

      if (isEdit) {
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
        // Build the updated row to pass back to parent
        const updatedRow: CategoryRow = {
          id: result.data.id,
          name: result.data.name,
          slug: result.data.slug,
          description: form.description.trim() || null,
          sortOrder: Number(form.sortOrder),
          _count: { products: category?._count?.products ?? 0 },
        };
        setTimeout(() => {
          onSaved(updatedRow);
          onClose();
        }, 800);
      } else {
        setSubmitError(result.error);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h3 className="text-[16px] font-bold text-slate-900">
              {isEdit ? "Edit Kategori" : "Tambah Kategori Baru"}
            </h3>
            <p className="text-[12px] text-slate-500 mt-0.5">
              {isEdit
                ? `Mengedit: ${category.name}`
                : "Isi detail kategori di bawah ini."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
              Nama Kategori <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleField}
              type="text"
              placeholder="contoh: Tenun NTT"
              className={inputCls}
              autoFocus
            />
            {/* Slug Preview */}
            {form.name && (
              <p className="mt-1.5 text-[11px] text-slate-400">
                Slug:{" "}
                <span className="font-mono text-slate-600">{slugPreview}</span>
              </p>
            )}
            {fieldErrors.name && (
              <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                <AlertCircle size={10} /> {fieldErrors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
              Deskripsi{" "}
              <span className="text-slate-400 font-normal">(opsional)</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleField}
              placeholder="Deskripsi singkat tentang kategori ini..."
              rows={3}
              className={textareaCls}
            />
            <p className="mt-1 text-[11px] text-slate-400 text-right">
              {form.description.length}/500
            </p>
            {fieldErrors.description && (
              <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                <AlertCircle size={10} /> {fieldErrors.description}
              </p>
            )}
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
              Urutan Tampil
            </label>
            <input
              name="sortOrder"
              value={form.sortOrder}
              onChange={handleField}
              type="number"
              min="0"
              placeholder="0"
              className={inputCls}
            />
            <p className="mt-1.5 text-[11px] text-slate-400">
              Angka lebih kecil = tampil lebih awal di filter katalog.
            </p>
            {fieldErrors.sortOrder && (
              <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                <AlertCircle size={10} /> {fieldErrors.sortOrder}
              </p>
            )}
          </div>

          {/* Feedback */}
          {submitError && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-[12px] text-red-700">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              {submitError}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-[12px] text-emerald-700">
              <CheckCircle2 size={14} />
              {isEdit ? "Kategori diperbarui!" : "Kategori ditambahkan!"}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 h-10 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending || success}
              className="flex-1 h-10 rounded-lg bg-[#0B1C30] text-[13px] font-semibold text-white hover:bg-[#0B1C30]/90 transition-colors disabled:opacity-50"
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

function DeleteModal({
  categoryName,
  productCount,
  onConfirm,
  onCancel,
  loading,
  error,
}: {
  categoryName: string;
  productCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  error: string | null;
}) {
  const hasProducts = productCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto mb-4">
          <Trash2 size={22} className="text-red-500" strokeWidth={2} />
        </div>
        <h3 className="text-[15px] font-bold text-slate-900 text-center mb-2">
          Hapus Kategori?
        </h3>

        {hasProducts ? (
          <div className="text-center mb-6">
            <p className="text-sm text-slate-600 mb-2">
              <span className="font-semibold">&ldquo;{categoryName}&rdquo;</span> tidak dapat
              dihapus.
            </p>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-[12px] text-amber-700">
              <AlertCircle size={13} className="flex-shrink-0" />
              Masih terdapat{" "}
              <strong>{productCount} produk</strong> dalam kategori ini. Pindahkan
              atau hapus produk tersebut terlebih dahulu.
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center mb-6">
            <span className="font-semibold text-slate-700">
              &ldquo;{categoryName}&rdquo;
            </span>{" "}
            akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.
          </p>
        )}

        {error && (
          <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-[12px] text-red-700">
            <AlertCircle size={13} className="flex-shrink-0 mt-0.5" /> {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-10 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {hasProducts ? "Mengerti" : "Batal"}
          </button>
          {!hasProducts && (
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 h-10 rounded-lg bg-red-600 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
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
  const [categories, setCategories] = useState<CategoryRow[]>(
    [...initialCategories].sort((a, b) => a.sortOrder - b.sortOrder)
  );
  const [modal, setModal] = useState<
    { type: "add" } | { type: "edit"; category: CategoryRow } | null
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();

  // ── Handlers ────────────────────────────────────────────────

  const handleSaved = (updated: CategoryRow) => {
    setCategories((prev) => {
      const exists = prev.find((c) => c.id === updated.id);
      const next = exists
        ? prev.map((c) => (c.id === updated.id ? updated : c))
        : [...prev, updated];
      return next.sort((a, b) => a.sortOrder - b.sortOrder);
    });
    router.refresh();
  };

  const handleDeleteRequest = (category: CategoryRow) => {
    setDeleteError(null);
    setDeleteTarget(category);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    startDelete(async () => {
      const result = await deleteCategory(deleteTarget.id);
      if (result.success) {
        setCategories((prev) =>
          prev.filter((c) => c.id !== deleteTarget.id)
        );
        setDeleteTarget(null);
        router.refresh();
      } else {
        setDeleteError(result.error);
      }
    });
  };

  // ── Render ───────────────────────────────────────────────────

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">
            Kategori
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            {categories.length} kategori terdaftar
          </p>
        </div>
        <button
          onClick={() => setModal({ type: "add" })}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#0B1C30] text-white text-[13px] font-semibold hover:bg-[#0B1C30]/90 transition-colors"
        >
          <Plus size={15} strokeWidth={2.5} />
          Tambah Kategori
        </button>
      </div>

      {/* PRD Note: sortOrder controls display order in catalog filter */}
      <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-[12px] text-slate-500">
        <GripVertical size={14} className="text-slate-400 flex-shrink-0" />
        Urutan tampil di filter katalog publik dikendalikan oleh kolom{" "}
        <span className="font-mono font-semibold text-slate-700">sortOrder</span>.
        Angka lebih kecil = tampil lebih awal.
      </div>

      {/* Table / Empty */}
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-slate-200">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Tags size={24} className="text-slate-400" />
          </div>
          <p className="text-[15px] font-semibold text-slate-700 mb-1">
            Belum ada kategori
          </p>
          <p className="text-[13px] text-slate-400 mb-6">
            Tambahkan kategori pertama untuk mengorganisir produk.
          </p>
          <button
            onClick={() => setModal({ type: "add" })}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#0B1C30] text-white text-[13px] font-semibold hover:bg-[#0B1C30]/90 transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} />
            Tambah Kategori
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-[0_1px_2px_0_rgba(0,0,0,0.04),0_1px_6px_-1px_rgba(0,0,0,0.04)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em]">
                  Nama
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em] hidden sm:table-cell">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em] hidden md:table-cell">
                  Deskripsi
                </th>
                <th className="px-4 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em]">
                  Produk
                </th>
                <th className="px-4 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em]">
                  Urutan
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em]">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors last:border-0"
                >
                  {/* Name */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#0B1C30]/[0.06] flex items-center justify-center flex-shrink-0">
                        <Tags size={14} className="text-[#0B1C30]" strokeWidth={2} />
                      </div>
                      <span className="text-[13px] font-semibold text-slate-800">
                        {cat.name}
                      </span>
                    </div>
                  </td>

                  {/* Slug */}
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {cat.slug}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="px-4 py-3.5 hidden md:table-cell max-w-[200px]">
                    <p className="text-[12px] text-slate-500 truncate">
                      {cat.description || (
                        <span className="text-slate-300 italic">—</span>
                      )}
                    </p>
                  </td>

                  {/* Product Count */}
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-bold ${
                        cat._count.products > 0
                          ? "bg-[#0B1C30]/[0.06] text-[#0B1C30]"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {cat._count.products}
                    </span>
                  </td>

                  {/* Sort Order */}
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-6 rounded-md bg-slate-100 text-[12px] font-mono font-semibold text-slate-600">
                      {cat.sortOrder}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() =>
                          setModal({ type: "edit", category: cat })
                        }
                        className="p-2 rounded-lg text-slate-400 hover:text-[#0B1C30] hover:bg-slate-100 transition-colors"
                        title="Edit kategori"
                      >
                        <PencilLine size={15} strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(cat)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Hapus kategori"
                      >
                        <Trash2 size={15} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {modal?.type === "add" && (
        <CategoryModal onClose={() => setModal(null)} onSaved={handleSaved} />
      )}
      {modal?.type === "edit" && (
        <CategoryModal
          category={modal.category}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          categoryName={deleteTarget.name}
          productCount={deleteTarget._count.products}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setDeleteTarget(null);
            setDeleteError(null);
          }}
          loading={isDeleting}
          error={deleteError}
        />
      )}
    </div>
  );
}
