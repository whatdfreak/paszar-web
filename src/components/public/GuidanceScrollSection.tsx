// ============================================================
// PASzar — Noesa-Style Split Scroll Showcase (Desktop & Mobile)
// ============================================================

"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import AnimatedSection from "@/components/public/AnimatedSection";
import type { GuidanceSlide } from "@/dictionaries/en";

interface GuidanceScrollSectionProps {
  slides: readonly GuidanceSlide[];
}

export default function GuidanceScrollSection({
  slides,
}: GuidanceScrollSectionProps) {
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);

  useEffect(() => {
    const updateActiveSlide = () => {
      const viewportCenter = window.innerHeight * 0.52;
      let closestIdx = 0;
      let minDist = Infinity;

      blockRefs.current.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const blockCenter = rect.top + rect.height / 2;
        const dist = Math.abs(blockCenter - viewportCenter);
        if (dist < minDist) {
          minDist = dist;
          closestIdx = idx;
        }
      });

      setActiveIndex(closestIdx);
    };

    window.addEventListener("scroll", updateActiveSlide, { passive: true });
    updateActiveSlide();
    return () => window.removeEventListener("scroll", updateActiveSlide);
  }, [slides.length]);

  const handleMobileScroll = () => {
    const el = mobileTrackRef.current;
    if (!el || el.clientWidth === 0) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== mobileIndex && idx >= 0 && idx < slides.length) {
      setMobileIndex(idx);
    }
  };

  const jumpToMobileSlide = (index: number) => {
    const el = mobileTrackRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
    setMobileIndex(index);
  };

  return (
    <section id="about" className="bg-white border-t border-stone-200">
      <AnimatedSection>
        {/* ===== DESKTOP: STICKY LEFT PHOTO + SCROLLING CENTERED TEXT ===== */}
        <div className="hidden lg:grid lg:grid-cols-2 max-w-7xl mx-auto">
          {/* Sticky Photo Column */}
          <div className="relative">
            <div className="sticky top-14 h-[calc(100vh-3.5rem)] flex items-center justify-center px-8 xl:px-14 py-10">
              <div className="relative w-full aspect-[4/5] max-h-[76vh] bg-stone-100 overflow-hidden">
                {slides.map((slide, i) => {
                  const isActive = i === activeIndex;
                  return (
                    <div
                      key={slide.image}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        isActive
                          ? "opacity-100"
                          : "opacity-0 pointer-events-none"
                      }`}
                    >
                      <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1280px) 45vw, 560px"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Vertically Scrolling Text Column */}
          <div className="bg-white">
            {slides.map((slide, i) => {
              const isActive = i === activeIndex;
              return (
                <div
                  key={slide.title}
                  ref={(el) => {
                    blockRefs.current[i] = el;
                  }}
                  className="min-h-[82vh] flex flex-col items-center justify-center text-center px-10 xl:px-20 py-16"
                >
                  <div
                    className={`transition-opacity duration-500 ${
                      isActive ? "opacity-100" : "opacity-25"
                    }`}
                  >
                    <h2
                      className="text-xl xl:text-2xl uppercase tracking-[0.22em] text-stone-900 font-normal leading-relaxed mb-6 max-w-md mx-auto"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {slide.title}
                    </h2>
                    <p className="text-sm xl:text-[15px] text-stone-600 font-light leading-[1.9] max-w-md mx-auto">
                      {slide.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== MOBILE: CENTERED SWIPE CAROUSEL WITH DOTS ===== */}
        <div className="lg:hidden py-14 bg-white">
          <div
            ref={mobileTrackRef}
            onScroll={handleMobileScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          >
            {slides.map((slide) => (
              <div
                key={slide.title}
                className="min-w-full snap-center px-8 flex flex-col items-center text-center"
              >
                <div className="relative w-64 max-w-[74vw] aspect-square bg-stone-100 overflow-hidden mb-8">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover"
                    sizes="75vw"
                  />
                </div>

                <h2
                  className="text-base tracking-[0.18em] uppercase text-stone-900 font-normal leading-relaxed mb-4 max-w-xs"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {slide.title}
                </h2>

                <p className="text-xs sm:text-sm text-stone-500 font-light leading-[1.8] max-w-xs">
                  {slide.body}
                </p>
              </div>
            ))}
          </div>

          {/* Pagination Dots */}
          <div className="flex items-center justify-center gap-2.5 mt-7">
            {slides.map((slide, i) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => jumpToMobileSlide(i)}
                aria-label={slide.title}
                className={`w-1.5 h-1.5 transition-colors duration-300 cursor-pointer ${
                  i === mobileIndex ? "bg-stone-900" : "bg-stone-300"
                }`}
              />
            ))}
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
