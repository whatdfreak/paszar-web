"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard, { type ProductCardData } from "@/components/public/ProductCard";
import { useDictionary } from "@/hooks/useDictionary";
import PriceSlider from "@/components/public/PriceSlider";

const ITEMS_PER_PAGE = 12;
const SKELETON_PRELOAD_MS = 150;
const INLINE_SEARCH_DEBOUNCE_MS = 220;

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

function ProductGridSkeleton({ count }: { count: number }) {
  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8 md:gap-x-7 md:gap-y-10"
      aria-busy="true"
      aria-label="Memuat produk"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="flex flex-col" aria-hidden="true">
          <div className="aspect-[4/5] w-full skeleton-shimmer mb-4" />
          <div className="space-y-2">
            <div className="h-2.5 w-20 skeleton-shimmer" />
            <div className="h-4 w-4/5 skeleton-shimmer" />
            <div className="h-3.5 w-24 skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function KatalogClient({ products, categories }: KatalogClientProps) {
  const dict = useDictionary();
  const d = dict.katalog;
  const searchBox = dict.header.searchBox;

  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const urlCategory =
    searchParams.get("category") ?? searchParams.get("kategori") ?? "";

  const [inputQuery, setInputQuery] = useState(urlQuery);
  const [appliedQuery, setAppliedQuery] = useState(urlQuery);
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setInputQuery(urlQuery);
    setAppliedQuery(urlQuery);
  }

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    urlCategory ? [urlCategory] : []
  );
  const [prevUrlCategory, setPrevUrlCategory] = useState(urlCategory);
  if (urlCategory !== prevUrlCategory) {
    setPrevUrlCategory(urlCategory);
    setSelectedCategories(urlCategory ? [urlCategory] : []);
  }

  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(5000000);
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isLoadingGrid, setIsLoadingGrid] = useState(false);

  const catalogTopRef = useRef<HTMLDivElement>(null);
  const gridWrapperRef = useRef<HTMLDivElement>(null);
  const unlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lockedMinHeight, setLockedMinHeight] = useState<number | null>(null);
  const [filterTransitionKey, setFilterTransitionKey] = useState(0);

  useEffect(() => {
    return () => {
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    };
  }, []);

  const triggerCatalogUpdate = (applyUpdate: () => void, forceScrollTop = false) => {
    if (unlockTimerRef.current) {
      clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = null;
    }
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }

    const topEl = catalogTopRef.current;
    const gridEl = gridWrapperRef.current;
    const rect = topEl?.getBoundingClientRect();
    const shouldScroll = Boolean(rect && (rect.top < 40 || (forceScrollTop && window.scrollY > 120)));

    if (shouldScroll && gridEl) {
      setLockedMinHeight(gridEl.offsetHeight);
    }

    setIsLoadingGrid(true);
    applyUpdate();
    setFilterTransitionKey((k) => k + 1);

    loadingTimerRef.current = setTimeout(() => {
      setIsLoadingGrid(false);
      loadingTimerRef.current = null;
    }, SKELETON_PRELOAD_MS);

    if (shouldScroll && rect) {
      const targetY = Math.max(0, window.scrollY + rect.top - 72);
      requestAnimationFrame(() => {
        window.scrollTo({ top: targetY, behavior: "smooth" });
      });

      const pollUnlock = (attemptsLeft: number) => {
        unlockTimerRef.current = setTimeout(() => {
          if (window.scrollY <= targetY + 48 || attemptsLeft <= 0) {
            setLockedMinHeight(null);
            unlockTimerRef.current = null;
          } else {
            pollUnlock(attemptsLeft - 1);
          }
        }, 150);
      };
      pollUnlock(5);
    } else {
      setLockedMinHeight(null);
    }
  };

  const trimmedQuery = appliedQuery.trim().toLowerCase();
  let filtered = products.filter((p) => {
    const matchCat =
      selectedCategories.length === 0 || selectedCategories.includes(p.category);
    const matchPrice = p.price >= minPrice && p.price <= maxPrice;
    const matchQuery =
      !trimmedQuery ||
      p.name.toLowerCase().includes(trimmedQuery) ||
      p.category.toLowerCase().includes(trimmedQuery);
    return matchCat && matchPrice && matchQuery;
  });

  if (sortBy === "price-asc") {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  } else if (sortBy === "name") {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const activeCount =
    selectedCategories.length +
    (minPrice > 0 || maxPrice < 5000000 ? 1 : 0) +
    (trimmedQuery ? 1 : 0);

  const clearAll = () => {
    triggerCatalogUpdate(() => {
      setSelectedCategories([]);
      setMinPrice(0);
      setMaxPrice(5000000);
      setSortBy("default");
      setInputQuery("");
      setAppliedQuery("");
      setCurrentPage(1);
    });
    if (urlQuery || urlCategory) {
      router.replace("/katalog", { scroll: false });
    }
  };

  const toggleCategory = (catName: string) => {
    triggerCatalogUpdate(() => {
      setSelectedCategories((prev) =>
        prev.includes(catName)
          ? prev.filter((c) => c !== catName)
          : [...prev, catName]
      );
      setCurrentPage(1);
    });
  };

  const handleStaticPrice = (min: number, max: number) => {
    triggerCatalogUpdate(() => {
      setMinPrice(min);
      setMaxPrice(max);
      setCurrentPage(1);
    });
  };

  const handleInlineSearchChange = (nextVal: string) => {
    setInputQuery(nextVal);
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }

    const cleaned = nextVal.trim();
    if (!cleaned) {
      if (appliedQuery.trim() !== "") {
        setIsLoadingGrid(true);
        loadingTimerRef.current = setTimeout(() => {
          setAppliedQuery("");
          setCurrentPage(1);
          setFilterTransitionKey((k) => k + 1);
          setIsLoadingGrid(false);
          loadingTimerRef.current = null;
        }, INLINE_SEARCH_DEBOUNCE_MS);
      } else {
        setIsLoadingGrid(false);
      }
      if (urlQuery) {
        router.replace("/katalog", { scroll: false });
      }
      return;
    }

    setIsLoadingGrid(true);
    loadingTimerRef.current = setTimeout(() => {
      setAppliedQuery(cleaned);
      setCurrentPage(1);
      setFilterTransitionKey((k) => k + 1);
      setIsLoadingGrid(false);
      loadingTimerRef.current = null;
    }, INLINE_SEARCH_DEBOUNCE_MS);
  };

  const handleInlineSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = inputQuery.trim();
    triggerCatalogUpdate(() => {
      setAppliedQuery(cleaned);
      setCurrentPage(1);
    });
  };

  const handleInlineSearchClear = () => {
    setInputQuery("");
    if (appliedQuery.trim() !== "") {
      triggerCatalogUpdate(() => {
        setAppliedQuery("");
        setCurrentPage(1);
      });
    }
    if (urlQuery) {
      router.replace("/katalog", { scroll: false });
    }
  };

  const goToPage = (page: number) => {
    const next = Math.min(totalPages, Math.max(1, page));
    if (next === safePage) return;
    triggerCatalogUpdate(() => {
      setCurrentPage(next);
    }, true);
  };

  // Hitung nomor halaman ringkas dengan elipsis jika lebih dari 5 halaman
  const pageTokens: Array<number | "ellipsis"> = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= safePage - 1 && i <= safePage + 1)) {
      pageTokens.push(i);
    } else if (pageTokens[pageTokens.length - 1] !== "ellipsis") {
      pageTokens.push("ellipsis");
    }
  }

  const renderFilterSidebar = () => (
    <div className="space-y-5">
      {/* Category */}
      <div>
        <button
          type="button"
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          className="w-full flex items-center justify-between mb-2.5 group"
        >
          <h3 className="text-[11px] font-normal text-stone-900 uppercase tracking-[0.2em]">
            {d.filter.category}
          </h3>
          <svg
            className={`w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 transition-transform duration-300 ${
              isCategoryOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {isCategoryOpen && (
          <div className="animate-fade-in flex flex-col">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center justify-between cursor-pointer group py-2 border-b border-stone-200"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.name)}
                    onChange={() => toggleCategory(cat.name)}
                    className="w-4 h-4 rounded-none border-stone-300 text-stone-900 focus:ring-stone-900 focus:ring-1 cursor-pointer transition-colors"
                  />
                  <span
                    className={`text-sm transition-colors duration-200 ${
                      selectedCategories.includes(cat.name)
                        ? "text-stone-900 font-normal"
                        : "text-stone-500 group-hover:text-stone-900 font-light"
                    }`}
                  >
                    {cat.name}
                  </span>
                </div>
                <span className="text-[11px] text-stone-300 font-light">
                  {cat._count.products}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Filter */}
      <div>
        <button
          type="button"
          onClick={() => setIsPriceOpen(!isPriceOpen)}
          className="w-full flex items-center justify-between mb-3 group"
        >
          <h3 className="text-[11px] font-normal text-stone-900 uppercase tracking-[0.2em]">
            {d.filter.price}
          </h3>
          <svg
            className={`w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 transition-transform duration-300 ${
              isPriceOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {isPriceOpen && (
          <div className="animate-fade-in flex flex-col">
            <div className="mb-4 flex flex-col">
              <button
                type="button"
                onClick={() => handleStaticPrice(0, 5000000)}
                className={`block w-full text-left py-2 border-b border-stone-200 text-sm font-light transition-colors ${
                  minPrice === 0 && maxPrice === 5000000
                    ? "text-stone-900 font-normal"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                {d.filter.priceRanges[0]}
              </button>
              <button
                type="button"
                onClick={() => handleStaticPrice(0, 100000)}
                className={`block w-full text-left py-2 border-b border-stone-200 text-sm font-light transition-colors ${
                  minPrice === 0 && maxPrice === 100000
                    ? "text-stone-900 font-normal"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                {d.filter.priceRanges[1]}
              </button>
              <button
                type="button"
                onClick={() => handleStaticPrice(100000, 500000)}
                className={`block w-full text-left py-2 border-b border-stone-200 text-sm font-light transition-colors ${
                  minPrice === 100000 && maxPrice === 500000
                    ? "text-stone-900 font-normal"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                {d.filter.priceRanges[2]}
              </button>
              <button
                type="button"
                onClick={() => handleStaticPrice(500000, 2000000)}
                className={`block w-full text-left py-2 border-b border-stone-200 text-sm font-light transition-colors ${
                  minPrice === 500000 && maxPrice === 2000000
                    ? "text-stone-900 font-normal"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                {d.filter.priceRanges[3]}
              </button>
              <button
                type="button"
                onClick={() => handleStaticPrice(2000000, 5000000)}
                className={`block w-full text-left py-2 border-b border-stone-200 text-sm font-light transition-colors ${
                  minPrice === 2000000 && maxPrice === 5000000
                    ? "text-stone-900 font-normal"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                {d.filter.priceRanges[4]}
              </button>
            </div>

            <PriceSlider
              minPrice={minPrice}
              maxPrice={maxPrice}
              onCommit={(min, max) => {
                triggerCatalogUpdate(() => {
                  setMinPrice(min);
                  setMaxPrice(max);
                  setCurrentPage(1);
                });
              }}
              formatRupiah={formatRupiah}
            />
          </div>
        )}
      </div>

      {activeCount > 0 && (
        <button
          type="button"
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
        <div
          ref={catalogTopRef}
          className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-10 md:pt-20 md:pb-14"
        >
          {/* Compact Page Header & Submit-Driven Inline Search (Zero double X) */}
          <div className="mb-6 border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <h1
              className="text-2xl md:text-4xl font-light text-stone-900 tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {d.title}
            </h1>

            <form
              onSubmit={handleInlineSearchSubmit}
              className="flex items-stretch w-full sm:w-80 border border-stone-200 focus-within:border-stone-900 bg-white transition-colors"
            >
              <input
                type="text"
                inputMode="search"
                enterKeyHint="search"
                maxLength={80}
                value={inputQuery}
                onChange={(e) => handleInlineSearchChange(e.target.value)}
                placeholder={searchBox.placeholder}
                aria-label={dict.header.search}
                className="flex-1 h-9 px-3 bg-white text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none rounded-none"
              />
              {inputQuery && (
                <button
                  type="button"
                  onClick={handleInlineSearchClear}
                  aria-label="Clear search"
                  className="px-2 text-stone-400 hover:text-stone-900 transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button
                type="submit"
                aria-label={dict.header.search}
                className="px-3 border-l border-stone-200 text-stone-600 hover:bg-stone-900 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
            </form>
          </div>

          <div className="flex gap-8 lg:gap-10">
            {/* Independently Scrollable Desktop Filter Sidebar (Full reach to PriceSlider & Reset) */}
            <aside className="hidden lg:block w-60 shrink-0">
              <div className="sticky top-20 max-h-[calc(100vh-9.5rem)] overflow-y-auto overscroll-contain pr-3 pb-16">
                {renderFilterSidebar()}
              </div>
            </aside>

            {/* Product Grid Wrapper (keeps height cleanly locked during smooth filter scroll) */}
            <div
              ref={gridWrapperRef}
              style={
                lockedMinHeight !== null
                  ? { minHeight: `${lockedMinHeight}px` }
                  : undefined
              }
              className="flex-1 min-w-0 min-h-[60vh]"
            >
              {/* Compact Toolbar */}
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-stone-100 relative">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden inline-flex items-center gap-2 text-[11px] font-normal text-stone-900 uppercase tracking-[0.15em]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                    </svg>
                    {d.filter.button} {activeCount > 0 && <span>({activeCount})</span>}
                  </button>
                  <p className="text-[12px] text-stone-400 font-light">
                    {filtered.length > 0
                      ? d.showingRange(
                          startIndex + 1,
                          startIndex + paginatedProducts.length,
                          filtered.length
                        )
                      : d.count(0)}
                  </p>
                </div>

                {/* Custom Sort Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center gap-2 text-[12px] text-stone-500 hover:text-stone-900 font-light transition-colors"
                  >
                    {sortOptions.find((opt) => opt.value === sortBy)?.label ||
                      d.sort.label}
                    <svg
                      className={`w-3 h-3 text-stone-400 transition-transform duration-300 ${
                        isSortOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {isSortOpen && (
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsSortOpen(false)}
                    />
                  )}

                  {isSortOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-stone-200 rounded-none shadow-none z-50 py-1 animate-fade-in">
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            triggerCatalogUpdate(() => {
                              setSortBy(opt.value);
                              setCurrentPage(1);
                            });
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-[12px] font-light transition-colors ${
                            sortBy === opt.value
                              ? "bg-stone-50 text-stone-900 font-normal"
                              : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {isLoadingGrid ? (
                <ProductGridSkeleton
                  count={Math.min(ITEMS_PER_PAGE, Math.max(3, paginatedProducts.length || 6))}
                />
              ) : paginatedProducts.length > 0 ? (
                <>
                  <div
                    key={filterTransitionKey}
                    className="animate-catalog-grid grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8 md:gap-x-7 md:gap-y-10"
                  >
                    {paginatedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination Controls (Max 12 items per page) */}
                  {totalPages > 1 && (
                    <nav
                      aria-label="Pagination"
                      className="mt-10 pt-6 border-t border-stone-200 flex items-center justify-between gap-3"
                    >
                      <button
                        type="button"
                        disabled={safePage <= 1}
                        onClick={() => goToPage(safePage - 1)}
                        className="px-4 py-2 border border-stone-200 text-[11px] uppercase tracking-[0.15em] text-stone-700 hover:border-stone-900 hover:text-stone-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed rounded-none cursor-pointer"
                      >
                        {d.prevPage}
                      </button>

                      <div className="flex items-center gap-1.5">
                        {pageTokens.map((token, idx) =>
                          token === "ellipsis" ? (
                            <span
                              key={`e-${idx}`}
                              className="px-2 text-xs text-stone-400"
                            >
                              …
                            </span>
                          ) : (
                            <button
                              key={token}
                              type="button"
                              onClick={() => goToPage(token)}
                              aria-current={token === safePage ? "page" : undefined}
                              className={`w-9 h-9 text-xs border transition-colors rounded-none cursor-pointer tabular-nums ${
                                token === safePage
                                  ? "bg-stone-900 border-stone-900 text-white"
                                  : "bg-white border-stone-200 text-stone-600 hover:border-stone-900 hover:text-stone-900"
                              }`}
                            >
                              {token}
                            </button>
                          )
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={safePage >= totalPages}
                        onClick={() => goToPage(safePage + 1)}
                        className="px-4 py-2 border border-stone-200 text-[11px] uppercase tracking-[0.15em] text-stone-700 hover:border-stone-900 hover:text-stone-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed rounded-none cursor-pointer"
                      >
                        {d.nextPage}
                      </button>
                    </nav>
                  )}
                </>
              ) : (
                <div className="animate-catalog-grid text-center py-20">
                  <p className="text-sm text-stone-400 font-light mb-4">
                    {d.empty}
                  </p>
                  <button
                    type="button"
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
            <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-[11px] font-normal text-stone-900 uppercase tracking-[0.2em]">
                {d.filter.button}
              </h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="text-stone-400 hover:text-stone-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">{renderFilterSidebar()}</div>
            <div className="sticky bottom-0 bg-white border-t border-stone-200 px-6 py-4">
              <button
                type="button"
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
