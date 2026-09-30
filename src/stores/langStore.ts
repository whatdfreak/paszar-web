// ============================================================
// PASzar — Language Store (Zustand + localStorage persist)
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Lang = "en" | "id";

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: "id", // default: Bahasa Indonesia
      setLang: (lang) => set({ lang }),
    }),
    {
      name: "paszar-lang",
    }
  )
);
