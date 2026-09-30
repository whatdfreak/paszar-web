// ============================================================
// PASzar — ProductCard (Migrated + Refactored from Tes Proyek)
// ============================================================
// Refactoring notes:
// - Removed @/context/CartContext → wired to useCartStore (Zustand)
// - Removed dependency on @/data/products (local mock data)
// - Props now accept plain typed fields (no Product mock interface)
// - formatPrice moved inline (Intl.NumberFormat)
// - Quick-add button: bg-white → border-stone-200 (no shadow)
// - Image hover scale preserved (tasteful micro-interaction)
// ============================================================

"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/stores/cartStore";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;    // Rupiah penuh (Int)
  image: string;    // URL publik Supabase Storage
  category: string; // Nama kategori (untuk label brand)
}

interface ProductCardProps {
  product: ProductCardData;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      slug: product.slug,
    });
    openCart();
  };

  return (
    <div className="group relative flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100 mb-4">
        <Link href={`/produk/${product.slug}`} className="absolute inset-0 z-0">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>

        {/* Quick Add Button — pojok kanan bawah dalam gambar */}
        <button
          onClick={handleQuickAdd}
          aria-label={`Tambah ${product.name} ke keranjang`}
          className="absolute bottom-3 right-3 z-10 w-9 h-9 flex items-center justify-center bg-white border border-stone-200 text-stone-900 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out hover:bg-stone-900 hover:text-white hover:border-stone-900"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5h.008v.008H8.625v-.008zm5.625 0h.008v.008h-.008v-.008z"
            />
          </svg>
        </button>
      </div>

      {/* Text Container */}
      <Link href={`/produk/${product.slug}`} className="block">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-normal">
            {product.category}
          </p>
          <h3 className="text-sm font-normal text-stone-900 leading-snug line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm font-light text-stone-600 pt-0.5">
            {formatRupiah(product.price)}
          </p>
        </div>
      </Link>
    </div>
  );
}
