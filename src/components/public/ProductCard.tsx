// ============================================================
// PASzar — ProductCard (Crossfade Gallery & Cart / Origin CTA)
// ============================================================

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/stores/cartStore";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;    // Rupiah penuh (Int)
  image: string;    // URL gambar utama
  galleryEnabled?: boolean;
  images?: string[];
  category: string; // Nama kategori (untuk label brand)
  externalUrl?: string | null; // Link pembelian website asal (opsional)
}

interface ProductCardProps {
  product: ProductCardData;
}

function QuickActionIcon({
  external,
  className,
}: {
  external: boolean;
  className: string;
}) {
  if (external) {
    return (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
        />
      </svg>
    );
  }
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5h.008v.008H8.625v-.008zm5.625 0h.008v.008h-.008v-.008z"
      />
    </svg>
  );
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

  const cardImages = Array.from(
    new Set([
      product.image,
      ...(product.galleryEnabled && product.images ? product.images : []),
    ])
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Dual persistent layers untuk crossfade CSS yang mulus tanpa flash/remount DOM
  const [slotA, setSlotA] = useState(product.image);
  const [slotB, setSlotB] = useState(product.image);
  const [activeSlot, setActiveSlot] = useState<"A" | "B">("A");
  const [hasSwappedOnce, setHasSwappedOnce] = useState(false);

  const [prevProductId, setPrevProductId] = useState(product.id);
  if (product.id !== prevProductId) {
    setPrevProductId(product.id);
    setCurrentIndex(0);
    setIsHovered(false);
    setSlotA(product.image);
    setSlotB(product.image);
    setActiveSlot("A");
    setHasSwappedOnce(false);
  }

  // Slide otomatis hanya berjalan saat cursor hover di kartu ini
  useEffect(() => {
    if (!isHovered || cardImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cardImages.length);
    }, 1600);
    return () => clearInterval(timer);
  }, [isHovered, cardImages.length]);

  const safeIndex = currentIndex < cardImages.length ? currentIndex : 0;
  const activeImage = cardImages[safeIndex] ?? product.image;

  const currentSlotUrl = activeSlot === "A" ? slotA : slotB;
  if (activeImage !== currentSlotUrl) {
    setHasSwappedOnce(true);
    if (activeSlot === "A") {
      setSlotB(activeImage);
      setActiveSlot("B");
    } else {
      setSlotA(activeImage);
      setActiveSlot("A");
    }
  }

  const safeExternalUrl =
    product.externalUrl && /^https?:\/\//i.test(product.externalUrl.trim())
      ? product.externalUrl.trim()
      : null;

  const quickLabel = safeExternalUrl
    ? `Beli ${product.name} di website asal`
    : `Tambah ${product.name} ke keranjang`;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (safeExternalUrl) {
      window.open(safeExternalUrl, "_blank", "noopener,noreferrer");
      return;
    }
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
      {/* Image Container — Hanya quick action beli/keranjang & garis progres halus */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative aspect-[4/5] overflow-hidden bg-stone-100 mb-4"
      >
        <Link href={`/produk/${product.slug}`} className="absolute inset-0 z-0">
          <Image
            src={slotA}
            alt={activeSlot === "A" ? product.name : ""}
            aria-hidden={activeSlot !== "A"}
            fill
            className={`object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out ${
              activeSlot === "A"
                ? `z-[2] opacity-100 ${hasSwappedOnce ? "animate-image-swap" : ""}`
                : "z-[1] opacity-100"
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <Image
            src={slotB}
            alt={activeSlot === "B" ? product.name : ""}
            aria-hidden={activeSlot !== "B"}
            fill
            className={`object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out ${
              activeSlot === "B"
                ? `z-[2] opacity-100 ${hasSwappedOnce ? "animate-image-swap" : ""}`
                : "z-[1] opacity-100"
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>

        {/* Subtle 2px bottom progress hairline saat hover produk multi-foto */}
        {cardImages.length > 1 && (
          <div
            className="absolute bottom-0 inset-x-0 h-[2px] bg-stone-300/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-[3] pointer-events-none"
            aria-hidden="true"
          >
            <div
              className="h-full bg-stone-900 transition-all duration-700 ease-in-out"
              style={{
                width: `${((safeIndex + 1) / cardImages.length) * 100}%`,
              }}
            />
          </div>
        )}

        {/* Quick Add / External Buy Button — Desktop */}
        <button
          type="button"
          onClick={handleQuickAdd}
          aria-label={quickLabel}
          title={safeExternalUrl ? "Beli di Website Asal" : "Tambah ke Keranjang"}
          className="hidden md:flex absolute bottom-3 right-3 z-10 w-9 h-9 items-center justify-center bg-white border border-stone-200 text-stone-900 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out hover:bg-stone-900 hover:text-white hover:border-stone-900 cursor-pointer"
        >
          <QuickActionIcon external={Boolean(safeExternalUrl)} className="w-4 h-4" />
        </button>
      </div>

      {/* Text Container */}
      <div className="relative">
        <Link href={`/produk/${product.slug}`} className="block pr-10 md:pr-0">
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

        {/* Quick Add / External Buy Button — Mobile */}
        <button
          type="button"
          onClick={handleQuickAdd}
          aria-label={quickLabel}
          title={safeExternalUrl ? "Beli di Website Asal" : "Tambah ke Keranjang"}
          className="md:hidden absolute bottom-0 right-0 z-10 w-8 h-8 flex items-center justify-center bg-white border border-stone-200 text-stone-900 hover:bg-stone-50 transition-colors"
        >
          <QuickActionIcon external={Boolean(safeExternalUrl)} className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
