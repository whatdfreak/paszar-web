import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import KatalogClient from "@/components/public/KatalogClient";
import type { ProductCardData } from "@/components/public/ProductCard";

export const metadata: Metadata = {
  title: "Katalog Produk",
  description:
    "Jelajahi semua kerajinan tangan karya warga binaan Lapas Kupang — tenun ikat NTT, miniatur sasando, anyaman bambu, mebel kayu, madu hutan, dan kuliner khas Timor.",
  openGraph: {
    title: "Katalog Produk — PASzar",
    description:
      "Temukan kerajinan autentik Nusa Tenggara Timur langsung dari tangan warga binaan Lapas Kupang. Setiap produk membawa cerita dan mendukung program rehabilitasi.",
    type: "website",
    images: [{ url: "/opengraph-image.jpg", width: 1200, height: 630, alt: "Katalog Produk PASzar" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Katalog Produk — PASzar",
    description: "Kerajinan autentik NTT dari tangan warga binaan Lapas Kupang.",
    images: ["/opengraph-image.jpg"],
  },
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
