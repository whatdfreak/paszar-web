import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

// ── Admin fonts (Geist) ─────────────────────────────────────
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// ── Public storefront fonts ─────────────────────────────────
const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

// ── Base URL ────────────────────────────────────────────────
// Server-only env var (tanpa NEXT_PUBLIC_ prefix) — tidak ter-bundle ke client.
// Ganti dengan URL production saat deploy ke Vercel.
const BASE_URL = process.env.BASE_URL ?? "https://paszar.vercel.app";


export const metadata: Metadata = {
  // ── Core ────────────────────────────────────────────────────
  metadataBase: new URL(BASE_URL),
  title: {
    default: "PASzar — Kerajinan Autentik Koperasi Lapas Kupang",
    template: "%s | PASzar",
  },
  description:
    "Belanja kerajinan tangan autentik dan premium karya warga binaan Koperasi Lapas Kupang, Kanwil Kemenkumham NTT. Tenun ikat NTT, miniatur sasando, anyaman, mebel, dan kuliner khas Timor. Setiap pembelian mendukung program rehabilitasi dan pemberdayaan.",
  keywords: [
    "kerajinan NTT",
    "tenun ikat NTT",
    "kain tenun Timor",
    "sasando",
    "kerajinan lapas",
    "koperasi lapas kupang",
    "produk warga binaan",
    "handmade Indonesia",
    "anyaman bambu",
    "madu hutan Timor",
    "kopi Flores",
    "oleh-oleh Kupang NTT",
  ],
  authors: [{ name: "Koperasi Lapas Kupang — Kanwil Kemenkumham NTT" }],
  creator: "Koperasi Lapas Kupang",
  publisher: "PASzar",
  category: "e-commerce",

  // ── Robots ──────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── Canonical ───────────────────────────────────────────────
  alternates: {
    canonical: BASE_URL,
    languages: {
      "id-ID": BASE_URL,
    },
  },

  // ── Open Graph ──────────────────────────────────────────────
  openGraph: {
    type: "website",
    siteName: "PASzar",
    locale: "id_ID",
    url: BASE_URL,
    title: "PASzar — Kerajinan Autentik Koperasi Lapas Kupang",
    description:
      "Tenun ikat NTT, miniatur sasando, anyaman, mebel, dan kuliner khas Timor langsung dari warga binaan Lapas Kupang. Beli = Berkontribusi pada rehabilitasi.",
    images: [
      {
        url: "/opengraph-image.jpg",  // Letakkan di: public/opengraph-image.jpg
        width: 1200,
        height: 630,
        alt: "PASzar — Kerajinan Premium Koperasi Lapas Kupang NTT",
        type: "image/jpeg",
      },
    ],
  },

  // ── Twitter Card ────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "PASzar — Kerajinan Autentik Koperasi Lapas Kupang",
    description:
      "Tenun ikat NTT, sasando, anyaman, mebel, dan kuliner khas Timor langsung dari Lapas Kupang. Beli = Berkontribusi.",
    images: ["/opengraph-image.jpg"],
    creator: "@paszar_ntt",   // Ganti dengan Twitter/X handle resmi jika ada
  },

  // ── Manifest ────────────────────────────────────────────────
  manifest: "/site.webmanifest",

  // ── Verification (isi saat deploy) ──────────────────────────
  // verification: {
  //   google: "GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE",
  // },
};


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
