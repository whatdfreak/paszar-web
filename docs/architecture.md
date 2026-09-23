# Architecture — PASzar
## Struktur Direktori, Data Flow & Keputusan Arsitektur

| Metadata | Detail |
|---|---|
| **Dokumen** | Architecture Guide |
| **Versi** | `1.0.0` |
| **Bergantung pada** | `docs/PRD_masterplan.md`, `docs/Design_System.md` |
| **Tanggal Dibuat** | 24 September 2026 |
| **Framework** | Next.js 16.x (App Router) + React 19 + React Compiler |

---

## Daftar Isi

1. [Prinsip Arsitektur](#1-prinsip-arsitektur)
2. [Struktur Direktori Lengkap](#2-struktur-direktori-lengkap)
3. [Layer Architecture](#3-layer-architecture)
4. [Data Flow — Operasi CRUD](#4-data-flow--operasi-crud)
5. [Data Flow — Checkout & WhatsApp](#5-data-flow--checkout--whatsapp)
6. [Database Schema & Future-Proofing](#6-database-schema--future-proofing)
7. [Authentication Flow](#7-authentication-flow)
8. [File Upload Flow](#8-file-upload-flow)
9. [State Management — Zustand Cart](#9-state-management--zustand-cart)
10. [API Routes — Aturan & Batasan](#10-api-routes--aturan--batasan)
11. [Environment & Configuration](#11-environment--configuration)
12. [Error Handling Patterns](#12-error-handling-patterns)

---

## 1. PRINSIP ARSITEKTUR

### 1.1 Monolith Next.js — Satu Repo, Satu Deploy

PASzar menggunakan arsitektur **Monolith Next.js** dengan satu aplikasi yang menggabungkan:

- **Public Storefront** (SSR/SSG untuk pengunjung)
- **Admin Dashboard** (Server-rendered, dilindungi auth)
- **Server Actions** (mutasi data, pengganti API tradisional)
- **Minimal API Routes** (hanya untuk keperluan spesifik: NextAuth + WebHook)

```
BUKAN: Microservices / Backend Terpisah / BFF Pattern
ADALAH: Next.js Monolith → Supabase PostgreSQL
```

### 1.2 Aturan Mutasi Data (WAJIB DIPATUHI)

> [!IMPORTANT]
> **SEMUA operasi mutasi data internal (CREATE, UPDATE, DELETE) WAJIB menggunakan Server Actions.**
> Dilarang keras membuat API Route tradisional (`/api/products`, `/api/categories`, dll) untuk tujuan CRUD internal.

| Operasi | Mekanisme | Lokasi |
|---|---|---|
| **Mutasi Internal** (CRUD) | Server Action | `src/actions/*.actions.ts` |
| **Auth** | NextAuth Route Handler | `src/app/api/auth/[...nextauth]/route.ts` |
| **Checkout Publik** | API Route (POST) | `src/app/api/orders/route.ts` |
| **Webhook PG** (Fase 2) | API Route (POST) | `src/app/api/webhooks/payment/route.ts` |

### 1.3 Rendering Strategy per Halaman

| Halaman | Strategi | Alasan |
|---|---|---|
| `/` (Landing) | SSG (Static) | Konten jarang berubah, performa optimal |
| `/katalog` | SSR + ISR (`revalidate: 60`) | Katalog berubah saat admin CRUD |
| `/produk/[slug]` | SSR + ISR (`revalidate: 60`) | Data produk dinamis |
| `/login` | SSG | Halaman statis sederhana |
| `/dashboard/*` | SSR (Dynamic) | Data real-time, dilindungi session |
| `/kelola-*` | SSR (Dynamic) | Admin CRUD, data segar |
| `/pesanan/*` | SSR (Dynamic) | Data pesanan real-time |

---

## 2. STRUKTUR DIREKTORI LENGKAP

```
paszar-web/
│
├── docs/                              # Dokumentasi proyek
│   ├── PRD_masterplan.md              # Product Requirements Document
│   ├── Design_System.md               # UI/UX & Styling Rules
│   └── architecture.md               # Dokumen ini
│
├── prisma/
│   ├── schema.prisma                  # Model database & relasi
│   ├── seed.ts                        # Script seed data awal
│   └── migrations/                    # Auto-generated oleh prisma migrate
│
├── public/
│   ├── favicon.ico
│   ├── images/
│   │   ├── logo.svg
│   │   └── placeholder-product.jpg    # Fallback jika gambar tidak ada
│   └── fonts/                         # Jika ada font self-hosted
│
├── src/
│   │
│   ├── app/                           # Next.js App Router Root
│   │   │
│   │   ├── (public)/                  # Route Group: tanpa prefix URL
│   │   │   ├── layout.tsx             # Layout publik (Header + Footer)
│   │   │   ├── page.tsx               # / — Landing Page (SSG)
│   │   │   ├── katalog/
│   │   │   │   └── page.tsx           # /katalog — Katalog produk
│   │   │   └── produk/
│   │   │       └── [slug]/
│   │   │           └── page.tsx       # /produk/[slug] — Detail produk
│   │   │
│   │   ├── (admin)/                   # Route Group: dashboard admin
│   │   │   ├── layout.tsx             # Layout admin (Sidebar + auth guard)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx           # /dashboard — Overview & statistik
│   │   │   ├── kelola-produk/
│   │   │   │   ├── page.tsx           # /kelola-produk — Daftar produk
│   │   │   │   ├── baru/
│   │   │   │   │   └── page.tsx       # /kelola-produk/baru — Form tambah
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx       # /kelola-produk/[id] — Form edit
│   │   │   ├── kelola-kategori/
│   │   │   │   └── page.tsx           # /kelola-kategori
│   │   │   └── pesanan/
│   │   │       ├── page.tsx           # /pesanan — Daftar pesanan
│   │   │       └── [id]/
│   │   │           └── page.tsx       # /pesanan/[id] — Detail pesanan
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx               # /login
│   │   │
│   │   ├── api/                       # API Routes — HANYA untuk kasus berikut:
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts       # NextAuth handler
│   │   │   ├── orders/
│   │   │   │   └── route.ts           # POST — Public checkout endpoint
│   │   │   └── webhooks/
│   │   │       └── payment/
│   │   │           └── route.ts       # [TODO: FASE 2] Midtrans webhook receiver
│   │   │
│   │   ├── layout.tsx                 # Root layout (font, metadata global)
│   │   └── globals.css                # Tailwind @import + custom keyframes
│   │
│   ├── components/                    # Komponen React — SRP (1 komponen = 1 tanggung jawab)
│   │   │
│   │   ├── ui/                        # Primitif UI — Tidak ada logika bisnis
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Spinner.tsx
│   │   │
│   │   ├── layout/                    # Komponen struktur halaman
│   │   │   ├── Header.tsx             # Navbar publik
│   │   │   ├── Footer.tsx             # Footer publik
│   │   │   └── AdminSidebar.tsx       # Sidebar dashboard admin
│   │   │
│   │   ├── product/                   # Komponen terkait produk (publik)
│   │   │   ├── ProductCard.tsx        # Card dengan hover quick-add
│   │   │   ├── ProductGrid.tsx        # Grid responsif
│   │   │   ├── ProductCarousel.tsx    # Horizontal scroll carousel
│   │   │   ├── CategoryFilter.tsx     # Filter kategori
│   │   │   └── HeroSlider.tsx         # Image slider Hero Section
│   │   │
│   │   ├── cart/                      # Komponen keranjang belanja
│   │   │   ├── CartDrawer.tsx         # Slide-over cart panel
│   │   │   ├── CartItem.tsx           # Baris item di keranjang
│   │   │   └── CheckoutModal.tsx      # Modal form data pengiriman
│   │   │
│   │   └── admin/                     # Komponen khusus admin dashboard
│   │       ├── ProductForm.tsx        # Form tambah/edit produk + upload
│   │       ├── CategoryForm.tsx       # Form tambah/edit kategori
│   │       ├── OrderTable.tsx         # Tabel daftar pesanan
│   │       ├── OrderStatusSelect.tsx  # Dropdown ubah status pesanan
│   │       └── StatsCard.tsx          # Kartu statistik dashboard
│   │
│   ├── actions/                       # Server Actions — SEMUA mutasi di sini
│   │   ├── product.actions.ts         # createProduct, updateProduct, deleteProduct
│   │   ├── category.actions.ts        # createCategory, updateCategory, deleteCategory
│   │   └── order.actions.ts           # updateOrderStatus, getOrderStats
│   │
│   ├── lib/                           # Utility & konfigurasi singleton
│   │   ├── prisma.ts                  # Prisma client singleton (connection pooling)
│   │   ├── auth.ts                    # NextAuth configuration (options)
│   │   ├── supabase.ts                # Supabase client (storage only)
│   │   ├── whatsapp.ts                # WA URL generator utility
│   │   └── utils.ts                   # Helper umum (formatPrice, generateSlug, dll)
│   │
│   ├── stores/                        # Zustand stores (client-side state)
│   │   └── cartStore.ts               # Cart state + persist ke localStorage
│   │
│   ├── validations/                   # Zod schemas — validasi input
│   │   ├── product.schema.ts
│   │   ├── category.schema.ts
│   │   ├── order.schema.ts
│   │   └── auth.schema.ts
│   │
│   ├── types/                         # TypeScript types & interfaces
│   │   ├── index.ts                   # Re-export semua types
│   │   ├── api.types.ts               # Request/Response types
│   │   └── next-auth.d.ts             # NextAuth session type augmentation
│   │
│   └── middleware.ts                  # Auth guard untuk route /dashboard, /kelola-*, /pesanan
│
├── .env.local                         # Secrets (TIDAK di-commit ke Git)
├── .gitignore
├── AGENTS.md                          # Instruksi untuk AI agents
├── CLAUDE.md                          # Instruksi khusus Claude
├── next.config.ts                     # Next.js config (reactCompiler: true)
├── tailwind.config.ts                 # Tailwind theme extension
├── tsconfig.json                      # TypeScript strict mode
└── package.json
```

---

## 3. LAYER ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  src/components/    src/app/(public)/    src/app/(admin)/    │
│  (React Components)  (Server Pages)      (Admin Pages)       │
└──────────────────────────┬──────────────────────────────────┘
                           │ props / server data fetch
┌──────────────────────────▼──────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  src/actions/*.actions.ts   src/app/api/orders/route.ts      │
│  (Server Actions)           (Public API — checkout only)     │
└──────────────────────────┬──────────────────────────────────┘
                           │ Prisma ORM calls
┌──────────────────────────▼──────────────────────────────────┐
│                    DATA ACCESS LAYER                         │
│  src/lib/prisma.ts (singleton)                               │
│  (Prisma Client → Supabase PostgreSQL)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ TCP connection
┌──────────────────────────▼──────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                      │
│  Supabase PostgreSQL (DB)   Supabase Storage (Images)        │
│  Vercel Edge Network        NextAuth.js (JWT)                │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 Client-Side Layer (Terpisah)

```
Browser
  └── Zustand cartStore (persist: localStorage)
        ├── cartItems[]
        ├── addItem / removeItem / updateQty / clearCart
        └── Hydrated oleh CartDrawer & CheckoutModal (Client Components)
```

---

## 4. DATA FLOW — OPERASI CRUD

### 4.1 Alur CREATE Produk (Admin)

```
[Admin] Isi ProductForm → Submit
    │
    ▼
[Client] Upload gambar ke Supabase Storage (via client)
    │   └── Validasi: MIME type (jpg/png/webp), max 2MB
    │   └── Return: public URL gambar
    │
    ▼
[Server Action] createProduct(formData)
    │   "use server"
    │   1. getServerSession() → cek autentikasi
    │   2. productSchema.safeParse() → validasi Zod
    │   3. slugify(name) → generate slug unik
    │   4. prisma.product.create({ data: {...} })
    │   5. revalidatePath("/katalog")
    │   6. revalidatePath("/dashboard")
    │
    ▼
[Supabase PostgreSQL] INSERT INTO products
    │
    ▼
[Next.js ISR] Cache diinvalidasi → Halaman katalog di-rebuild
    │
    ▼
[Admin UI] Toast notifikasi sukses + redirect ke /kelola-produk
```

### 4.2 Alur READ Produk (Publik — SSR)

```
[Visitor] Request GET /katalog
    │
    ▼
[Next.js Server] katalog/page.tsx (Server Component)
    │   const products = await prisma.product.findMany({
    │     where: { isActive: true },
    │     include: { category: true },
    │     orderBy: { createdAt: "desc" }
    │   })
    │
    ▼
[Supabase PostgreSQL] SELECT dari products
    │
    ▼
[React Server Component] Render HTML di server
    │
    ▼
[Browser] Terima HTML yang sudah rendered (SSR/ISR)
```

---

## 5. DATA FLOW — CHECKOUT & WHATSAPP

```
[Visitor] Klik "Checkout" di CartDrawer
    │
    ▼
[CheckoutModal] Muncul — form data pengiriman
    │
    ▼
[Visitor] Isi form → Klik "Kirim Pesanan"
    │
    ▼
[Client] Validasi form sisi client (Zod)
    │
    ▼
[API Route] POST /api/orders
    │   Body: { customerName, phone, address, items: CartItem[] }
    │
    ▼
[Server] Validasi ulang dengan Zod (server-side)
    │   1. orderSchema.safeParse(body)
    │   2. Cek stok produk dari database
    │   3. Generate orderCode: "PZ-YYYYMMDD-XXXXX"
    │   4. Kalkulasi totalAmount
    │   5. prisma.$transaction([
    │        prisma.order.create({ data: orderData }),
    │        ...items.map(item => prisma.orderItem.create(...)),
    │        // Opsional: kurangi stok produk
    │      ])
    │
    ▼
[Supabase PostgreSQL]
    │   INSERT INTO orders (status: PENDING)
    │   INSERT INTO order_items
    │
    ▼
[Server] Return { orderCode, success: true }
    │
    ▼
[Client]
    │   1. zustand.clearCart()
    │   2. Tutup CheckoutModal
    │   3. lib/whatsapp.ts → generateWAUrl(orderCode, items, customer)
    │   4. window.open(waUrl, "_blank")
    │
    ▼
[WhatsApp] Terbuka dengan pesan pre-filled ke nomor admin
```

---

## 6. DATABASE SCHEMA & FUTURE-PROOFING

### 6.1 Enum `OrderStatus` — Disiapkan untuk Fase 2

> [!NOTE]
> Enum `OrderStatus` dan kolom tabel `Order` sudah disiapkan sejak MVP untuk mengakomodasi alur Payment Gateway di Fase 2. Status `WAITING_PAYMENT` dan `PAID` sudah ada meskipun **belum digunakan** di alur WA MVP saat ini.

```prisma
enum OrderStatus {
  // ── Fase 1 (MVP — WhatsApp Router) ──────────────────────
  PENDING     // Order dibuat → menunggu konfirmasi via WA
  CONFIRMED   // Admin konfirmasi via WA / dashboard
  PROCESSING  // Sedang dikemas
  SHIPPED     // Sudah dikirim
  COMPLETED   // Diterima pembeli
  CANCELLED   // Dibatalkan

  // ── Fase 2 (TODO — Payment Gateway) ─────────────────────
  // WAITING_PAYMENT  // Order dibuat, menunggu pembayaran Midtrans
  // PAID             // Pembayaran dikonfirmasi oleh webhook
  // PAYMENT_FAILED   // Pembayaran gagal / kadaluarsa
  // REFUNDED         // Dana dikembalikan
}
```

### 6.2 Kolom Order untuk Fase 2 (TODO)

```prisma
model Order {
  // ... kolom existing ...

  // [TODO: FASE 2 — Payment Gateway]
  // paymentMethod     String?   // "midtrans", "manual_transfer"
  // paymentToken      String?   // Midtrans Snap token
  // paymentUrl        String?   // Midtrans payment URL
  // midtransOrderId   String?   @unique
  // paidAt            DateTime?
}
```

### 6.3 Webhook Payment Route (TODO: Fase 2)

```typescript
// src/app/api/webhooks/payment/route.ts
// [TODO: FASE 2] — Midtrans webhook receiver
// Endpoint ini akan dipanggil oleh Midtrans untuk notifikasi status pembayaran.
// Implementasi Fase 2:
//   1. Verifikasi signature key dari Midtrans
//   2. Update OrderStatus: WAITING_PAYMENT → PAID / PAYMENT_FAILED
//   3. Kirim notifikasi email ke admin (opsional)

export async function POST(req: Request) {
  // TODO: Implementasi Fase 2
  return new Response("Not Implemented", { status: 501 });
}
```

---

## 7. AUTHENTICATION FLOW

### 7.1 Login Admin

```
[Admin] GET /login
    │
    ▼
[Login Page] Form Email + Password
    │
    ▼
[Admin] Submit form
    │
    ▼
[NextAuth] POST /api/auth/callback/credentials
    │   CredentialsProvider.authorize():
    │   1. prisma.admin.findUnique({ where: { email } })
    │   2. bcrypt.compare(password, admin.hashedPassword)
    │   3. Jika valid → return { id, email, name }
    │   4. JWT dibuat oleh NextAuth
    │
    ▼
[Browser] Cookie: next-auth.session-token (HttpOnly, Secure, SameSite=Lax)
    │
    ▼
[Middleware] src/middleware.ts
    │   - Setiap request ke /dashboard, /kelola-*, /pesanan
    │   - Cek token JWT dari cookie
    │   - Jika tidak valid → redirect ke /login
    │
    ▼
[Admin] Akses ke halaman admin berhasil
```

### 7.2 Pola Proteksi di Server Action

```typescript
// src/actions/product.actions.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/validations/product.schema";

export async function createProduct(formData: FormData) {
  // LANGKAH 1: Cek autentikasi — WAJIB di setiap Server Action admin
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized: Anda harus login sebagai admin.");
  }

  // LANGKAH 2: Parse & validasi input dengan Zod
  const rawData = {
    name:        formData.get("name"),
    description: formData.get("description"),
    price:       Number(formData.get("price")),
    stock:       Number(formData.get("stock")),
    categoryId:  formData.get("categoryId"),
    image:       formData.get("image"),
  };

  const parsed = productSchema.safeParse(rawData);
  if (!parsed.success) {
    throw new Error(`Validasi gagal: ${parsed.error.message}`);
  }

  // LANGKAH 3: Operasi database
  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      slug: generateSlug(parsed.data.name),
    },
  });

  // LANGKAH 4: Invalidasi cache ISR
  revalidatePath("/katalog");
  revalidatePath("/dashboard");

  return { success: true, id: product.id };
}
```

---

## 8. FILE UPLOAD FLOW

### 8.1 Alur Upload Gambar Produk

```
[Admin] Pilih file gambar di ProductForm
    │
    ▼
[Client-side Validation] — Sebelum upload
    │   1. Cek MIME type: hanya image/jpeg, image/png, image/webp
    │   2. Cek ukuran file: maksimal 2MB (2 * 1024 * 1024 bytes)
    │   3. Jika gagal → tampilkan error, TIDAK upload
    │
    ▼
[Optional: Client Compression]
    │   Gunakan browser-image-compression atau canvas API
    │   Resize: maks 1200px lebar, quality: 0.85
    │
    ▼
[Supabase Storage Client] — Upload langsung dari browser
    │   const { data, error } = await supabase.storage
    │     .from("product-images")  // bucket publik
    │     .upload(`products/${Date.now()}-${filename}`, file, {
    │       cacheControl: "3600",
    │       upsert: false,
    │     });
    │
    ▼
[Supabase Storage] Simpan file
    │   Return: path file di storage
    │
    ▼
[Client] Generate public URL
    │   const { data: { publicUrl } } = supabase.storage
    │     .from("product-images")
    │     .getPublicUrl(data.path);
    │
    ▼
[Server Action] createProduct() dipanggil dengan publicUrl sebagai nilai `image`
```

### 8.2 Aturan Supabase Storage

```typescript
// src/lib/supabase.ts — Konfigurasi Supabase client (storage only)
import { createClient } from "@supabase/supabase-js";

// HANYA menggunakan ANON_KEY untuk operasi storage dari client
// JANGAN gunakan SERVICE_KEY di sini
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Konstanta validasi upload
export const UPLOAD_CONSTRAINTS = {
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"] as const,
  MAX_SIZE_BYTES: 2 * 1024 * 1024, // 2MB
  BUCKET_NAME: "product-images",
} as const;
```

---

## 9. STATE MANAGEMENT — ZUSTAND CART

### 9.1 Struktur Cart Store

```typescript
// src/stores/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  id:       string;  // product.id
  name:     string;
  price:    number;
  image:    string;
  slug:     string;
  quantity: number;
}

interface CartState {
  items:        CartItem[];
  isOpen:       boolean;
  isCheckoutOpen: boolean;

  // Actions
  addItem:      (item: Omit<CartItem, "quantity">) => void;
  removeItem:   (id: string) => void;
  updateQty:    (id: string, quantity: number) => void;
  clearCart:    () => void;
  openCart:     () => void;
  closeCart:    () => void;
  toggleCart:   () => void;
  openCheckout: () => void;
  closeCheckout:() => void;

  // Derived (dihitung, bukan state)
  // Gunakan selector, bukan computed property
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isCheckoutOpen: false,

      addItem: (newItem) => set((state) => {
        const existing = state.items.find(i => i.id === newItem.id);
        if (existing) {
          return {
            items: state.items.map(i =>
              i.id === newItem.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          };
        }
        return { items: [...state.items, { ...newItem, quantity: 1 }] };
      }),

      // ... implementasi lainnya
    }),
    {
      name: "paszar-cart",     // key di localStorage
      partialize: (state) => ({ items: state.items }),  // Hanya persist items
    }
  )
);

// Selectors — gunakan ini di komponen
export const cartItemCount = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);

export const cartSubtotal = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
```

---

## 10. API ROUTES — ATURAN & BATASAN

> [!WARNING]
> API Routes hanya boleh dibuat untuk kasus-kasus di bawah ini. Di luar itu, wajib menggunakan Server Actions.

### 10.1 Route yang Diizinkan

| Route | Method | Tujuan | Auth Required |
|---|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth session handler | — |
| `/api/orders` | POST | Public checkout endpoint | ❌ Tidak |
| `/api/webhooks/payment` | POST | **(TODO: Fase 2)** Midtrans webhook | ❌ (signature verify) |

### 10.2 Proteksi `/api/orders` (Public Endpoint)

```typescript
// src/app/api/orders/route.ts

import { NextRequest, NextResponse } from "next/server";
import { orderSchema } from "@/validations/order.schema";
import { prisma } from "@/lib/prisma";
import { generateOrderCode } from "@/lib/utils";

export async function POST(req: NextRequest) {
  // 1. Rate limiting (implementasi via Vercel Edge Config atau custom header)
  //    Target: maks 5 request per IP per menit

  // 2. Parse & validasi body
  const body = await req.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data tidak valid", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // 3. Verifikasi stok produk
  const productIds = parsed.data.items.map(i => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    select: { id: true, name: true, price: true, stock: true },
  });

  for (const item of parsed.data.items) {
    const product = products.find(p => p.id === item.productId);
    if (!product || product.stock < item.quantity) {
      return NextResponse.json(
        { error: `Stok produk tidak mencukupi: ${item.productName}` },
        { status: 409 }
      );
    }
  }

  // 4. Buat order dalam transaction
  const orderCode = generateOrderCode();
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderCode,
        customerName:       parsed.data.customerName,
        customerPhone:      parsed.data.customerPhone,
        customerAddress:    parsed.data.customerAddress,
        customerCity:       parsed.data.customerCity,
        customerProvince:   parsed.data.customerProvince,
        customerPostalCode: parsed.data.customerPostalCode,
        notes:              parsed.data.notes,
        totalAmount:        parsed.data.totalAmount,
        status:             "PENDING",
        items: {
          create: parsed.data.items.map(item => ({
            productId:    item.productId,
            productName:  item.productName,
            productPrice: item.productPrice,
            quantity:     item.quantity,
            subtotal:     item.productPrice * item.quantity,
          })),
        },
      },
    });
    return newOrder;
  });

  return NextResponse.json({ success: true, orderCode: order.orderCode });
}
```

---

## 11. ENVIRONMENT & CONFIGURATION

### 11.1 File `.env.local` (Template)

```bash
# ── Database (Supabase PostgreSQL via Prisma) ──────────────────
# Transaction Mode (untuk runtime — connection pooler)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Session Mode (untuk prisma migrate — direct connection)
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# ── NextAuth ───────────────────────────────────────────────────
NEXTAUTH_SECRET="[generate dengan: openssl rand -base64 32]"
NEXTAUTH_URL="http://localhost:3000"    # Di production: https://paszar.vercel.app

# ── Supabase (Storage) ─────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."

# ⚠️ SERVICE_KEY — HANYA untuk server-side, JANGAN gunakan NEXT_PUBLIC_
SUPABASE_SERVICE_KEY="eyJ..."

# ── Admin WhatsApp ─────────────────────────────────────────────
ADMIN_WHATSAPP_NUMBER="6281234567890"   # Format internasional, tanpa +

# ── [TODO: FASE 2] Midtrans ────────────────────────────────────
# MIDTRANS_SERVER_KEY=""
# MIDTRANS_CLIENT_KEY=""
# MIDTRANS_IS_PRODUCTION="false"
```

### 11.2 Rules `tsconfig.json` — Strict Mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}
```

---

## 12. ERROR HANDLING PATTERNS

### 12.1 Server Action Error

```typescript
// Pattern standar: return object, bukan throw
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createProduct(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "Unauthorized" };

    // ... logika ...
    return { success: true, data: { id: product.id } };
  } catch (err) {
    console.error("[createProduct]", err);
    return { success: false, error: "Terjadi kesalahan server." };
  }
}
```

### 12.2 Client Component Error Handling

```typescript
// Di komponen client yang memanggil Server Action
const [isPending, startTransition] = useTransition();

const handleSubmit = (formData: FormData) => {
  startTransition(async () => {
    const result = await createProduct(formData);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Produk berhasil ditambahkan!");
    router.push("/kelola-produk");
  });
};
```

### 12.3 Error Boundary untuk Halaman

```typescript
// src/app/(admin)/error.tsx
"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
      <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400">
        Terjadi Kesalahan
      </p>
      <h2 className="text-2xl font-light font-[family-name:var(--font-display)]
                     text-stone-900">
        {error.message}
      </h2>
      <button
        onClick={reset}
        className="px-6 py-3 rounded-none border border-stone-900 text-stone-900
                   text-[11px] uppercase tracking-[0.2em] hover:bg-stone-900
                   hover:text-white transition-all duration-200">
        Coba Lagi
      </button>
    </div>
  );
}
```

---

> **Arsitektur ini wajib dipatuhi seluruh tim pengembang dan AI agents yang bekerja pada proyek PASzar.**
> Setiap keputusan yang menyimpang dari dokumen ini harus didiskusikan dan dicatat perubahannya.
