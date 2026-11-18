// ============================================================
// PASzar — Language Store (Spinning Emblem + Native Reload)
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Lang = "en" | "id";

const STORAGE_KEY = "paszar-lang";
export const SCROLL_Y_KEY = "paszar-scroll-y";
export const SCROLL_PATH_KEY = "paszar-scroll-path";

function getInitialClientLang(): Lang {
  if (typeof window === "undefined") return "id";

  try {
    const cookieMatch = document.cookie
      .split("; ")
      .find((row) => row.startsWith("paszar_lang="));
    const cookieVal = cookieMatch?.split("=")[1];
    if (cookieVal === "en" || cookieVal === "id") {
      return cookieVal;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: { lang?: string } };
      if (parsed.state?.lang === "en" || parsed.state?.lang === "id") {
        return parsed.state.lang;
      }
    }
  } catch {
    // Ignore storage read errors
  }

  return "id";
}

interface LangState {
  lang: Lang;
  isTextMorphing: boolean;
  targetLang: Lang | null;
  switchLang: (nextLang: Lang) => void;
  setLang: (nextLang: Lang) => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set, get) => ({
      lang: getInitialClientLang(),
      isTextMorphing: false,
      targetLang: null,
      switchLang: (nextLang) => {
        if (nextLang === get().lang || get().isTextMorphing) return;

        if (typeof window === "undefined") {
          set({ lang: nextLang });
          return;
        }

        // Keep `lang` unchanged on the visible page until the browser finishes reloading
        set({ isTextMorphing: true, targetLang: nextLang });

        try {
          window.sessionStorage.setItem(SCROLL_Y_KEY, String(window.scrollY));
          window.sessionStorage.setItem(
            SCROLL_PATH_KEY,
            window.location.pathname
          );
          window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ state: { lang: nextLang }, version: 0 })
          );
        } catch {
          // Ignore storage write errors
        }

        document.cookie = `paszar_lang=${nextLang}; path=/; max-age=31536000; SameSite=Lax`;

        window.setTimeout(() => {
          window.location.reload();
        }, 260);
      },
      setLang: (nextLang) => {
        get().switchLang(nextLang);
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ lang: state.lang }),
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== "undefined") {
          document.documentElement.lang = state.lang;
        }
      },
    }
  )
);
