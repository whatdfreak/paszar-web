// ============================================================
// PASzar — Landing Page Client (i18n, Editorial & Tenun Motif)
// ============================================================

"use client";

import Link from "next/link";
import Image from "next/image";
import { useDictionary } from "@/hooks/useDictionary";
import HeroImageFader from "@/components/public/HeroImageFader";
import FeaturedCarousel from "@/components/public/FeaturedCarousel";
import AnimatedSection from "@/components/public/AnimatedSection";
import GuidanceScrollSection from "@/components/public/GuidanceScrollSection";
import type { ProductCardData } from "@/components/public/ProductCard";

// Trust bar icons matching the 4 factual pillars
const TRUST_ICONS = [
  "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
  "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
  "M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z",
];

// Motif Tenun Ikat Kaif / Belah Ketupat NTT (zero external file & DB overhead)
const TENUN_PATTERN_SVG = `url("data:image/svg+xml,%3Csvg width='56' height='56' viewBox='0 0 56 56' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23BA7517' stroke-width='1'%3E%3Cpath d='M28 4L52 28L28 52L4 28Z'/%3E%3Cpath d='M28 13L43 28L28 43L13 28Z'/%3E%3Cpath d='M0 0L14 14M56 0L42 14M0 56L14 42M56 56L42 42'/%3E%3Cpath d='M28 0V8M28 48V56M0 28H8M48 28H56'/%3E%3C/g%3E%3Crect x='26' y='26' width='4' height='4' transform='rotate(45 28 28)' fill='%23D4943A'/%3E%3C/svg%3E")`;

type PartnerCode = "imipas" | "lapas" | "rutan" | "koperasi";

function PartnerEmblem({ code }: { code: PartnerCode }) {
  // Heraldic SVG Institutional Seals with subtle Gold + Stone details
  if (code === "imipas") {
    return (
      <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path
          d="M32 6L52 13V30C52 43 43.5 52.5 32 57C20.5 52.5 12 43 12 30V13L32 6Z"
          stroke="#292524"
          strokeWidth="1.5"
        />
        <path
          d="M32 10L48 15.8V30C48 40.5 41 48.2 32 52C23 48.2 16 40.5 16 30V15.8L32 10Z"
          stroke="#BA7517"
          strokeWidth="1"
        />
        {/* Pohon Pengayoman / Balance Scales */}
        <path d="M32 18V45M21 26H43" stroke="#1C1917" strokeWidth="1.5" />
        <path d="M21 26L17.5 34.5H24.5L21 26ZM43 26L39.5 34.5H46.5L43 26Z" stroke="#BA7517" strokeWidth="1.3" />
        <path d="M25 42C28 39 36 39 39 42" stroke="#1C1917" strokeWidth="1.4" />
        <polygon points="32,12.5 33.4,15.4 36.6,15.8 34.2,18 34.8,21 32,19.5 29.2,21 29.8,18 27.4,15.8 30.6,15.4" fill="#BA7517" />
      </svg>
    );
  }

  if (code === "lapas") {
    return (
      <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <rect x="10" y="10" width="44" height="44" stroke="#292524" strokeWidth="1.5" />
        <rect x="14" y="14" width="36" height="36" stroke="#BA7517" strokeWidth="1" />
        {/* Arch & Workshop Crest */}
        <path d="M20 44V29C20 22.5 25.4 18 32 18C38.6 18 44 22.5 44 29V44" stroke="#1C1917" strokeWidth="1.5" />
        <path d="M17 44H47M32 18V44M24 31H40" stroke="#1C1917" strokeWidth="1.3" />
        <rect x="29.5" y="21.5" width="5" height="5" transform="rotate(45 32 24)" fill="#BA7517" />
      </svg>
    );
  }

  if (code === "rutan") {
    return (
      <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <polygon points="32,6 56,32 32,58 8,32" stroke="#292524" strokeWidth="1.5" />
        <polygon points="32,13 49,32 32,51 15,32" stroke="#BA7517" strokeWidth="1" />
        <polygon points="32,20 42,32 32,44 22,32" stroke="#1C1917" strokeWidth="1.4" />
        <path d="M24 32H40M32 24V40" stroke="#1C1917" strokeWidth="1.2" />
        <rect x="29.5" y="29.5" width="5" height="5" transform="rotate(45 32 32)" fill="#BA7517" />
      </svg>
    );
  }

  // Koperasi Pemasyarakatan — Double Ring, Gear & Soko Guru Diamond
  return (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="24" stroke="#292524" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="19" stroke="#BA7517" strokeWidth="1" />
      <path d="M14 40C18 46 25 49 32 49C39 49 46 46 50 40" stroke="#BA7517" strokeWidth="1.3" />
      <path d="M22 28H42M32 19V41" stroke="#1C1917" strokeWidth="1.4" />
      <path d="M22 28L19 35H25L22 28ZM42 28L39 35H45L42 28Z" stroke="#1C1917" strokeWidth="1.2" />
      <polygon points="32,12 35,17 32,22 29,17" fill="#BA7517" />
    </svg>
  );
}

interface HomeClientProps {
  products: ProductCardData[];
}

