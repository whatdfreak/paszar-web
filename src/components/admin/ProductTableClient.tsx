"use client";

// ============================================================
// PASzar — Product Table Client (Admin Dashboard)
// ============================================================
// Handles: Toggle isActive, Delete (with confirmation dialog)
// All mutations call Server Actions — no direct DB access.
// ============================================================

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toggleProductActive, deleteProduct } from "@/actions/product.actions";
import {
  PencilLine,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Package,
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
  category: { name: string };
}

// ── Helpers ───────────────────────────────────────────────────

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ── Delete Confirm Modal ──────────────────────────────────────

function DeleteModal({
  productName,
  onConfirm,
  onCancel,
  loading,
}: {
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-xl border border-slate-200 shadow-xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto mb-4">
          <Trash2 size={22} className="text-red-500" strokeWidth={2} />
        </div>
        <h3 className="text-[15px] font-bold text-slate-900 text-center mb-2">
          Hapus Produk?
        </h3>
        <p className="text-sm text-slate-500 text-center mb-6">
          <span className="font-semibold text-slate-700">&ldquo;{productName}&rdquo;</span> akan
          dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-10 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-10 rounded-lg bg-red-600 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Product Row ────────────────────────────────────────────────

function ProductRowItem({
  product,
  onDeleteRequest,
}: {
  product: ProductRow;
  onDeleteRequest: (id: string, name: string) => void;
}) {
  const [isActive, setIsActive] = useState(product.isActive);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleProductActive(product.id);
      if (result.success) {
        setIsActive(result.data.isActive);
      }
    });
  };

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors group">
      {/* Image + Name */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="44px"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <Package size={18} className="text-slate-300" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-800 truncate max-w-[200px]">
              {product.name}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{product.slug}</p>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="px-4 py-3.5 hidden sm:table-cell">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600">
          {product.category.name}
        </span>
      </td>

      {/* Price */}
      <td className="px-4 py-3.5 hidden md:table-cell">
        <span className="text-[13px] font-medium text-slate-700 tabular-nums">
          {formatRupiah(product.price)}
        </span>
      </td>

      {/* Stock */}
      <td className="px-4 py-3.5 hidden lg:table-cell">
        <span
          className={`text-[13px] font-semibold tabular-nums ${
            product.stock === 0
              ? "text-red-500"
              : product.stock < 5
              ? "text-amber-600"
              : "text-slate-700"
          }`}
        >
          {product.stock}
        </span>
      </td>

      {/* Status Toggle */}
      <td className="px-4 py-3.5">
        <button
          onClick={handleToggle}
          disabled={isPending}
          title={isActive ? "Nonaktifkan" : "Aktifkan"}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all duration-200 cursor-pointer disabled:opacity-60 ${
            isActive
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
          }`}
        >
          {isActive ? (
            <Eye size={11} strokeWidth={2.5} />
          ) : (
            <EyeOff size={11} strokeWidth={2.5} />
          )}
          {isActive ? "Aktif" : "Nonaktif"}
        </button>
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/dashboard/produk/${product.id}`}
            className="p-2 rounded-lg text-slate-400 hover:text-[#0B1C30] hover:bg-slate-100 transition-colors"
            title="Edit produk"
          >
            <PencilLine size={15} strokeWidth={2} />
          </Link>
          <button
            onClick={() => onDeleteRequest(product.id, product.name)}
            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Hapus produk"
          >
            <Trash2 size={15} strokeWidth={2} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Main Export ───────────────────────────────────────────────

export default function ProductTableClient({
  initialProducts,
}: {
  initialProducts: ProductRow[];
}) {
  const router = useRouter();
  const [products, setProducts] = useState<ProductRow[]>(initialProducts);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteRequest = (id: string, name: string) => {
    setDeleteError(null);
    setDeleteTarget({ id, name });
  };

  const [deleteInfo, setDeleteInfo] = useState<string | null>(null);

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    startDelete(async () => {
      const result = await deleteProduct(deleteTarget.id);
      if (result.success) {
        if (result.data.softDeleted) {
          // Soft-delete: produk punya riwayat pesanan → nonaktifkan saja
          setProducts((prev) =>
            prev.map((p) =>
              p.id === deleteTarget.id ? { ...p, isActive: false } : p
            )
          );
          setDeleteInfo(
            `"${deleteTarget.name}" memiliki riwayat pesanan dan tidak dapat dihapus permanen. Produk telah dinonaktifkan dari katalog.`
          );
        } else {
          // Hard-delete berhasil
          setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        }
        setDeleteTarget(null);
        router.refresh();
      } else {
        setDeleteError(result.error);
      }
    });
  };

  return (
    <div>
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">
            Produk
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            {products.length} produk terdaftar
          </p>
        </div>
        <Link
          href="/dashboard/produk/baru"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#0B1C30] text-white text-[13px] font-semibold hover:bg-[#0B1C30]/90 transition-colors"
        >
          <Plus size={15} strokeWidth={2.5} />
          Tambah Produk
        </Link>
      </div>

      {/* Error from delete */}
      {deleteError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-[13px] text-red-700">
          {deleteError}
        </div>
      )}
      {/* Info: soft-delete notification */}
      {deleteInfo && (
        <div className="mb-4 flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-[13px] text-amber-800">
          <span className="flex-1">{deleteInfo}</span>
          <button onClick={() => setDeleteInfo(null)} className="text-amber-500 hover:text-amber-700 flex-shrink-0">✕</button>
        </div>
      )}

      {/* Table */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Package size={24} className="text-slate-400" />
          </div>
          <p className="text-[15px] font-semibold text-slate-700 mb-1">
            Belum ada produk
          </p>
          <p className="text-[13px] text-slate-400 mb-6">
            Tambahkan produk pertama untuk memulai.
          </p>
          <Link
            href="/dashboard/produk/baru"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#0B1C30] text-white text-[13px] font-semibold hover:bg-[#0B1C30]/90 transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} />
            Tambah Produk
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-[0_1px_2px_0_rgba(0,0,0,0.04),0_1px_6px_-1px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em]">
                    Produk
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em] hidden sm:table-cell">
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em] hidden md:table-cell">
                    Harga
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em] hidden lg:table-cell">
                    Stok
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
                {products.map((product) => (
                  <ProductRowItem
                    key={product.id}
                    product={product}
                    onDeleteRequest={handleDeleteRequest}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteModal
          productName={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={isDeleting}
        />
      )}
    </div>
  );
}
