"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

export interface AdminSelectOption {
  value: string;
  label: string;
}

interface AdminSelectProps {
  value: string;
  options: AdminSelectOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  disabled?: boolean;
  align?: "left" | "right";
  triggerClassName?: string;
  menuClassName?: string;
  placeholder?: string;
}

interface MenuPosition {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxHeight: number;
}

export function AdminSelect({
  value,
  options,
  onChange,
  ariaLabel,
  disabled = false,
  align = "left",
  triggerClassName = "",
  menuClassName = "",
  placeholder = "Pilih...",
}: AdminSelectProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<MenuPosition>({
    top: 0,
    left: 0,
    width: 140,
    maxHeight: 240,
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        (!menuRef.current || !menuRef.current.contains(target))
      ) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const handleScroll = (e: Event) => {
      if (
        menuRef.current &&
        e.target instanceof Node &&
        menuRef.current.contains(e.target)
      ) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);

    // Scroll opsi terpilih ke area pandang saat dropdown dibuka
    const selectedEl = menuRef.current?.querySelector(
      '[data-selected="true"]'
    );
    if (selectedEl instanceof HTMLElement) {
      selectedEl.scrollIntoView({ block: "nearest" });
    }
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [open]);

  const handleToggle = () => {
    if (disabled) return;
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const minW = Math.max(rect.width, 96);
      const left =
        align === "right"
          ? Math.max(8, rect.right - minW)
          : Math.min(rect.left, window.innerWidth - minW - 8);

      const estimatedHeight = Math.min(options.length * 32 + 12, 240);
      const spaceBelow = window.innerHeight - rect.bottom - 10;
      const spaceAbove = rect.top - 10;
      const openUpward =
        spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

      setCoords({
        top: openUpward ? undefined : rect.bottom + 6,
        bottom: openUpward ? window.innerHeight - rect.top + 6 : undefined,
        left,
        width: minW,
        maxHeight: Math.max(
          96,
          Math.min(240, openUpward ? spaceAbove : spaceBelow)
        ),
      });
    }
    setOpen((prev) => !prev);
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={handleToggle}
        className={
          triggerClassName ||
          "inline-flex items-center justify-between gap-2 h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
        }
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            data-admin-select-menu="true"
            style={{
              position: "fixed",
              top: coords.top !== undefined ? `${coords.top}px` : undefined,
              bottom:
                coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
              left: `${coords.left}px`,
              minWidth: `${coords.width}px`,
              maxWidth: "320px",
              maxHeight: `${coords.maxHeight}px`,
            }}
            className={`flex flex-col bg-white border border-slate-200 rounded-xl shadow-lg z-[200] p-1 overflow-y-auto ${menuClassName}`}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  data-selected={isSelected ? "true" : undefined}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isSelected
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}
