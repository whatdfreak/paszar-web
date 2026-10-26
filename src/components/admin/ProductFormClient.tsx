"use client";

// ============================================================
// PASzar — Product Form Client (Tambah & Edit Produk)
// ============================================================
// Used by:
//   /dashboard/produk/baru  → create mode (product = undefined)
//   /dashboard/produk/[id]  → edit mode   (product = existing data)
// ============================================================

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createProduct, updateProduct } from "@/actions/product.actions";
import type { CreateProductInput } from "@/validations/product.schema";
import { AlertCircle, CheckCircle2, ImageIcon, ChevronLeft } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
}

interface ProductData {
  id: string;
  name: string;
  description: string;
  story: string | null;
  price: number;
  stock: number;
  image: string;
  isActive: boolean;
  categoryId: string;
}

interface ProductFormClientProps {
  categories: Category[];
  product?: ProductData; // undefined = create mode
}

// ── Input component ───────────────────────────────────────────

function FormField({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1.5 text-[11px] text-slate-400">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1">
          <AlertCircle size={10} /> {error}
        </p>
      )}
    </div>
  );
}

const inputCls =
  "w-full h-10 px-3 rounded-lg border border-slate-200 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1C30]/20 focus:border-[#0B1C30]/40 transition-all bg-white";

const textareaCls =
  "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1C30]/20 focus:border-[#0B1C30]/40 transition-all bg-white resize-none";

// ── Main Export ───────────────────────────────────────────────

