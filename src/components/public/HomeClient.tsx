// ============================================================
// PASzar — Landing Page Client (i18n)
// ============================================================
// Menerima produk dari Server Component parent.
// Membaca dictionary dari useLangStore — reactive saat toggle.
// ============================================================

"use client";

import Link from "next/link";
import Image from "next/image";
import { useDictionary } from "@/hooks/useDictionary";
import HeroImageFader from "@/components/public/HeroImageFader";
import FeaturedCarousel from "@/components/public/FeaturedCarousel";
import type { ProductCardData } from "@/components/public/ProductCard";

// Trust bar icon paths
const TRUST_ICONS = [
  "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
  "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
  // Tenun icon — loom/weave represented by a sparkle variant
  "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z",
  "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12",
];

interface HomeClientProps {
  products: ProductCardData[];
}

export default function HomeClient({ products }: HomeClientProps) {
  const d = useDictionary().page;

  // Hero title with line break support
  const heroLines = d.hero.title.split("\n");

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative w-full min-h-[85vh] lg:min-h-screen bg-stone-100 overflow-hidden">
        {/* Background Image Fader */}
        <HeroImageFader />
        
        {/* Scrim Overlay */}
        <div className="absolute inset-0 bg-black/50 z-[5]"></div>
        
        {/* Text Overlay */}
        <div className="relative z-10 w-full h-full min-h-[85vh] lg:min-h-screen flex flex-col justify-center max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-16">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.3em] text-white font-normal mb-6 lg:mb-8 drop-shadow-sm">
              {d.hero.eyebrow}
            </p>
            <h1
              className="text-4xl sm:text-5xl lg:text-[64px] font-normal text-white leading-[1.1] tracking-tight mb-6 lg:mb-8 drop-shadow-md"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {heroLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < heroLines.length - 1 && <br />}
                </span>
              ))}
            </h1>
            <p className="text-base text-stone-100 font-light leading-relaxed max-w-xl mb-10 lg:mb-12">
              {d.hero.desc}
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-8">
              <Link
                href="/katalog"
                className="inline-flex justify-center items-center gap-3 px-8 py-4 bg-transparent border border-white text-white text-[11px] uppercase tracking-[0.2em] font-normal hover:bg-white hover:text-black transition-all duration-300 rounded-none w-full sm:w-auto"
              >
                {d.hero.cta}
              </Link>
              <Link
                href="#about"
                className="text-[11px] uppercase tracking-[0.2em] text-stone-200 font-normal hover:text-white border-b border-stone-200 hover:border-white pb-0.5 transition-colors duration-300"
              >
                {d.hero.story}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ARTISANS ===== */}
      <section id="artisans" className="bg-stone-50 py-20 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-xl mb-12 md:mb-16">
            <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400 font-normal mb-4">
              {d.artisans.eyebrow}
            </p>
            <h2
              className="text-3xl lg:text-[42px] font-light text-stone-900 leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {d.artisans.title}
            </h2>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 md:grid md:grid-cols-3 md:overflow-visible scrollbar-hide pb-6 md:pb-0 -mx-6 px-6 scroll-px-6 md:mx-0 md:px-0">
            {d.artisans.categories.map((item) => (
              <div key={item.title} className="min-w-[80vw] snap-center md:min-w-0 md:w-auto">
                <div className="relative aspect-square md:aspect-[4/5] bg-stone-100 overflow-hidden mb-6">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 80vw, 33vw"
                  />
                </div>
                <h3 className="text-sm font-normal text-stone-900 uppercase tracking-[0.15em] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-stone-400 font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="bg-white py-20 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10 md:mb-14">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400 font-normal mb-4">
                {d.featured.eyebrow}
              </p>
              <h2
                className="text-3xl lg:text-[42px] font-light text-stone-900 leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {d.featured.title}
              </h2>
            </div>
            <Link
              href="/katalog"
              className="hidden sm:inline-flex items-center gap-2 text-[11px] text-stone-500 hover:text-stone-900 tracking-[0.15em] uppercase font-light border-b border-stone-300 pb-0.5 transition-all duration-300"
            >
              {d.featured.viewAll}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {products.length > 0 ? (
            <FeaturedCarousel products={products} />
          ) : (
            <div className="text-center py-20 border border-stone-100">
              <p className="text-sm text-stone-400 font-light mb-4">{d.featured.empty}</p>
              <p className="text-[12px] text-stone-300 font-light">{d.featured.emptyHint}</p>
            </div>
          )}

          <div className="text-center mt-6 sm:hidden">
            <Link
              href="/katalog"
              className="inline-flex items-center gap-2 text-[11px] text-stone-500 hover:text-stone-900 tracking-[0.15em] uppercase font-light border-b border-stone-300 pb-0.5"
            >
              {d.featured.viewAllMobile}
            </Link>
          </div>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section className="bg-[#BA7517] py-14 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {d.trust.map((item, i) => (
              <div key={item.title} className="text-center lg:text-left">
                <div className="flex justify-center lg:justify-start text-white/90 mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={TRUST_ICONS[i]} />
                  </svg>
                </div>
                <p className="text-sm font-normal text-white tracking-wide mb-1">{item.title}</p>
                <p className="text-[12px] text-white/70 font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT / STORY ===== */}
      <section id="about" className="bg-white py-20 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image */}
            <div className="relative aspect-square md:aspect-[4/5] bg-stone-100 overflow-hidden order-2 lg:order-1">
              <Image
                src="/images/product-chair.png"
                alt="Workshop Lapas Kupang"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Text */}
            <div className="order-1 lg:order-2">
              <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400 font-normal mb-6">
                {d.about.eyebrow}
              </p>

              {/* Title with line break */}
              <h2
                className="text-3xl lg:text-[42px] font-light text-stone-900 leading-tight mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {d.about.title.split("\n").map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br className="hidden md:block" />}
                  </span>
                ))}
              </h2>

              {/* Tagline */}
              <p className="text-[13px] text-stone-400 font-light italic tracking-wide mb-8 md:mb-10">
                &ldquo;{d.about.tagline}&rdquo;
              </p>

              <div className="space-y-6 text-stone-500 font-light leading-relaxed text-[15px]">
                {d.about.body.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-5 mt-10 md:mt-12 pt-10 md:pt-12 border-t border-stone-200">
                {d.about.features.map((f) => (
                  <div key={f.title}>
                    <p className="font-normal text-stone-900 text-sm">{f.title}</p>
                    <p className="text-[12px] text-stone-400 font-light mt-0.5">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PARTNERS ===== */}
      <section className="bg-stone-50 py-16 lg:py-20 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400 font-normal text-center mb-10">
            {d.partners.eyebrow}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center mb-8">
            {d.partners.names.map((partner) => (
              <div key={partner} className="flex items-center justify-center h-12">
                <span className="text-sm text-stone-400 hover:text-stone-900 transition-colors font-light tracking-[0.15em] uppercase text-center">
                  {partner}
                </span>
              </div>
            ))}
          </div>
          {/* Hashtag */}
          <div className="text-center">
            <span className="text-[11px] text-stone-400 font-light tracking-[0.1em]">
              {d.partners.hashtag}
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
