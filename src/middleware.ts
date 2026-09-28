// ============================================================
// PASzar — Next.js Middleware (Auth Guard)
// ============================================================
// Melindungi semua route admin dari akses tanpa autentikasi.
// Jika user belum login, akan di-redirect ke /login secara otomatis.
//
// Referensi: docs/architecture.md (Section 7.1: Login Admin)
// ============================================================

export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    // Halaman admin — semua sub-route dilindungi
    "/dashboard/:path*",
    "/kelola-produk/:path*",
    "/kelola-kategori/:path*",
    "/pesanan/:path*",
  ],
};
