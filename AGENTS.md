<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

<!-- BEGIN:paszar-agent-rules -->

# PASZAR PROJECT — MANDATORY AGENT RULES

Kamu sedang bekerja pada proyek **PASzar**, platform e-commerce produk warga binaan pemasyarakatan.
Baca seluruh dokumen di `docs/` sebelum menulis kode apapun.

## Dokumen Referensi Wajib

| Dokumen | Isi | Kapan Dibaca |
|---|---|---|
| `docs/PRD_masterplan.md` | Visi, fitur, schema database, user flow, timeline | Sebelum mulai task apapun |
| `docs/architecture.md` | Struktur direktori, data flow, pola kode | Sebelum menulis file baru atau memodifikasi arsitektur |
| `docs/Design_System.md` | Aturan visual, komponen, typography, warna | Sebelum menulis komponen React apapun |

---

## ATURAN ARSITEKTUR (WAJIB — TIDAK BOLEH DILANGGAR)

### A1 — Monolith Next.js

Proyek ini menggunakan **arsitektur monolith Next.js**. Tidak ada backend terpisah, tidak ada microservices.

### A2 — Dilarang API Route untuk CRUD Internal

```
❌ DILARANG: src/app/api/products/route.ts  (POST, PUT, DELETE)
❌ DILARANG: src/app/api/categories/route.ts (POST, PUT, DELETE)
❌ DILARANG: src/app/api/orders/[id]/route.ts (PUT status)

✅ WAJIB: src/actions/product.actions.ts    (createProduct, updateProduct, deleteProduct)
✅ WAJIB: src/actions/category.actions.ts   (createCategory, updateCategory)
✅ WAJIB: src/actions/order.actions.ts      (updateOrderStatus)
```

**Pengecualian yang diizinkan:**
- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth handler
- `src/app/api/orders/route.ts` — Checkout publik (POST only)
- `src/app/api/webhooks/payment/route.ts` — (TODO: Fase 2) Midtrans webhook

### A3 — Setiap Server Action Wajib Memiliki Auth Guard

```typescript
// WAJIB di setiap Server Action yang digunakan admin:
"use server";
const session = await getServerSession(authOptions);
if (!session) throw new Error("Unauthorized");
```

### A4 — Setiap Server Action Wajib Validasi Zod

```typescript
// WAJIB — validasi input sebelum menyentuh database:
const parsed = productSchema.safeParse(rawData);
if (!parsed.success) throw new Error("Validasi gagal");
```

### A5 — Prisma via Singleton

Selalu import Prisma dari `@/lib/prisma`, jangan buat instance baru:
```typescript
import { prisma } from "@/lib/prisma"; // ✅
import { PrismaClient } from "@prisma/client"; // ❌ Jangan
```

### A6 — Lokasi File Baru

| Jenis File | Lokasi |
|---|---|
| Server Action | `src/actions/[domain].actions.ts` |
| Zod Schema | `src/validations/[domain].schema.ts` |
| TypeScript Types | `src/types/index.ts` atau `src/types/[domain].types.ts` |
| Utility Functions | `src/lib/utils.ts` |
| UI Komponen Primitif | `src/components/ui/` |
| Layout Komponen | `src/components/layout/` |
| Komponen Produk | `src/components/product/` |
| Komponen Keranjang | `src/components/cart/` |
| Komponen Admin | `src/components/admin/` |

---

## ATURAN REACT & TYPESCRIPT

### R1 — React Compiler Aktif — DILARANG Manual Memoization

Proyek ini menggunakan **React Compiler** (`reactCompiler: true` di `next.config.ts`).
React Compiler secara otomatis mengoptimalkan re-render. Penggunaan manual wajib dihapus.

```typescript
// ❌ DILARANG KERAS
const memoValue = useMemo(() => compute(x), [x]);
const stableFn  = useCallback(() => handler(), [dep]);
const Memoized  = React.memo(MyComponent);

// ✅ Tulis kode React biasa
const value  = compute(x);
const handler = () => doSomething();
function MyComponent() { return <div />; }
```

### R2 — TypeScript Strict Mode — DILARANG Tipe `any`

