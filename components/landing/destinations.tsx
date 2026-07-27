"use client";

import { ChevronLeft, ChevronRight, Compass, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { GuideDocumentCard } from "@/components/landing/guide-document-card";
import { useLandingSearch } from "@/components/landing/landing-search-provider";
import { useLanding } from "@/components/landing/language-provider";
import { Alert } from "@/components/ui/alert";
import {
  parsePublicGuideListResponse,
  type PublicDocumentGuideCard,
} from "@/lib/document-guide/parse-public-list";
import { parseOrderList } from "@/lib/order/parse-order";

export function DestinationsSection() {
  const { t, locale, currentUser } = useLanding();
  const { filters, searchVersion } = useLandingSearch();
  const [guides, setGuides] = useState<PublicDocumentGuideCard[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());

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

  const hasFilters =
    filters.regionIds.length > 0 ||
    filters.countryIds.length > 0 ||
    filters.cityIds.length > 0 ||
    filters.tripDays != null;

  const loadGuides = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "24",
        search: "",
        locale,
      });

      // Empty search → popular (PAID count); with filters → match filter (newest).
      if (!hasFilters) {
        params.set("sort", "popular");
      } else {
        for (const id of filters.regionIds) {
          params.append("regionIds", String(id));
        }
        for (const id of filters.countryIds) {
          params.append("countryIds", String(id));
        }
        for (const id of filters.cityIds) {
          params.append("cityIds", String(id));
        }
        if (filters.tripDays != null) {
          params.set("tripDays", String(filters.tripDays));
        }
      }

      const res = await fetch(`/api/document-guide/public?${params}`);
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setGuides([]);
        setError(t.destinations.loadError);
        return;
      }
      const parsed = parsePublicGuideListResponse(body);
      setGuides(parsed.data);
      setIndex(0);
    } catch {
      setGuides([]);
      setError(t.destinations.loadError);
    } finally {
      setLoading(false);
    }
  }, [
    t.destinations.loadError,
    locale,
    hasFilters,
    filters.regionIds,
    filters.countryIds,
    filters.cityIds,
    filters.tripDays,
  ]);

  useEffect(() => {
    void loadGuides();
  }, [loadGuides, searchVersion]);

  const visible = guides.slice(index, index + 3);
  const canPrev = index > 0;
  const canNext = index + 3 < guides.length;

  function daysLabel(days: number | null): string {
    if (!days || days < 1) return "";
    return `${days} ${t.destinations.days}`;
  }

  return (
    <section id="services" className="bg-gradient-to-b from-slate-50/80 to-white py-16 sm:py-20 dark:from-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-landing-orange">
              {locale === "id" ? "Panduan perjalanan" : "Travel guides"}
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
              {hasFilters ? (
                <>
                  {t.destinations.titleFiltered}{" "}
                  <span className="text-landing-orange">{t.destinations.titleFilteredHighlight}</span>
                </>
              ) : (
                <>
                  {t.destinations.title}{" "}
                  <span className="text-landing-orange">{t.destinations.titleHighlight}</span>
                </>
              )}
            </h2>
          </div>
          {guides.length > 3 ? (
            <div className="flex gap-2">
              <CarouselBtn disabled={!canPrev} onClick={() => setIndex((i) => Math.max(0, i - 1))}>
                <ChevronLeft className="h-4 w-4" />
              </CarouselBtn>
              <CarouselBtn
                disabled={!canNext}
                onClick={() =>
                  setIndex((i) => Math.min(Math.max(0, guides.length - 3), i + 1))
                }
              >
                <ChevronRight className="h-4 w-4" />
              </CarouselBtn>
            </div>
          ) : null}
        </div>

        {error ? <Alert variant="error">{error}</Alert> : null}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
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
              {hasFilters ? (
                <Search className="h-6 w-6 text-landing-orange" aria-hidden />
              ) : (
                <Compass className="h-6 w-6 text-landing-orange" aria-hidden />
              )}
            </span>
            <p className="mt-4 text-base font-semibold text-slate-800 dark:text-slate-200">
              {hasFilters ? t.destinations.emptyFiltered : t.destinations.empty}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t.destinations.emptyHint}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item) => (
              <GuideDocumentCard
                key={item.id}
                item={item}
                daysLabel={daysLabel(item.tripDays)}
                buyLabel={t.destinations.buy}
                previewLabel={t.destinations.preview}
                downloadLabel={t.destinations.download}
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
      </div>
    </section>
  );
}

function CarouselBtn({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-landing-orange hover:text-landing-orange disabled:opacity-30 dark:border-slate-700 dark:text-slate-300"
    >
      {children}
    </button>
  );
}
