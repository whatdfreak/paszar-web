# Design System — PASzar
## Panduan UI/UX & Styling Komprehensif

| Metadata | Detail |
|---|---|
| **Dokumen** | Design System |
| **Versi** | `1.0.0` |
| **Bergantung pada** | `docs/PRD_masterplan.md` |
| **Tanggal Dibuat** | 24 September 2026 |

---

## Daftar Isi

1. [Filosofi Desain](#1-filosofi-desain)
2. [Aturan Wajib (Anti-AI Slop Rules)](#2-aturan-wajib-anti-ai-slop-rules)
3. [Color System](#3-color-system)
4. [Typography System](#4-typography-system)
5. [Spacing & Layout](#5-spacing--layout)
6. [Component Patterns](#6-component-patterns)
7. [Animation & Transition](#7-animation--transition)
8. [Iconography](#8-iconography)
9. [Responsive Breakpoints](#9-responsive-breakpoints)
10. [Accessibility (a11y)](#10-accessibility-a11y)

---

## 1. FILOSOFI DESAIN

### 1.1 Konsep Utama: "High-End Minimalist Boutique"

PASzar dirancang untuk tampil setara dengan butik artisan premium internasional seperti **Aesop**, **Muji**, atau **A.P.C.**. Filosofi desain bertumpu pada:

- **Less is More**: Setiap elemen visual harus memiliki alasan keberadaannya.
- **Typography-Forward**: Tipografi menjadi elemen visual utama, bukan ornamen grafis.
- **Purposeful Whitespace**: Ruang kosong adalah bagian dari desain, bukan kekosongan.
- **Tactile Authenticity**: Estetika yang memancarkan kesan benda nyata buatan tangan.

### 1.2 Prinsip yang HARUS Diikuti

```
✅ LAKUKAN                          ❌ JANGAN LAKUKAN
──────────────────────────────────  ─────────────────────────────────
Border tipis flat sebagai pemisah   Box-shadow tebal/blur/glow
Typografi editorial yang breathing  Teks terlalu kecil atau padat
Whitespace yang generous             Layout terlalu penuh/cluttered
Warna netral warm (stone/tan)       Warna accent yang mencolok/neon
Animasi subtle & purposeful         Animasi berlebihan/bounce
```

---

## 2. ATURAN WAJIB (ANTI-AI SLOP RULES)

> [!CAUTION]
> Aturan-aturan di bawah ini bersifat ABSOLUT. Setiap kode yang melanggar wajib ditolak dan direfactor.

### DS-01 — Dilarang Box-Shadow

```typescript
// ❌ DILARANG
<div className="shadow-md rounded-lg p-4">
<div className="shadow-xl drop-shadow-lg">

// ✅ WAJIB — Gunakan border tipis flat
<div className="border border-stone-200 p-4">
<div className="border-b border-stone-200">
```

### DS-02 — Dilarang Rounded Corners

```typescript
// ❌ DILARANG
<button className="rounded-md px-4 py-2">
<div className="rounded-xl overflow-hidden">
<input className="rounded-lg border">

// ✅ WAJIB — Semua elemen harus sharp corners
<button className="rounded-none px-4 py-2">
<div className="overflow-hidden">
<input className="rounded-none border">
```

### DS-03 — Dilarang Warna Generic

```typescript
// ❌ DILARANG
<div className="bg-blue-500 text-white">
<button className="bg-green-600">
<span className="text-red-500">Error</span>

// ✅ WAJIB — Gunakan palet stone dan accent brand
<div className="bg-stone-900 text-white">
<button className="bg-stone-900 hover:bg-stone-800">
<span className="text-stone-500">Error</span>
```

### DS-04 — Dilarang useMemo, useCallback, React.memo

```typescript
// ❌ DILARANG — React Compiler sudah mengelola ini secara otomatis
const memoValue = useMemo(() => compute(x), [x]);
const memoFn = useCallback(() => doSomething(), [dep]);
const MemoCard = React.memo(({ data }) => <Card data={data} />);

// ✅ WAJIB — Tulis kode React biasa, biarkan React Compiler bekerja
const value = compute(x);
const handleClick = () => doSomething();
function Card({ data }: CardProps) { return <div>...</div>; }
```

### DS-05 — Dilarang Tipe `any` di TypeScript

```typescript
// ❌ DILARANG
function processData(data: any) { ... }
const result: any = await fetch(...);
const items = [] as any[];

// ✅ WAJIB — Definisikan tipe eksplisit selalu
function processData(data: ProductData) { ... }
const result: ApiResponse<Product[]> = await fetch(...);
const items: CartItem[] = [];
```

### DS-06 — Dilarang API Route untuk Mutasi Internal

```typescript
// ❌ DILARANG — Jangan buat route untuk mutasi CRUD internal
// src/app/api/products/route.ts (POST, PUT, DELETE)
// src/app/api/categories/route.ts (POST, PUT, DELETE)

// ✅ WAJIB — Gunakan Server Actions untuk semua mutasi internal
// src/actions/product.actions.ts
"use server";
export async function createProduct(formData: FormData) { ... }
export async function updateProduct(id: string, data: ProductInput) { ... }
```

---

## 3. COLOR SYSTEM

### 3.1 Palet Warna Lengkap

```css
/* ── Primary Scale (Warm Neutral — Stone) ─────────────── */
--color-stone-50:  #FAFAF9;   /* Background tersier, section bg */
--color-stone-100: #F5F5F4;   /* Background sekunder */
--color-stone-200: #E7E5E4;   /* Border komponen, divider */
--color-stone-300: #D6D3D1;   /* Border default, placeholder stroke */
--color-stone-400: #A8A29E;   /* Label, caption, icon, disabled */
--color-stone-500: #78716C;   /* Navigasi, link, subtext */
--color-stone-600: #57534E;   /* Harga, subheading, metadata */
--color-stone-700: #44403C;   /* Text sekunder utama */
--color-stone-800: #292524;   /* Text gelap, button hover */
--color-stone-900: #1C1917;   /* Text utama, button fill, logo */

/* ── Brand Accent ──────────────────────────────────────── */
--color-paszar-gold:       #BA7517;   /* Trust bar, badge, aksen utama */
--color-paszar-gold-hover: #D4943A;   /* Hover state aksen */
--color-paszar-gold-muted: #F5E6C8;   /* Background badge/tag ringan */

/* ── Functional ────────────────────────────────────────── */
--color-background:     #FFFFFF;    /* Background halaman utama */
--color-image-bg:       #F8F8F8;    /* Placeholder latar gambar produk */
--color-image-bg-alt:   #EFEFEF;    /* Placeholder alternatif */

/* ── Semantic (Status Order) ───────────────────────────── */
--color-status-pending:    #78716C;  /* Stone-500 — Menunggu */
--color-status-confirmed:  #1D4ED8;  /* Blue-700 — Dikonfirmasi */
--color-status-processing: #B45309;  /* Amber-700 — Diproses */
--color-status-shipped:    #0369A1;  /* Sky-700 — Dikirim */
--color-status-completed:  #15803D;  /* Green-700 — Selesai */
--color-status-cancelled:  #B91C1C;  /* Red-700 — Dibatalkan */
```

### 3.2 Penggunaan Warna per Konteks

| Konteks | Warna | Class Tailwind |
|---|---|---|
| Background halaman | White | `bg-white` |
| Background section alt | Stone 50 | `bg-stone-50` |
| Background section abu | Stone 100 | `bg-[#F8F8F8]` |
| Text utama | Stone 900 | `text-stone-900` |
| Text subheading/harga | Stone 600 | `text-stone-600` |
| Text label/caption | Stone 400 | `text-stone-400` |
| Border komponen | Stone 200 | `border-stone-200` |
| Border fokus input | Stone 900 | `focus:border-stone-900` |
| Button CTA | Stone 900 | `bg-stone-900 text-white` |
| Aksen brand | Paszar Gold | `bg-[#BA7517]` |

---

## 4. TYPOGRAPHY SYSTEM

### 4.1 Font Stack

```css
/* ── Display & Heading Font ────────────────────────────── */
--font-display: "Playfair Display", "Georgia", serif;

/* ── Body Font ─────────────────────────────────────────── */
--font-body: "Inter", ui-sans-serif, system-ui, sans-serif;
```

**Setup di `layout.tsx`:**
```typescript
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
```

### 4.2 Type Scale

| Role | Size | Weight | Font | Letter Spacing | Usage |
|---|---|---|---|---|---|
| **Hero Display** | `text-[64px]` | `font-light` (300) | Playfair Display | `tracking-tight` | `<h1>` utama Hero |
| **Section Heading** | `text-[42px]` | `font-light` (300) | Playfair Display | `tracking-tight` | `<h2>` section |
| **Sub Heading** | `text-2xl` | `font-light` (300) | Playfair Display | default | `<h3>` card header |
| **Label / Eyebrow** | `text-[11px]` | `font-normal` (400) | Inter | `tracking-[0.3em]` | Label di atas heading |
| **Nav Link** | `text-[11px]` | `font-normal` (400) | Inter | `tracking-[0.2em]` | Header navigasi |
| **Body Text** | `text-[15px]` | `font-light` (300) | Inter | `leading-relaxed` | Paragraf, deskripsi |
| **Body SM** | `text-sm` | `font-light` (300) | Inter | default | Caption, secondary |
| **Price** | `text-sm` | `font-light` (300) | Inter | default | Harga produk |
| **Card Title** | `text-sm` | `font-normal` (400) | Inter | `tracking-[0.15em]` | Nama produk di card |
| **Micro** | `text-[10px]` | `font-normal` (400) | Inter | `tracking-[0.2em]` | Brand label, micro copy |
| **Button** | `text-[11px]` | `font-normal` (400) | Inter | `tracking-[0.2em]` | Semua tombol, `uppercase` |

### 4.3 Contoh Implementasi Heading

```typescript
// Eyebrow label — selalu di atas heading
<p className="text-[11px] uppercase tracking-[0.3em] text-stone-400 font-normal mb-6">
  The Makers
</p>

// H1 — Hero
<h1 className="text-4xl sm:text-5xl lg:text-[64px] font-light
               font-[family-name:var(--font-display)] text-stone-900
               leading-[1.1] tracking-tight mb-8">
  Where Craft Meets Purpose
</h1>

// H2 — Section
<h2 className="text-3xl lg:text-[42px] font-light
               font-[family-name:var(--font-display)] text-stone-900
               leading-tight">
  Featured Products
</h2>

// H3 — Card / Sub
<h3 className="text-sm font-normal text-stone-900
               uppercase tracking-[0.15em]">
  Product Name
</h3>
```

---

## 5. SPACING & LAYOUT

### 5.1 Max-Width Container

```typescript
// Container standar untuk semua section
<div className="max-w-7xl mx-auto px-6 lg:px-8">
  {/* konten */}
</div>

// Container sempit — untuk teks editorial
<div className="max-w-2xl mx-auto px-6 lg:px-8">
  {/* konten teks panjang */}
</div>
```

### 5.2 Section Padding

| Ukuran | Class | Digunakan untuk |
|---|---|---|
| **XL** | `py-24 lg:py-32` | Section konten utama (produk, about) |
| **LG** | `py-16 lg:py-20` | Section pendukung (partner, trust bar) |
| **MD** | `py-12 lg:py-16` | Hero, sub-section |
| **SM** | `py-8 lg:py-10` | Footer main, admin section |

### 5.3 Grid System

```typescript
// Grid 2 kolom — Hero, About (50/50)
<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

// Grid 3 kolom — Artisan cards
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">

// Grid 4 kolom — Product grid
<div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">

// Grid 4 kolom — Trust bar, Footer
<div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
```

### 5.4 Aspect Ratios (Gambar Produk)

| Konteks | Ratio | Class |
|---|---|---|
| Hero image | 3:4 (Portrait) | `aspect-[3/4]` |
| Product card | 4:5 (Tall Portrait) | `aspect-[4/5]` |
| About image | 4:5 (Tall Portrait) | `aspect-[4/5]` |
| Artisan card | 4:5 | `aspect-[4/5]` |
| Thumbnail | 1:1 (Square) | `aspect-square` |

---

## 6. COMPONENT PATTERNS

### 6.1 Button

```typescript
// Button Primer (CTA Utama)
<button className="inline-flex items-center gap-3 px-8 py-4 rounded-none
                   border border-stone-900 bg-stone-900 text-white
                   text-[11px] uppercase tracking-[0.2em] font-normal
                   hover:bg-stone-800 transition-colors duration-200">
  Explore Collection
</button>

// Button Sekunder (Outline)
<button className="inline-flex items-center gap-3 px-8 py-4 rounded-none
                   border border-stone-900 bg-white text-stone-900
                   text-[11px] uppercase tracking-[0.2em] font-normal
                   hover:bg-stone-900 hover:text-white transition-all duration-300">
  Lihat Semua
</button>

// Button Ghost / Link
<button className="text-[11px] uppercase tracking-[0.2em] text-stone-500
                   font-light hover:text-stone-900 border-b border-stone-300
                   pb-0.5 transition-colors duration-300">
  Our Story
</button>

// Button Destruktif (Admin)
<button className="px-6 py-2.5 rounded-none border border-red-700 text-red-700
                   text-[11px] uppercase tracking-[0.15em] font-normal
                   hover:bg-red-700 hover:text-white transition-all duration-200">
  Hapus
</button>
```

### 6.2 Input & Form

```typescript
// Input Text Standard
<input
  type="text"
  className="w-full px-4 py-3 rounded-none border border-stone-300
             text-sm font-light text-stone-900 placeholder:text-stone-400
             bg-white focus:outline-none focus:border-stone-900
             transition-colors duration-200"
/>

// Textarea
<textarea
  rows={4}
  className="w-full px-4 py-3 rounded-none border border-stone-300
             text-sm font-light text-stone-900 placeholder:text-stone-400
             bg-white focus:outline-none focus:border-stone-900
             resize-none transition-colors duration-200"
/>

// Select
<select
  className="w-full px-4 py-3 rounded-none border border-stone-300
             text-sm font-light text-stone-900 bg-white
             focus:outline-none focus:border-stone-900
             appearance-none transition-colors duration-200">
  <option>Pilih kategori...</option>
</select>

// Form Label
<label className="block text-[11px] uppercase tracking-[0.15em]
                  text-stone-600 font-normal mb-2">
  Nama Produk
</label>

// Error Message
<p className="text-[11px] text-red-600 font-light mt-1.5">
  Field ini wajib diisi.
</p>
```

### 6.3 Product Card

```typescript
// Struktur Product Card — Selalu `group relative`
<div className="group relative">
  <Link href={`/produk/${slug}`} className="block">
    {/* Image — strict 4:5 ratio */}
    <div className="relative aspect-[4/5] overflow-hidden bg-[#F8F8F8] mb-4">
      <Image
        src={image}
        alt={name}
        fill
        className="object-cover group-hover:scale-[1.03]
                   transition-transform duration-700 ease-out"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />
    </div>

    {/* Content — typographic only, no card border */}
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-[0.2em]
                    text-stone-400 font-normal">{brand}</p>
      <h3 className="text-sm font-normal text-stone-900
                     leading-snug line-clamp-2">{name}</h3>
      <p className="text-sm font-light text-stone-600 pt-0.5">{price}</p>
    </div>
  </Link>

  {/* Quick Add — hanya muncul saat hover */}
  <button className="absolute bottom-[72px] right-3 opacity-0 translate-y-2
                     group-hover:opacity-100 group-hover:translate-y-0
                     transition-all duration-300 ease-out rounded-none
                     bg-stone-900 text-white px-3 py-2.5 text-[10px]
                     uppercase tracking-[0.15em] font-normal
                     hover:bg-stone-800 z-10">
    + Keranjang
  </button>
</div>
```

### 6.4 Badge / Tag

```typescript
// Badge Status Pesanan
const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING:    "bg-stone-100 text-stone-600 border-stone-200",
  CONFIRMED:  "bg-blue-50   text-blue-700  border-blue-200",
  PROCESSING: "bg-amber-50  text-amber-700 border-amber-200",
  SHIPPED:    "bg-sky-50    text-sky-700   border-sky-200",
  COMPLETED:  "bg-green-50  text-green-700 border-green-200",
  CANCELLED:  "bg-red-50    text-red-700   border-red-200",
};

<span className={`inline-flex items-center px-2.5 py-1 rounded-none
                  border text-[10px] uppercase tracking-[0.15em] font-normal
                  ${STATUS_STYLES[status]}`}>
  {status}
</span>
```

### 6.5 Admin Table

```typescript
// Table Container
<div className="border border-stone-200">
  <table className="w-full">
    <thead>
      <tr className="border-b border-stone-200 bg-stone-50">
        <th className="px-5 py-3 text-left text-[10px] uppercase
                       tracking-[0.15em] text-stone-500 font-normal">
          Nama Produk
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-stone-100">
      <tr className="hover:bg-stone-50 transition-colors duration-150">
        <td className="px-5 py-4 text-sm font-light text-stone-900">
          {/* data */}
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### 6.6 Modal / Drawer

```typescript
// Overlay backdrop
<div className="fixed inset-0 bg-stone-900/40 backdrop-blur-[2px] z-40" />

// Modal container — NO rounded corners, NO shadow
<div className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto
                md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg
                bg-white border border-stone-200 z-50 max-h-[90vh]
                overflow-y-auto">
  {/* Modal header */}
  <div className="flex items-center justify-between px-6 py-4
                  border-b border-stone-200">
    <h2 className="text-sm font-normal text-stone-900
                   uppercase tracking-[0.15em]">Judul Modal</h2>
    <button className="text-stone-400 hover:text-stone-900
                       transition-colors duration-200">
      ✕
    </button>
  </div>
  {/* Modal body */}
  <div className="px-6 py-6">...</div>
</div>

// Slide-over / CartDrawer
<div className="fixed right-0 top-0 h-full w-full max-w-sm
                bg-white border-l border-stone-200 z-50
                animate-slide-in-right">
  {/* drawer content */}
</div>
```

---

## 7. ANIMATION & TRANSITION

### 7.1 Prinsip Animasi

> Animasi harus subtle, purposeful, dan tidak pernah distract dari konten.

| Tipe | Duration | Easing | Digunakan Untuk |
|---|---|---|---|
| Color transition | `duration-200` | `ease-out` | Hover tombol, link, input focus |
| Transform (scale image) | `duration-700` | `ease-out` | Image zoom saat hover card |
| Opacity reveal | `duration-300` | `ease-out` | Quick action button, tooltip |
| Slide panel | `duration-350` | `ease-out` | Cart drawer, mobile menu |
| Fade in | `duration-400` | `ease-out` | Page transition, modal |

### 7.2 CSS Keyframes (globals.css)

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(100%); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-fade-in       { animation: fadeIn      0.3s ease-out forwards; }
.animate-slide-in-right{ animation: slideInRight 0.35s ease-out forwards; }
.animate-fade-in-up    { animation: fadeInUp    0.4s ease-out forwards; }
```

---

## 8. ICONOGRAPHY

### 8.1 Gaya Ikon

- **Library**: Heroicons (inline SVG — TIDAK ada dependency library)
- **Style**: `stroke` (outline), bukan `fill`
- **Stroke Width**: `strokeWidth={1.5}` (konsisten di seluruh proyek)
- **Size Default**: `w-5 h-5` (20×20px)
- **Color**: Selalu melalui `currentColor` (Tailwind text class)

```typescript
// ✅ Contoh Ikon yang Benar
<svg
  className="w-5 h-5 text-stone-500"
  fill="none"
  stroke="currentColor"
  strokeWidth={1.5}
  viewBox="0 0 24 24"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M2.25 3h1.386c..."
  />
</svg>

// ❌ Jangan menggunakan fill icon atau library dengan style berbeda
import { ShoppingCart } from "lucide-react"; // Dilarang jika inconsistent stroke
```

---

## 9. RESPONSIVE BREAKPOINTS

### 9.1 Tailwind Breakpoints

| Breakpoint | Min-width | Target Device | Penggunaan |
|---|---|---|---|
| `(default)` | 0px | Mobile 375px | Base — mobile first |
| `sm:` | 640px | Mobile besar | Tampilkan elemen sekunder |
| `md:` | 768px | Tablet | 2-column layout mulai |
| `lg:` | 1024px | Desktop | Layout penuh, sidebar admin |
| `xl:` | 1280px | Wide desktop | Tidak digunakan biasanya |

### 9.2 Audit Minimum

Setiap komponen baru WAJIB diuji di 3 resolusi berikut sebelum dianggap selesai:

| Resolusi | Keterangan |
|---|---|
| 375 × 812 | iPhone SE / Mobile standar |
| 768 × 1024 | iPad / Tablet |
| 1440 × 900 | MacBook / Desktop standar |

---

## 10. ACCESSIBILITY (A11Y)

### 10.1 Aturan Minimum

```typescript
// ✅ Semua elemen interaktif wajib memiliki label
<button aria-label="Tambah ke keranjang">
  <svg>...</svg>
</button>

// ✅ Gunakan elemen semantik yang tepat
<nav aria-label="Navigasi utama">
<main>
<footer>
<article>

// ✅ Gambar wajib memiliki alt text yang deskriptif
<Image src={img} alt="Kursi ukir jati tradisional oleh pengrajin Lapas Kupang" />

// ✅ Focus visible — jangan disable outline
// Di globals.css:
*:focus-visible {
  outline: 2px solid var(--color-stone-400);
  outline-offset: 2px;
}

// ✅ Kontras warna minimal 4.5:1 (WCAG AA)
// stone-900 (#1C1917) di atas white (#FFFFFF) = 19.1:1 ✓
// stone-500 (#78716C) di atas white (#FFFFFF) = 4.6:1 ✓
```

### 10.2 Keyboard Navigation

- Semua tombol dan link harus dapat dijangkau via `Tab`
- Modal harus melakukan **focus trap** saat terbuka
- Modal harus dapat ditutup dengan tombol `Escape`
- CartDrawer menggunakan `aria-expanded` dan `aria-controls`

---

> **Dokumen ini adalah sumber kebenaran tunggal (single source of truth) untuk seluruh keputusan visual PASzar.**
> Setiap deviasi dari dokumen ini harus didiskusikan dan disetujui sebelum diimplementasikan.
