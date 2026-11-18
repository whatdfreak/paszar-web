// ============================================================
// PASzar — SSR Language Hydrator, Scroll Restorer & Emblem Loader
// ============================================================

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";
import {
  SCROLL_PATH_KEY,
  SCROLL_Y_KEY,
  useLangStore,
  type Lang,
} from "@/stores/langStore";

const InitialLangContext = createContext<Lang>("id");
const emptySubscribe = () => () => {};

export function useEffectiveLang(): Lang {
  const initialLang = useContext(InitialLangContext);
  const storeLang = useLangStore((s) => s.lang);
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  return isClient ? storeLang : initialLang;
}

export default function LangHydrator({
  initialLang,
  children,
}: {
  initialLang: Lang;
  children: React.ReactNode;
}) {
  const isTextMorphing = useLangStore((s) => s.isTextMorphing);
  const targetLang = useLangStore((s) => s.targetLang);

  useEffect(() => {
    const current = useLangStore.getState().lang;
    const hasCookie = document.cookie
      .split("; ")
      .some((row) => row.startsWith("paszar_lang="));

    if (!hasCookie && (current === "en" || current === "id")) {
      document.cookie = `paszar_lang=${current}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = current;
    } else {
      if (current !== initialLang) {
        useLangStore.setState({ lang: initialLang });
      }
      document.documentElement.lang = initialLang;
    }

    try {
      const savedPath = window.sessionStorage.getItem(SCROLL_PATH_KEY);
      const savedY = window.sessionStorage.getItem(SCROLL_Y_KEY);
      if (savedPath === window.location.pathname && savedY !== null) {
        const y = Number(savedY);
        window.sessionStorage.removeItem(SCROLL_PATH_KEY);
        window.sessionStorage.removeItem(SCROLL_Y_KEY);
        if (!Number.isNaN(y) && y > 0) {
          window.requestAnimationFrame(() => {
            window.scrollTo(0, y);
          });
        }
      }
    } catch {
      // Ignore storage access errors
    }
  }, [initialLang]);

  return (
    <InitialLangContext.Provider value={initialLang}>
      {children}

      {isTextMorphing && (
        <div
          role="status"
          aria-live="polite"
          aria-label={
            targetLang === "en"
              ? "Switching to English"
              : "Memuat Bahasa Indonesia"
          }
          className="fixed inset-0 z-[200] bg-stone-950/50 backdrop-blur-[2px] flex items-center justify-center animate-fade-in"
        >
          <div className="bg-stone-900 border border-stone-700/80 px-8 py-6 flex flex-col items-center gap-3.5">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-stone-700 border-t-[#D4943A] rounded-full animate-spin" />
              <span
                className="text-xs font-light text-white tracking-widest"
                style={{ fontFamily: "var(--font-display)" }}
              >
                P
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-[0.22em] text-stone-300 font-light">
              {targetLang === "en"
                ? "Switching to English..."
                : "Memuat Bahasa Indonesia..."}
            </span>
          </div>
        </div>
      )}
    </InitialLangContext.Provider>
  );
}
