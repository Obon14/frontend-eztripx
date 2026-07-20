"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { LandingProvider, useLanding } from "@/components/landing/language-provider";
import { LandingHeader } from "@/components/landing/header";
import { Alert } from "@/components/ui/alert";
import { parseOrderResponse } from "@/lib/order/parse-order";
import type { OrderItem, OrderStatusPayment } from "@/types/order";

const MAX_SYNC_ATTEMPTS = 6;
const SYNC_RETRY_DELAY_MS = 2000;

function PaymentReturnContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId")?.trim() ?? "";
  const { t } = useLanding();
  const [order, setOrder] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function sync() {
      setLoading(true);
      try {
        const encodedOrderId = encodeURIComponent(orderId);

        for (let attempt = 0; attempt < MAX_SYNC_ATTEMPTS && !cancelled; attempt += 1) {
          await fetch(`/api/order/${encodedOrderId}/sync-status`, {
            method: "POST",
            credentials: "include",
          });

          const res = await fetch(`/api/order/${encodedOrderId}`, {
            credentials: "include",
          });
          const body = await res.json().catch(() => null);

          if (!res.ok) {
            break;
          }

          const nextOrder = parseOrderResponse(body);
          if (!nextOrder) {
            break;
          }

          if (!cancelled) {
            setOrder(nextOrder);
          }

          if (
            nextOrder.statusPayment === "PAID" ||
            nextOrder.statusPayment === "FAILED" ||
            nextOrder.statusPayment === "CANCELED"
          ) {
            break;
          }

          if (attempt < MAX_SYNC_ATTEMPTS - 1) {
            await new Promise((resolve) => setTimeout(resolve, SYNC_RETRY_DELAY_MS));
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void sync();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const message = loading
    ? t.payment.syncing
    : statusMessage(order?.statusPayment, t.payment);

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">{t.payment.title}</h1>
        <p className="mt-4 text-slate-600">{message}</p>
        {order?.documentGuide?.title ? (
          <p className="mt-2 text-sm font-medium text-landing-orange">{order.documentGuide.title}</p>
        ) : null}
        {!loading && order?.statusPayment === "PAID" ? (
          <Alert variant="success" className="mt-6 w-full text-left">
            {t.payment.paid}
          </Alert>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-admin-primary px-4 text-sm font-medium text-white hover:bg-admin-primary-600"
          >
            {t.payment.backHome}
          </Link>
          <Link
            href="/#services"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {t.payment.viewGuide}
          </Link>
        </div>
      </main>
    </div>
  );
}

function statusMessage(
  status: OrderStatusPayment | undefined,
  copy: {
    paid: string;
    pending: string;
    failed: string;
    canceled: string;
    syncing: string;
  },
): string {
  if (!status) return copy.syncing;
  switch (status) {
    case "PAID":
      return copy.paid;
    case "PENDING":
      return copy.pending;
    case "FAILED":
      return copy.failed;
    case "CANCELED":
      return copy.canceled;
    default:
      return copy.pending;
  }
}

export default function PaymentReturnPage() {
  return (
    <LandingProvider>
      <Suspense fallback={<div className="min-h-screen bg-white" />}>
        <PaymentReturnContent />
      </Suspense>
    </LandingProvider>
  );
}
