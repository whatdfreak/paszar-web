// ============================================================
// PASzar — Public Footer (Dark Stone Editorial + Official Icons)
// ============================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDictionary } from "@/hooks/useDictionary";

export default function Footer() {
  const d = useDictionary().footer;
  const pathname = usePathname();
  const year = new Date().getFullYear();

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    const targetPath = href.split("#")[0] || "/";
    if (!href.includes("#") && pathname === targetPath) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-stone-900 border-t border-stone-800 text-stone-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-12 lg:gap-16">
          {/* Left Column: Strong PASzar Identity + CTA + Accurate Vector Icons */}
          <div className="max-w-sm">
            <p
              className="text-xl tracking-[0.3em] uppercase font-light text-white mb-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {d.brand}
            </p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#D4943A] font-normal mb-4">
              {d.subtitle}
            </p>
            <p className="text-sm text-stone-300 font-light leading-relaxed mb-6">
              {d.tagline}
            </p>

            <Link
              href="/katalog"
              onClick={(e) => handleLinkClick(e, "/katalog")}
              className="inline-flex justify-center items-center gap-3 px-8 py-4 bg-transparent border border-white text-white text-[11px] uppercase tracking-[0.2em] font-normal hover:bg-white hover:text-black transition-all duration-300 rounded-none w-auto mb-8"
            >
              {d.cta}
            </Link>

            <div className="flex items-center gap-5 text-stone-400">
              {/* Instagram — Standard 24x24 Lucide Vector */}
              <a
                href="https://www.instagram.com/lapaskupang"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                title="Instagram"
                className="hover:text-white transition-colors duration-200"
              >
                <svg
                  className="w-[18px] h-[18px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>

              {/* WhatsApp — Official SimpleIcons 24x24 Path */}
              <Link
                href="/katalog"
                aria-label="WhatsApp"
                title="WhatsApp"
                className="hover:text-white transition-colors duration-200"
              >
                <svg
                  className="w-[18px] h-[18px]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.98 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.73C7 10.96 7.9 12.14 8.02 12.31C8.15 12.48 9.76 14.97 12.24 16.04C12.83 16.3 13.29 16.45 13.65 16.56C14.24 16.75 14.78 16.72 15.2 16.66C15.67 16.59 16.65 16.07 16.85 15.5C17.06 14.93 17.06 14.44 17 14.34C16.93 14.23 16.77 14.17 16.52 14.04C16.27 13.92 15.05 13.32 14.82 13.23C14.59 13.15 14.42 13.11 14.26 13.36C14.09 13.61 13.62 14.17 13.47 14.34C13.33 14.51 13.18 14.53 12.93 14.4C12.68 14.28 11.88 14.01 10.93 13.17C10.19 12.51 9.69 11.7 9.54 11.45C9.4 11.2 9.52 11.06 9.65 10.94C9.76 10.83 9.9 10.65 10.02 10.5C10.15 10.35 10.19 10.25 10.27 10.08C10.36 9.91 10.32 9.77 10.25 9.64C10.19 9.52 9.69 8.29 9.48 7.8C9.28 7.31 9.07 7.37 8.92 7.36C8.78 7.35 8.62 7.33 8.53 7.33Z" />
                </svg>
              </Link>

              {/* Email — Standard 24x24 Lucide Vector */}
              <a
                href="mailto:koperasi@paszar.id"
                aria-label="Email"
                title="Email"
                className="hover:text-white transition-colors duration-200"
              >
                <svg
                  className="w-[18px] h-[18px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </a>

              {/* Location Kupang, NTT — Standard 24x24 Lucide MapPin */}
              <Link
                href="/#partners"
                aria-label="Kupang, NTT"
                title="Kupang, NTT"
                className="hover:text-white transition-colors duration-200"
              >
                <svg
                  className="w-[18px] h-[18px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right 3 Columns: Koleksi Karya, Tentang PASzar, Layanan Koperasi */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 sm:gap-14 xl:gap-20">
            {/* Craft Collection */}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white font-normal mb-5">
                {d.sections.shop.title}
              </p>
              <ul className="space-y-3">
                {d.sections.shop.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link.href)}
                      className="text-sm text-stone-400 hover:text-white font-light transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* About PASzar */}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white font-normal mb-5">
                {d.sections.company.title}
              </p>
              <ul className="space-y-3">
                {d.sections.company.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-stone-400 hover:text-white font-light transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cooperative Desk */}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white font-normal mb-5">
                {d.sections.care.title}
              </p>
              <ul className="space-y-3">
                {d.sections.care.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-stone-400 hover:text-white font-light transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-[11px] text-stone-400 font-light tracking-wide">
            {d.copyright(year)}
          </p>
          <p className="text-[11px] text-stone-400 font-light">{d.rights}</p>
        </div>
      </div>
    </footer>
  );
}
