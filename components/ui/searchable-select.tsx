"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  /** Compact inline style for hero/search bars — hides visible label */
  variant?: "default" | "compact";
};

type PanelPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

function computePanelPosition(trigger: HTMLButtonElement): PanelPosition {
  const rect = trigger.getBoundingClientRect();
  const gap = 6;
  const viewportPad = 8;
  const preferredMax = 280;
  const spaceBelow = window.innerHeight - rect.bottom - viewportPad;
  const spaceAbove = rect.top - viewportPad;
  const openUp = spaceBelow < 200 && spaceAbove > spaceBelow;

  const maxHeight = Math.min(
    preferredMax,
    openUp ? spaceAbove - gap : spaceBelow - gap,
  );

  const top = openUp
    ? Math.max(viewportPad, rect.top - gap - maxHeight)
    : rect.bottom + gap;

  const width = Math.max(rect.width, 220);
  let left = rect.left;
  if (left + width > window.innerWidth - viewportPad) {
    left = window.innerWidth - viewportPad - width;
  }
  left = Math.max(viewportPad, left);

  return { top, left, width, maxHeight: Math.max(120, maxHeight) };
}

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
  variant = "default",
}: SearchableSelectProps) {
  const compact = variant === "compact";
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<SearchableSelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [panelPos, setPanelPos] = useState<PanelPosition | null>(null);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const skipQueryDebounceOnce = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const updatePanelPosition = useCallback(() => {
    if (!triggerRef.current) return;
    setPanelPos(computePanelPosition(triggerRef.current));
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setPanelPos(null);
      skipQueryDebounceOnce.current = false;
      return;
    }
    skipQueryDebounceOnce.current = true;
    updatePanelPosition();
    void runLoad("");
  }, [open, runLoad, updatePanelPosition]);

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
    const onReposition = () => updatePanelPosition();
    window.addEventListener("scroll", onReposition, true);
    window.addEventListener("resize", onReposition);
    return () => {
      window.removeEventListener("scroll", onReposition, true);
      window.removeEventListener("resize", onReposition);
    };
  }, [open, updatePanelPosition]);

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
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

  const panelContent = open && panelPos ? (
    <div
      ref={panelRef}
      role="listbox"
      className="fixed z-[200] rounded-xl border border-slate-200 bg-white py-2 shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5"
      style={{
        top: panelPos.top,
        left: panelPos.left,
        width: panelPos.width,
        maxHeight: panelPos.maxHeight,
      }}
    >
      <div className="shrink-0 border-b border-slate-100 bg-slate-50/80 px-2 pb-2 pt-1">
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
              "h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none",
              "focus:border-landing-orange focus:ring-2 focus:ring-landing-orange/15",
            )}
            autoFocus
          />
        </div>
        {value ? (
          <button
            type="button"
            className="mt-2 text-xs font-medium text-landing-orange hover:underline"
            onClick={() => onChange(null)}
          >
            Clear selection
          </button>
        ) : null}
      </div>

      <div
        className="overflow-y-auto px-1 pt-1"
        style={{ maxHeight: Math.max(80, panelPos.maxHeight - 72) }}
      >
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
                  "flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-sm text-slate-800",
                  selected ? "bg-landing-orange/10 font-medium" : "hover:bg-slate-50",
                )}
              >
                <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                {selected ? (
                  <Check className="h-4 w-4 shrink-0 text-landing-orange" aria-hidden />
                ) : (
                  <span className="h-4 w-4 shrink-0" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  ) : null;

  return (
    <div ref={rootRef} className="relative min-w-0">
      {compact ? (
        <span className="sr-only">{label}</span>
      ) : (
        <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      )}
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={compact ? label : undefined}
        disabled={disabled}
        onClick={handleTriggerClick}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg border bg-white text-left outline-none transition",
          compact
            ? "h-9 border-slate-200/80 px-2.5 text-sm hover:border-slate-300 focus:border-landing-orange focus:ring-2 focus:ring-landing-orange/15"
            : "h-10 border-slate-300 px-3 text-sm text-slate-900 hover:border-slate-400 focus:border-admin-primary focus:ring-2 focus:ring-admin-primary/20",
          disabled && "cursor-not-allowed opacity-50",
          !value && "text-slate-500",
          value && "font-medium text-slate-900",
          open && compact && "border-landing-orange ring-2 ring-landing-orange/15",
        )}
      >
        <span className="min-w-0 flex-1 truncate">{summary}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-slate-500 transition", open && "rotate-180")}
        />
      </button>

      {mounted && panelContent
        ? createPortal(panelContent, document.body)
        : null}
    </div>
  );
}
