// ============================================================
// PASzar — useDictionary Hook
// ============================================================
// Client-side hook. Subscribes to useLangStore and returns
// the correct dictionary object. Zero network — purely
// in-memory. Safe to use in any Client Component.
// ============================================================

"use client";

import { useLangStore } from "@/stores/langStore";
import { en } from "@/dictionaries/en";
import { id } from "@/dictionaries/id";

const dictionaries = { en, id } as const;

export function useDictionary() {
  const lang = useLangStore((s) => s.lang);
  return dictionaries[lang];
}
