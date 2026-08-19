"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import type {
  DashboardRecentOrder,
  DashboardSummary,
  DashboardTopGuide,
} from "@/types/dashboard";
import type { OrderStatusPayment } from "@/types/order";

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

const formatDateTime = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

function guideTitle(g: { titleId: string; titleEn: string | null }) {
  return g.titleEn?.trim() || g.titleId;
}

function formatMoney(price: string, currency: string) {
  const n = Number(price);
  if (!Number.isFinite(n)) return `${currency} ${price}`;
  if (currency === "USD") return formatUsd.format(n);
  if (currency === "IDR") return formatIdr.format(n);
  return `${currency} ${n.toLocaleString("id-ID")}`;
}

function statusBadgeVariant(
  status: OrderStatusPayment,
): "accent" | "primary" | "danger" | "neutral" {
  switch (status) {
    case "PAID":
      return "accent";
    case "PENDING":
      return "primary";
    case "FAILED":
    case "CANCELED":
      return "danger";
    default:
      return "neutral";
  }
}

function parseSummary(body: unknown): DashboardSummary | null {
  if (typeof body !== "object" || body === null) return null;
  if (!("kpis" in body) || !("recentOrders" in body)) return null;
  return body as DashboardSummary;
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/dashboard/summary?days=7", {
          credentials: "include",
          signal: ac.signal,
        });
        const body: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          const msg =
            typeof body === "object" &&
            body !== null &&
            "message" in body &&
            typeof (body as { message: unknown }).message === "string"
              ? (body as { message: string }).message
              : `Gagal memuat dashboard (${res.status}).`;
          throw new Error(msg);
        }
        const parsed = parseSummary(body);
        if (!parsed) throw new Error("Format respons dashboard tidak valid.");
        setSummary(parsed);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(
          e instanceof Error ? e.message : "Tidak dapat memuat ringkasan dashboard.",
        );
        setSummary(null);
      } finally {
        setLoading(false);
      }
    }

    void load();
    return () => ac.abort();
  }, []);

  const recentColumns = useMemo(
    () => [
      {
        key: "buyer",
        header: "Pembeli",
        render: (row: DashboardRecentOrder) => row.user.email,
      },
      {
        key: "guide",
        header: "Document Guide",
        render: (row: DashboardRecentOrder) => guideTitle(row.documentGuide),
      },
      {
        key: "amount",
        header: "Nominal",
        render: (row: DashboardRecentOrder) => formatMoney(row.price, row.currency),
      },
      {
        key: "status",
        header: "Status",
        render: (row: DashboardRecentOrder) => (
          <Badge variant={statusBadgeVariant(row.statusPayment)}>
            {row.statusPayment}
          </Badge>
        ),
      },
      {
        key: "createdAt",
        header: "Waktu",
        render: (row: DashboardRecentOrder) =>
          formatDateTime.format(new Date(row.paidAt ?? row.createdAt)),
      },
    ],
    [],
  );

  const topColumns = useMemo(
    () => [
      {
        key: "title",
        header: "Guide",
        render: (row: DashboardTopGuide) => guideTitle(row),
      },
      {
        key: "paidCount",
        header: "Terjual",
        render: (row: DashboardTopGuide) => (
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {row.paidCount}
          </span>
        ),
      },
    ],
    [],
  );

  const kpis = summary?.kpis;
  const periodDays = summary?.periodDays ?? 7;
  const attention = summary?.attention;
  const hasAttention =
    (attention?.unpaidEmail.length ?? 0) > 0 ||
    (attention?.pendingCount ?? 0) > 0 ||
    (attention?.draftCount ?? 0) > 0;

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-slate-100">Home</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Radar penjualan &amp; operasional {periodDays} hari terakhir.
        </p>
      </div>

      {error ? <Alert variant="warning">{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Revenue IDR ({periodDays}h)
          </p>
          <p className="mt-1 text-2xl font-bold text-admin-primary-700">
            {loading ? "…" : formatIdr.format(Number(kpis?.revenueIdr ?? 0))}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            USD:{" "}
            {loading ? "…" : formatUsd.format(Number(kpis?.revenueUsd ?? 0))}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Order PAID ({periodDays}h)
          </p>
          <p className="mt-1 text-2xl font-bold text-admin-accent-700">
            {loading ? "…" : (kpis?.paidOrders ?? 0)}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Total PAID: {summary?.orderCounts.PAID ?? 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Pending bayar</p>
          <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {loading ? "…" : (kpis?.pendingOrders ?? 0)}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Failed/Cancel:{" "}
            {(summary?.orderCounts.FAILED ?? 0) + (summary?.orderCounts.CANCELED ?? 0)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            User baru ({periodDays}h)
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-200">
            {loading ? "…" : (kpis?.newUsers ?? 0)}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Katalog: {summary?.catalog.published ?? 0} published ·{" "}
            {summary?.catalog.draft ?? 0} draft
          </p>
        </Card>
      </div>

      {hasAttention && !loading ? (
        <Card className="border-amber-200/80 dark:border-amber-500/30">
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Perlu perhatian
          </h2>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {(attention?.pendingCount ?? 0) > 0 ? (
              <li>
                <Badge variant="primary" className="mr-2">
                  Pending
                </Badge>
                {attention?.pendingCount} order menunggu pembayaran.
              </li>
            ) : null}
            {(attention?.draftCount ?? 0) > 0 ? (
              <li>
                <Badge variant="neutral" className="mr-2">
                  Draft
                </Badge>
                {attention?.draftCount} document guide masih draft.
              </li>
            ) : null}
            {(attention?.unpaidEmail.length ?? 0) > 0 ? (
              <li className="space-y-2">
                <div>
                  <Badge variant="danger" className="mr-2">
                    Email
                  </Badge>
                  {attention?.unpaidEmail.length} order PAID belum terkirim PDF.
                </div>
                <ul className="ml-1 space-y-1 border-l-2 border-amber-200 pl-3 dark:border-amber-500/40">
                  {attention?.unpaidEmail.map((o) => (
                    <li key={o.id} className="text-xs text-slate-600 dark:text-slate-400">
                      {o.userEmail} · {guideTitle(o.documentGuide)}
                      {o.paidAt
                        ? ` · ${formatDateTime.format(new Date(o.paidAt))}`
                        : ""}
                    </li>
                  ))}
                </ul>
              </li>
            ) : null}
          </ul>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="min-w-0 xl:col-span-3">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Transaksi terbaru
          </h2>
          <DataTable
            data={summary?.recentOrders ?? []}
            getRowKey={(row) => row.id}
            columns={recentColumns}
            emptyMessage={loading ? "Memuat data..." : "Belum ada transaksi."}
            className="border-0 shadow-none dark:shadow-none"
          />
        </Card>
        <Card className="min-w-0 xl:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Guide terlaris
          </h2>
          <DataTable
            data={summary?.topGuides ?? []}
            getRowKey={(row) => row.id}
            columns={topColumns}
            emptyMessage={loading ? "Memuat data..." : "Belum ada penjualan."}
            className="border-0 shadow-none dark:shadow-none"
          />
        </Card>
      </div>
    </section>
  );
}
