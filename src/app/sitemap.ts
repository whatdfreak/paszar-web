import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.BASE_URL ?? "https://paszar.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Halaman statis ─────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/katalog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // ── Halaman produk dinamis ─────────────────────────────────────────────
  // Hanya produk aktif yang diindeks — produk non-aktif di-noindex.
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    productPages = products.map((p) => ({
      url: `${BASE_URL}/produk/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // Gagal ambil produk tidak boleh crash sitemap — return static saja
    console.error("[sitemap] Gagal mengambil data produk dari DB.");
  }

  return [...staticPages, ...productPages];
}
