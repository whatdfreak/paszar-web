"use client";

import { useState, useMemo } from "react";
import ProductCard, { type ProductCardData } from "@/components/public/ProductCard";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

interface KatalogClientProps {
  products: ProductCardData[];
  categories: Category[];
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

const PRICE_RANGES = [
  { label: "Semua Harga", min: 0, max: Infinity },
  { label: "< Rp 100.000", min: 0, max: 100_000 },
  { label: "Rp 100.000 – 500.000", min: 100_000, max: 500_000 },
  { label: "Rp 500.000 – 2.000.000", min: 500_000, max: 2_000_000 },
  { label: "> Rp 2.000.000", min: 2_000_000, max: Infinity },
];

export default function KatalogClient({ products, categories }: KatalogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState(PRICE_RANGES[0]);
  const [sortBy, setSortBy] = useState("default");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const matchCat = selectedCategory === "all" || p.category === selectedCategory;
      const matchPrice = p.price >= priceRange.min && p.price <= priceRange.max;
      return matchCat && matchPrice;
    });

    if (sortBy === "price-asc") result = [...result].sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
    else if (sortBy === "name") result = [...result].sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [products, selectedCategory, priceRange, sortBy]);

  const activeCount =
    (selectedCategory !== "all" ? 1 : 0) + (priceRange.min > 0 || priceRange.max < Infinity ? 1 : 0);

  const clearAll = () => {
    setSelectedCategory("all");
    setPriceRange(PRICE_RANGES[0]);
    setSortBy("default");
  };

  const FilterSidebar = () => (
    <div className="space-y-10">
      {/* Category */}
      <div>
        <h3 className="text-[11px] font-normal text-stone-900 uppercase tracking-[0.2em] mb-5">
          Kategori
        </h3>
        <div className="space-y-0">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`w-full flex items-center justify-between py-3 border-b border-stone-200 text-sm transition-colors duration-200 ${
              selectedCategory === "all"
                ? "text-stone-900 font-normal"
                : "text-stone-400 hover:text-stone-900 font-light"
            }`}
          >
            <span>Semua</span>
            <span className="text-[11px] text-stone-300 font-light">{products.length}</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`w-full flex items-center justify-between py-3 border-b border-stone-200 text-sm transition-colors duration-200 ${
                selectedCategory === cat.name
                  ? "text-stone-900 font-normal"
                  : "text-stone-400 hover:text-stone-900 font-light"
              }`}
            >
              <span>{cat.name}</span>
              <span className="flex items-center gap-3">
                <span className="text-[11px] text-stone-300 font-light">{cat._count.products}</span>
                {selectedCategory === cat.name && <span className="w-1.5 h-1.5 bg-stone-900" />}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="text-[11px] font-normal text-stone-900 uppercase tracking-[0.2em] mb-5">
          Harga
        </h3>
        <div className="space-y-0">
          {PRICE_RANGES.map((range) => (
            <button
              key={range.label}
              onClick={() => setPriceRange(range)}
              className={`w-full flex items-center justify-between py-3 border-b border-stone-200 text-sm transition-colors duration-200 ${
                priceRange.label === range.label
                  ? "text-stone-900 font-normal"
                  : "text-stone-400 hover:text-stone-900 font-light"
              }`}
            >
              <span>{range.label}</span>
              {priceRange.label === range.label && <span className="w-1.5 h-1.5 bg-stone-900" />}
            </button>
          ))}
        </div>
      </div>

      {activeCount > 0 && (
        <button
          onClick={clearAll}
          className="text-[12px] text-stone-400 hover:text-stone-900 font-light underline underline-offset-4 transition-colors"
        >
          Hapus semua filter ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Page Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-14">
          <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-stone-400 mb-6">
            <a href="/" className="hover:text-stone-900 transition-colors font-light">Home</a>
            <span className="text-stone-300">/</span>
            <span className="text-stone-700 font-normal">Produk</span>
          </nav>
          <h1
            className="text-3xl lg:text-[42px] font-light text-stone-900 tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Semua Produk
          </h1>
        </div>
      </div>

      {/* Main */}
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="flex gap-16">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-24">
                <FilterSidebar />
              </div>
            </aside>

            {/* Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden inline-flex items-center gap-2 text-[11px] font-normal text-stone-900 uppercase tracking-[0.15em]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                    </svg>
                    Filter {activeCount > 0 && <span>({activeCount})</span>}
                  </button>
                  <p className="text-[12px] text-stone-400 font-light">
                    {filtered.length} produk
                  </p>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-[12px] bg-transparent text-stone-500 font-light focus:outline-none cursor-pointer appearance-none pr-5"
                >
                  <option value="default">Urutkan</option>
                  <option value="price-asc">Harga ↑</option>
                  <option value="price-desc">Harga ↓</option>
                  <option value="name">A — Z</option>
                </select>
              </div>

              {filtered.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                  {filtered.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24">
                  <p className="text-sm text-stone-400 font-light mb-4">
                    Tidak ada produk yang sesuai filter.
                  </p>
                  <button
                    onClick={clearAll}
                    className="text-[12px] font-normal text-stone-900 underline underline-offset-4"
                  >
                    Hapus filter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-full max-w-xs bg-white overflow-y-auto animate-slide-in-left">
            <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-5 flex items-center justify-between z-10">
              <h2 className="text-[11px] font-normal text-stone-900 uppercase tracking-[0.2em]">Filter</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="text-stone-400 hover:text-stone-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <FilterSidebar />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-stone-200 px-6 py-4">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 bg-stone-900 text-white text-[11px] font-normal uppercase tracking-[0.15em]"
              >
                Tampilkan {filtered.length} Produk
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
