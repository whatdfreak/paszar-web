import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductActions from "@/components/public/ProductActions";
import ProductCard from "@/components/public/ProductCard";

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

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: { select: { name: true, slug: true } } },
  });

  // 404 jika tidak ditemukan atau tidak aktif
  if (!product || !product.isActive) notFound();

  // Related products — kategori sama, maks 4
  const related = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: product.categoryId,
      NOT: { id: product.id },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, slug: true, price: true, image: true, category: { select: { name: true } } },
  });

  const relatedCards = related.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    image: p.image,
    category: p.category.name,
  }));

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-stone-400 flex-wrap">
            <Link href="/" className="hover:text-stone-900 transition-colors font-light">Home</Link>
            <span className="text-stone-300">/</span>
            <Link href="/katalog" className="hover:text-stone-900 transition-colors font-light">Produk</Link>
            <span className="text-stone-300">/</span>
            <Link
              href={`/katalog`}
              className="hover:text-stone-900 transition-colors font-light"
            >
              {product.category.name}
            </Link>
            <span className="text-stone-300">/</span>
            <span className="text-stone-700 font-normal truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail — 2 Column */}
      <section className="bg-white py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">

            {/* Left — Images */}
            <div>
              <div className="relative aspect-[4/5] overflow-hidden bg-stone-100 mb-3">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
              {/* Thumbnail strip (single image repeated — real thumbnails via gallery sprint) */}
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`relative w-16 h-16 overflow-hidden bg-stone-100 border ${
                      i === 0 ? "border-stone-900" : "border-transparent opacity-50"
                    }`}
                  >
                    <Image
                      src={product.image}
                      alt={`${product.name} view ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Details */}
            <div className="flex flex-col lg:pt-2">
              {/* Category label */}
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-normal mb-3">
                {product.category.name}
              </p>

              {/* Title */}
              <h1
                className="text-2xl lg:text-[36px] font-normal text-stone-900 leading-tight mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {product.name}
              </h1>

              {/* Client — price, qty, CTA buttons */}
              <ProductActions
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  slug: product.slug,
                  stock: product.stock,
                }}
              />

              {/* Description */}
              <div className="pb-6 border-b border-stone-200 mb-6">
                <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-normal mb-3">
                  Deskripsi
                </p>
                <p className="text-sm text-stone-500 font-light leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Story */}
              {product.story && (
                <div className="pb-6 border-b border-stone-200 mb-6">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-normal mb-3">
                    Kisah Produk
                  </p>
                  <p className="text-sm text-stone-400 font-light leading-relaxed italic">
                    &ldquo;{product.story}&rdquo;
                  </p>
                </div>
              )}

              {/* Trust badges */}
              <div className="flex items-center gap-6 mt-2">
                {["Produk Autentik", "Pengiriman Aman", "Kualitas Terjamin"].map((badge) => (
                  <p
                    key={badge}
                    className="text-[10px] text-stone-400 uppercase tracking-[0.1em] font-light"
                  >
                    {badge}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedCards.length > 0 && (
        <section className="py-20 lg:py-28 bg-stone-50 border-t border-stone-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400 font-normal mb-3">
                  Mungkin Anda Suka
                </p>
                <h2
                  className="text-2xl lg:text-3xl font-light text-stone-900"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Produk Terkait
                </h2>
              </div>
              <Link
                href="/katalog"
                className="hidden sm:inline-flex text-[11px] text-stone-500 hover:text-stone-900 uppercase tracking-[0.15em] font-light border-b border-stone-300 pb-0.5 transition-all duration-300"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {relatedCards.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
