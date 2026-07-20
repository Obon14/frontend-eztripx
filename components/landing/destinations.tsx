"use client";

import { ChevronLeft, ChevronRight, Compass, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { GuideCoverCarousel } from "@/components/landing/guide-cover-carousel";
import { useLandingSearch } from "@/components/landing/landing-search-provider";
import { useLanding } from "@/components/landing/language-provider";
import { Alert } from "@/components/ui/alert";
import {
  parsePublicGuideListResponse,
  type PublicDocumentGuideCard,
} from "@/lib/document-guide/parse-public-list";
import { parseOrderResponse } from "@/lib/order/parse-order";
import type { OrderCurrency } from "@/types/order";

const formatIdr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const formatUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function DestinationsSection() {
  const { t, locale, openRegister } = useLanding();
  const { filters, searchVersion } = useLandingSearch();
  const [guides, setGuides] = useState<PublicDocumentGuideCard[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buyingId, setBuyingId] = useState<string | null>(null);

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

  const currency: OrderCurrency = locale === "id" ? "IDR" : "USD";

  async function handleBuy(guide: PublicDocumentGuideCard) {
    const price = currency === "IDR" ? guide.priceIdr : guide.priceUsd;
    if (!price || Number(price) <= 0) {
      setError(t.destinations.priceUnavailable);
      return;
    }

    setBuyingId(guide.id);
    setError("");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          documentGuideId: guide.id,
          currency,
        }),
      });
      const body = await res.json().catch(() => null);

      if (res.status === 401) {
        openRegister();
        return;
      }

      if (!res.ok) {
        const msg =
          body && typeof body === "object" && "message" in body && typeof body.message === "string"
            ? body.message
            : t.auth.networkError;
        setError(msg);
        return;
      }

      const order = parseOrderResponse(body);
      if (order?.paymentUrl) {
        window.location.href = order.paymentUrl;
        return;
      }
      setError(t.auth.networkError);
    } catch {
      setError(t.auth.networkError);
    } finally {
      setBuyingId(null);
    }
  }

  function displayPrice(guide: PublicDocumentGuideCard): string {
    if (locale === "id") {
      const n = guide.priceIdr ? Number(guide.priceIdr) : 0;
      return n > 0 ? formatIdr.format(n) : "—";
    }
    const n = guide.priceUsd ? Number(guide.priceUsd) : 0;
    return n > 0 ? formatUsd.format(n) : "—";
  }

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
              <article
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-slate-100/80 bg-white shadow-sm ring-1 ring-slate-900/[0.03] transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-landing-orange/20 dark:border-slate-800 dark:bg-slate-900 dark:ring-white/5"
              >
                <div className="relative">
                  <GuideCoverCarousel
                    guideId={item.id}
                    coverImages={item.coverImages}
                    alt={item.title}
                  />
                  {item.tripDays ? (
                    <span className="absolute right-3 top-3 z-10 rounded-full bg-landing-orange px-2.5 py-1 text-xs font-bold text-white">
                      {daysLabel(item.tripDays)}
                    </span>
                  ) : null}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">{item.title}</h3>
                  {item.locationLabel ? (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.locationLabel}</p>
                  ) : null}
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <p className="text-lg font-bold text-landing-orange">
                      {displayPrice(item)}
                    </p>
                    <button
                      type="button"
                      disabled={buyingId === item.id}
                      onClick={() => void handleBuy(item)}
                      className="shrink-0 rounded-lg bg-landing-orange px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-landing-orange/20 transition hover:bg-[#e07830] disabled:opacity-50"
                    >
                      {buyingId === item.id ? t.destinations.processing : t.destinations.buy}
                    </button>
                  </div>
                </div>
              </article>
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
