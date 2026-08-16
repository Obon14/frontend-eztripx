"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { OrderCard } from "@/components/landing/order-card";
import { useLanding } from "@/components/landing/language-provider";
import { Alert } from "@/components/ui/alert";
import { parseOrderList } from "@/lib/order/parse-order";
import type { OrderItem, OrderStatusPayment } from "@/types/order";

const PAGE_SIZE = 10;

type StatusFilter = "ALL" | OrderStatusPayment;

export function OrdersList() {
  const { t, currentUser, isCheckingAuth, openLogin } = useLanding();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (isCheckingAuth) return;
    if (!currentUser) {
      setOrders([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/order", { credentials: "include" });
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          if (!cancelled) {
            setError(
              body && typeof body === "object" && "message" in body && typeof body.message === "string"
                ? body.message
                : t.orders.loadError,
            );
            setOrders([]);
          }
          return;
        }
        if (!cancelled) setOrders(parseOrderList(body));
      } catch {
        if (!cancelled) {
          setError(t.orders.loadError);
          setOrders([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [currentUser, isCheckingAuth, t.orders.loadError]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((row) => {
      if (status !== "ALL" && row.statusPayment !== status) return false;
      if (!q) return true;
      return row.documentGuide.title.toLowerCase().includes(q);
    });
  }, [orders, search, status]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const hasFilters = search.trim().length > 0 || status !== "ALL";

  if (isCheckingAuth) {
    return (
      <p className="py-16 text-center text-sm text-slate-500">{t.orders.loading}</p>
    );
  }

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-slate-600 dark:text-slate-300">{t.orders.loginRequired}</p>
        <button
          type="button"
          onClick={openLogin}
          className="mt-6 rounded-lg bg-landing-orange px-4 py-2 text-sm font-semibold text-white"
        >
          {t.orders.loginCta}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
        {t.orders.title}
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t.orders.subtitle}</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.orders.searchPlaceholder}
          className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-sm text-slate-900 outline-none focus:border-landing-orange focus:bg-white focus:ring-2 focus:ring-landing-orange/15 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="ALL">{t.orders.filterAll}</option>
          <option value="PENDING">{t.orders.filterPending}</option>
          <option value="PAID">{t.orders.filterPaid}</option>
          <option value="FAILED">{t.orders.filterFailed}</option>
          <option value="CANCELED">{t.orders.filterCanceled}</option>
        </select>
        {hasFilters ? (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatus("ALL");
            }}
            className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 hover:border-slate-300 dark:border-slate-600 dark:text-slate-300"
          >
            {t.orders.reset}
          </button>
        ) : null}
      </div>

      {error ? (
        <Alert variant="error" className="mt-6">
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <p className="py-16 text-center text-sm text-slate-500">{t.orders.loading}</p>
      ) : filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-white px-8 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="font-medium text-slate-800 dark:text-slate-100">
            {orders.length === 0 ? t.orders.empty : t.orders.emptyFiltered}
          </p>
          <p className="mt-2 text-sm text-slate-500">{t.orders.emptyHint}</p>
          {orders.length === 0 ? (
            <Link
              href="/guide-document"
              className="mt-6 inline-flex rounded-lg bg-landing-orange px-4 py-2 text-sm font-semibold text-white"
            >
              {t.nav.guideDocument}
            </Link>
          ) : null}
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-slate-500">
            {t.orders.resultsCount
              .replace("{shown}", String(pageItems.length))
              .replace("{total}", String(filtered.length))}
          </p>
          <div className="mt-4 space-y-3">
            {pageItems.map((row) => (
              <OrderCard
                key={row.id}
                order={row}
                onError={setError}
                onReviewed={() => {
                  setOrders((prev) =>
                    prev.map((item) =>
                      item.id === row.id ? { ...item, hasReview: true } : item,
                    ),
                  );
                }}
              />
            ))}
          </div>
          {totalPages > 1 ? (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex h-10 items-center gap-1 rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:border-landing-orange hover:text-landing-orange disabled:opacity-30 dark:border-slate-700 dark:text-slate-300"
              >
                <ChevronLeft className="h-4 w-4" />
                {t.guides.prevPage}
              </button>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t.guides.pageOf
                  .replace("{page}", String(safePage))
                  .replace("{totalPages}", String(totalPages))}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex h-10 items-center gap-1 rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:border-landing-orange hover:text-landing-orange disabled:opacity-30 dark:border-slate-700 dark:text-slate-300"
              >
                {t.guides.nextPage}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
