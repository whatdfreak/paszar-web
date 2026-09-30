// ============================================================
// PASzar — CartDrawer (Migrated + Refactored from Tes Proyek)
// ============================================================
// Refactoring notes:
// - Removed @/context/CartContext → useCartStore (Zustand)
// - Removed @/data/products dependency → formatRupiah inline
// - CartItem shape updated to match cartStore.CartItem
//   (items now have id, name, price, image, slug, quantity)
// - Removed `item.variant` field (not in PASzar MVP schema)
// - border-gray-200 → border-stone-200
// - shadow-2xl on drawer → removed, border-l border-stone-200 instead
// - openCheckout wired to Zustand action
// ============================================================

"use client";

import Image from "next/image";
import { useCartStore, cartSubtotal } from "@/stores/cartStore";

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const openCheckout = useCartStore((s) => s.openCheckout);
  const subtotal = useCartStore(cartSubtotal);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white border-l border-stone-200 animate-slide-in-right flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-stone-900 font-normal">
            Keranjang ({items.length})
          </h2>
          <button
            onClick={closeCart}
            className="text-stone-400 hover:text-stone-900 transition-colors"
            aria-label="Tutup keranjang"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-sm text-stone-400 font-light mb-4">
                Keranjang Anda kosong
              </p>
              <button
                onClick={closeCart}
                className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-light border-b border-stone-300 pb-0.5 hover:text-stone-900 transition-colors"
              >
                Lanjut Belanja
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-6 border-b border-stone-200">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-24 bg-stone-100 shrink-0 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-normal text-stone-900 leading-snug truncate mb-1">
                      {item.name}
                    </p>
                    <p className="text-sm font-light text-stone-600 mb-3">
                      {formatRupiah(item.price)}
                    </p>

                    {/* Qty + Remove */}
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center border border-stone-300">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-900 text-sm font-light"
                          aria-label="Kurangi"
                        >
                          −
                        </button>
                        <span className="w-8 h-8 flex items-center justify-center text-[12px] font-normal text-stone-900 border-x border-stone-300">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-900 text-sm font-light"
                          aria-label="Tambah"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[11px] text-stone-400 hover:text-stone-900 font-light underline underline-offset-2 transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-stone-200 px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-normal">
                Subtotal
              </p>
              <p className="text-base font-normal text-stone-900">
                {formatRupiah(subtotal)}
              </p>
            </div>
            <button
              onClick={openCheckout}
              className="w-full py-4 bg-stone-900 text-white text-[11px] uppercase tracking-[0.15em] font-normal hover:bg-stone-800 transition-colors duration-200"
            >
              Lanjut ke Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
