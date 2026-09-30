// ============================================================
// PASzar — Landing Page (Server Component)
// ============================================================
// Hanya bertanggung jawab untuk fetch data dari Prisma.
// Semua rendering dan i18n ditangani oleh HomeClient.
// ============================================================

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/public/HomeClient";
import type { ProductCardData } from "@/components/public/ProductCard";

export const metadata: Metadata = {
  title: "PASzar — Kerajinan Tangan Lapas Kupang",
  description:
    "Platform kerajinan tangan warga binaan Lapas Kupang. Tenun ikat, furnitur, anyaman, dan kuliner khas NTT. Every purchase supports rehabilitation.",
};

export const revalidate = 3600;

async function getFeaturedProducts(): Promise<ProductCardData[]> {
  const products = await prisma.product.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      image: true,
      category: { select: { name: true } },
    },
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    image: p.image,
    category: p.category.name,
  }));
}

export default async function HomePage() {
  const products = await getFeaturedProducts();
  return <HomeClient products={products} />;
}
