"use client";

import { useState } from "react";
import { GuideCoverCarousel } from "@/components/landing/guide-cover-carousel";
import { useLanding } from "@/components/landing/language-provider";
import {
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

function displayPrice(guide: PublicDocumentGuideCard, locale: "id" | "en"): string {
  if (locale === "id") {
    const n = guide.priceIdr ? Number(guide.priceIdr) : 0;
    return n > 0 ? formatIdr.format(n) : "—";
  }
  const n = guide.priceUsd ? Number(guide.priceUsd) : 0;
  return n > 0 ? formatUsd.format(n) : "—";
}

export function GuideDocumentCard({
  item,
  daysLabel,
  buyLabel,
  processingLabel,
  priceUnavailableLabel,
  networkErrorLabel,
  onError,
}: {
  item: PublicDocumentGuideCard;
  daysLabel: string;
  buyLabel: string;
  processingLabel: string;
  priceUnavailableLabel: string;
  networkErrorLabel: string;
  onError: (message: string) => void;
}) {
  const { locale, openRegister } = useLanding();
  const [buying, setBuying] = useState(false);
  const currency: OrderCurrency = locale === "id" ? "IDR" : "USD";

  async function handleBuy() {
    const price = currency === "IDR" ? item.priceIdr : item.priceUsd;
    if (!price || Number(price) <= 0) {
      onError(priceUnavailableLabel);
      return;
    }

    setBuying(true);
    onError("");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          documentGuideId: item.id,
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
            : networkErrorLabel;
        onError(msg);
        return;
      }

      const order = parseOrderResponse(body);
      if (order?.paymentUrl) {
        window.location.href = order.paymentUrl;
        return;
      }
      onError(networkErrorLabel);
    } catch {
      onError(networkErrorLabel);
    } finally {
      setBuying(false);
    }
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-100/80 bg-white shadow-sm ring-1 ring-slate-900/[0.03] transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-landing-orange/20 dark:border-slate-800 dark:bg-slate-900 dark:ring-white/5">
      <div className="relative">
        <GuideCoverCarousel
          guideId={item.id}
          coverImages={item.coverImages}
          alt={item.title}
        />
        {item.tripDays ? (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-landing-orange px-2.5 py-1 text-xs font-bold text-white">
            {daysLabel}
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-900 dark:text-slate-100">{item.title}</h3>
        {item.locationLabel ? (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.locationLabel}</p>
        ) : null}
        <div className="mt-4 flex items-center justify-between gap-2">
          <p className="text-lg font-bold text-landing-orange">{displayPrice(item, locale)}</p>
          <button
            type="button"
            disabled={buying}
            onClick={() => void handleBuy()}
            className="shrink-0 rounded-lg bg-landing-orange px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-landing-orange/20 transition hover:bg-[#e07830] disabled:opacity-50"
          >
            {buying ? processingLabel : buyLabel}
          </button>
        </div>
      </div>
    </article>
  );
}
