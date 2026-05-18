"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type SearchableSelectOption = { id: string; label: string };

type SearchableSelectProps = {
  label: string;
  value: SearchableSelectOption | null;
  onChange: (next: SearchableSelectOption | null) => void;
  loadOptions: (query: string) => Promise<SearchableSelectOption[]>;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  emptyHint?: string;
  debounceMs?: number;
};

export function SearchableSelect({
  label,
  value,
  onChange,
  loadOptions,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  disabled = false,
  emptyHint = "No options.",
  debounceMs = 300,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<SearchableSelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const skipQueryDebounceOnce = useRef(false);

  const runLoad = useCallback(
    async (q: string) => {
      setLoading(true);
      try {
        const list = await loadOptions(q);
        setOptions(list);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [loadOptions],
  );

  useEffect(() => {
    if (!open) {
      setQuery("");
      skipQueryDebounceOnce.current = false;
      return;
    }
    skipQueryDebounceOnce.current = true;
    void runLoad("");
  }, [open, runLoad]);

  useEffect(() => {
    if (!open) return;
    if (skipQueryDebounceOnce.current) {
      skipQueryDebounceOnce.current = false;
      return;
    }
    const t = window.setTimeout(() => void runLoad(query.trim()), debounceMs);
    return () => window.clearTimeout(t);
  }, [query, open, debounceMs, runLoad]);

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

  function handleTriggerClick() {
    if (disabled) return;
    setOpen((o) => !o);
  }

  function selectOption(opt: SearchableSelectOption) {
    onChange(opt);
    setOpen(false);
    setQuery("");
  }

  const summary = value?.label ?? placeholder;

  return (
    <div ref={rootRef} className="relative">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={handleTriggerClick}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 text-left text-sm text-slate-900 outline-none transition",
          "hover:border-slate-400 focus:border-admin-primary focus:ring-2 focus:ring-admin-primary/20",
          disabled && "cursor-not-allowed opacity-50",
          !value && "text-slate-500",
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
        >
          <div className="border-b border-slate-200 bg-slate-50 px-2 pb-2 pt-1">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className={cn(
                  "h-9 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none",
                  "focus:border-admin-primary focus:ring-2 focus:ring-admin-primary/20",
                )}
                autoFocus
              />
            </div>
            {value ? (
              <button
                type="button"
                className="mt-2 text-xs font-medium text-admin-primary-700 hover:underline"
                onClick={() => onChange(null)}
              >
                Clear selection
              </button>
            ) : null}
          </div>

          <div className="max-h-52 overflow-y-auto px-1 pt-1">
            {loading ? (
              <p className="px-2 py-3 text-sm text-slate-500">Loading…</p>
            ) : options.length === 0 ? (
              <p className="px-2 py-3 text-sm text-slate-500">{emptyHint}</p>
            ) : (
              options.map((opt) => {
                const selected = value?.id === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => selectOption(opt)}
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
