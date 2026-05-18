"use client";

import { Check, ChevronDown, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type AsyncMultiOption = { id: string; label: string };

export type AsyncMultiLoadPageResult = { options: AsyncMultiOption[]; hasMore: boolean };

type AsyncMultiSelectProps = {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  loadPage: (query: string, page: number) => Promise<AsyncMultiLoadPageResult>;
  /** Labels for ids set from outside the dropdown (e.g. auto-filled from city). */
  resolvedLabels?: Record<string, string>;
  className?: string;
  emptyHint?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  debounceMs?: number;
};

function mergeOptionMaps(prev: AsyncMultiOption[], more: AsyncMultiOption[]): AsyncMultiOption[] {
  const seen = new Set(prev.map((p) => p.id));
  const out = [...prev];
  for (const o of more) {
    if (seen.has(o.id)) continue;
    seen.add(o.id);
    out.push(o);
  }
  return out;
}

function summaryFromLabels(
  value: string[],
  labels: Map<string, string>,
  resolved: Record<string, string> | undefined,
  placeholder: string,
) {
  if (value.length === 0) return placeholder;
  const names = value.map((id) => labels.get(id) ?? resolved?.[id] ?? id);
  if (names.length <= 2) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
}

function displayLabel(
  id: string,
  labels: Map<string, string>,
  resolved: Record<string, string> | undefined,
): string {
  return labels.get(id) ?? resolved?.[id] ?? id;
}

export function AsyncMultiSelect({
  label,
  value,
  onChange,
  loadPage,
  resolvedLabels,
  className,
  emptyHint = "No options.",
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  disabled = false,
  debounceMs = 300,
}: AsyncMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<AsyncMultiOption[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [labels, setLabels] = useState<Map<string, string>>(() => new Map());
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const skipDebounceOnce = useRef(false);
  const loadSeq = useRef(0);
  const nextPageRef = useRef(2);

  const mergeLabels = useCallback((opts: AsyncMultiOption[]) => {
    setLabels((prev) => {
      const next = new Map(prev);
      for (const o of opts) {
        next.set(o.id, o.label);
      }
      return next;
    });
  }, []);

  const runReplace = useCallback(
    async (q: string) => {
      const seq = ++loadSeq.current;
      setLoading(true);
      nextPageRef.current = 2;
      try {
        const { options: list, hasMore: more } = await loadPage(q, 1);
        if (seq !== loadSeq.current) return;
        setOptions(list);
        setHasMore(more);
        mergeLabels(list);
      } catch {
        if (seq !== loadSeq.current) return;
        setOptions([]);
        setHasMore(false);
      } finally {
        if (seq === loadSeq.current) setLoading(false);
      }
    },
    [loadPage, mergeLabels],
  );

  const runAppend = useCallback(async () => {
    const seq = loadSeq.current;
    if (!hasMore || loading || loadingMore) return;
    const q = query.trim();
    const page = nextPageRef.current;
    setLoadingMore(true);
    try {
      const { options: list, hasMore: more } = await loadPage(q, page);
      if (seq !== loadSeq.current) return;
      setOptions((prev) => mergeOptionMaps(prev, list));
      mergeLabels(list);
      if (list.length === 0) setHasMore(false);
      else setHasMore(more);
      if (list.length > 0) nextPageRef.current = page + 1;
    } catch {
      if (seq === loadSeq.current) setHasMore(false);
    } finally {
      if (seq === loadSeq.current) setLoadingMore(false);
    }
  }, [hasMore, loadPage, loading, loadingMore, mergeLabels, query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      skipDebounceOnce.current = false;
      return;
    }
    skipDebounceOnce.current = true;
    void runReplace("");
  }, [open, runReplace]);

  useEffect(() => {
    if (!open) return;
    if (skipDebounceOnce.current) {
      skipDebounceOnce.current = false;
      return;
    }
    const t = window.setTimeout(() => void runReplace(query.trim()), debounceMs);
    return () => window.clearTimeout(t);
  }, [query, open, debounceMs, runReplace]);

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

  function onListScroll() {
    const el = listRef.current;
    if (!el || !hasMore || loading || loadingMore) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight - scrollTop - clientHeight < 48) void runAppend();
  }

  function toggle(id: string, optionLabel: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      setLabels((prev) => {
        const next = new Map(prev);
        next.set(id, optionLabel);
        return next;
      });
      onChange([...value, id]);
    }
  }

  function removeId(id: string) {
    onChange(value.filter((v) => v !== id));
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const summary = summaryFromLabels(value, labels, resolvedLabels, placeholder);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 text-left text-sm text-slate-900 outline-none transition",
          "hover:border-slate-400 focus:border-admin-primary focus:ring-2 focus:ring-admin-primary/20",
          disabled && "cursor-not-allowed opacity-50",
          value.length === 0 && "text-slate-500",
        )}
      >
        <span className="min-w-0 flex-1 truncate">{summary}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-slate-500 transition", open && "rotate-180")}
        />
      </button>

      {value.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {value.map((id) => (
            <span
              key={id}
              className="inline-flex max-w-full items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-800"
            >
              <span className="truncate">{displayLabel(id, labels, resolvedLabels)}</span>
              <button
                type="button"
                disabled={disabled}
                className="rounded-full p-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50"
                aria-label={`Remove ${displayLabel(id, labels, resolvedLabels)}`}
                onClick={() => !disabled && removeId(id)}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {open ? (
        <div
          className="absolute left-0 right-0 z-[120] mt-1 rounded-lg border border-slate-200 bg-white py-2 shadow-lg"
          role="listbox"
          aria-multiselectable
        >
          <div className="border-b border-slate-200 bg-slate-50 px-2 pb-2 pt-1">
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
                  "h-9 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none",
                  "focus:border-admin-primary focus:ring-2 focus:ring-admin-primary/20",
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
                Clear all
              </button>
            ) : null}
          </div>

          <div
            ref={listRef}
            onScroll={onListScroll}
            className="max-h-72 overflow-y-auto px-1 pt-1"
          >
            {loading ? (
              <p className="px-2 py-3 text-sm text-slate-500">Loading…</p>
            ) : options.length === 0 ? (
              <p className="px-2 py-3 text-sm text-slate-500">{emptyHint}</p>
            ) : filtered.length === 0 ? (
              <p className="px-2 py-3 text-sm text-slate-500">No results for &quot;{query}&quot;</p>
            ) : (
              filtered.map((opt) => {
                const selected = value.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => toggle(opt.id, opt.label)}
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
            {loadingMore ? (
              <p className="px-2 py-2 text-center text-xs text-slate-500">Loading more…</p>
            ) : null}
            {!loading && !loadingMore && hasMore && options.length > 0 && filtered.length > 0 ? (
              <p className="px-2 pb-2 text-center text-[11px] text-slate-400">Scroll for more</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
