// ============================================================
// PASzar — useDictionary Hook
// ============================================================

"use client";

import { useEffectiveLang } from "@/components/public/LangHydrator";
import { en } from "@/dictionaries/en";
import { id } from "@/dictionaries/id";

const dictionaries = { en, id } as const;

export function useDictionary() {
  const lang = useEffectiveLang();
  return dictionaries[lang];
}
