"use client";

import { ChevronLeft, ChevronRight, Compass, Search } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { GuideDocumentCard } from "@/components/landing/guide-document-card";
import { useLanding } from "@/components/landing/language-provider";
import { Alert } from "@/components/ui/alert";
import {
  parsePublicGuideListResponse,
  type PublicDocumentGuideCard,
} from "@/lib/document-guide/parse-public-list";
import type { ListMeta } from "@/types/geo-api";

const PAGE_SIZE = 10;

export function GuideDocumentCatalog() {
  const { t, locale } = useLanding();
  const [guides, setGuides] = useState<PublicDocumentGuideCard[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadGuides = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        search: appliedSearch,
        locale,
        sort: "newest",
      });
      const res = await fetch(`/api/document-guide/public?${params}`);
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setGuides([]);
        setMeta(null);
        setError(t.guides.loadError);
        return;
      }
      const parsed = parsePublicGuideListResponse(body);
      setGuides(parsed.data);
      setMeta(parsed.meta);
    } catch {
      setGuides([]);
      setMeta(null);
      setError(t.guides.loadError);
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, locale, page, t.guides.loadError]);

  useEffect(() => {
    void loadGuides();
  }, [loadGuides]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, appliedSearch]);

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(searchInput.trim());
  }

  function clearSearch() {
    setSearchInput("");
    setPage(1);
    setAppliedSearch("");
  }

  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total ?? 0;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  function daysLabel(days: number | null): string {
    if (!days || days < 1) return "";
    return `${days} ${t.destinations.days}`;
  }

  return (
    <section className="bg-gradient-to-b from-slate-50/80 to-white py-12 sm:py-16 dark:from-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-landing-orange">
            {t.guides.eyebrow}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
            {t.guides.title}{" "}
            <span className="text-landing-orange">{t.guides.titleHighlight}</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {t.guides.subtitle}
          </p>
        </div>

        <form
          onSubmit={submitSearch}
          className="mb-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center dark:border-slate-700 dark:bg-slate-900"
        >
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">{t.guides.searchPlaceholder}</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t.guides.searchPlaceholder}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-landing-orange focus:ring-2 focus:ring-landing-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          <div className="flex shrink-0 gap-2">
            {appliedSearch ? (
              <button
                type="button"
                onClick={clearSearch}
                className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300"
              >
                {t.guides.clearSearch}
              </button>
            ) : null}
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-landing-orange px-5 text-sm font-semibold text-white shadow-sm shadow-landing-orange/20 transition hover:bg-[#e07830]"
            >
              <Search className="h-4 w-4" aria-hidden />
              {t.guides.search}
            </button>
          </div>
        </form>

        {!loading && !error && total > 0 ? (
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            {t.guides.resultsCount
              .replace("{shown}", String(guides.length))
              .replace("{total}", String(total))}
          </p>
        ) : null}

        {error ? (
          <div className="mb-6">
            <Alert variant="error">{error}</Alert>
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-8 w-full rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : guides.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-slate-200 bg-white px-8 py-14 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-landing-orange/10">
              {appliedSearch ? (
                <Search className="h-6 w-6 text-landing-orange" aria-hidden />
              ) : (
                <Compass className="h-6 w-6 text-landing-orange" aria-hidden />
              )}
            </span>
            <p className="mt-4 text-base font-semibold text-slate-800 dark:text-slate-200">
              {appliedSearch ? t.guides.emptySearch : t.guides.empty}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t.guides.emptyHint}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((item) => (
              <GuideDocumentCard
                key={item.id}
                item={item}
                daysLabel={daysLabel(item.tripDays)}
                buyLabel={t.destinations.buy}
                processingLabel={t.destinations.processing}
                priceUnavailableLabel={t.destinations.priceUnavailable}
                networkErrorLabel={t.auth.networkError}
                onError={setError}
              />
            ))}
          </div>
        )}

        {!loading && totalPages > 1 ? (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              disabled={!canPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex h-10 items-center gap-1 rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:border-landing-orange hover:text-landing-orange disabled:opacity-30 dark:border-slate-700 dark:text-slate-300"
            >
              <ChevronLeft className="h-4 w-4" />
              {t.guides.prevPage}
            </button>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {t.guides.pageOf
                .replace("{page}", String(page))
                .replace("{totalPages}", String(totalPages))}
            </span>
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex h-10 items-center gap-1 rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:border-landing-orange hover:text-landing-orange disabled:opacity-30 dark:border-slate-700 dark:text-slate-300"
            >
              {t.guides.nextPage}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
