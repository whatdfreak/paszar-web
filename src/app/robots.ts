import type { MetadataRoute } from "next";

const BASE_URL = process.env.BASE_URL ?? "https://paszar.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Bot umum: izinkan semua halaman publik
        userAgent: "*",
        allow: ["/", "/katalog", "/produk/"],
        disallow: [
          "/dashboard/",   // Seluruh area admin tidak boleh diindeks
          "/api/",         // API routes tidak untuk crawler
          "/login",        // Halaman login tidak perlu diindeks
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