export default function HomeClient({ products }: HomeClientProps) {
  const d = useDictionary().page;
  const heroLines = d.hero.title.split("\n");

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative w-full min-h-[70vh] lg:min-h-screen bg-stone-200 overflow-hidden">
        <HeroImageFader />

        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/55 via-stone-950/40 to-stone-950/20 z-[5]" />

        <div className="relative z-10 w-full h-full min-h-[70vh] lg:min-h-screen flex flex-col justify-center max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-24">
          <div className="max-w-2xl">
            <p
              className="animate-hero-fade text-[11px] uppercase tracking-[0.3em] text-stone-200 font-normal mb-6 lg:mb-8"
              style={{ animationDelay: "0ms" }}
            >
              {d.hero.eyebrow}
            </p>
            <h1
              className="animate-hero-fade text-4xl sm:text-5xl lg:text-[64px] font-normal text-white leading-[1.1] tracking-tight mb-6 lg:mb-8"
              style={{ fontFamily: "var(--font-display)", animationDelay: "70ms" }}
            >
              {heroLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < heroLines.length - 1 && <br />}
                </span>
              ))}
            </h1>
            <p
              className="animate-hero-fade text-base text-stone-100 font-light leading-relaxed max-w-xl mb-10 lg:mb-12"
              style={{ animationDelay: "140ms" }}
            >
              {d.hero.desc}
            </p>
            <div
              className="animate-hero-fade flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-8"
              style={{ animationDelay: "210ms" }}
            >
              <Link
                href="/katalog"
                className="inline-flex justify-center items-center gap-3 px-8 py-4 bg-transparent border border-white text-white text-[11px] uppercase tracking-[0.2em] font-normal hover:bg-white hover:text-black transition-all duration-300 rounded-none w-auto"
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
      <section id="artisans" className="bg-stone-50 py-12 md:py-16 lg:py-20">
        <AnimatedSection className="max-w-7xl mx-auto px-6 lg:px-8">
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
                    className="object-cover transition-transform duration-700 hover:scale-[1.02]"
                    sizes="(max-width: 768px) 80vw, 33vw"
                  />
                </div>
                <h3 className="text-sm font-normal text-stone-900 uppercase tracking-[0.15em] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-stone-500 font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="bg-white py-12 md:py-16 lg:py-20">
        <AnimatedSection className="max-w-7xl mx-auto px-6 lg:px-8" delay={100}>
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
              className="hidden sm:inline-flex items-center gap-2.5 px-5 py-2.5 border border-stone-900 bg-transparent text-stone-900 text-[11px] tracking-[0.2em] uppercase font-normal hover:bg-stone-900 hover:text-white transition-all duration-300 rounded-none"
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
              className="inline-flex items-center justify-center px-6 py-3 border border-stone-900 bg-transparent text-stone-900 text-[11px] tracking-[0.2em] uppercase font-normal hover:bg-stone-900 hover:text-white transition-all duration-300 rounded-none"
            >
              {d.featured.viewAllMobile}
            </Link>
          </div>
        </AnimatedSection>
      </section>

      {/* ===== TRUST BAR (NTT Tenun Ikat Kaif Motif Divider) ===== */}
      <section className="relative py-14 lg:py-16 bg-stone-950 border-y border-[#BA7517]/35 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.14] pointer-events-none"
          style={{ backgroundImage: TENUN_PATTERN_SVG }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-transparent to-stone-950/60 pointer-events-none"
        />

        <AnimatedSection className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {d.trust.map((item, i) => (
              <div key={item.title} className="text-center lg:text-left">
                <div className="flex justify-center lg:justify-start text-[#D4943A] mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={TRUST_ICONS[i]} />
                  </svg>
                </div>
                <p className="text-sm font-normal text-white tracking-wide mb-1">{item.title}</p>
                <p className="text-[12px] text-stone-300 font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* ===== GUIDANCE / PEMBINAAN (NOESA-STYLE SINGLE LAYER STICKY / MOBILE SWIPE) ===== */}
      <GuidanceScrollSection slides={d.about.slides} />

      {/* ===== OFFICIAL PARTNERS (STONE-50 CONTRASTING WITH WHITE GUIDANCE & WHITE FOOTER) ===== */}
      <section id="partners" className="bg-stone-50 py-14 lg:py-16 border-t border-stone-200">
        <AnimatedSection className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-normal mb-3">
              {d.partners.eyebrow}
            </p>
            <h2
              className="text-2xl sm:text-3xl font-light text-stone-900 leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {d.partners.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-stone-200 border-y border-stone-200">
            {d.partners.items.map((partner) => (
              <div
                key={partner.code}
                className="px-6 py-8 flex flex-col items-center text-center group transition-colors duration-300 hover:bg-white"
              >
                <div className="w-16 h-16 flex items-center justify-center mb-4">
                  <PartnerEmblem code={partner.code} />
                </div>
                <p className="text-xs font-medium text-stone-900 tracking-[0.08em] uppercase leading-snug mb-1.5">
                  {partner.name}
                </p>
                <p className="text-[12px] text-stone-500 font-light leading-relaxed max-w-[22ch]">
                  {partner.role}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <span className="text-[11px] text-stone-400 font-light tracking-[0.2em] uppercase">
              {d.partners.hashtag}
            </span>
          </div>
        </AnimatedSection>
      </section>
    </>
  );
}
