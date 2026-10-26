import type { NextConfig } from "next";

// ── Content Security Policy ────────────────────────────────────
// - 'unsafe-inline' untuk style/script diperlukan oleh Next.js App Router & Tailwind CSS v4
// - img-src mencakup semua domain yang diizinkan di remotePatterns
// - frame-ancestors 'none' mencegah clickjacking
const ContentSecurityPolicy = [
  "default-src 'self'",
  // Next.js App Router membutuhkan 'unsafe-inline' untuk hydration scripts
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://via.placeholder.com https://placehold.co https://*.supabase.co https://*.supabase.in https://res.cloudinary.com",
  "connect-src 'self' https://*.supabase.co https://*.supabase.in",
  "media-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

// ── Shared Security Headers (semua route) ─────────────────────
const sharedSecurityHeaders = [
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy,
  },
  {
    // HSTS: 2 tahun, includeSubDomains, preload — enforce HTTPS
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    // Cegah MIME sniffing
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Cegah clickjacking — DENY karena tidak butuh embed di iframe manapun
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // Tidak bocorkan URL ke referrer saat cross-origin
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Matikan fitur browser yang tidak dipakai
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    // Cross-Origin Opener Policy — isolasi browsing context
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    // Matikan X-Powered-By header otomatis Next.js
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

// ── Admin-specific Headers (no-cache) ─────────────────────────
const adminHeaders = [
  ...sharedSecurityHeaders,
  {
    // Pastikan response admin TIDAK di-cache oleh browser atau CDN
    key: "Cache-Control",
    value: "no-store, no-cache, must-revalidate, proxy-revalidate",
  },
  {
    key: "Pragma",
    value: "no-cache",
  },
];

// ── API Headers ────────────────────────────────────────────────
const apiHeaders = [
  ...sharedSecurityHeaders,
  {
    // API responses tidak boleh di-cache
    key: "Cache-Control",
    value: "no-store",
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,

  // ── Security Headers ────────────────────────────────────────
  async headers() {
    return [
      // Semua halaman publik
      {
        source: "/(.*)",
        headers: sharedSecurityHeaders,
      },
      // Admin dashboard — tambahkan no-cache
      {
        source: "/dashboard/:path*",
        headers: adminHeaders,
      },
      // API routes — no-cache
      {
        source: "/api/:path*",
        headers: apiHeaders,
      },
    ];
  },

  // ── Image Remote Patterns ───────────────────────────────────
  images: {
    remotePatterns: [
      // Placeholder images — used by seeded test data
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "placehold.co" },
      // Supabase Storage — production image host
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
      // Cloudinary — optional CDN fallback
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;


