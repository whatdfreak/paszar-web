// ============================================================
// PASzar — Public Header (with Language Toggle)
// ============================================================

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCartStore, cartItemCount } from "@/stores/cartStore";
import { useLangStore, type Lang } from "@/stores/langStore";
import { useDictionary } from "@/hooks/useDictionary";

export default function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === "/" || pathname === "/en" || pathname === "/id";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(!isHomePage);
  
  const toggleCart = useCartStore((s) => s.toggleCart);
  const count = useCartStore(cartItemCount);
  const { lang, setLang } = useLangStore();
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
    handleScroll(); // Check on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  const isTransparent = isHomePage && !isScrolled;

  const navLinks = [
    { label: d.header.nav.home, href: "/" },
    { label: d.header.nav.shop, href: "/katalog" },
    { label: d.header.nav.artisans, href: "/#artisans" },
    { label: d.header.nav.about, href: "/#about" },
  ];

  const LangToggle = ({ isMobile = false }) => {
    const textColor = isTransparent && !isMobile ? "text-white hover:text-stone-300" : "text-stone-400 hover:text-stone-700";
    const activeColor = isTransparent && !isMobile ? "text-white font-semibold" : "text-stone-900 font-semibold";
    const dividerColor = isTransparent && !isMobile ? "text-white/50" : "text-stone-300";

    return (
      <div className="flex items-center gap-0.5 text-[10px] tracking-[0.15em] uppercase select-none">
        {(["en", "id"] as Lang[]).map((l, i) => (
          <span key={l} className="flex items-center">
            <button
              onClick={() => setLang(l)}
              aria-label={`Switch to ${l.toUpperCase()}`}
              className={`px-1 py-0.5 transition-colors duration-300 ${
                lang === l ? activeColor : `font-light ${textColor}`
              }`}
            >
              {l.toUpperCase()}
            </button>
            {i === 0 && (
              <span className={`leading-none select-none transition-colors duration-300 ${dividerColor}`}>|</span>
            )}
          </span>
        ))}
      </div>
    );
  };

  const headerBg = isTransparent ? "bg-transparent border-transparent" : "bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm";
  const iconColor = isTransparent ? "text-white hover:text-stone-300" : "text-stone-500 hover:text-stone-900";
  const navColor = isTransparent ? "text-white hover:text-stone-300" : "text-stone-500 hover:text-stone-900";
  const brandColor = isTransparent ? "text-white hover:text-stone-300" : "text-stone-900 hover:text-stone-600";

  return (
    <header className={`fixed w-full top-0 z-50 transition-colors duration-300 ${headerBg}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16">

          {/* Logo */}
          <Link
            href="/"
            className={`text-lg tracking-[0.3em] uppercase transition-colors duration-300 ${brandColor} ${isTransparent ? 'font-normal' : 'font-light'}`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {d.header.brand}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[11px] uppercase tracking-[0.2em] font-light transition-colors duration-300 ${navColor}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-5">
            {/* Search */}
            <button
              aria-label={d.header.search}
              className={`transition-colors duration-300 ${iconColor}`}
            >
              <svg
                className="w-[18px] h-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </button>

            {/* Language Toggle — desktop */}
            <div className="hidden sm:block">
              <LangToggle />
            </div>

            {/* Cart */}
            <button
              onClick={toggleCart}
              aria-label={d.header.cart}
              className={`relative transition-colors duration-300 ${iconColor}`}
            >
              <svg
                className="w-[18px] h-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
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
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden transition-colors duration-300 ml-1 ${iconColor}`}
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 animate-fade-in">
          <div className="px-6 py-8 space-y-5 bg-white">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-[11px] uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 font-light transition-colors py-2"
              >
                {link.label}
              </Link>
            ))}
            {/* Language Toggle — mobile */}
            <div className="pt-2 border-t border-stone-100">
              <LangToggle isMobile={true} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
