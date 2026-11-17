"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createProduct,
  updateProduct,
  uploadProductImage,
} from "@/actions/product.actions";
import type { CreateProductInput } from "@/validations/product.schema";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { useAdminI18n } from "@/lib/admin-i18n";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ImageIcon,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";

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
  product?: ProductData;
}

// ── Constants & Helpers ───────────────────────────────────────

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_RAW_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB sebelum kompresi client
const MAX_FINAL_BYTES = 2 * 1024 * 1024; // 2 MB batas keras server
const TARGET_MAX_DIMENSION = 1200; // Standar e-commerce (tajam & ringan)

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * Mengubah ukuran & mengompresi gambar di browser menjadi WebP/JPEG
 * maksimal 1200x1200px agar memenuhi standar e-commerce tanpa membebani server.
 */
async function optimizeProductImage(file: File): Promise<{
  optimizedFile: File;
  width: number;
  height: number;
}> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const imageEl = new window.Image();
      imageEl.onload = () => resolve(imageEl);
      imageEl.onerror = () => reject(new Error("Gagal membaca file gambar."));
      imageEl.src = objectUrl;
    });

    let targetWidth = img.naturalWidth;
    let targetHeight = img.naturalHeight;

    if (
      targetWidth > TARGET_MAX_DIMENSION ||
      targetHeight > TARGET_MAX_DIMENSION
    ) {
      const ratio = Math.min(
        TARGET_MAX_DIMENSION / targetWidth,
        TARGET_MAX_DIMENSION / targetHeight
      );
      targetWidth = Math.round(targetWidth * ratio);
      targetHeight = Math.round(targetHeight * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Browser tidak mendukung pemrosesan gambar.");
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), "image/webp", 0.82);
    });

    if (!blob) {
      throw new Error("Gagal mengompresi gambar.");
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "product";
    const optimizedFile = new File([blob], `${baseName}.webp`, {
      type: "image/webp",
    });

    return {
      optimizedFile,
      width: targetWidth,
      height: targetHeight,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

// ── UI Helpers ────────────────────────────────────────────────

function FormField({
  label,
  required,
  hint,
  error,
  rightLabel,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  rightLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold text-slate-700">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
        {rightLabel && (
          <span className="text-[11px] text-slate-400 tabular-nums">
            {rightLabel}
          </span>
        )}
      </div>
      {children}
      {hint && !error && (
        <p className="mt-1.5 text-[11px] text-slate-400">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-[11px] text-rose-600 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

const inputCls =
  "w-full h-10 px-3 rounded-lg border border-slate-200 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1C30]/15 focus:border-[#0B1C30] transition-all bg-white";

const textareaCls =
  "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1C30]/15 focus:border-[#0B1C30] transition-all bg-white resize-y";

// ── Main Export ───────────────────────────────────────────────

export default function ProductFormClient({
  categories,
  product,
}: ProductFormClientProps) {
  const router = useRouter();
  const { t } = useAdminI18n();
  const isEditMode = Boolean(product);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMeta, setUploadMeta] = useState<string | null>(null);
  const [previewBroken, setPreviewBroken] = useState(false);

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
  };

  const processAndUploadFile = async (file: File) => {
    setFieldErrors((prev) => ({ ...prev, image: "" }));
    setSubmitError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFieldErrors((prev) => ({
        ...prev,
        image: "Format tidak didukung. Gunakan file JPG, PNG, atau WebP.",
      }));
      return;
    }

    if (file.size === 0) {
      setFieldErrors((prev) => ({
        ...prev,
        image: "File gambar kosong atau rusak.",
      }));
      return;
    }

    if (file.size > MAX_RAW_UPLOAD_BYTES) {
      setFieldErrors((prev) => ({
        ...prev,
        image: "Ukuran file mentah terlalu besar (maksimal 10 MB).",
      }));
      return;
    }

    setIsUploading(true);
    try {
      const { optimizedFile, width, height } = await optimizeProductImage(file);

      if (optimizedFile.size > MAX_FINAL_BYTES) {
        setFieldErrors((prev) => ({
          ...prev,
          image: "Ukuran gambar setelah kompresi masih melebihi 2 MB.",
        }));
        return;
      }

      const formData = new FormData();
      formData.append("file", optimizedFile);

      const uploadResult = await uploadProductImage(formData);
      if (!uploadResult.success) {
        setFieldErrors((prev) => ({ ...prev, image: uploadResult.error }));
        return;
      }

      setForm((prev) => ({ ...prev, image: uploadResult.data.url }));
      setPreviewBroken(false);
      setUploadMeta(
        `WebP · ${formatFileSize(uploadResult.data.sizeBytes)} · ${width}×${height}px`
      );
    } catch (err) {
      setFieldErrors((prev) => ({
        ...prev,
        image:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memproses gambar.",
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void processAndUploadFile(file);
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void processAndUploadFile(file);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const nameTrim = form.name.trim();
    const descTrim = form.description.trim();
    const storyTrim = form.story.trim();
    const parsedPrice = Number(form.price);
    const parsedStock = Number(form.stock);

    if (!nameTrim || nameTrim.length < 3) {
      errs.name = "Nama produk minimal 3 karakter.";
    } else if (nameTrim.length > 120) {
      errs.name = "Nama produk maksimal 120 karakter.";
    }

    if (!form.categoryId) {
      errs.categoryId = "Pilih kategori produk terlebih dahulu.";
    }

    if (!descTrim || descTrim.length < 10) {
      errs.description = "Deskripsi produk minimal 10 karakter.";
    } else if (descTrim.length > 2000) {
      errs.description = "Deskripsi maksimal 2000 karakter.";
    }

    if (storyTrim.length > 2000) {
      errs.story = "Cerita produk maksimal 2000 karakter.";
    }

    if (
      form.price.trim() === "" ||
      Number.isNaN(parsedPrice) ||
      !Number.isInteger(parsedPrice) ||
      parsedPrice < 0
    ) {
      errs.price = "Harga harus bilangan bulat ≥ 0 (Rupiah penuh).";
    } else if (parsedPrice > 1_000_000_000) {
      errs.price = "Harga maksimal Rp 1.000.000.000.";
    }

    if (
      form.stock.trim() === "" ||
      Number.isNaN(parsedStock) ||
      !Number.isInteger(parsedStock) ||
      parsedStock < 0
    ) {
      errs.stock = "Stok harus bilangan bulat ≥ 0.";
    } else if (parsedStock > 100_000) {
      errs.stock = "Stok maksimal 100.000 unit.";
    }

    if (!form.image.trim()) {
      errs.image = "Gambar produk wajib diunggah dari perangkat Anda.";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (isUploading) {
      setSubmitError("Tunggu hingga proses upload gambar selesai.");
      return;
    }
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
      const result = isEditMode && product
        ? await updateProduct({ id: product.id, ...payload })
        : await createProduct(payload);

      if (result.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          router.push("/dashboard/produk");
          router.refresh();
        }, 900);
      } else {
        setSubmitError(result.error);
      }
    });
  };

  const numericPrice = Number(form.price);
  const numericStock = Number(form.stock);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar sejajar dengan Sidebar */}
      <AdminTopBar
        breadcrumbs={[
          { label: "PASzar", href: "/dashboard" },
          { label: t.products.title, href: "/dashboard/produk" },
          {
            label: isEditMode
              ? t.productForm.editBreadcrumb
              : t.productForm.addBreadcrumb,
          },
        ]}
        rightSlot={
          <Link
            href="/dashboard/produk"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>{t.common.back}</span>
          </Link>
        }
      />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="p-5 md:p-6 max-w-6xl mx-auto space-y-5"
      >
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {isEditMode ? t.productForm.editTitle : t.productForm.addTitle}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditMode
                ? `${t.productForm.editSubtitle} "${product?.name}"`
                : t.productForm.addSubtitle}
            </p>
          </div>
        </header>

        {/* Peringatan jika belum ada kategori */}
        {categories.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-4 py-3 text-xs flex items-center justify-between gap-3">
            <span className="font-medium">
              Belum ada kategori produk. Buat kategori terlebih dahulu sebelum
              menambah produk.
            </span>
            <Link
              href="/dashboard/kategori"
              className="font-semibold underline shrink-0"
            >
              Buat Kategori →
            </Link>
          </div>
        )}

        {/* Global Error / Success */}
        {submitError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-3 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {submitSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              {isEditMode
                ? "Perubahan produk berhasil disimpan! Mengalihkan..."
                : "Produk baru berhasil ditambahkan! Mengalihkan..."}
            </span>
          </div>
        )}

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Kiri (8 Col): Informasi Dasar & Harga/Stok */}
          <div className="lg:col-span-8 space-y-5">
            {/* Informasi Produk */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">
                {t.productForm.infoSection}
              </h2>

              <FormField
                label={t.productForm.nameLabel}
                required
                rightLabel={`${form.name.length}/120`}
                error={fieldErrors.name}
              >
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleField}
                  maxLength={120}
                  placeholder="Contoh: Tenun Ikat Motif Buna Timor"
                  className={inputCls}
                />
              </FormField>

              <FormField
                label={t.productForm.categoryLabel}
                required
                error={fieldErrors.categoryId}
              >
                <AdminSelect
                  value={form.categoryId}
                  disabled={categories.length === 0}
                  ariaLabel="Pilih kategori produk"
                  placeholder="Tidak ada kategori tersedia"
                  onChange={(val) => {
                    setForm((prev) => ({ ...prev, categoryId: val }));
                    setFieldErrors((prev) => ({ ...prev, categoryId: "" }));
                  }}
                  triggerClassName={`${inputCls} flex items-center justify-between cursor-pointer disabled:opacity-50`}
                  options={categories.map((cat) => ({
                    value: cat.id,
                    label: cat.name,
                  }))}
                />
              </FormField>

              <FormField
                label={t.productForm.descLabel}
                required
                rightLabel={`${form.description.length}/2000`}
                hint={t.productForm.descHint}
                error={fieldErrors.description}
              >
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleField}
                  rows={4}
                  maxLength={2000}
                  placeholder="Jelaskan spesifikasi dan detail produk..."
                  className={textareaCls}
                />
              </FormField>

              <FormField
                label={t.productForm.storyLabel}
                rightLabel={`${form.story.length}/2000`}
                hint={t.productForm.storyHint}
                error={fieldErrors.story}
              >
                <textarea
                  name="story"
                  value={form.story}
                  onChange={handleField}
                  rows={3}
                  maxLength={2000}
                  placeholder="Dikerjakan dengan teliti di bengkel kerja lapas..."
                  className={textareaCls}
                />
              </FormField>
            </div>

            {/* Harga & Inventaris */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">
                {t.productForm.priceSection}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label={t.productForm.priceLabel}
                  required
                  hint={
                    !Number.isNaN(numericPrice) &&
                    form.price.trim() !== "" &&
                    numericPrice >= 0
                      ? `Tampil di toko: ${formatRupiah(numericPrice)}`
                      : "Masukkan angka bulat dalam Rupiah (contoh: 150000)"
                  }
                  error={fieldErrors.price}
                >
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      Rp
                    </span>
                    <input
                      type="number"
                      name="price"
                      min={0}
                      step={1}
                      value={form.price}
                      onChange={handleField}
                      placeholder="150000"
                      className={`${inputCls} pl-9 tabular-nums`}
                    />
                  </div>
                </FormField>

                <FormField
                  label={t.productForm.stockLabel}
                  required
                  hint={
                    !Number.isNaN(numericStock) && numericStock === 0
                      ? "Stok 0 akan ditandai Habis di katalog."
                      : !Number.isNaN(numericStock) && numericStock <= 5
                      ? "Stok ≤ 5 akan memicu notifikasi Stok Kritis."
                      : "Jumlah unit siap kirim."
                  }
                  error={fieldErrors.stock}
                >
                  <input
                    type="number"
                    name="stock"
                    min={0}
                    step={1}
                    value={form.stock}
                    onChange={handleField}
                    placeholder="10"
                    className={`${inputCls} tabular-nums`}
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Kanan (4 Col): Upload Gambar & Publikasi */}
          <div className="lg:col-span-4 space-y-5">
            {/* Upload Gambar Produk */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-semibold text-slate-900">
                  {t.productForm.imageSection} <span className="text-rose-500">*</span>
                </h2>
                <span className="text-[11px] text-slate-400">
                  {t.productForm.imageLimit}
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {form.image && !previewBroken ? (
                <div className="space-y-2.5">
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                    <img
                      src={form.image}
                      alt={form.name || "Preview produk"}
                      onError={() => setPreviewBroken(true)}
                      className="w-full h-full object-cover"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#0B1C30]" />
                        <span className="text-xs font-medium text-slate-700">
                          Mengoptimasi & mengunggah...
                        </span>
                      </div>
                    )}
                  </div>

                  {uploadMeta && (
                    <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5 font-medium">
                      Teroptimasi: {uploadMeta}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 h-8 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      {t.productForm.replaceImage}
                    </button>
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => {
                        setForm((prev) => ({ ...prev, image: "" }));
                        setUploadMeta(null);
                      }}
                      className="h-8 px-2.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors disabled:opacity-50"
                      title="Hapus gambar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => {
                    if (!isUploading) fileInputRef.current?.click();
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? "border-[#0B1C30] bg-slate-50"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                  }`}
                >
                  {isUploading ? (
                    <div className="py-4 flex flex-col items-center gap-2">
                      <Loader2 className="w-7 h-7 animate-spin text-[#0B1C30]" />
                      <p className="text-xs font-medium text-slate-700">
                        Mengompresi & mengunggah gambar...
                      </p>
                    </div>
                  ) : (
                    <div className="py-2 flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-2.5">
                        {previewBroken ? (
                          <ImageIcon className="w-5 h-5" />
                        ) : (
                          <UploadCloud className="w-5 h-5" />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-800">
                        {t.productForm.uploadPrompt}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {t.productForm.uploadHint}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {fieldErrors.image && (
                <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{fieldErrors.image}</span>
                </p>
              )}
            </div>

            {/* Status Publikasi */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    {t.productForm.showInCatalog}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {form.isActive
                      ? t.productForm.visibleHint
                      : t.productForm.hiddenHint}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleField}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-[#0B1C30] transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-2.5">
                <Link
                  href="/dashboard/produk"
                  className="flex-1 h-9 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors"
                >
                  {t.common.cancel}
                </Link>
                <button
                  type="submit"
                  disabled={
                    isPending || isUploading || categories.length === 0
                  }
                  className="flex-1 h-9 rounded-lg bg-[#0B1C30] hover:bg-[#132944] text-white text-xs font-medium shadow-sm transition-colors disabled:opacity-50"
                >
                  {isPending
                    ? t.productForm.saving
                    : isEditMode
                    ? t.productForm.saveEdit
                    : t.productForm.saveNew}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
