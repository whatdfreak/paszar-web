import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { syncFlobakaryaCatalog } from "@/lib/flobakarya-sync";
import ProductDetailClient from "@/components/public/ProductDetailClient";

export const revalidate = 300;

// ── generateStaticParams untuk pre-rendering produk aktif ────
export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return products.map((p) => ({ slug: p.slug }));
}

// ── Dynamic metadata per produk ───────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, description: true, image: true },
  });

  if (!product) return { title: "Produk tidak ditemukan" };

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: [{ url: product.image }],
    },
  };
}

// ── Page ──────────────────────────────────────────────────────
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const productSelect = {
    id: true,
    name: true,
    slug: true,
    description: true,
    story: true,
    price: true,
    stock: true,
    image: true,
    galleryEnabled: true,
    images: true,
    externalUrl: true,
    isActive: true,
    categoryId: true,
    createdAt: true,
    category: { select: { name: true, slug: true } },
  } as const;

  const product = await prisma.product.findUnique({
    where: { slug },
    select: productSelect,
  });

  // 404 jika tidak ditemukan atau tidak aktif
  if (!product || !product.isActive) notFound();

  if (product.externalUrl?.startsWith("https://flobakarya.com/")) {
    void syncFlobakaryaCatalog({ force: false });
  }


  // Related products — kategori sama, maks 4
  const related = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: product.categoryId,
      NOT: { id: product.id },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      image: true,
      galleryEnabled: true,
      images: true,
      externalUrl: true,
      category: { select: { name: true } },
    },
  });

  const relatedCards = related.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    image: p.image,
    galleryEnabled: p.galleryEnabled,
    images: p.images,
    category: p.category.name,
    externalUrl: p.externalUrl,
  }));

  return <ProductDetailClient product={product} relatedProducts={relatedCards} />;
}