export default function ProductFormClient({
  categories,
  product,
}: ProductFormClientProps) {
  const router = useRouter();
  const isEditMode = !!product;

  // ── Form State ──────────────────────────────────────────────
  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    story: product?.story ?? "",
    price: product?.price?.toString() ?? "",
    stock: product?.stock?.toString() ?? "0",
    categoryId: product?.categoryId ?? (categories[0]?.id ?? ""),
    image: product?.image ?? "",
    isActive: product?.isActive ?? true,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  // ── Image Preview ───────────────────────────────────────────
  const [imageError, setImageError] = useState(false);

  // ── Handlers ────────────────────────────────────────────────
  const handleField = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "image") setImageError(false);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 3)
      errs.name = "Nama minimal 3 karakter.";
    if (!form.description.trim() || form.description.trim().length < 10)
      errs.description = "Deskripsi minimal 10 karakter.";
    if (!form.categoryId) errs.categoryId = "Pilih kategori.";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
      errs.price = "Harga harus angka positif.";
    if (isNaN(Number(form.stock)) || Number(form.stock) < 0)
      errs.stock = "Stok harus angka ≥ 0.";
    if (!form.image.trim()) errs.image = "URL gambar wajib diisi.";
    try {
      new URL(form.image);
    } catch {
      if (form.image.trim()) errs.image = "Format URL gambar tidak valid.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    const payload: CreateProductInput = {
      name: form.name.trim(),
      description: form.description.trim(),
      story: form.story.trim() || undefined,
      price: Number(form.price),
      stock: Number(form.stock),
      categoryId: form.categoryId,
      image: form.image.trim(),
      isActive: form.isActive,
    };

    startTransition(async () => {
      let result;
      if (isEditMode) {
        result = await updateProduct({ id: product.id, ...payload });
      } else {
        result = await createProduct(payload);
      }

      if (result.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          router.push("/dashboard/produk");
          router.refresh();
        }, 1200);
      } else {
        setSubmitError(result.error);
      }
    });
  };

  // ── Render ───────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.push("/dashboard/produk")}
        className="flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-800 transition-colors mb-6"
      >
        <ChevronLeft size={16} strokeWidth={2} />
        Kembali ke Daftar Produk
      </button>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">
          {isEditMode ? "Edit Produk" : "Tambah Produk Baru"}
        </h1>
        <p className="text-[13px] text-slate-500 mt-0.5">
          {isEditMode
            ? "Perbarui informasi produk di bawah ini."
            : "Isi detail produk kerajinan warga binaan."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Card: Informasi Dasar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_2px_0_rgba(0,0,0,0.04),0_1px_6px_-1px_rgba(0,0,0,0.04)] p-6 space-y-5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100">
            Informasi Dasar
          </p>

          <FormField
            label="Nama Produk"
            required
            error={fieldErrors.name}
            hint="Nama produk yang akan ditampilkan ke publik."
          >
            <input
              name="name"
              value={form.name}
              onChange={handleField}
              type="text"
              placeholder="contoh: Tenun Ikat Motif Sotis NTT"
              className={inputCls}
            />
          </FormField>

          <FormField label="Kategori" required error={fieldErrors.categoryId}>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleField}
              className={inputCls}
            >
              {categories.length === 0 && (
                <option value="" disabled>
                  Belum ada kategori — tambah dulu di halaman Kategori
                </option>
              )}
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Deskripsi Produk"
            required
            error={fieldErrors.description}
            hint="Jelaskan produk secara singkat (ukuran, bahan, keunikan)."
          >
            <textarea
              name="description"
              value={form.description}
              onChange={handleField}
              placeholder="Deskripsi singkat mengenai produk..."
              rows={4}
              className={textareaCls}
            />
          </FormField>

          <FormField
            label="Cerita Produk (Story)"
            error={fieldErrors.story}
            hint="Opsional. Narasi inspiratif di balik pembuatan produk ini."
          >
            <textarea
              name="story"
              value={form.story}
              onChange={handleField}
              placeholder="Diceritakan oleh pengrajin: ..."
              rows={3}
              className={textareaCls}
            />
          </FormField>
        </div>

        {/* Card: Harga & Stok */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_2px_0_rgba(0,0,0,0.04),0_1px_6px_-1px_rgba(0,0,0,0.04)] p-6 space-y-5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100">
            Harga & Stok
          </p>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Harga (Rp)"
              required
              error={fieldErrors.price}
              hint="Masukkan angka penuh (contoh: 150000)"
            >
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-slate-400 font-medium">
                  Rp
                </span>
                <input
                  name="price"
                  value={form.price}
                  onChange={handleField}
                  type="number"
                  min="0"
                  placeholder="150000"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </FormField>

            <FormField
              label="Stok"
              required
              error={fieldErrors.stock}
              hint="Jumlah unit tersedia"
            >
              <input
                name="stock"
                value={form.stock}
                onChange={handleField}
                type="number"
                min="0"
                placeholder="0"
                className={inputCls}
              />
            </FormField>
          </div>
        </div>

        {/* Card: Gambar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_2px_0_rgba(0,0,0,0.04),0_1px_6px_-1px_rgba(0,0,0,0.04)] p-6 space-y-5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100">
            Gambar Produk
          </p>

          <FormField
            label="URL Gambar"
            required
            error={fieldErrors.image}
            hint="Masukkan URL gambar publik (https://...). Upload ke Supabase Storage akan ditambahkan segera."
          >
            <input
              name="image"
              value={form.image}
              onChange={handleField}
              type="url"
              placeholder="https://..."
              className={inputCls}
            />
          </FormField>

          {/* Preview */}
          {form.image && (
            <div className="mt-3">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Preview
              </p>
              <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                {!imageError ? (
                  <Image
                    src={form.image}
                    alt="Preview"
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                    sizes="160px"
                    unoptimized
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <ImageIcon size={24} className="text-slate-300" />
                    <p className="text-[10px] text-slate-400 text-center px-2">
                      URL tidak valid atau gambar tidak bisa dimuat
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Card: Status */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_2px_0_rgba(0,0,0,0.04),0_1px_6px_-1px_rgba(0,0,0,0.04)] p-4 flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold text-slate-800">
              Tampilkan di Katalog Publik
            </p>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Produk akan terlihat oleh pengunjung jika diaktifkan.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              name="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={handleField}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0B1C30]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B1C30]"></div>
          </label>
        </div>

        {/* Submit Area */}
        <div className="space-y-3 pb-8">
          {submitError && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-[13px] text-red-700">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[13px] text-emerald-700">
              <CheckCircle2 size={15} />
              {isEditMode ? "Produk berhasil diperbarui!" : "Produk berhasil ditambahkan!"}
              <span className="text-[12px] text-emerald-600 ml-auto">
                Mengalihkan...
              </span>
            </div>
          )}
          <button
            type="submit"
            disabled={isPending || submitSuccess}
            className="w-full h-11 rounded-lg bg-[#0B1C30] text-white text-[14px] font-semibold hover:bg-[#0B1C30]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending
              ? "Menyimpan..."
              : isEditMode
              ? "Simpan Perubahan"
              : "Tambah Produk"}
          </button>
        </div>
      </form>
    </div>
  );
}
