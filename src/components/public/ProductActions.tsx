"use client";

import { useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useDictionary } from "@/hooks/useDictionary";

interface ProductActionsProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    slug: string;
    stock: number;
    externalUrl?: string | null;
  };
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ProductActions({ product }: ProductActionsProps) {
  const d = useDictionary().product;
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const openCheckout = useCartStore((s) => s.openCheckout);

  const safeExternalUrl =
    product.externalUrl && /^https?:\/\//i.test(product.externalUrl.trim())
      ? product.externalUrl.trim()
      : null;
  const inStock = product.stock > 0;

  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        slug: product.slug,
      },
      quantity
    );
    openCart();
  };

  const handleBuyNow = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        slug: product.slug,
      },
      quantity
    );
    openCheckout();
  };

  return (
    <>
      {/* Price */}
      <p className="text-xl font-light text-stone-700 mb-4">
        {formatRupiah(product.price)}
      </p>

      {safeExternalUrl ? (
        <>
          {/* Stock status for external origin product */}
          <div className="mb-5 pb-4 border-b border-stone-200">
            <p className="text-[12px] text-stone-500 font-light">
              {inStock ? d.available(product.stock) : d.outOfStock}
            </p>
          </div>

          {/* External Purchase CTA */}
          <div className="space-y-2.5 mb-6">
            {inStock ? (
              <a
                href={safeExternalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full py-3.5 px-6 bg-stone-900 border border-stone-900 text-white text-[11px] uppercase tracking-[0.15em] font-normal hover:bg-white hover:text-stone-900 transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{d.buyExternal}</span>
                <svg
                  className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
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
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="w-full py-3.5 bg-stone-900 text-white text-[11px] uppercase tracking-[0.15em] font-normal opacity-40 cursor-not-allowed"
              >
                {d.outOfStock}
              </button>
            )}
            <p className="text-xs text-stone-500 font-light leading-relaxed">
              {d.externalNotice}
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Quantity */}
          <div className="mb-5 pb-5 border-b border-stone-200">
            <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-normal mb-2.5">
              {d.qty}
            </p>
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center border border-stone-300">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-100 active:bg-stone-200 transition-colors text-lg font-light"
                  aria-label="Decrease"
                >
                  −
                </button>
                <span className="w-11 h-10 flex items-center justify-center text-sm font-normal text-stone-900 border-x border-stone-300">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-100 active:bg-stone-200 transition-colors text-lg font-light"
                  aria-label="Increase"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              <p className="text-[12px] text-stone-400 font-light">
                {inStock ? d.available(product.stock) : d.outOfStock}
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-2.5 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="w-full py-3.5 border border-stone-900 bg-white text-stone-900 text-[11px] uppercase tracking-[0.15em] font-normal hover:bg-stone-100 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {d.addToCart}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!inStock}
              className="w-full py-3.5 bg-stone-900 text-white text-[11px] uppercase tracking-[0.15em] font-normal hover:bg-stone-800 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {d.buyNow}
            </button>
          </div>
        </>
      )}
    </>
  );
}
