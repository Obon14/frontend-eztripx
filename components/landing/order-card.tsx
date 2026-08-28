"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { PdfJsPreview } from "@/components/admin/pdf-js-preview";
import { ReviewFormModal } from "@/components/landing/review-form-modal";
import { useLanding } from "@/components/landing/language-provider";
import { Modal } from "@/components/ui/modal";
import { parseOrderResponse } from "@/lib/order/parse-order";
import type { OrderItem } from "@/types/order";
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

function formatPrice(price: string, currency: string): string {
  const n = Number(price);
  if (!Number.isFinite(n)) return price;
  if (currency === "USD") return formatUsd.format(n);
  return formatIdr.format(n);
}

function pdfDownloadName(fileName: string): string {
  const t = fileName.trim() || "document.pdf";
  return /\.pdf$/i.test(t) ? t : `${t}.pdf`;
}

const STATUS_CLASS: Record<OrderItem["statusPayment"], string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
  PAID: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-200",
  CANCELED: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
};

export function OrderCard({
  order,
  onError,
  onReviewed,
}: {
  order: OrderItem;
  onError: (message: string) => void;
  onReviewed?: () => void;
}) {
  const { t, locale, currentUser } = useLanding();
  const paid = order.statusPayment === "PAID";
  const pending = order.statusPayment === "PENDING";
  const [busy, setBusy] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const previewAbortRef = useRef<AbortController | null>(null);
  const previewLoadedRef = useRef(false);

  const closePreview = useCallback(() => {
    const shouldAskReview = paid && !order.hasReview && previewLoadedRef.current;
    previewAbortRef.current?.abort();
    previewAbortRef.current = null;
    previewLoadedRef.current = false;
    setPreviewOpen(false);
    setPreviewLoading(false);
    setPreviewError(null);
    setPreviewUrl((u) => {
      if (u) URL.revokeObjectURL(u);
      return null;
    });
    if (shouldAskReview) setReviewOpen(true);
  }, [order.hasReview, paid]);

  useEffect(() => {
    return () => {
      previewAbortRef.current?.abort();
      setPreviewUrl((u) => {
        if (u) URL.revokeObjectURL(u);
        return null;
      });
    };
  }, []);

  const statusLabel =
    order.statusPayment === "PENDING"
      ? t.orders.filterPending
      : order.statusPayment === "PAID"
        ? t.orders.filterPaid
        : order.statusPayment === "FAILED"
          ? t.orders.filterFailed
          : t.orders.filterCanceled;

  const orderedAt = (() => {
    if (!order.createdAt) return "—";
    const d = new Date(order.createdAt);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  })();

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

    const path = paid
      ? `/api/document-guide/${encodeURIComponent(order.documentGuide.id)}/preview`
      : `/api/document-guide/public/${encodeURIComponent(order.documentGuide.id)}/preview`;

    try {
      const res = await fetch(path, {
        signal: ac.signal,
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) {
        setPreviewError(t.orders.previewError);
        return;
      }
      const blob = await res.blob();
      if (ac.signal.aborted) return;
      previewLoadedRef.current = true;
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setPreviewError(t.orders.previewError);
    } finally {
      if (!ac.signal.aborted) setPreviewLoading(false);
    }
  }

  function handleContinuePay() {
    if (!order.paymentUrl) {
      onError(t.orders.noPaymentUrl);
      return;
    }
    window.location.href = order.paymentUrl;
  }

  async function handleBuyAgain() {
    if (!order.documentGuide.id) return;
    setBusy(true);
    onError("");
    try {
      const currency = "IDR";
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          documentGuideId: order.documentGuide.id,
          currency,
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          body && typeof body === "object" && "message" in body && typeof body.message === "string"
            ? body.message
            : t.auth.networkError;
        onError(msg);
        return;
      }
      const next = parseOrderResponse(body);
      if (next?.paymentUrl) {
        window.location.href = next.paymentUrl;
        return;
      }
      onError(t.orders.noPaymentUrl);
    } catch {
      onError(t.auth.networkError);
    } finally {
      setBusy(false);
    }
  }

  const canPreview = Boolean(order.documentGuide.id);

  return (
    <>
      <article className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.03] dark:border-slate-800 dark:bg-slate-900 dark:ring-white/5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold leading-snug text-slate-900 dark:text-slate-100">
            {order.documentGuide.title || "—"}
          </h2>
          <span
            className={cn(
              "mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
              STATUS_CLASS[order.statusPayment],
            )}
          >
            {statusLabel}
          </span>
          <p className="mt-2 text-sm font-semibold text-landing-orange">
            {formatPrice(order.price, order.currency)}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t.orders.dateLabel}: {orderedAt}
          </p>
        </div>
        <div className="flex shrink-0 flex-row flex-wrap items-center gap-2 sm:justify-end">
          {canPreview ? (
            <button
              type="button"
              onClick={() => void openPreview()}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-landing-orange hover:text-landing-orange dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              {t.orders.preview}
            </button>
          ) : null}
          {pending ? (
            <button
              type="button"
              onClick={handleContinuePay}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-landing-orange px-3 text-sm font-semibold text-white shadow-sm shadow-landing-orange/20 transition hover:bg-[#e07830]"
            >
              {t.orders.continuePay}
            </button>
          ) : null}
          {paid ? (
            <a
              href={`/api/document-guide/${encodeURIComponent(order.documentGuide.id)}/download`}
              download={pdfDownloadName(`${order.documentGuide.title}.pdf`)}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-landing-orange px-3 text-sm font-semibold text-white shadow-sm shadow-landing-orange/20 transition hover:bg-[#e07830]"
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
              {t.orders.download}
            </a>
          ) : null}
          {paid && !order.hasReview ? (
            <button
              type="button"
              onClick={() => setReviewOpen(true)}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-landing-orange hover:text-landing-orange dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              {t.review.write}
            </button>
          ) : null}
          {paid && order.hasReview ? (
            <span className="inline-flex h-9 items-center text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.review.submittedNote}
            </span>
          ) : null}
          {order.statusPayment === "FAILED" || order.statusPayment === "CANCELED" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleBuyAgain()}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-landing-orange px-3 text-sm font-semibold text-white shadow-sm shadow-landing-orange/20 transition hover:bg-[#e07830] disabled:opacity-50"
            >
              {busy ? t.destinations.processing : t.orders.buyAgain}
            </button>
          ) : null}
        </div>
      </article>

      <Modal
        open={previewOpen}
        onClose={closePreview}
        title={order.documentGuide.title || t.orders.preview}
        description={paid ? t.orders.previewPaidHint : t.orders.previewUnpaidHint}
        panelClassName="w-full max-w-[min(1280px,96vw)]"
        rootClassName="z-[100]"
        footer={
          paid && previewUrl && !previewLoading && !previewError ? (
            <div className="flex justify-end">
              <a
                href={`/api/document-guide/${encodeURIComponent(order.documentGuide.id)}/download`}
                download={pdfDownloadName(`${order.documentGuide.title}.pdf`)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                {t.orders.download}
              </a>
            </div>
          ) : undefined
        }
      >
        {previewLoading ? (
          <p className="text-sm text-slate-500">{t.orders.previewLoading}</p>
        ) : previewError ? (
          <p className="text-sm text-red-600 dark:text-red-300">{previewError}</p>
        ) : previewUrl ? (
          <PdfJsPreview url={previewUrl} />
        ) : null}
      </Modal>
      <ReviewFormModal
        open={reviewOpen}
        guideTitle={order.documentGuide.title}
        documentGuideId={order.documentGuide.id}
        defaultName={currentUser?.email.split("@")[0] ?? ""}
        onClose={() => setReviewOpen(false)}
        onSubmitted={() => onReviewed?.()}
      />
    </>
  );
}
