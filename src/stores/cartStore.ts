// ============================================================
// PASzar — Cart Store (Zustand + localStorage persist)
// ============================================================
// State keranjang belanja pengunjung.
// Persist middleware menyimpan HANYA `items` ke localStorage,
// sehingga UI state (isOpen, dll) selalu reset saat reload.
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── Interfaces ────────────────────────────────────────────────

export interface CartItem {
  id: string;       // product.id (cuid)
  name: string;     // snapshot nama produk
  price: number;    // snapshot harga (Rupiah penuh)
  image: string;    // URL gambar produk
  slug: string;     // slug produk (untuk link)
  quantity: number;
}

interface CartState {
  // ── Data ──────────────────────────────────────────────────
  items: CartItem[];

  // ── UI State ──────────────────────────────────────────────
  isOpen: boolean;
  isCheckoutOpen: boolean;

  // ── Item Mutations ────────────────────────────────────────
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, quantity: number) => void;
  clearCart: () => void;

  // ── UI Mutations ──────────────────────────────────────────
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
}

// ── Store ──────────────────────────────────────────────────────

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      // ── Initial State ─────────────────────────────────────────
      items: [],
      isOpen: false,
      isCheckoutOpen: false,

      // ── addItem ───────────────────────────────────────────────
      addItem: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity: qty }],
          };
        }),

      // ── removeItem ────────────────────────────────────────────
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      // ── updateQty ─────────────────────────────────────────────
      updateQty: (id, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.id !== id) };
          }
          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity } : i
            ),
          };
        }),

      // ── clearCart ─────────────────────────────────────────────
      clearCart: () => set({ items: [] }),

      // ── UI Mutations ──────────────────────────────────────────
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCheckout: () => set({ isCheckoutOpen: true, isOpen: false }),
      closeCheckout: () => set({ isCheckoutOpen: false }),
    }),
    {
      name: "paszar-cart",
      // HANYA persist items — UI state (isOpen, isCheckoutOpen) TIDAK
      // disimpan agar keranjang tidak terbuka otomatis saat reload.
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// ── Selectors (Derived State) ─────────────────────────────────
// Fungsi selector terpisah untuk mencegah re-render yang tidak perlu.
// Gunakan: `const count = useCartStore(cartItemCount);`

export const cartItemCount = (state: CartState): number =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);

export const cartSubtotal = (state: CartState): number =>
  state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
