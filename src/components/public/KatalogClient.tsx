"use client";

import { useState, useMemo } from "react";
import ProductCard, { type ProductCardData } from "@/components/public/ProductCard";
import { useDictionary } from "@/hooks/useDictionary";
import PriceSlider from "@/components/public/PriceSlider";

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

export default function KatalogClient({ products, categories }: KatalogClientProps) {
  const d = useDictionary().katalog;
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Real state for filtering
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(5000000); // Max 5jt default

  const [sortBy, setSortBy] = useState("default");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const matchCat = selectedCategories.length === 0 || selectedCategories.includes(p.category);
      const matchPrice = p.price >= minPrice && p.price <= maxPrice;
      return matchCat && matchPrice;
    });

    if (sortBy === "price-asc") result = [...result].sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
    else if (sortBy === "name") result = [...result].sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [products, selectedCategories, minPrice, maxPrice, sortBy]);

  const activeCount = selectedCategories.length + (minPrice > 0 || maxPrice < 5000000 ? 1 : 0);

  const clearAll = () => {
    setSelectedCategories([]);
    setMinPrice(0);
    setMaxPrice(5000000);
    setSortBy("default");
  };

  const toggleCategory = (catName: string) => {
    setSelectedCategories(prev => 
      prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]
    );
  };

  const handleStaticPrice = (min: number, max: number) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const renderFilterSidebar = () => (
    <div className="space-y-10">
      {/* Category */}
      <div>
        <button 
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          className="w-full flex items-center justify-between mb-5 group"
        >
          <h3 className="text-[11px] font-normal text-stone-900 uppercase tracking-[0.2em]">
            {d.filter.category}
          </h3>
          <svg 
            className={`w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} 
            fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        
        {isCategoryOpen && (
          <div className="animate-fade-in flex flex-col">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center justify-between cursor-pointer group py-3 border-b border-stone-200"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.name)}
                    onChange={() => toggleCategory(cat.name)}
                    className="w-4 h-4 rounded-none border-stone-300 text-stone-900 focus:ring-stone-900 focus:ring-1 cursor-pointer transition-colors"
                  />
                  <span className={`text-sm transition-colors duration-200 ${
                    selectedCategories.includes(cat.name) ? "text-stone-900 font-normal" : "text-stone-500 group-hover:text-stone-900 font-light"
                  }`}>
                    {cat.name}
                  </span>
                </div>
                <span className="text-[11px] text-stone-300 font-light">{cat._count.products}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Filter */}
      <div>
        <button 
          onClick={() => setIsPriceOpen(!isPriceOpen)}
          className="w-full flex items-center justify-between mb-5 group"
        >
          <h3 className="text-[11px] font-normal text-stone-900 uppercase tracking-[0.2em]">
            {d.filter.price}
          </h3>
          <svg 
            className={`w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 transition-transform duration-300 ${isPriceOpen ? 'rotate-180' : ''}`} 
            fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {isPriceOpen && (
          <div className="animate-fade-in flex flex-col">
            {/* Static Price Links */}
            <div className="mb-8 flex flex-col">
              <button onClick={() => handleStaticPrice(0, 5000000)} className={`block w-full text-left py-3 border-b border-stone-200 text-sm font-light transition-colors ${minPrice === 0 && maxPrice === 5000000 ? "text-stone-900 font-normal" : "text-stone-500 hover:text-stone-900"}`}>{d.filter.priceRanges[0]}</button>
              <button onClick={() => handleStaticPrice(0, 100000)} className={`block w-full text-left py-3 border-b border-stone-200 text-sm font-light transition-colors ${minPrice === 0 && maxPrice === 100000 ? "text-stone-900 font-normal" : "text-stone-500 hover:text-stone-900"}`}>{d.filter.priceRanges[1]}</button>
              <button onClick={() => handleStaticPrice(100000, 500000)} className={`block w-full text-left py-3 border-b border-stone-200 text-sm font-light transition-colors ${minPrice === 100000 && maxPrice === 500000 ? "text-stone-900 font-normal" : "text-stone-500 hover:text-stone-900"}`}>{d.filter.priceRanges[2]}</button>
              <button onClick={() => handleStaticPrice(500000, 2000000)} className={`block w-full text-left py-3 border-b border-stone-200 text-sm font-light transition-colors ${minPrice === 500000 && maxPrice === 2000000 ? "text-stone-900 font-normal" : "text-stone-500 hover:text-stone-900"}`}>{d.filter.priceRanges[3]}</button>
              <button onClick={() => handleStaticPrice(2000000, 5000000)} className={`block w-full text-left py-3 border-b border-stone-200 text-sm font-light transition-colors ${minPrice === 2000000 && maxPrice === 5000000 ? "text-stone-900 font-normal" : "text-stone-500 hover:text-stone-900"}`}>{d.filter.priceRanges[4]}</button>
            </div>

            {/* Dual Range Slider */}
            <PriceSlider 
              minPrice={minPrice} 
              maxPrice={maxPrice} 
              onCommit={(min, max) => {
                setMinPrice(min);
                setMaxPrice(max);
              }}
              formatRupiah={formatRupiah} 
            />
          </div>
        )}
      </div>

      {activeCount > 0 && (
        <button
          onClick={clearAll}
          className="text-[11px] uppercase tracking-[0.1em] text-stone-400 hover:text-stone-900 font-normal border-b border-stone-300 hover:border-stone-900 pb-0.5 transition-colors"
        >
          {d.filter.clearAll(activeCount)}
        </button>
      )}
    </div>
  );

  const sortOptions = [
    { value: "default", label: d.sort.label },
    { value: "price-asc", label: d.sort.priceAsc },
    { value: "price-desc", label: d.sort.priceDesc },
    { value: "name", label: d.sort.name },
  ];

  return (
    <>
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-8 md:pt-28 md:pb-12">
          
          {/* Page Header (Title without breadcrumb) */}
          <div className="mb-6 md:mb-10 border-b border-stone-200 pb-4 md:pb-8">
            <h1
              className="text-3xl md:text-5xl font-light text-stone-900 tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {d.title}
            </h1>
          </div>

          <div className="flex gap-16">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-28">
                {renderFilterSidebar()}
              </div>
            </aside>

            {/* Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-100 relative">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden inline-flex items-center gap-2 text-[11px] font-normal text-stone-900 uppercase tracking-[0.15em]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                    </svg>
                    {d.filter.button} {activeCount > 0 && <span>({activeCount})</span>}
                  </button>
                  <p className="text-[12px] text-stone-400 font-light">
                    {d.count(filtered.length)}
                  </p>
                </div>
                
                {/* Custom Sort Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center gap-2 text-[12px] text-stone-500 hover:text-stone-900 font-light transition-colors"
                  >
                    {sortOptions.find(opt => opt.value === sortBy)?.label || d.sort.label}
                    <svg className={`w-3 h-3 text-stone-400 transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {/* Backdrop for click outside */}
                  {isSortOpen && (
                    <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)}></div>
                  )}

                  {/* Dropdown Menu */}
                  {isSortOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-stone-200 rounded-none shadow-none z-50 py-1 animate-fade-in">
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSortBy(opt.value);
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-[12px] font-light transition-colors ${
                            sortBy === opt.value ? 'bg-stone-50 text-stone-900 font-normal' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {filtered.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                  {filtered.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24">
                  <p className="text-sm text-stone-400 font-light mb-4">
                    {d.empty}
                  </p>
                  <button
                    onClick={clearAll}
                    className="text-[12px] font-normal text-stone-900 underline underline-offset-4"
                  >
                    {d.clearFilters}
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
              <h2 className="text-[11px] font-normal text-stone-900 uppercase tracking-[0.2em]">{d.filter.button}</h2>
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
              {renderFilterSidebar()}
            </div>
            <div className="sticky bottom-0 bg-white border-t border-stone-200 px-6 py-4">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 bg-stone-900 text-white text-[11px] font-normal uppercase tracking-[0.15em]"
              >
                {d.showProducts(filtered.length)}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
