# PRD & TECHNICAL BLUEPRINT — PASzar
## Platform E-Commerce MVP Produk Warga Binaan Pemasyarakatan

| Metadata | Detail |
|---|---|
| **Kode Proyek** | `PASZAR-MVP-2026` |
| **Klien** | Koperasi Lapas Kupang — Kanwil Kemenkumham NTT |
| **Versi Dokumen** | `1.0.0` |
| **Tanggal Disusun** | 22 September 2026 |
| **Masa Pengerjaan** | 21 Hari Kalender (23 Sept – 13 Okt 2026) |
| **Klasifikasi** | Internal — Tidak Untuk Distribusi Publik |

---

## Daftar Isi

1. [Executive Summary](#1-executive-summary)
2. [Tech Stack & Architecture](#2-tech-stack--architecture)
3. [Database Schema (ERD)](#3-database-schema-erd)
4. [User Flow (DFD)](#4-user-flow-dfd)
5. [Security & Deployment Protocol](#5-security--deployment-protocol)
6. [Timeline Pengerjaan 21 Hari](#6-timeline-pengerjaan-21-hari)
7. [Lampiran: Design System Rules](#7-lampiran-design-system-rules)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Latar Belakang

Unit Pelaksana Teknis (UPT) Pemasyarakatan di wilayah Nusa Tenggara Timur menghasilkan berbagai produk kerajinan tangan, tekstil tenun, furnitur kayu, dan produk kuliner berkualitas tinggi melalui program pembinaan keterampilan warga binaan. Namun, distribusi dan pemasaran produk-produk tersebut masih bergantung pada mekanisme konvensional (bazar fisik, titip jual, dan pesanan langsung) yang memiliki jangkauan pasar sangat terbatas.

**PASzar** (singkatan dari **P**emasyarakatan + B**azar**) hadir sebagai solusi digital berupa platform _e-commerce_ Minimum Viable Product (MVP) yang dirancang untuk memperluas akses pasar produk warga binaan secara nasional, sekaligus meningkatkan transparansi dan akuntabilitas pengelolaan hasil produksi.

### 1.2 Visi

> Menjadi standar platform digital pemasaran produk warga binaan yang profesional, transparan, dan berdaya saing komersial setara produk _artisan brand_ nasional.

### 1.3 Misi

1. Membangun _storefront_ digital berkualitas enterprise dengan pengalaman pengguna kelas _premium boutique_.
2. Menyediakan sistem manajemen katalog produk dan pencatatan pesanan yang terstruktur bagi pengelola Koperasi.
3. Mengintegrasikan alur pemesanan dengan komunikasi WhatsApp sebagai _checkout channel_ yang familiar bagi target pasar Indonesia.
4. Menghasilkan sistem yang dapat direplikasi ke UPT Pemasyarakatan lain di seluruh Indonesia.

### 1.4 Target Keberhasilan (KPI MVP)

| Indikator | Target |
|---|---|
| Sistem _live_ dan dapat diakses publik | ≤ 13 Oktober 2026 |
| Katalog produk terisi minimal | 12 SKU aktif |
| Waktu muat halaman (_Largest Contentful Paint_) | < 2.5 detik |
| Alur checkout-to-WhatsApp berfungsi _end-to-end_ | 100% |
| Dokumentasi BAST (_Berita Acara Serah Terima_) lengkap | Selesai di H-21 |

### 1.5 Batasan Ruang Lingkup MVP

> [!IMPORTANT]
> Fitur-fitur berikut **TIDAK** termasuk dalam ruang lingkup MVP ini dan akan dipertimbangkan pada iterasi selanjutnya:

- Sistem pembayaran online (Payment Gateway).
- Multi-tenant / multi-Lapas dalam satu _instance_.
- Registrasi akun pembeli / _customer account_.
- Fitur rating, review, dan wishlist.
- Sistem pengiriman terintegrasi (_shipping API_).
- Notifikasi email / push notification.

---

## 2. TECH STACK & ARCHITECTURE

### 2.1 Tabel Teknologi

| Layer | Teknologi | Versi | Justifikasi |
|---|---|---|---|
| **Framework** | Next.js (App Router) | `^15.x` | SSR/SSG hybrid, React Server Components, optimasi performa bawaan |
| **Bahasa** | TypeScript | `^5.x` | _Type safety_ untuk kode yang _maintainable_ dan minim _runtime error_ |
| **Styling** | Tailwind CSS | `^4.x` | Utility-first, konsisten dengan design system, zero unused CSS |
| **Database** | Supabase (PostgreSQL) | Free Tier | Managed PostgreSQL, Row Level Security, REST & Realtime API |
| **File Storage** | Supabase Storage | Free Tier | Bucket publik untuk gambar produk, integrasi native dengan Supabase |
| **ORM** | Prisma | `^6.x` | Schema-as-code, migrasi otomatis, type-safe query builder |
| **Authentication** | NextAuth.js (Auth.js) | `^5.x` | JWT-based session, Credentials Provider, middleware protection |
| **Password Hashing** | bcrypt | `^5.x` | Standar industri untuk hashing password dengan salt rounds |
| **State Management** | Zustand | `^5.x` | Lightweight, tidak membutuhkan provider wrapper, persist middleware |
| **Form Validation** | Zod | `^3.x` | Schema validation yang type-safe, integrasi native dengan TypeScript |
| **HTTP Client** | Next.js Server Actions | built-in | Menggantikan kebutuhan API route terpisah untuk mutasi data |
| **Deployment** | Vercel | Pro/Hobby | Zero-config deploy dari Git, Edge Network, Preview Deployments |
| **Font** | Playfair Display + Inter | Google Fonts | Serif elegan (heading) + Sans-serif bersih (body) |

### 2.2 Diagram Arsitektur Tingkat Tinggi

```
+------------------------------------------------------------------+
|                        VERCEL EDGE NETWORK                        |
|  +------------------------------------------------------------+  |
|  |                    Next.js App Router                        |  |
|  |  +-------------+  +--------------+  +-------------------+  |  |
|  |  |  Public      |  |  Admin        |  |  API Routes       |  |
|  |  |  Pages       |  |  Dashboard    |  |  /api/auth/*      |  |
|  |  |  (SSR/SSG)   |  |  (Protected)  |  |  /api/orders      |  |
|  |  +-------------+  +--------------+  +-------------------+  |  |
|  |         |                |                   |              |  |
|  |  +------+----------------+-------------------+-----------+  |  |
|  |  |              Server Actions & Middleware               |  |  |
|  |  |         (Auth Guard - Validation - CRUD Logic)         |  |  |
|  |  +-------------------------+-----------------------------+  |  |
|  +----------------------------+-------------------------------+  |
+-------------------------------+----------------------------------+
                                | Prisma Client (TCP)
                                v
              +------------------------------+
              |    SUPABASE (Cloud)           |
              |  +------------------------+  |
              |  |  PostgreSQL Database    |  |
              |  |  - Admin               |  |
              |  |  - Category            |  |
              |  |  - Product             |  |
              |  |  - Order               |  |
              |  |  - OrderItem           |  |
              |  +------------------------+  |
              |  +------------------------+  |
              |  |  Supabase Storage      |  |
              |  |  Bucket: product-imgs  |  |
              |  +------------------------+  |
              +------------------------------+

+------------------------------------------+
|          CLIENT BROWSER                   |
|  +--------------------------------------+|
|  |  Zustand Store (persist)             ||
|  |  - cartItems[]                       ||
|  |  - addItem() / removeItem()          ||
|  |  - clearCart()                        ||
|  +--------------------------------------+|
|  +--------------------------------------+|
|  |  Checkout Modal -> WA Redirect        ||
|  +--------------------------------------+|
+------------------------------------------+
```

### 2.3 Struktur Direktori Proyek

```
paszar/
├── prisma/
│   └── schema.prisma              # Definisi model database
├── public/
│   └── images/                    # Asset statis (logo, placeholder)
├── src/
│   ├── app/
│   │   ├── (public)/              # Route Group: halaman publik
│   │   │   ├── page.tsx           # Landing Page / Home
│   │   │   ├── katalog/
│   │   │   │   └── page.tsx       # Halaman katalog produk
│   │   │   └── produk/
│   │   │       └── [slug]/
│   │   │           └── page.tsx   # Halaman detail produk
│   │   ├── (admin)/               # Route Group: dashboard admin
│   │   │   ├── layout.tsx         # Layout dengan auth guard
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx       # Overview & statistik
│   │   │   ├── kelola-produk/
│   │   │   │   ├── page.tsx       # CRUD tabel produk
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Form edit produk
│   │   │   ├── kelola-kategori/
│   │   │   │   └── page.tsx       # CRUD kategori
│   │   │   └── pesanan/
│   │   │       ├── page.tsx       # Daftar pesanan masuk
│   │   │       └── [id]/
│   │   │           └── page.tsx   # Detail pesanan
│   │   ├── login/
│   │   │   └── page.tsx           # Halaman login admin
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts   # NextAuth handler
│   │   │   └── orders/
│   │   │       └── route.ts       # POST: create order
│   │   ├── layout.tsx             # Root layout
│   │   └── globals.css            # Tailwind + custom styles
│   ├── components/
│   │   ├── ui/                    # Komponen UI primitif
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Badge.tsx
│   │   ├── layout/                # Komponen layout
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── AdminSidebar.tsx
│   │   ├── product/               # Komponen terkait produk
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   └── CategoryFilter.tsx
│   │   ├── cart/                   # Komponen keranjang
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── CartItem.tsx
│   │   │   └── CheckoutModal.tsx
│   │   └── admin/                 # Komponen admin
│   │       ├── ProductForm.tsx
│   │       ├── OrderTable.tsx
│   │       └── StatsCard.tsx
│   ├── lib/
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── auth.ts                # NextAuth config
│   │   ├── supabase.ts            # Supabase client (storage)
│   │   └── whatsapp.ts            # WA URL generator
│   ├── stores/
│   │   └── cartStore.ts           # Zustand cart store
│   ├── actions/
│   │   ├── product.actions.ts     # Server actions produk
│   │   ├── category.actions.ts    # Server actions kategori
│   │   └── order.actions.ts       # Server actions pesanan
│   ├── validations/
│   │   ├── product.schema.ts      # Zod schema produk
│   │   ├── order.schema.ts        # Zod schema pesanan
│   │   └── auth.schema.ts         # Zod schema login
│   └── types/
│       └── index.ts               # Shared TypeScript types
├── .env.local                     # Environment variables (TIDAK di-commit)
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── PRD_MASTER_PLAN.md             # Dokumen ini
```

---

## 3. DATABASE SCHEMA (ERD)

### 3.1 Entity Relationship Diagram

```mermaid
erDiagram
    ADMIN {
        String id PK
        String email UK
        String name
        String hashedPassword
        DateTime createdAt
        DateTime updatedAt
    }

    CATEGORY {
        String id PK
        String name UK
        String slug UK
        String description
        Int sortOrder
        DateTime createdAt
        DateTime updatedAt
    }

    PRODUCT {
        String id PK
        String name
        String slug UK
        String description
        String story
        Int price
        Int stock
        String image
        String categoryId FK
        Boolean isActive
        DateTime createdAt
        DateTime updatedAt
    }

    ORDER {
        String id PK
        String orderCode UK
        String customerName
        String customerPhone
        String customerAddress
        String customerCity
        String customerProvince
        String customerPostalCode
        String notes
        Int totalAmount
        OrderStatus status
        DateTime createdAt
        DateTime updatedAt
    }

    ORDER_ITEM {
        String id PK
        String orderId FK
        String productId FK
        String productName
        Int productPrice
        Int quantity
        Int subtotal
    }

    CATEGORY ||--o{ PRODUCT : "has many"
    ORDER ||--|{ ORDER_ITEM : "has many"
    PRODUCT ||--o{ ORDER_ITEM : "referenced by"
```

### 3.2 Draft `schema.prisma`

```prisma
// ============================================================
// PASzar — Prisma Schema
// Database: PostgreSQL (Supabase Free Tier)
// ============================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// -- Admin -------------------------------------------------------
// Hanya ada 1 akun SuperAdmin. Tidak ada registrasi publik.
// Password di-hash menggunakan bcrypt sebelum disimpan.

model Admin {
  id             String   @id @default(cuid())
  email          String   @unique
  name           String
  hashedPassword String   @map("hashed_password")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  @@map("admins")
}

// -- Category ----------------------------------------------------
// Kategori produk: Mebel, Tenun, Kuliner, Kerajinan, dll.
// Slug digunakan untuk URL-friendly routing.

model Category {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?  @db.Text
  sortOrder   Int      @default(0) @map("sort_order")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  products Product[]

  @@map("categories")
}

// -- Product -----------------------------------------------------
// Produk kerajinan warga binaan.
// Field `story` menyimpan narasi cerita di balik pembuatan produk.
// Field `image` menyimpan URL publik dari Supabase Storage.

model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String   @db.Text
  story       String?  @db.Text
  price       Int      // Harga dalam Rupiah (tanpa desimal)
  stock       Int      @default(0)
  image       String   // URL Supabase Storage
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  categoryId String     @map("category_id")
  category   Category   @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  orderItems OrderItem[]

  @@index([categoryId])
  @@index([isActive, createdAt(sort: Desc)])
  @@map("products")
}

// -- Order -------------------------------------------------------
// Pesanan yang dibuat saat user klik Checkout.
// `orderCode` = kode unik pesanan yang dikirim via WhatsApp.
// Format: PZ-YYYYMMDD-XXXXX (contoh: PZ-20261001-A3F7K)

model Order {
  id                 String      @id @default(cuid())
  orderCode          String      @unique @map("order_code")
  customerName       String      @map("customer_name")
  customerPhone      String      @map("customer_phone")
  customerAddress    String      @map("customer_address") @db.Text
  customerCity       String      @map("customer_city")
  customerProvince   String      @map("customer_province")
  customerPostalCode String      @map("customer_postal_code")
  notes              String?     @db.Text
  totalAmount        Int         @map("total_amount")
  status             OrderStatus @default(PENDING)
  createdAt          DateTime    @default(now()) @map("created_at")
  updatedAt          DateTime    @updatedAt @map("updated_at")

  // Relations
  items OrderItem[]

  @@index([status, createdAt(sort: Desc)])
  @@map("orders")
}

// -- OrderItem ---------------------------------------------------
// Salinan snapshot data produk saat pemesanan.
// `productName` dan `productPrice` dicopy agar data pesanan
// tetap akurat meskipun harga/nama produk berubah di kemudian hari.

model OrderItem {
  id           String @id @default(cuid())
  quantity     Int
  productName  String @map("product_name")
  productPrice Int    @map("product_price")
  subtotal     Int    // quantity x productPrice

  // Relations
  orderId   String  @map("order_id")
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String  @map("product_id")
  product   Product @relation(fields: [productId], references: [id], onDelete: Restrict)

  @@index([orderId])
  @@map("order_items")
}

// -- Enums -------------------------------------------------------

enum OrderStatus {
  PENDING    // Pesanan baru dibuat, menunggu konfirmasi via WA
  CONFIRMED  // Admin sudah mengkonfirmasi pesanan
  PROCESSING // Pesanan sedang diproses/dikemas
  SHIPPED    // Pesanan sudah dikirim
  COMPLETED  // Pesanan selesai (diterima pembeli)
  CANCELLED  // Pesanan dibatalkan
}
```

### 3.3 Catatan Penting Schema

| Aspek | Keputusan Desain |
|---|---|
| **Primary Key** | Menggunakan `cuid()` — _collision-resistant_, URL-safe, lebih pendek dari UUID |
| **Harga** | Disimpan sebagai `Int` (Rupiah penuh, tanpa desimal) untuk menghindari _floating-point precision error_ |
| **Snapshot Pattern** | `OrderItem` menyimpan `productName` dan `productPrice` sebagai salinan statis agar riwayat pesanan tidak berubah jika data produk diperbarui |
| **Soft Delete** | Tidak diimplementasikan di MVP. Produk memiliki flag `isActive` sebagai gantinya |
| **Column Mapping** | Semua kolom menggunakan `@map("snake_case")` agar konsisten dengan konvensi PostgreSQL, sementara kode TypeScript tetap menggunakan `camelCase` |

---

## 4. USER FLOW (DFD)

### 4.1 Alur Pengunjung (Customer Journey)

```
+----------------------------------------------------------------------+
|                                                                      |
|  (1) LANDING PAGE (/)                                                |
|  |-- Melihat Hero Section & Featured Products                       |
|  +-- Klik "Lihat Katalog" --------------------------+                |
|                                                     v                |
|  (2) KATALOG (/katalog)                                              |
|  |-- Melihat semua produk aktif                                      |
|  |-- Filter berdasarkan Kategori                                     |
|  |-- Klik kartu produk ----------------------------+                 |
|  |                                                 v                 |
|  |  (3) DETAIL PRODUK (/produk/[slug])                               |
|  |  |-- Melihat foto, deskripsi, cerita pembuat, harga              |
|  |  |-- Klik "+ Keranjang" ----------------------+                   |
|  |  |                                           v                    |
|  |  |  (4) SLIDE-OVER CART (Zustand State)                           |
|  |  |  |-- Item ditambahkan ke state lokal                           |
|  |  |  |-- CartDrawer terbuka dari sisi kanan                        |
|  |  |  |-- Bisa ubah quantity / hapus item                           |
|  |  |  |-- Melihat subtotal                                         |
|  |  |  +-- Klik "Checkout" ----------------------+                   |
|  |  |                                           v                    |
|  |  |  (5) CHECKOUT MODAL (Form Alamat)                              |
|  |  |  |-- Isi Nama Lengkap                                         |
|  |  |  |-- Isi Nomor WhatsApp                                       |
|  |  |  |-- Isi Alamat Lengkap                                       |
|  |  |  |-- Isi Kota, Provinsi, Kode Pos                             |
|  |  |  |-- Isi Catatan (opsional)                                    |
|  |  |  |-- Validasi form (Zod)                                       |
|  |  |  +-- Klik "Kirim Pesanan" -----------------+                  |
|  |  |                                           v                    |
|  |  |  (6) SERVER ACTION (Create Order)                              |
|  |  |  |-- Validasi ulang data di server                             |
|  |  |  |-- Generate Order Code: PZ-YYYYMMDD-XXXXX                   |
|  |  |  |-- Simpan Order + OrderItems ke database                     |
|  |  |  |-- Status default: PENDING                                   |
|  |  |  |-- Return Order Code ke client                               |
|  |  |  +-- ----------------------------------------+                 |
|  |  |                                              v                 |
|  |  |  (7) REDIRECT KE WHATSAPP                                     |
|  |  |  |-- Zustand: clearCart()                                      |
|  |  |  |-- Generate WhatsApp URL:                                    |
|  |  |  |   https://wa.me/62XXXXXXXXXX?text={encoded_message}         |
|  |  |  |-- Pesan berisi: Order Code, daftar item, total, alamat      |
|  |  |  +-- window.open() -> WhatsApp Admin                          |
|  |  |                                                                |
|  +--+----------------------------------------------------------------+
|                                                                      |
+----------------------------------------------------------------------+
```

### 4.2 Detail Format Pesan WhatsApp

```
PESANAN BARU — PASzar
================================
Kode Pesanan: *PZ-20261001-A3F7K*

Detail Pesanan:
1. Kursi Ukir Jati Tradisional x 1 — Rp2.850.000
2. Tenun Ikat Motif Sotis NTT x 2 — Rp3.000.000

Total: *Rp5.850.000*

Data Pengiriman:
Nama: Ahmad Fauzi
Telp: 081234567890
Alamat: Jl. El Tari No. 15, RT 03/RW 07
Kota: Kupang
Provinsi: NTT
Kode Pos: 85111

Catatan:
Mohon dikirim sebelum tanggal 10 Oktober.
================================
Dikirim otomatis dari PASzar
```

### 4.3 Alur Admin (Dashboard Management)

```
+-------------------------------------------------------------+
|                                                             |
|  (1) LOGIN (/login)                                         |
|  |-- Input Email + Password                                 |
|  |-- Server: bcrypt.compare() -> JWT Session                |
|  +-- Redirect ke Dashboard ----------------------+          |
|                                                  v          |
|  (2) DASHBOARD (/dashboard)                                 |
|  |-- Statistik: Total Produk, Pesanan Hari Ini, Revenue    |
|  +-- Quick Links ke semua fitur admin                       |
|                                                             |
|  (3) KELOLA PRODUK (/kelola-produk)                         |
|  |-- Tabel daftar produk (nama, harga, stok, status)       |
|  |-- Tombol "Tambah Produk Baru"                            |
|  |   +-- Form: Nama, Slug (auto), Deskripsi, Cerita,       |
|  |       Harga, Stok, Kategori, Upload Gambar               |
|  |-- Edit produk (/kelola-produk/[id])                      |
|  +-- Toggle Aktif/Nonaktif produk                           |
|                                                             |
|  (4) KELOLA KATEGORI (/kelola-kategori)                     |
|  |-- CRUD kategori (Nama, Slug, Deskripsi, Urutan)         |
|  +-- Drag-reorder urutan tampil (sortOrder)                 |
|                                                             |
|  (5) PESANAN (/pesanan)                                     |
|  |-- Tabel daftar pesanan (kode, nama, total, status, tgl) |
|  |-- Filter berdasarkan status                              |
|  |-- Detail pesanan (/pesanan/[id])                         |
|  |   +-- Daftar item, data pelanggan, catatan               |
|  +-- Ubah Status Pesanan (Dropdown):                        |
|      PENDING -> CONFIRMED -> PROCESSING -> SHIPPED          |
|      -> COMPLETED                                           |
|      atau PENDING/CONFIRMED -> CANCELLED                    |
|                                                             |
+-------------------------------------------------------------+
```

---

## 5. SECURITY & DEPLOYMENT PROTOCOL

### 5.1 Aturan `.gitignore` (Strict)

```gitignore
# -- Environment & Secrets --
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# -- Dependencies --
node_modules/

# -- Build Output --
.next/
out/
dist/
build/

# -- Prisma --
prisma/migrations/dev/

# -- IDE --
.vscode/
.idea/
*.swp
*.swo

# -- OS --
.DS_Store
Thumbs.db
desktop.ini

# -- Debug --
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# -- Vercel --
.vercel/
```

### 5.2 Environment Variables

| Variable | Deskripsi | Contoh |
|---|---|---|
| `DATABASE_URL` | Connection string Supabase (via connection pooler — Transaction Mode) | `postgresql://postgres.xxx:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Direct connection string (untuk migrasi Prisma) | `postgresql://postgres.xxx:password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres` |
| `NEXTAUTH_SECRET` | Secret key untuk enkripsi JWT (min. 32 karakter random) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Base URL aplikasi | `https://paszar.vercel.app` |
| `SUPABASE_URL` | URL proyek Supabase | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Anon/public key Supabase (untuk client-side storage access) | `eyJhbGciOiJIUzI...` |
| `SUPABASE_SERVICE_KEY` | Service role key Supabase (server-side only, JANGAN expose) | `eyJhbGciOiJIUzI...` |
| `ADMIN_WHATSAPP` | Nomor WhatsApp admin (format internasional tanpa +) | `6281234567890` |

> [!CAUTION]
> `SUPABASE_SERVICE_KEY` TIDAK BOLEH digunakan di kode _client-side_. Key ini hanya boleh diakses di Server Actions, API Routes, atau _server-only modules_. Pelanggaran terhadap aturan ini berisiko membuka akses penuh ke seluruh database.

### 5.3 Proteksi API Routes & Server Actions

#### Middleware Authentication Guard

```typescript
// Pseudocode — src/middleware.ts
// Melindungi seluruh route di bawah path /dashboard, /kelola-*, /pesanan

export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/kelola-produk/:path*",
    "/kelola-kategori/:path*",
    "/pesanan/:path*",
  ],
};
```

#### Server Action Protection Pattern

```typescript
// Pseudocode — Setiap Server Action admin WAJIB mengikuti pola ini:

async function protectedAction(formData: FormData) {
  "use server";

  // 1. Verifikasi session
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  // 2. Validasi input dengan Zod
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Validation failed");

  // 3. Eksekusi operasi database via Prisma
  await prisma.product.create({ data: parsed.data });

  // 4. Revalidate cache
  revalidatePath("/katalog");
}
```

#### Public API (Order Creation) Protection

```typescript
// Pseudocode — POST /api/orders
// Route ini PUBLIK (tidak memerlukan login), namun dilindungi oleh:

// 1. Rate Limiting — maks 5 request per IP per menit
// 2. Zod Validation — input harus lolos validasi ketat
// 3. Stock Check — verifikasi stok sebelum menyimpan
// 4. Honeypot Field — field tersembunyi untuk deteksi bot
```

### 5.4 Skema Deployment Vercel

#### Konfigurasi Akun

| Aspek | Detail |
|---|---|
| **Platform** | Vercel (Hobby atau Pro Plan) |
| **Email Akun** | Dedicated project email (misal: `paszar.dev@domain.id`) |
| **Git Provider** | GitHub — repository private |
| **Branch Strategy** | `main` = production, `dev` = preview |
| **Build Command** | `npx prisma generate && next build` |
| **Install Command** | `npm ci` |

#### Deployment Flow

```
Developer Push ke GitHub
         |
         v
+---------------------+
|  Vercel Auto-Deploy  |
|  +-----------------+ |
|  | 1. npm ci        | |
|  | 2. prisma generate|
|  | 3. next build    | |
|  | 4. Deploy Edge   | |
|  +-----------------+ |
+---------------------+
         |
    +----+-----+
    v          v
 Preview    Production
 (dev)      (main)
```

#### Domain & DNS

| Lingkungan | URL |
|---|---|
| **Production** | `https://paszar.vercel.app` (atau custom domain jika tersedia) |
| **Preview** | `https://paszar-{branch}-{hash}.vercel.app` |

---

## 6. TIMELINE PENGERJAAN 21 HARI

### Ikhtisar Sprint

```
================================================================
 MINGGU 1 (23-29 Sep)     MINGGU 2 (30 Sep-6 Okt)     MINGGU 3 (7-13 Okt)
 ==================       ====================        ===================
 INISIASI & BACKEND       FRONTEND & ZUSTAND          INTEGRASI - QA - BAST
================================================================
```

---

### SPRINT 1 — Minggu 1: Inisiasi & Backend (23–29 September 2026)

| Hari | Tanggal | Deliverable | Detail |
|---|---|---|---|
| **H-1** | 23 Sep (Rabu) | **Project Setup** | Inisialisasi Next.js + TypeScript + Tailwind. Setup Supabase project. Konfigurasi Prisma. Setup Git repo (private). Konfigurasi `.env.local` dan `.gitignore`. |
| **H-2** | 24 Sep (Kamis) | **Database & Migrasi** | Finalisasi `schema.prisma`. Jalankan `prisma migrate dev`. Seed data dummy (1 Admin, 4 Kategori, 8 Produk). Verifikasi tabel di Supabase Dashboard. |
| **H-3** | 25 Sep (Jumat) | **Authentication** | Setup NextAuth.js (Credentials Provider + JWT). Implementasi bcrypt password hashing. Buat halaman Login (`/login`). Setup middleware auth guard. Seed akun SuperAdmin. |
| **H-4** | 26 Sep (Sabtu) | **CRUD Produk (Backend)** | Implementasi Server Actions: `createProduct`, `updateProduct`, `toggleProductActive`, `deleteProduct`. Zod validation schemas. Upload gambar ke Supabase Storage. |
| **H-5** | 27 Sep (Minggu) | **CRUD Kategori & Pesanan (Backend)** | Server Actions untuk kategori. Server Actions untuk pesanan (`createOrder`, `updateOrderStatus`). Order code generator (`PZ-YYYYMMDD-XXXXX`). |
| **H-6** | 28 Sep (Senin) | **API & WhatsApp Utility** | Implementasi `POST /api/orders`. WhatsApp URL generator (`lib/whatsapp.ts`). Rate limiting untuk public API. Unit test kritis (happy path). |
| **H-7** | 29 Sep (Selasa) | **Sprint 1 Review** | Code review internal. Pengujian semua Server Actions via Prisma Studio. Fix bug. Dokumentasi API. **Checkpoint: seluruh backend logic selesai.** |

> [!IMPORTANT]
> **Exit Criteria Sprint 1:**
> - Database termigrasi dan berisi data seed
> - Login admin berfungsi dengan session JWT
> - Seluruh CRUD operations berfungsi via Server Actions
> - Order creation + WA URL generation berfungsi

---

### SPRINT 2 — Minggu 2: Frontend & Zustand (30 September – 6 Oktober 2026)

| Hari | Tanggal | Deliverable | Detail |
|---|---|---|---|
| **H-8** | 30 Sep (Rabu) | **Design System & Layout** | Setup font (Playfair Display + Inter). Definisi CSS variables & Tailwind theme extension. Buat komponen UI primitif (`Button`, `Input`, `Modal`, `Badge`). Buat `Header.tsx` & `Footer.tsx`. |
| **H-9** | 1 Okt (Kamis) | **Landing Page** | Implementasi Hero Section (dengan image slider jika waktu memungkinkan). Section "Featured Products". Trust Bar. About/Story section. Partner logos. Responsive test. |
| **H-10** | 2 Okt (Jumat) | **Katalog & Detail Produk** | Halaman katalog (`/katalog`) dengan filter kategori. Grid produk responsif. Halaman detail produk (`/produk/[slug]`). Optimasi gambar (Next.js `<Image>`). |
| **H-11** | 3 Okt (Sabtu) | **Zustand Cart Store** | Setup Zustand store dengan `persist` middleware (localStorage). Implementasi `addItem`, `removeItem`, `updateQuantity`, `clearCart`. CartDrawer (slide-over dari kanan). CartItem komponen. |
| **H-12** | 4 Okt (Minggu) | **Checkout Modal** | Modal form data pengiriman. Zod validation untuk form input. Integrasi dengan `POST /api/orders`. WhatsApp redirect setelah order sukses. Loading & error states. |
| **H-13** | 5 Okt (Senin) | **Admin Dashboard** | Layout admin dengan sidebar. Halaman dashboard (statistik ringkasan). Halaman kelola produk (tabel + form CRUD). Halaman kelola kategori. Upload gambar produk ke Supabase Storage. |
| **H-14** | 6 Okt (Selasa) | **Admin Pesanan & Sprint 2 Review** | Halaman daftar pesanan (filter by status). Halaman detail pesanan. Fitur ubah status pesanan. Code review. **Checkpoint: seluruh UI selesai.** |

> [!IMPORTANT]
> **Exit Criteria Sprint 2:**
> - Seluruh halaman publik responsif dan sesuai design system
> - Cart flow berfungsi end-to-end (add -> checkout -> WA)
> - Admin dashboard berfungsi penuh (CRUD + order management)
> - Upload gambar ke Supabase Storage berfungsi

---

### SPRINT 3 — Minggu 3: Integration, QA & Handover BAST (7–13 Oktober 2026)

| Hari | Tanggal | Deliverable | Detail |
|---|---|---|---|
| **H-15** | 7 Okt (Rabu) | **Integration Testing** | End-to-end test seluruh alur (pengunjung -> keranjang -> checkout -> WA). Test admin flow (login -> CRUD -> order management). Cross-browser test (Chrome, Firefox, Safari). |
| **H-16** | 8 Okt (Kamis) | **Responsive & Performance** | Responsive audit (Mobile 375px, Tablet 768px, Desktop 1440px). Performance audit (Lighthouse score target >= 90). Optimasi _Largest Contentful Paint_. Lazy loading gambar non-kritis. |
| **H-17** | 9 Okt (Jumat) | **Data Entry & Content** | Input data produk riil dari Koperasi Lapas (foto + deskripsi). Minimal 12 SKU produk aktif. Verifikasi gambar produk di Supabase Storage. Setup kategori final. |
| **H-18** | 10 Okt (Sabtu) | **Production Deploy** | Deploy ke Vercel production. Konfigurasi environment variables di Vercel Dashboard. Verifikasi database connection (Supabase). Smoke test di production URL. Setup custom domain (jika ada). |
| **H-19** | 11 Okt (Minggu) | **Bug Fix & Polish** | Fix semua bug dari pengujian H-15 s/d H-18. Final UI polish. SEO metadata (title, description, OG tags). Favicon & manifest. |
| **H-20** | 12 Okt (Senin) | **Dokumentasi** | README.md (setup guide, env vars, deployment). Panduan penggunaan admin dashboard (Bahasa Indonesia). Dokumentasi struktur database. Backup seed script. |
| **H-21** | 13 Okt (Selasa) | **Handover & BAST** | Penyerahan akses (Vercel, Supabase, GitHub). Training singkat penggunaan admin dashboard. Penandatanganan BAST (_Berita Acara Serah Terima_). **PROYEK SELESAI.** |

> [!IMPORTANT]
> **Exit Criteria Sprint 3 (Final):**
> - Aplikasi live dan dapat diakses publik
> - Minimal 12 SKU produk aktif di katalog
> - Seluruh alur berfungsi tanpa error di production
> - Lighthouse Performance score >= 90
> - Dokumentasi dan BAST lengkap ditandatangani

---

## 7. LAMPIRAN: DESIGN SYSTEM RULES

### 7.1 Anti-AI Slop Rules (Wajib)

| Rule # | Deskripsi | Dilarang | Wajib |
|---|---|---|---|
| **DS-01** | Tidak ada shadow tebal | `shadow-md`, `shadow-lg`, `shadow-xl` | `border border-stone-200` |
| **DS-02** | Tidak ada rounded corners | `rounded-md`, `rounded-lg`, `rounded-xl` | `rounded-none` (seluruh komponen) |
| **DS-03** | Tipografi heading | Font sans-serif biasa | `Playfair Display` (serif elegan) |
| **DS-04** | Tipografi body | Font serif atau decorative | `Inter` (sans-serif bersih, thin weight) |
| **DS-05** | Warna netral | Warna vibrant/neon | Palette `stone-*` (warm neutral) |
| **DS-06** | Hover effects | Scale besar, animasi bounce | Subtle `transition-colors duration-200` |
| **DS-07** | Spacing | Padding/margin terlalu besar | Proporsional, mengikuti skala 4px |
| **DS-08** | Ikon | Ikon berwarna/filled | Ikon `stroke` tipis (`strokeWidth: 1.5`) |

### 7.2 Color Palette

```
Primary:
  stone-900  #1C1917   <- Text utama, button fill
  stone-800  #292524   <- Text sekunder gelap
  stone-600  #57534E   <- Harga, subheading
  stone-500  #78716C   <- Navigasi, placeholder
  stone-400  #A8A29E   <- Label, caption, disabled
  stone-300  #D6D3D1   <- Border, divider
  stone-200  #E7E5E4   <- Border komponen
  stone-100  #F5F5F4   <- Background sekunder
  stone-50   #FAFAF9   <- Background tersier

Accent:
  rupa-gold       #BA7517   <- Aksen brand (trust bar, badge)
  rupa-gold-light #D4943A   <- Aksen hover

Functional:
  white      #FFFFFF   <- Background utama
  [#F8F8F8]            <- Image placeholder bg
  [#EFEFEF]            <- Secondary placeholder bg
```

### 7.3 Typography Scale

```
Display (Hero):    text-[64px]  font-light  Playfair Display  leading-[1.1]
H2 (Section):     text-[42px]  font-light  Playfair Display  leading-tight
H3 (Card Title):  text-sm      font-normal Inter             uppercase tracking-[0.15em]
Body:             text-[15px]  font-light  Inter             leading-relaxed
Caption/Label:    text-[11px]  font-normal Inter             uppercase tracking-[0.2em]
Price:            text-sm      font-light  Inter
Micro:            text-[10px]  font-normal Inter             uppercase tracking-[0.2em]
```

### 7.4 Component Style Guide (Contoh)

```
Button Primary:
  bg-stone-900 text-white text-[11px] uppercase tracking-[0.2em]
  font-normal px-8 py-4 rounded-none border border-stone-900
  hover:bg-stone-800 transition-colors duration-200

Button Secondary:
  bg-white text-stone-900 text-[11px] uppercase tracking-[0.2em]
  font-normal px-8 py-4 rounded-none border border-stone-900
  hover:bg-stone-900 hover:text-white transition-all duration-300

Input:
  w-full px-4 py-3 border border-stone-300 rounded-none
  text-sm font-light text-stone-900 placeholder:text-stone-400
  bg-white focus:outline-none focus:border-stone-900
  transition-colors duration-200

Card (Product):
  bg-white rounded-none border-none
  Image: aspect-[4/5] bg-[#F8F8F8] overflow-hidden
  Hover: group-hover:scale-[1.03] transition-transform duration-700
```

---

> **Dokumen ini bersifat _living document_ dan dapat diperbarui sesuai kebutuhan selama masa pengerjaan proyek.**
>
> Disusun oleh: Tim Pengembang PASzar
> Disetujui oleh: _[Menunggu persetujuan klien]_
