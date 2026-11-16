"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useAdminI18n } from "@/lib/admin-i18n";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminTopBarProps {
  breadcrumbs: BreadcrumbItem[];
  rightSlot?: React.ReactNode;
}

export function AdminTopBar({ breadcrumbs, rightSlot }: AdminTopBarProps) {
  const { lang, switchLang } = useAdminI18n();

  return (
    <div className="bg-white border-b border-slate-200 h-16 px-5 md:px-6 flex items-center">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-3">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0"
        >
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <span
                key={`${crumb.label}-${idx}`}
                className="inline-flex items-center gap-1.5 min-w-0"
              >
                {idx > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                )}
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="font-medium text-slate-600 hover:text-slate-900 transition-colors truncate"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={
                      isLast
                        ? "font-medium text-slate-900 truncate"
                        : "font-semibold text-slate-700 truncate"
                    }
                  >
                    {crumb.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {rightSlot}

          {/* Language Switcher (ID | EN) */}
          <div
            role="group"
            aria-label="Pilih bahasa admin"
            className="inline-flex items-center bg-slate-100 border border-slate-200/80 p-0.5 rounded-lg h-8"
          >
            {(["id", "en"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => switchLang(code)}
                className={`px-2 py-1 text-[11px] font-semibold uppercase rounded-md transition-colors cursor-pointer ${
                  lang === code
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
