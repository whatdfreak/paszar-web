"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDictionary } from "@/hooks/useDictionary";
import ProductActions from "@/components/public/ProductActions";
import ProductCard, { type ProductCardData } from "@/components/public/ProductCard";

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    galleryEnabled?: boolean;
    images?: string[];
    externalUrl?: string | null;
    slug: string;
    stock: number;
    description: string;
    story: string | null;
    category: {
      name: string;
      slug: string;
    };
  };
  relatedProducts: ProductCardData[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailProps) {
  const d = useDictionary().product;
  const galleryImages = Array.from(
    new Set([
      product.image,
      ...(product.galleryEnabled && product.images ? product.images : []),
    ])
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUserSelected, setIsUserSelected] = useState(false);

  // Dual persistent layers untuk crossfade CSS halus pada halaman detail
  const [slotA, setSlotA] = useState(product.image);
  const [slotB, setSlotB] = useState(product.image);
  const [activeSlot, setActiveSlot] = useState<"A" | "B">("A");
  const [hasSwappedOnce, setHasSwappedOnce] = useState(false);

  const [prevProductId, setPrevProductId] = useState(product.id);
  if (product.id !== prevProductId) {
    setPrevProductId(product.id);
    setCurrentIndex(0);
    setIsUserSelected(false);
    setSlotA(product.image);
    setSlotB(product.image);
    setActiveSlot("A");
    setHasSwappedOnce(false);
  }

  useEffect(() => {
    if (galleryImages.length <= 1 || isUserSelected) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [galleryImages.length, isUserSelected]);

  const safeIndex = currentIndex < galleryImages.length ? currentIndex : 0;
  const activeImage = galleryImages[safeIndex] ?? product.image;

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

  const handleManualSelect = (nextIdx: number) => {
    setIsUserSelected(true);
    setCurrentIndex((nextIdx + galleryImages.length) % galleryImages.length);
  };

  return (
    <>
      {/* Product Detail — 2 Column */}
      <section className="bg-white pt-16 md:pt-20 pb-10 lg:pb-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          {/* Page-Only Breadcrumb (Produk / Nama Produk) */}
          <nav className="flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-widest text-stone-500 mb-4 md:mb-5">
            <Link href="/katalog" className="hover:text-stone-900 transition-colors font-normal">
              {d.breadcrumb.shop}
            </Link>
            <span className="text-stone-300">/</span>
            <span className="text-stone-800 font-normal truncate max-w-[260px] sm:max-w-md">
              {product.name}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* Left — Images (Auto-slide until user clicks a photo) */}
            <div>
              <div className="relative aspect-square overflow-hidden bg-stone-100 mb-3 rounded-none group">
                <Image
                  src={slotA}
                  alt={activeSlot === "A" ? product.name : ""}
                  aria-hidden={activeSlot !== "A"}
                  fill
                  className={`object-cover ${
                    activeSlot === "A"
                      ? `z-[2] opacity-100 ${hasSwappedOnce ? "animate-image-swap" : ""}`
                      : "z-[1] opacity-100"
                  }`}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <Image
                  src={slotB}
                  alt={activeSlot === "B" ? product.name : ""}
                  aria-hidden={activeSlot !== "B"}
                  fill
                  className={`object-cover ${
                    activeSlot === "B"
                      ? `z-[2] opacity-100 ${hasSwappedOnce ? "animate-image-swap" : ""}`
                      : "z-[1] opacity-100"
                  }`}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />

                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleManualSelect(safeIndex - 1)}
                      aria-label="Foto sebelumnya"
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center bg-white/90 border border-stone-200 text-stone-900 opacity-85 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 hover:bg-stone-900 hover:text-white cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleManualSelect(safeIndex + 1)}
                      aria-label="Foto berikutnya"
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center bg-white/90 border border-stone-200 text-stone-900 opacity-85 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 hover:bg-stone-900 hover:text-white cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                    <span className="absolute bottom-3 right-3 z-10 px-2.5 py-1 bg-white/90 border border-stone-200 text-[10px] tracking-[0.15em] text-stone-800 tabular-nums">
                      {safeIndex + 1} / {galleryImages.length}
                    </span>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {galleryImages.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {galleryImages.map((imgUrl, i) => {
                    const isActive = i === safeIndex;
                    return (
                      <button
                        key={imgUrl}
                        type="button"
                        onClick={() => handleManualSelect(i)}
                        aria-label={`${product.name} view ${i + 1}`}
                        className={`relative w-14 h-14 overflow-hidden bg-stone-100 border rounded-none transition-opacity cursor-pointer ${
                          isActive
                            ? "border-stone-900 opacity-100"
                            : "border-stone-200 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={imgUrl}
                          alt={`${product.name} view ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right — Details */}
            <div className="flex flex-col">
              {/* Title */}
              <h1
                className="text-2xl lg:text-[34px] font-normal text-stone-900 leading-tight mb-2.5"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {product.name}
              </h1>

              {/* Client — price, qty, CTA buttons */}
              <ProductActions
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  slug: product.slug,
                  stock: product.stock,
                  externalUrl: product.externalUrl,
                }}
              />

              {/* Description */}
              <div className="pb-5 border-b border-stone-200 mb-5">
                <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-normal mb-2.5">
                  {d.description}
                </p>
                <p className="text-sm text-stone-500 font-light leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Story */}
              {product.story && (
                <div className="pb-5 border-b border-stone-200 mb-5">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-normal mb-2.5">
                    {d.story}
                  </p>
                  <p className="text-sm text-stone-400 font-light leading-relaxed italic">
                    &ldquo;{product.story}&rdquo;
                  </p>
                </div>
              )}

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-4 lg:gap-6 mt-2">
                {d.badges.map((badge) => (
                  <p
                    key={badge}
                    className="text-[10px] text-stone-400 uppercase tracking-[0.1em] font-light"
                  >
                    {badge}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-12 lg:py-16 bg-stone-50 border-t border-stone-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400 font-normal mb-2">
                  {d.related.eyebrow}
                </p>
                <h2
                  className="text-2xl lg:text-3xl font-light text-stone-900"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {d.related.title}
                </h2>
              </div>
              <Link
                href="/katalog"
                className="hidden sm:inline-flex text-[11px] text-stone-500 hover:text-stone-900 uppercase tracking-[0.15em] font-light border-b border-stone-300 pb-0.5 transition-all duration-300"
              >
                {d.related.viewAll}
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-8">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
