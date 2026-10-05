"use client";

import { Calendar, ChevronLeft, ChevronRight, Compass, MapPin, Search } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { GuideDocumentCard } from "@/components/landing/guide-document-card";
import {
  HeroLocationPicker,
  type LocationSelection,
} from "@/components/landing/hero-location-picker";
import { useLanding } from "@/components/landing/language-provider";
import { Alert } from "@/components/ui/alert";
import {
  parsePublicGuideListResponse,
  type PublicDocumentGuideCard,
} from "@/lib/document-guide/parse-public-list";
import { parseOrderList } from "@/lib/order/parse-order";
import type { ListMeta } from "@/types/geo-api";

const PAGE_SIZE = 10;

const emptyLocation: LocationSelection = {
  regions: [],
  countries: [],
  cities: [],
};

type AppliedFilters = {
  search: string;
  regionIds: number[];
  countryIds: number[];
  cityIds: number[];
  tripDays: number | null;
};

function locationToIds(location: LocationSelection) {
  return {
    regionIds: location.regions.map((r) => Number(r.id)).filter(Number.isFinite),
    countryIds: location.countries.map((c) => Number(c.id)).filter(Number.isFinite),
    cityIds: location.cities.map((c) => Number(c.id)).filter(Number.isFinite),
  };
}

function hasAnyFilter(f: AppliedFilters): boolean {
  return (
    f.search.length > 0 ||
    f.regionIds.length > 0 ||
    f.countryIds.length > 0 ||
    f.cityIds.length > 0 ||
    f.tripDays != null
  );
}

