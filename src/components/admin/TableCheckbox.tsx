"use client";

import { Check } from "lucide-react";

interface TableCheckboxProps {
  checked: boolean;
  onChange: () => void;
  ariaLabel: string;
}

export function TableCheckbox({
  checked,
  onChange,
  ariaLabel,
}: TableCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors cursor-pointer ${
        checked
          ? "bg-orange-500 border-orange-500 text-white"
          : "bg-white border-slate-200 hover:border-slate-300 text-transparent"
      }`}
    >
      <Check className="w-2.5 h-2.5 stroke-[3]" />
    </button>
  );
}
