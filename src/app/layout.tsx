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

export const metadata: Metadata = {
  title: {
    default: "PASzar — Kerajinan Tangan Lapas Kupang",
    template: "%s | PASzar",
  },
  description:
    "Belanja kerajinan tangan autentik karya warga binaan Koperasi Lapas Kupang, Kanwil Kemenkumham NTT. Setiap pembelian mendukung program rehabilitasi.",
  keywords: ["kerajinan NTT", "tenun ikat", "lapas kupang", "koperasi", "handmade"],
  openGraph: {
    siteName: "PASzar",
    locale: "id_ID",
    type: "website",
  },
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
