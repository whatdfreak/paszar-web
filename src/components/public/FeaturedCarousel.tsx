"use client";

import { useRef, useState, useEffect } from "react";
import ProductCard, { type ProductCardData } from "@/components/public/ProductCard";

export default function FeaturedCarousel({ products }: { products: ProductCardData[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 20);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 20);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [products]);

  const scroll = (dir: "left" | "right") => {
    carouselRef.current?.scrollBy({ left: dir === "left" ? -350 : 350, behavior: "smooth" });
  };

  const navBtn = (dir: "left" | "right", visible: boolean) => (
    <button
      onClick={() => scroll(dir)}
      aria-label={dir === "left" ? "Scroll kiri" : "Scroll kanan"}
      className={`absolute ${dir === "left" ? "left-0 -translate-x-3 md:-translate-x-5" : "right-0 translate-x-3 md:translate-x-5"}
        top-[40%] -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white border border-stone-200 text-stone-600
        flex items-center justify-center hover:bg-stone-900 hover:text-white hover:border-stone-900
        transition-all duration-300 z-10
        ${visible ? "opacity-100 md:opacity-0 md:group-hover:opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.2}
          d={dir === "left" ? "M15.75 19.5L8.25 12l7.5-7.5" : "M8.25 4.5l7.5 7.5-7.5 7.5"}
        />
      </svg>
    </button>
  );

  return (
    <div className="relative group">
      {navBtn("left", canScrollLeft)}
      <div
        ref={carouselRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 scrollbar-hide -mx-6 px-6 scroll-px-6 md:mx-0 md:px-0 md:scroll-px-0"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-[70vw] md:w-[40vw] lg:w-[23%] snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      {navBtn("right", canScrollRight)}
    </div>
  );
}
