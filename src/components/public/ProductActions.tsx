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
      <p className="text-xl font-light text-stone-700 mb-8">
        {formatRupiah(product.price)}
      </p>

      {/* Quantity */}
      <div className="mb-8 pb-8 border-b border-stone-200">
        <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-normal mb-3">
          {d.qty}
        </p>
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center border border-stone-300">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-11 h-11 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors text-lg font-light"
              aria-label="Decrease"
            >
              −
            </button>
            <span className="w-12 h-11 flex items-center justify-center text-sm font-normal text-stone-900 border-x border-stone-300">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className="w-11 h-11 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors text-lg font-light"
              aria-label="Increase"
              disabled={quantity >= product.stock}
            >
              +
            </button>
          </div>
          <p className="text-[12px] text-stone-400 font-light">
            {product.stock > 0 ? d.available(product.stock) : d.outOfStock}
          </p>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="space-y-3 mb-8">
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full py-4 border border-stone-900 bg-white text-stone-900 text-[11px] uppercase tracking-[0.15em] font-normal hover:bg-stone-100 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {d.addToCart}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={product.stock === 0}
          className="w-full py-4 bg-stone-900 text-white text-[11px] uppercase tracking-[0.15em] font-normal hover:bg-stone-800 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {d.buyNow}
        </button>
      </div>
    </>
  );
}
