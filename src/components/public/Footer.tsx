// ============================================================
// PASzar — Public Footer (i18n)
// ============================================================

"use client";

import Link from "next/link";
import { useDictionary } from "@/hooks/useDictionary";

export default function Footer() {
  const d = useDictionary().footer;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Brand Column */}
          <div>
            <p
              className="text-lg tracking-[0.25em] uppercase font-light text-white mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {d.brand}
            </p>
            <p className="text-sm text-slate-300 font-light leading-relaxed mb-6">
              {d.tagline}
            </p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white font-normal mb-3">
              {d.newsletter.label}
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder={d.newsletter.placeholder}
                className="w-full px-4 py-3 border border-slate-700 text-sm font-light text-white placeholder:text-slate-400 bg-slate-800 focus:outline-none focus:border-white transition-colors duration-200"
                style={{ borderRadius: 0 }}
              />
              <button
                className="px-5 py-3 bg-white text-slate-900 text-[11px] uppercase tracking-[0.15em] font-medium hover:bg-slate-200 transition-colors duration-200"
                style={{ borderRadius: 0 }}
              >
                {d.newsletter.button}
              </button>
            </div>
          </div>

          {/* Customer Care */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white font-normal mb-6">
              {d.sections.service.title}
            </p>
            <ul className="space-y-3">
              {d.sections.service.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-slate-300 hover:text-white font-light transition-colors duration-200"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white font-normal mb-6">
              {d.sections.company.title}
            </p>
            <ul className="space-y-3">
              {d.sections.company.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-300 hover:text-white font-light transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white font-normal mb-6">
              {d.sections.shop.title}
            </p>
            <ul className="space-y-3">
              {d.sections.shop.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-300 hover:text-white font-light transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-[11px] text-slate-400 font-light tracking-wide">
            {d.copyright(year)}
          </p>
          <p className="text-[11px] text-slate-400 font-light">{d.rights}</p>
        </div>
      </div>
    </footer>
  );
}
