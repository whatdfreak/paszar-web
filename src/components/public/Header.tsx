// ============================================================
// PASzar — Public Header (Smooth Search Drawer, Skeleton Preload, Lang & Cart)
// ============================================================

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore, cartItemCount } from "@/stores/cartStore";
import { useLangStore, type Lang } from "@/stores/langStore";
import { useEffectiveLang } from "@/components/public/LangHydrator";
import { useDictionary } from "@/hooks/useDictionary";

export interface SearchProductItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  category: string;
}

const RECENT_SEARCHES_KEY = "paszar-recent-searches";
const MAX_RECENT_SEARCHES = 5;
const SEARCH_DEBOUNCE_MS = 220;

function readRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
}

function writeRecentSearches(items: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items));
  } catch {
    // Abaikan jika storage tidak tersedia
  }
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function FlagID() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="w-4 h-4 rounded-full overflow-hidden shrink-0 border border-stone-300/70"
      aria-hidden="true"
    >
      <rect width="20" height="10" y="0" fill="#CE1126" />
      <rect width="20" height="10" y="10" fill="#FFFFFF" />
    </svg>
  );
}

function FlagEN() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="w-4 h-4 rounded-full overflow-hidden shrink-0 border border-stone-300/70"
      aria-hidden="true"
    >
      <rect width="20" height="20" fill="#012169" />
      <path d="M0,0 L20,20 M20,0 L0,20" stroke="#FFFFFF" strokeWidth="3.6" />
      <path d="M0,0 L20,20 M20,0 L0,20" stroke="#C8102E" strokeWidth="1.6" />
      <path d="M10,0 V20 M0,10 H20" stroke="#FFFFFF" strokeWidth="5.4" />
      <path d="M10,0 V20 M0,10 H20" stroke="#C8102E" strokeWidth="3" />
    </svg>
  );
}

