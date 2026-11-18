"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const IMAGES = [
  {
    src: "/images/hero-bg-1.jpg",
    alt: "Pengrajin menenun kain Tenun Ikat tradisional NTT di bengkel kerja Kupang",
  },
  {
    src: "/images/hero-bg-2.jpg",
    alt: "Proses ukir dan penghalusan kayu jati karya warga binaan Lapas Kupang",
  },
  {
    src: "/images/hero-bg-3.jpg",
    alt: "Koleksi kriya lontar, ukiran tempurung kelapa, sasando, dan tenun ikat NTT",
  },
];

export default function HeroImageFader() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full bg-stone-200 overflow-hidden z-0">
      {IMAGES.map((item, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={item.src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              className={`object-cover transition-transform duration-[5000ms] ease-out ${
                isActive ? "scale-[1.03]" : "scale-100"
              }`}
              priority={index === 0}
              sizes="100vw"
            />
          </div>
        );
      })}
    </div>
  );
}
