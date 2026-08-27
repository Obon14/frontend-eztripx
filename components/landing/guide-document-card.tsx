"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { GuideCoverCarousel } from "@/components/landing/guide-cover-carousel";
import { useLanding } from "@/components/landing/language-provider";
import { PdfJsPreview } from "@/components/admin/pdf-js-preview";
import { Modal } from "@/components/ui/modal";
import {
  type PublicDocumentGuideCard,
} from "@/lib/document-guide/parse-public-list";
import { parseOrderResponse } from "@/lib/order/parse-order";
import type { OrderCurrency } from "@/types/order";
import { cn } from "@/lib/utils";

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

function pdfDownloadName(fileName: string): string {
  const t = fileName.trim() || "document.pdf";
  return /\.pdf$/i.test(t) ? t : `${t}.pdf`;
}

export function GuideDocumentCard({
  item,
  daysLabel,
  buyLabel,
  previewLabel,
  downloadLabel,
  processingLabel,
  priceUnavailableLabel,
  networkErrorLabel,
  previewLoadingLabel,
  previewErrorLabel,
  previewLimitedHint,
  previewFullHint,
  owned,
  onError,
}: {
  item: PublicDocumentGuideCard;
  daysLabel: string;
  buyLabel: string;
  previewLabel: string;
  downloadLabel: string;
  processingLabel: string;
  priceUnavailableLabel: string;
  networkErrorLabel: string;
  previewLoadingLabel: string;
  previewErrorLabel: string;
  previewLimitedHint: string;
  previewFullHint: string;
  owned: boolean;
  onError: (message: string) => void;
}) {
  const { locale, openRegister } = useLanding();
  const [buying, setBuying] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const previewAbortRef = useRef<AbortController | null>(null);
  const currency: OrderCurrency = "IDR";

  const closePreview = useCallback(() => {
    previewAbortRef.current?.abort();
    previewAbortRef.current = null;
    setPreviewOpen(false);
    setPreviewLoading(false);
    setPreviewError(null);
    setPreviewUrl((u) => {
      if (u) URL.revokeObjectURL(u);
      return null;
    });
  }, []);

  useEffect(() => {
    return () => {
      previewAbortRef.current?.abort();
      setPreviewUrl((u) => {
        if (u) URL.revokeObjectURL(u);
        return null;
      });
    };
  }, []);

  async function openPreview() {
    previewAbortRef.current?.abort();
    const ac = new AbortController();
    previewAbortRef.current = ac;

    setPreviewError(null);
    setPreviewUrl((u) => {
      if (u) URL.revokeObjectURL(u);
      return null;
    });
    setPreviewOpen(true);
    setPreviewLoading(true);

    try {
      const res = await fetch(
        `/api/document-guide/public/${encodeURIComponent(item.id)}/preview`,
        { signal: ac.signal, cache: "no-store" },
      );
      if (!res.ok) {
        let message = previewErrorLabel;
        try {
          const j: unknown = await res.json();
          if (
            typeof j === "object" &&
            j !== null &&
            "message" in j &&
            typeof (j as { message: string }).message === "string"
          ) {
            message = (j as { message: string }).message;
          }
        } catch {
          /* keep default */
        }
        setPreviewError(message);
        return;
      }
      const blob = await res.blob();
      if (ac.signal.aborted) return;
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setPreviewError(previewErrorLabel);
    } finally {
      if (!ac.signal.aborted) setPreviewLoading(false);
    }
  }

  async function handleBuy() {
    const price = item.priceIdr;
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
      if (order?.statusPayment === "PAID") {
        window.location.href = `/payment/return?orderId=${encodeURIComponent(order.id)}`;
        return;
      }
      onError(networkErrorLabel);
    } catch {
      onError(networkErrorLabel);
    } finally {
      setBuying(false);
    }
  }

  const previewHint =
    item.previewMode === "show"
      ? previewFullHint
      : previewLimitedHint.replace("{n}", String(item.previewPageCount));

  return (
    <>
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100/80 bg-white shadow-sm ring-1 ring-slate-900/[0.03] transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-landing-orange/20 dark:border-slate-800 dark:bg-slate-900 dark:ring-white/5">
        <div className="relative shrink-0">
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
        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 font-bold text-slate-900 dark:text-slate-100">{item.title}</h3>
          {item.locationLabel ? (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.locationLabel}</p>
          ) : null}
          {item.description ? (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {item.description}
            </p>
          ) : null}
          <div className="mt-auto space-y-3 pt-4">
            <p className="text-lg font-bold text-landing-orange">{displayPrice(item, locale)}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void openPreview()}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-landing-orange hover:text-landing-orange dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                {previewLabel}
              </button>
              {owned ? (
                <a
                  href={`/api/document-guide/${encodeURIComponent(item.id)}/download`}
                  download={pdfDownloadName(`${item.title}.pdf`)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg bg-landing-orange px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-landing-orange/20 transition hover:bg-[#e07830]",
                  )}
                >
                  <Download className="h-3.5 w-3.5" aria-hidden />
                  {downloadLabel}
                </a>
              ) : (
                <button
                  type="button"
                  disabled={buying}
                  onClick={() => void handleBuy()}
                  className="rounded-lg bg-landing-orange px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-landing-orange/20 transition hover:bg-[#e07830] disabled:opacity-50"
                >
                  {buying ? processingLabel : buyLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      </article>

      <Modal
        open={previewOpen}
        onClose={closePreview}
        title={item.title}
        description={previewHint}
        panelClassName="w-full max-w-[min(1280px,96vw)]"
        rootClassName="z-[100]"
        footer={
          owned && previewUrl && !previewLoading && !previewError ? (
            <div className="flex justify-end">
              <a
                href={`/api/document-guide/${encodeURIComponent(item.id)}/download`}
                download={pdfDownloadName(`${item.title}.pdf`)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                <Download className="h-4 w-4 shrink-0" aria-hidden />
                {downloadLabel}
              </a>
            </div>
          ) : null
        }
      >
        <div className="space-y-3">
          {previewLoading ? (
            <p className="py-16 text-center text-sm text-slate-500">{previewLoadingLabel}</p>
          ) : null}
          {previewError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
              {previewError}
            </div>
          ) : null}
          {previewUrl && !previewLoading ? <PdfJsPreview url={previewUrl} /> : null}
        </div>
      </Modal>
    </>
  );
}
