"use client";

import { useState, useEffect } from "react";

interface PriceSliderProps {
  minPrice: number;
  maxPrice: number;
  onCommit: (min: number, max: number) => void;
  formatRupiah: (amount: number) => string;
}

export default function PriceSlider({
  minPrice,
  maxPrice,
  onCommit,
  formatRupiah,
}: PriceSliderProps) {
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  // Sync local state when the filter is cleared or changed externally
  useEffect(() => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }, [minPrice, maxPrice]);

  const handleChange = (type: "min" | "max", val: number) => {
    if (type === "min") {
      setLocalMin(Math.min(val, localMax - 1000));
    } else {
      setLocalMax(Math.max(val, localMin + 1000));
    }
  };

  const handleRelease = () => {
    onCommit(localMin, localMax);
  };

  return (
    <>
      <div className="relative h-1 bg-stone-200 w-full mb-6">
        <div
          className="absolute h-full bg-stone-900"
          style={{
            left: `${(localMin / 5000000) * 100}%`,
            right: `${100 - (localMax / 5000000) * 100}%`,
          }}
        ></div>
        <input
          type="range"
          min="0"
          max="5000000"
          step="1000"
          value={localMin}
          onChange={(e) => handleChange("min", Number(e.target.value))}
          onPointerUp={handleRelease}
          onTouchEnd={handleRelease}
          className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-stone-900 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-none z-10"
        />
        <input
          type="range"
          min="0"
          max="5000000"
          step="1000"
          value={localMax}
          onChange={(e) => handleChange("max", Number(e.target.value))}
          onPointerUp={handleRelease}
          onTouchEnd={handleRelease}
          className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-stone-900 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-none z-20"
        />
      </div>
      <div className="flex justify-between items-center text-[11px] text-stone-500 font-light">
        <span>{formatRupiah(localMin)}</span>
        <span>{formatRupiah(localMax)}</span>
      </div>
    </>
  );
}
