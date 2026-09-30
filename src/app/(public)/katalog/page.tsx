import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import KatalogClient from "@/components/public/KatalogClient";
import type { ProductCardData } from "@/components/public/ProductCard";

export const metadata: Metadata = {
  title: "Katalog Produk",
  description:
    "Jelajahi semua kerajinan tangan karya warga binaan Lapas Kupang — tenun ikat, furnitur, anyaman, dan kuliner khas NTT.",
};

export const revalidate = 1800;

export default async function KatalogPage() {
  const [rawProducts, rawCategories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        image: true,
        category: { select: { name: true } },
      },
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    }),
  ]);

  const products: ProductCardData[] = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    image: p.image,
    category: p.category.name,
  }));

  const categories = rawCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    _count: { products: c._count.products },
  }));

  return <KatalogClient products={products} categories={categories} />;
}
