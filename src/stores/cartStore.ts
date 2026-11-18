// ============================================================
// PASzar — Cart Store (Zustand + Hardened localStorage persist)
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;       // product.id (cuid)
  name: string;     // snapshot nama produk
  price: number;    // snapshot harga (Rupiah penuh)
  image: string;    // URL gambar produk
  slug: string;     // slug produk (untuk link)
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isCheckoutOpen: boolean;

  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, quantity: number) => void;
  clearCart: () => void;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
}

const MAX_CART_ITEM_QTY = 99;
const MAX_CART_ITEMS = 20;
const FALLBACK_IMAGE = "/images/product-tenun.jpg";

function clampQty(qty: unknown): number {
  const num = typeof qty === "number" ? qty : Number(qty);
  if (!Number.isFinite(num) || num < 1) return 1;
  return Math.min(MAX_CART_ITEM_QTY, Math.trunc(num));
}

function sanitizeImageUrl(url: unknown): string {
  if (typeof url !== "string") return FALLBACK_IMAGE;
  const trimmed = url.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return trimmed;
    }
  } catch {
    // URL tidak valid
  }
  return FALLBACK_IMAGE;
}

function sanitizeCartItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const valid: CartItem[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const item = entry as Partial<CartItem>;
    if (
      typeof item.id !== "string" ||
      !item.id.trim() ||
      typeof item.name !== "string" ||
      !item.name.trim() ||
      typeof item.slug !== "string" ||
      !item.slug.trim()
    ) {
      continue;
    }
    const priceNum = Number(item.price);
    if (!Number.isFinite(priceNum) || priceNum < 0) continue;

    valid.push({
      id: item.id.trim().slice(0, 64),
      name: item.name.trim().slice(0, 200),
      slug: item.slug.trim().slice(0, 200),
      price: Math.trunc(priceNum),
      image: sanitizeImageUrl(item.image),
      quantity: clampQty(item.quantity),
    });
    if (valid.length >= MAX_CART_ITEMS) break;
  }
  return valid;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      isCheckoutOpen: false,

      addItem: (item, qty = 1) =>
        set((state) => {
          const safeQty = clampQty(qty);
          const safePrice =
            Number.isFinite(item.price) && item.price >= 0
              ? Math.trunc(item.price)
              : 0;
          const safeImage = sanitizeImageUrl(item.image);
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: clampQty(i.quantity + safeQty) }
                  : i
              ),
            };
          }
          if (state.items.length >= MAX_CART_ITEMS) {
            return state;
          }
          return {
            items: [
              ...state.items,
              {
                id: item.id.trim().slice(0, 64),
                name: item.name.trim().slice(0, 200),
                slug: item.slug.trim().slice(0, 200),
                price: safePrice,
                image: safeImage,
                quantity: safeQty,
              },
            ],
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQty: (id, quantity) =>
        set((state) => {
          if (!Number.isFinite(quantity) || quantity <= 0) {
            return { items: state.items.filter((i) => i.id !== id) };
          }
          const clamped = clampQty(quantity);
          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity: clamped } : i
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCheckout: () => set({ isCheckoutOpen: true, isOpen: false }),
      closeCheckout: () => set({ isCheckoutOpen: false }),
    }),
    {
      name: "paszar-cart",
      partialize: (state) => ({ items: state.items }),
      merge: (persistedState, currentState) => {
        const raw =
          persistedState && typeof persistedState === "object"
            ? (persistedState as { items?: unknown }).items
            : undefined;
        return {
          ...currentState,
          items: sanitizeCartItems(raw),
        };
      },
    }
  )
);

export const cartItemCount = (state: CartState): number =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);

export const cartSubtotal = (state: CartState): number =>
  state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
