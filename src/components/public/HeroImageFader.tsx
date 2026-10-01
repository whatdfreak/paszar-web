"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const IMAGES = [
  "/images/hero-bg-1.png",
  "/images/hero-bg-2.png",
  "/images/hero-bg-3.png",
];

export default function HeroImageFader() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
    }, 4000); // 4 seconds crossfade

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full bg-stone-100 overflow-hidden z-0">
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-white/40 z-10 mix-blend-overlay" />
      <div className="absolute inset-0 bg-stone-900/10 z-10" />
      {IMAGES.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={src}
            alt={`Hero background ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
          />
        </div>
      ))}
    </div>
  );
}