function SearchResultsSkeleton() {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      aria-busy="true"
      aria-label="Mencari produk"
    >
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="flex items-center gap-3 p-2 border border-stone-200 bg-white rounded-none"
          aria-hidden="true"
        >
          <div className="w-12 h-14 skeleton-shimmer shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-2 w-16 skeleton-shimmer" />
            <div className="h-3 w-4/5 skeleton-shimmer" />
            <div className="h-2.5 w-20 skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

const LANG_CHOICES: readonly { code: Lang; label: string }[] = [
  { code: "id", label: "Indonesia" },
  { code: "en", label: "English" },
];

export default function Header({
  searchProducts = [],
}: {
  searchProducts?: SearchProductItem[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/" || pathname === "/en" || pathname === "/id";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isScrolled, setIsScrolled] = useState(!isHomePage);

  const headerRef = useRef<HTMLElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleCart = useCartStore((s) => s.toggleCart);
  const count = useCartStore(cartItemCount);
  const lang = useEffectiveLang();
  const isTextMorphing = useLangStore((s) => s.isTextMorphing);
  const switchLang = useLangStore((s) => s.switchLang);
  const d = useDictionary();

  useEffect(() => {
    const handleScroll = () => {
      if (isHomePage) {
        setIsScrolled(window.scrollY > window.innerHeight * 0.8);
      } else {
        setIsScrolled(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!langMenuOpen && !searchOpen) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (langMenuOpen && langMenuRef.current && !langMenuRef.current.contains(target)) {
        setLangMenuOpen(false);
      }
      if (searchOpen && headerRef.current && !headerRef.current.contains(target)) {
        setSearchOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLangMenuOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [langMenuOpen, searchOpen]);

  const isTransparent = isHomePage && !isScrolled && !searchOpen && !mobileMenuOpen;

  const navLinks = [
    { label: d.header.nav.home, href: "/" },
    { label: d.header.nav.shop, href: "/katalog" },
    { label: d.header.nav.artisans, href: "/#artisans" },
    { label: d.header.nav.about, href: "/#about" },
  ];

  const handleSelectLang = (next: Lang) => {
    setLangMenuOpen(false);
    setMobileMenuOpen(false);
    switchLang(next);
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    if (!href.includes("#") && pathname === href) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleToggleSearch = () => {
    const nextOpen = !searchOpen;
    setSearchOpen(nextOpen);
    setLangMenuOpen(false);
    setMobileMenuOpen(false);
    if (nextOpen) {
      setRecentSearches(readRecentSearches());
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  };

  const handleSearchInputChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }
    const trimmed = val.trim();
    if (!trimmed) {
      setDebouncedQuery("");
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedQuery(trimmed);
      setIsSearching(false);
      searchTimerRef.current = null;
    }, SEARCH_DEBOUNCE_MS);
  };

  const saveRecentSearch = (trimmed: string) => {
    if (!trimmed) return;
    const nextRecent = [
      trimmed,
      ...readRecentSearches().filter(
        (item) => item.toLowerCase() !== trimmed.toLowerCase()
      ),
    ].slice(0, MAX_RECENT_SEARCHES);
    writeRecentSearches(nextRecent);
    setRecentSearches(nextRecent);
  };

  const navigateToSearch = (rawTerm: string) => {
    const trimmed = rawTerm.trim();
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }
    setIsSearching(false);
    if (trimmed) {
      saveRecentSearch(trimmed);
      setSearchQuery(trimmed);
      setDebouncedQuery(trimmed);
    }
    setSearchOpen(false);
    if (trimmed) {
      router.push(`/katalog?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/katalog");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateToSearch(searchQuery);
  };

  const handleClearRecent = () => {
    writeRecentSearches([]);
    setRecentSearches([]);
  };

  const normalizedDebounced = debouncedQuery.trim().toLowerCase();
  const hasTypedText = searchQuery.trim().length > 0;
  const matchingProducts =
    !isSearching && normalizedDebounced
      ? searchProducts
          .filter(
            (p) =>
              p.name.toLowerCase().includes(normalizedDebounced) ||
              p.category.toLowerCase().includes(normalizedDebounced)
          )
          .slice(0, 6)
      : [];

  const headerBg = isTransparent
    ? "bg-transparent border-transparent"
    : "bg-white/95 backdrop-blur-md border-b border-stone-200";
  const iconColor = isTransparent
    ? "text-white hover:text-stone-300"
    : "text-stone-600 hover:text-stone-900";
  const navColor = isTransparent
    ? "text-white hover:text-stone-300"
    : "text-stone-600 hover:text-stone-900";
  const brandColor = isTransparent
    ? "text-white hover:text-stone-300"
    : "text-stone-900 hover:text-stone-600";

  return (
    <header
      ref={headerRef}
      onMouseLeave={() => {
        if (searchOpen) setSearchOpen(false);
      }}
      className={`fixed w-full top-0 z-50 transition-colors duration-300 ${headerBg}`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between lg:grid lg:grid-cols-3 h-14">
          {/* Logo (Left) */}
          <Link
            href="/"
            onClick={(e) => handleNavClick(e, "/")}
            className={`lg:justify-self-start text-base lg:text-lg tracking-[0.3em] uppercase transition-colors duration-300 ${brandColor} ${
              isTransparent ? "font-normal" : "font-light"
            }`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {d.header.brand}
          </Link>

          {/* Desktop Nav (Centered Symmetric 4 Links) */}
          <nav className="hidden lg:flex items-center justify-center gap-10 lg:justify-self-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`group relative whitespace-nowrap text-[11px] uppercase tracking-[0.2em] font-light transition-colors duration-300 ${navColor}`}
              >
                {link.label}
                <span className="absolute -bottom-1 left-1/2 w-0 h-[1px] bg-current -translate-x-1/2 transition-all duration-300 group-hover:w-[calc(100%-0.2em)]" />
              </Link>
            ))}
          </nav>

          {/* Right Utility Cluster */}
          <div className="flex items-center justify-end gap-5 lg:justify-self-end">
            {/* Search Box Toggle */}
            <button
              type="button"
              onClick={handleToggleSearch}
              aria-label={d.header.search}
              aria-expanded={searchOpen}
              className={`transition-colors duration-300 cursor-pointer ${iconColor}`}
            >
              <svg
                className="w-[17px] h-[17px]"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </button>

            {/* Flag + Language Selector */}
            <div ref={langMenuRef} className="relative select-none">
              <button
                type="button"
                disabled={isTextMorphing}
                onClick={() => {
                  setLangMenuOpen((open) => !open);
                  setSearchOpen(false);
                }}
                aria-haspopup="menu"
                aria-expanded={langMenuOpen}
                aria-label="Language"
                className={`inline-flex items-center gap-1.5 py-1 transition-colors duration-300 cursor-pointer disabled:opacity-50 ${iconColor}`}
              >
                {lang === "id" ? <FlagID /> : <FlagEN />}
                <span className="text-[10px] tracking-[0.14em] uppercase font-normal leading-none">
                  {lang.toUpperCase()}
                </span>
                <svg
                  className={`w-2.5 h-2.5 shrink-0 transition-transform duration-200 ${
                    langMenuOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              <div
                role="menu"
                aria-hidden={!langMenuOpen}
                className={`absolute right-0 mt-2.5 w-36 bg-white border border-stone-200 rounded-none z-50 py-1 origin-top-right transition-all duration-200 ease-out ${
                  langMenuOpen
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-1.5 pointer-events-none"
                }`}
              >
                {LANG_CHOICES.map((opt) => {
                  const active = lang === opt.code;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      role="menuitemradio"
                      aria-checked={active}
                      tabIndex={langMenuOpen ? 0 : -1}
                      disabled={isTextMorphing}
                      onClick={() => handleSelectLang(opt.code)}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-left transition-colors duration-200 cursor-pointer disabled:opacity-50 ${
                        active
                          ? "bg-stone-50 text-stone-900"
                          : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        {opt.code === "id" ? <FlagID /> : <FlagEN />}
                        <span className="text-[12px] font-normal tracking-wide">
                          {opt.label}
                        </span>
                      </span>
                      {active && (
                        <span
                          className="w-1.5 h-1.5 bg-[#BA7517] shrink-0"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cart */}
            <button
              type="button"
              onClick={toggleCart}
              aria-label={d.header.cart}
              className={`relative transition-colors duration-300 cursor-pointer ${iconColor}`}
            >
              <svg
                className="w-[17px] h-[17px]"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                />
              </svg>
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-stone-900 text-white text-[9px] flex items-center justify-center font-normal">
                  {count}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setSearchOpen(false);
              }}
              className={`lg:hidden transition-colors duration-300 ml-0.5 ${iconColor}`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Smooth-Transition Search Drawer Panel (Mounted continuously for open & close animation) */}
      <div
        aria-hidden={!searchOpen}
        className={`transition-all duration-300 ease-out overflow-hidden bg-white ${
          searchOpen
            ? "max-h-[560px] opacity-100 translate-y-0 border-t border-stone-200 pointer-events-auto"
            : "max-h-0 opacity-0 -translate-y-2 border-t border-transparent pointer-events-none"
        }`}
      >
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-normal">
              {d.header.searchBox.title}
            </p>
            <button
              type="button"
              tabIndex={searchOpen ? 0 : -1}
              onClick={() => setSearchOpen(false)}
              aria-label={d.header.searchBox.close}
              className="text-stone-400 hover:text-stone-900 transition-colors p-1 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="flex items-stretch border border-stone-300 focus-within:border-stone-900 transition-colors"
          >
            <div className="flex items-center pl-3.5 text-stone-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              inputMode="search"
              enterKeyHint="search"
              maxLength={80}
              tabIndex={searchOpen ? 0 : -1}
              value={searchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              placeholder={d.header.searchBox.placeholder}
              className="flex-1 h-11 px-3 bg-white text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none rounded-none"
            />
            {searchQuery && (
              <button
                type="button"
                tabIndex={searchOpen ? 0 : -1}
                onClick={() => {
                  handleSearchInputChange("");
                  searchInputRef.current?.focus();
                }}
                aria-label="Clear"
                className="px-2.5 text-stone-400 hover:text-stone-900 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              type="submit"
              tabIndex={searchOpen ? 0 : -1}
              className="px-6 bg-stone-900 text-white text-[11px] uppercase tracking-[0.2em] font-normal hover:bg-stone-800 transition-colors rounded-none cursor-pointer"
            >
              {d.header.search}
            </button>
          </form>

          <p className="mt-2 text-[11px] text-stone-400 font-light">
            {d.header.searchBox.submitHint}
          </p>

          {/* Recent & Popular Searches when not actively typing */}
          {!hasTypedText && (
            <>
              {recentSearches.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-stone-400">
                      {d.header.searchBox.recentLabel}
                    </span>
                    <button
                      type="button"
                      tabIndex={searchOpen ? 0 : -1}
                      onClick={handleClearRecent}
                      className="text-[10px] uppercase tracking-[0.15em] text-stone-400 hover:text-stone-900 transition-colors cursor-pointer"
                    >
                      {d.header.searchBox.clearRecent}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        type="button"
                        tabIndex={searchOpen ? 0 : -1}
                        onClick={() => navigateToSearch(term)}
                        className="px-2.5 py-1 border border-stone-200 hover:border-stone-900 bg-stone-50 hover:bg-white text-[11px] text-stone-700 hover:text-stone-900 transition-colors rounded-none cursor-pointer"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.18em] text-stone-400 mr-1">
                  {d.header.searchBox.popularLabel}:
                </span>
                {d.header.searchBox.popularTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    tabIndex={searchOpen ? 0 : -1}
                    onClick={() => navigateToSearch(tag)}
                    className="px-2.5 py-1 border border-stone-200 hover:border-stone-900 text-[11px] text-stone-600 hover:text-stone-900 transition-colors rounded-none cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Skeleton ("Skull") Preload + Debounced Matching Results */}
          {hasTypedText && (
            <div className="mt-5 pt-4 border-t border-stone-200">
              {isSearching ? (
                <SearchResultsSkeleton />
              ) : (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400">
                      {d.header.searchBox.resultsLabel} ({matchingProducts.length})
                    </p>
                    {matchingProducts.length > 0 && (
                      <button
                        type="button"
                        tabIndex={searchOpen ? 0 : -1}
                        onClick={() => navigateToSearch(debouncedQuery)}
                        className="text-[11px] text-stone-900 hover:text-[#BA7517] underline underline-offset-4 transition-colors cursor-pointer"
                      >
                        {d.header.searchBox.viewAll(debouncedQuery)}
                      </button>
                    )}
                  </div>

                  {matchingProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1">
                      {matchingProducts.map((item) => (
                        <Link
                          key={item.id}
                          href={`/produk/${item.slug}`}
                          tabIndex={searchOpen ? 0 : -1}
                          onClick={() => {
                            saveRecentSearch(debouncedQuery);
                            setSearchOpen(false);
                          }}
                          className="flex items-center gap-3 p-2 border border-stone-200 hover:border-stone-900 bg-white transition-colors rounded-none group"
                        >
                          <div className="relative w-12 h-14 bg-stone-100 shrink-0 overflow-hidden">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] uppercase tracking-[0.15em] text-stone-400 truncate">
                              {item.category}
                            </p>
                            <p className="text-xs text-stone-900 group-hover:underline line-clamp-1">
                              {item.name}
                            </p>
                            <p className="text-[11px] font-light text-stone-600 mt-0.5">
                              {formatRupiah(item.price)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-stone-500 font-light py-3">
                      {d.header.searchBox.noResults}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 animate-fade-in">
          <div className="px-6 py-7 space-y-4 bg-white">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="block text-[11px] uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 font-light transition-colors py-1.5"
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 border-t border-stone-100 flex items-center gap-4 text-[11px] tracking-[0.12em]">
              <button
                type="button"
                onClick={() => handleSelectLang("id")}
                className={`inline-flex items-center gap-1.5 transition-colors ${
                  lang === "id"
                    ? "text-stone-900 font-medium border-b border-[#BA7517] pb-0.5"
                    : "text-stone-400 hover:text-stone-700 font-light"
                }`}
              >
                <FlagID />
                <span>Indonesia</span>
              </button>
              <span className="text-stone-300">|</span>
              <button
                type="button"
                onClick={() => handleSelectLang("en")}
                className={`inline-flex items-center gap-1.5 transition-colors ${
                  lang === "en"
                    ? "text-stone-900 font-medium border-b border-[#BA7517] pb-0.5"
                    : "text-stone-400 hover:text-stone-700 font-light"
                }`}
              >
                <FlagEN />
                <span>English</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
