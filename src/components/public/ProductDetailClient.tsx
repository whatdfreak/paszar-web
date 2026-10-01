"use client";

import Image from "next/image";
import Link from "next/link";
import { useDictionary } from "@/hooks/useDictionary";
import ProductActions from "@/components/public/ProductActions";
import ProductCard, { type ProductCardData } from "@/components/public/ProductCard";

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    slug: string;
    stock: number;
    description: string;
    story: string | null;
    category: {
      name: string;
      slug: string;
    };
  };
  relatedProducts: ProductCardData[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailProps) {
  const d = useDictionary().product;

  return (
    <>


      {/* Product Detail — 2 Column */}
      <section className="bg-white pt-20 md:pt-24 pb-12 lg:pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-stone-500 mb-6 md:mb-8">
            <Link href="/" className="hover:text-stone-900 transition-colors font-normal">{d.breadcrumb.home}</Link>
            <span className="text-stone-300">/</span>
            <Link href="/katalog" className="hover:text-stone-900 transition-colors font-normal">{d.breadcrumb.shop}</Link>
            <span className="text-stone-300">/</span>
            <Link href={`/katalog?category=${product.category.name}`} className="hover:text-stone-900 transition-colors font-normal">
              {product.category.name}
            </Link>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">

            {/* Left — Images */}
            <div>
              <div className="relative aspect-[4/5] overflow-hidden bg-stone-100 mb-3 rounded-none">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
              {/* Thumbnail strip */}
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`relative w-16 h-16 overflow-hidden bg-stone-100 border rounded-none ${
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
                  {d.description}
                </p>
                <p className="text-sm text-stone-500 font-light leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Story */}
              {product.story && (
                <div className="pb-6 border-b border-stone-200 mb-6">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-normal mb-3">
                    {d.story}
                  </p>
                  <p className="text-sm text-stone-400 font-light leading-relaxed italic">
                    &ldquo;{product.story}&rdquo;
                  </p>
                </div>
              )}

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-4 lg:gap-6 mt-2">
                {d.badges.map((badge) => (
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
      {relatedProducts.length > 0 && (
        <section className="py-20 lg:py-28 bg-stone-50 border-t border-stone-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400 font-normal mb-3">
                  {d.related.eyebrow}
                </p>
                <h2
                  className="text-2xl lg:text-3xl font-light text-stone-900"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {d.related.title}
                </h2>
              </div>
              <Link
                href="/katalog"
                className="hidden sm:inline-flex text-[11px] text-stone-500 hover:text-stone-900 uppercase tracking-[0.15em] font-light border-b border-stone-300 pb-0.5 transition-all duration-300"
              >
                {d.related.viewAll}
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