export function GuideDocumentCatalog() {
  const { t, locale, currentUser } = useLanding();
  const searchParams = useSearchParams();
  const urlSearch = (searchParams.get("search") ?? "").trim();
  const [guides, setGuides] = useState<PublicDocumentGuideCard[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [location, setLocation] = useState<LocationSelection>(emptyLocation);
  const [tripDays, setTripDays] = useState("");
  const [applied, setApplied] = useState<AppliedFilters>({
    search: urlSearch,
    regionIds: [],
    countryIds: [],
    cityIds: [],
    tripDays: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const next = (searchParams.get("search") ?? "").trim();
    setSearchInput(next);
    setPage(1);
    setApplied((prev) => ({ ...prev, search: next }));
  }, [searchParams]);

  const loadOwned = useCallback(async () => {
    if (!currentUser) {
      setOwnedIds(new Set());
      return;
    }
    try {
      const res = await fetch("/api/order", { credentials: "include" });
      if (!res.ok) {
        setOwnedIds(new Set());
        return;
      }
      const body = await res.json().catch(() => null);
      const orders = parseOrderList(body);
      setOwnedIds(
        new Set(
          orders
            .filter((o) => o.statusPayment === "PAID" && o.documentGuide.id)
            .map((o) => o.documentGuide.id),
        ),
      );
    } catch {
      setOwnedIds(new Set());
    }
  }, [currentUser]);

  useEffect(() => {
    void loadOwned();
  }, [loadOwned]);

  const loadGuides = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        search: applied.search,
        locale,
        sort: "newest",
      });
      for (const id of applied.regionIds) {
        params.append("regionIds", String(id));
      }
      for (const id of applied.countryIds) {
        params.append("countryIds", String(id));
      }
      for (const id of applied.cityIds) {
        params.append("cityIds", String(id));
      }
      if (applied.tripDays != null) {
        params.set("tripDays", String(applied.tripDays));
      }

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
  }, [applied, locale, page, t.guides.loadError]);

  useEffect(() => {
    void loadGuides();
  }, [loadGuides]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, applied]);

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    const ids = locationToIds(location);
    const daysRaw = tripDays.trim();
    const daysNum = daysRaw ? Number(daysRaw) : null;
    const nextTripDays =
      daysNum != null && Number.isInteger(daysNum) && daysNum >= 1 && daysNum <= 365
        ? daysNum
        : null;

    setPage(1);
    setApplied({
      search: searchInput.trim(),
      regionIds: ids.regionIds,
      countryIds: ids.countryIds,
      cityIds: ids.cityIds,
      tripDays: nextTripDays,
    });
  }

  function clearFilters() {
    setSearchInput("");
    setLocation(emptyLocation);
    setTripDays("");
    setPage(1);
    setApplied({
      search: "",
      regionIds: [],
      countryIds: [],
      cityIds: [],
      tripDays: null,
    });
  }

  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total ?? 0;
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const filtersActive = hasAnyFilter(applied);

  function daysLabel(days: number | null): string {
    if (!days || days < 1) return "";
    return `${days} ${t.destinations.days}`;
  }

  function emptyMessage(): { title: string; hint: string } {
    if (!filtersActive) {
      return { title: t.guides.empty, hint: t.guides.emptyHint };
    }
    if (
      applied.search &&
      applied.regionIds.length === 0 &&
      applied.countryIds.length === 0 &&
      applied.cityIds.length === 0 &&
      applied.tripDays == null
    ) {
      return { title: t.guides.emptySearch, hint: t.guides.emptyHint };
    }
    return { title: t.guides.emptyFiltered, hint: t.guides.emptyHint };
  }

  const emptyCopy = emptyMessage();

  return (
    <section className="relative overflow-hidden bg-slate-50 py-16 sm:py-24 dark:bg-[#0b1120]">
      {/* Decorative ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-landing-peach/30 blur-[120px] dark:bg-landing-peach/5" />
        <div className="absolute -right-1/4 bottom-0 h-[600px] w-[600px] rounded-full bg-landing-orange/10 blur-[120px] dark:bg-emerald-500/5" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-landing-orange">
            {t.guides.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">
            {t.guides.title}{" "}
            <span className="bg-gradient-to-r from-landing-orange to-[#ffb347] bg-clip-text text-transparent">{t.guides.titleHighlight}</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {t.guides.subtitle}
          </p>
        </div>

        <form
          onSubmit={submitSearch}
          className="mb-12 rounded-[2rem] border border-white/50 bg-white/70 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-landing-orange/10 dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-none"
        >
          <div className="flex flex-col lg:flex-row lg:items-center">
            <div className="relative flex-1 border-b border-slate-100 transition-colors hover:bg-slate-50/50 lg:border-b-0 lg:border-r dark:border-slate-800 dark:hover:bg-slate-800/30 rounded-tl-[2rem] lg:rounded-l-[2rem]">
              <div className="flex items-center px-6 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <MapPin className="h-5 w-5 text-landing-orange" aria-hidden />
                </div>
                <div className="ml-4 flex-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {t.hero.location}
                  </label>
                  <div className="mt-0.5 w-full">
                    <HeroLocationPicker value={location} onChange={setLocation} />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative border-b border-slate-100 transition-colors hover:bg-slate-50/50 lg:w-48 lg:border-b-0 lg:border-r dark:border-slate-800 dark:hover:bg-slate-800/30">
              <div className="flex items-center px-6 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <Calendar className="h-5 w-5 text-landing-orange" aria-hidden />
                </div>
                <div className="ml-4 flex-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {t.hero.duration}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    placeholder={t.hero.durationPlaceholder}
                    value={tripDays}
                    onChange={(e) => setTripDays(e.target.value)}
                    className="mt-0.5 block w-full border-none bg-transparent p-0 text-base font-semibold text-slate-900 placeholder-slate-400 focus:ring-0 dark:text-slate-100 dark:placeholder-slate-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>

            <div className="relative flex-1 border-b border-slate-100 transition-colors hover:bg-slate-50/50 lg:border-b-0 lg:border-r dark:border-slate-800 dark:hover:bg-slate-800/30">
              <div className="flex items-center px-6 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <Search className="h-5 w-5 text-landing-orange" aria-hidden />
                </div>
                <div className="ml-4 flex-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {t.guides.search}
                  </label>
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={t.guides.searchPlaceholder}
                    className="mt-0.5 block w-full border-none bg-transparent p-0 text-base font-semibold text-slate-900 placeholder-slate-400 focus:ring-0 dark:text-slate-100 dark:placeholder-slate-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex p-4 gap-3 lg:pr-6">
              {filtersActive ||
              searchInput ||
              tripDays ||
              location.regions.length > 0 ||
              location.countries.length > 0 ||
              location.cities.length > 0 ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex h-14 items-center justify-center rounded-full border-2 border-slate-200 px-6 text-sm font-bold text-slate-600 transition-all hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-100 flex-1 lg:flex-none"
                >
                  {t.guides.clearSearch}
                </button>
              ) : null}
              <button
                type="submit"
                className="flex h-14 items-center justify-center gap-2 rounded-full bg-landing-orange px-8 text-base font-bold text-white shadow-xl shadow-landing-orange/30 transition-all hover:scale-105 hover:bg-[#e07830] active:scale-[0.98] flex-1 lg:flex-none"
              >
                <Search className="h-5 w-5" strokeWidth={2.5} />
                {t.guides.search}
              </button>
            </div>
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
              {filtersActive ? (
                <Search className="h-6 w-6 text-landing-orange" aria-hidden />
              ) : (
                <Compass className="h-6 w-6 text-landing-orange" aria-hidden />
              )}
            </span>
            <p className="mt-4 text-base font-semibold text-slate-800 dark:text-slate-200">
              {emptyCopy.title}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{emptyCopy.hint}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((item) => (
              <GuideDocumentCard
                key={item.id}
                item={item}
                daysLabel={daysLabel(item.tripDays)}
                buyLabel={t.guides.buy}
                previewLabel={t.guides.preview}
                downloadLabel={t.guides.download}
                processingLabel={t.destinations.processing}
                priceUnavailableLabel={t.destinations.priceUnavailable}
                networkErrorLabel={t.auth.networkError}
                previewLoadingLabel={t.destinations.previewLoading}
                previewErrorLabel={t.destinations.previewError}
                previewLimitedHint={t.destinations.previewLimitedHint}
                previewFullHint={t.destinations.previewFullHint}
                owned={ownedIds.has(item.id)}
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