```typescript
// ❌ DILARANG
function handle(data: any) { }
const result: any = await fetch();
const items = [] as any[];

// ✅ WAJIB — Tipe eksplisit selalu
function handle(data: ProductFormData) { }
const result: ApiResponse<Product> = await fetchProduct(id);
const items: CartItem[] = [];
```

### R3 — Prinsip SRP (Single Responsibility)

Setiap komponen harus memiliki **satu tanggung jawab yang jelas**.
- Komponen di `components/ui/` TIDAK boleh mengandung logika bisnis.
- Komponen di `components/product/` TIDAK boleh mengandung logika cart langsung.
- Pisahkan komponen besar (> 150 baris) menjadi komponen-komponen kecil.

### R4 — Prinsip DRY (Don't Repeat Yourself)

Jika pola kode yang sama muncul lebih dari 2 kali, **ekstrak ke utility atau komponen**:
```typescript
// ❌ Sama di 3 tempat
<p className="text-[11px] uppercase tracking-[0.3em] text-stone-400 font-normal">

// ✅ Buat komponen
<EyebrowLabel>The Makers</EyebrowLabel>
```

---

## ATURAN KEAMANAN (SECURITY)

### S1 — Secrets Wajib di Environment Variables

```typescript
// ❌ DILARANG — hardcoded secret
const ADMIN_NUMBER = "628123456789";
const SUPABASE_KEY = "eyJhbGci...";

// ✅ WAJIB — via env
const ADMIN_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER!;
```

### S2 — SUPABASE_SERVICE_KEY Hanya di Server

`SUPABASE_SERVICE_KEY` TIDAK BOLEH menggunakan prefix `NEXT_PUBLIC_`.
Hanya boleh digunakan di Server Actions dan API Routes.

### S3 — Validasi File Upload

Upload gambar produk wajib divalidasi:
- MIME type: hanya `image/jpeg`, `image/png`, `image/webp`
- Ukuran: maksimal **2MB**
- Validasi dilakukan di **client-side sebelum upload** dan diverifikasi ulang di server jika memungkinkan.

### S4 — Honeypot di Form Publik

Form checkout publik (`CheckoutModal`) wajib memiliki **honeypot field** tersembunyi
untuk deteksi bot:
```typescript
// Field ini harus kosong saat submit — jika terisi, order ditolak
<input type="text" name="_honeypot" className="hidden" tabIndex={-1} />
```

---

## ATURAN DESAIN (DESIGN SYSTEM)

Lihat `docs/Design_System.md` untuk detail lengkap. Berikut ringkasan wajib:

### D1 — Dilarang Box-Shadow

```typescript
// ❌  shadow-sm  shadow-md  shadow-lg  shadow-xl  drop-shadow
// ✅  border border-stone-200
```

### D2 — Dilarang Rounded Corners

```typescript
// ❌  rounded-sm  rounded-md  rounded-lg  rounded-xl  rounded-full
// ✅  rounded-none  (atau tidak ada class rounded sama sekali)
```

### D3 — Font Wajib

```typescript
// Heading/Display: Playfair Display → font-[family-name:var(--font-display)]
// Body/UI:         Inter            → (default, tidak perlu class khusus)
```

### D4 — Palet Warna Wajib

```
Teks utama:    text-stone-900
Teks muted:    text-stone-400 / text-stone-500
Border:        border-stone-200 / border-stone-300
Button fill:   bg-stone-900 hover:bg-stone-800
Aksen brand:   bg-[#BA7517]  (Paszar Gold)
```

---

## CHECKLIST SEBELUM MEMBUAT FILE BARU

Sebelum membuat file `.tsx` atau `.ts` baru, tanyakan kepada diri sendiri:

- [ ] Apakah lokasi file sudah sesuai dengan struktur direktori di `docs/architecture.md`?
- [ ] Apakah komponen ini memiliki satu tanggung jawab yang jelas (SRP)?
- [ ] Apakah sudah menggunakan tipe TypeScript yang eksplisit (bukan `any`)?
- [ ] Jika ini Server Action, apakah sudah ada auth guard + Zod validation?
- [ ] Apakah desain mengikuti aturan di `docs/Design_System.md`?
- [ ] Apakah ada `useMemo`/`useCallback`/`React.memo` yang perlu dihapus?
- [ ] Apakah tidak ada secret yang ter-hardcode?

<!-- END:paszar-agent-rules -->
