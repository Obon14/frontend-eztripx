"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type MultiSelectOption = {
  id: string;
  label: string;
};

type MultiSelectDropdownProps = {
  label: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (next: string[]) => void;
  className?: string;
  emptyHint?: string;
  placeholder?: string;
  searchPlaceholder?: string;
};

function selectionSummary(options: MultiSelectOption[], value: string[], placeholder: string) {
  if (value.length === 0) return placeholder;
  const labels = value
    .map((id) => options.find((o) => o.id === id)?.label)
    .filter((x): x is string => Boolean(x));
  if (labels.length === 0) return placeholder;
  if (labels.length <= 2) return labels.join(", ");
  return `${labels.slice(0, 2).join(", ")} +${labels.length - 2}`;
}

export function MultiSelectDropdown({
  label,
  options,
  value,
  onChange,
  className,
  emptyHint = "Tidak ada pilihan.",
  placeholder = "Klik untuk memilih…",
  searchPlaceholder = "Cari…",
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      const el = rootRef.current;
      if (!el || !(e.target instanceof Node) || el.contains(e.target)) return;
      setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  function handleTriggerClick() {
    if (!open) {
      setQuery("");
      setOpen(true);
    } else {
      setOpen(false);
    }
  }

  const summary = selectionSummary(options, value, placeholder);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={handleTriggerClick}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 text-left text-sm text-slate-900 outline-none transition",
          "hover:border-slate-400 focus:border-admin-primary focus:ring-2 focus:ring-admin-primary/20",
          value.length === 0 && "text-slate-500",
        )}
      >
        <span className="min-w-0 flex-1 truncate">{summary}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-slate-500 transition", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div
          className="absolute left-0 right-0 z-[100] mt-1 rounded-lg border border-slate-200 bg-white py-2 shadow-lg"
          role="listbox"
          aria-multiselectable
        >
          <div className="border-b border-slate-200 bg-slate-100 px-2 pb-2 pt-1">
            <p className="mb-1.5 px-0.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Cari dalam daftar
            </p>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className={cn(
                  "h-10 w-full rounded-md border-2 border-slate-400 bg-white pl-10 pr-3 text-sm text-slate-900 shadow-sm outline-none",
                  "placeholder:text-slate-500",
                  "focus:border-admin-primary focus:ring-2 focus:ring-admin-primary/35",
                )}
                autoFocus
              />
            </div>
            {value.length > 0 ? (
              <button
                type="button"
                className="mt-1.5 text-xs font-medium text-admin-primary-700 hover:underline"
                onClick={() => onChange([])}
              >
                Hapus semua pilihan
              </button>
            ) : null}
          </div>

          <div className="max-h-52 overflow-y-auto px-1 pt-1">
            {options.length === 0 ? (
              <p className="px-2 py-3 text-sm text-slate-500">{emptyHint}</p>
            ) : filtered.length === 0 ? (
              <p className="px-2 py-3 text-sm text-slate-500">Tidak ada hasil untuk &quot;{query}&quot;</p>
            ) : (
              filtered.map((opt) => {
                const selected = value.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => toggle(opt.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm text-slate-800",
                      selected ? "bg-admin-primary-50 font-medium" : "hover:bg-slate-50",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                    {selected ? (
                      <Check className="h-4 w-4 shrink-0 text-admin-primary-700" aria-hidden />
                    ) : (
                      <span className="h-4 w-4 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
