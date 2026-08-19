"use client";

import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DataTable } from "@/components/ui/table";
import {
  clampLimit,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  MIN_LIMIT,
} from "@/lib/api/list-query";
import { parseAdminOrderList } from "@/lib/order/parse-admin-order";
import type { AdminOrderRow } from "@/types/admin-order";
import type { ListMeta } from "@/types/geo-api";
import type { OrderStatusPayment } from "@/types/order";

const LIMIT_OPTIONS = [10, 25, 50, 100] as const;

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

export function OrderListPage() {
  const [rows, setRows] = useState<AdminOrderRow[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | OrderStatusPayment>("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({
        page: String(page),
        limit: String(clampLimit(limit)),
        search: search.trim(),
      });
      if (statusFilter) qs.set("status", statusFilter);

      const res = await fetch(`/api/order/admin?${qs}`, { credentials: "include" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          body && typeof body === "object" && "message" in body && typeof body.message === "string"
            ? body.message
            : "Gagal memuat daftar order.",
        );
        setRows([]);
        setMeta(null);
        return;
      }
      const parsed = parseAdminOrderList(body);
      setRows(parsed.data);
      setMeta(parsed.meta);
    } catch {
      setError("Gagal memuat daftar order.");
      setRows([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  useEffect(() => {
    const delay = search.trim() === "" ? 0 : 300;
    const t = window.setTimeout(() => void load(), delay);
    return () => window.clearTimeout(t);
  }, [load, search]);

  async function syncStatus(id: string) {
    setSyncingId(id);
    try {
      const res = await fetch(`/api/order/admin/${encodeURIComponent(id)}/sync-status`, {
        method: "POST",
        credentials: "include",
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          body && typeof body === "object" && "message" in body && typeof body.message === "string"
            ? body.message
            : "Gagal sync status pembayaran.",
        );
        return;
      }
      await load();
    } finally {
      setSyncingId(null);
    }
  }

  const columns = useMemo(
    () => [
      {
        key: "createdAt",
        header: "Waktu",
        render: (row: AdminOrderRow) =>
          formatDateTime.format(new Date(row.paidAt ?? row.createdAt)),
      },
      {
        key: "buyer",
        header: "Pembeli",
        render: (row: AdminOrderRow) => (
          <span className="max-w-[180px] truncate" title={row.userEmail}>
            {row.userEmail}
          </span>
        ),
      },
      {
        key: "guide",
        header: "Document Guide",
        render: (row: AdminOrderRow) => (
          <span className="max-w-[200px] truncate" title={row.guideTitle}>
            {row.guideTitle}
          </span>
        ),
      },
      {
        key: "amount",
        header: "Nominal",
        render: (row: AdminOrderRow) => formatMoney(row.price, row.currency),
      },
      {
        key: "status",
        header: "Status",
        render: (row: AdminOrderRow) => (
          <Badge variant={statusBadgeVariant(row.statusPayment)}>{row.statusPayment}</Badge>
        ),
      },
      {
        key: "email",
        header: "Email PDF",
        render: (row: AdminOrderRow) =>
          row.emailDeliveredAt ? (
            <span className="text-xs text-emerald-700 dark:text-emerald-400">Terkirim</span>
          ) : row.statusPayment === "PAID" ? (
            <span className="text-xs text-amber-700 dark:text-amber-400">Belum</span>
          ) : (
            "—"
          ),
      },
      {
        key: "action",
        header: "Action",
        render: (row: AdminOrderRow) =>
          row.statusPayment === "PENDING" && row.gatewayTransactionId ? (
            <Button
              size="sm"
              variant="outline"
              disabled={syncingId === row.id}
              onClick={() => void syncStatus(row.id)}
            >
              {syncingId === row.id ? "Sync…" : "Sync Xendit"}
            </Button>
          ) : (
            "—"
          ),
      },
    ],
    [syncingId],
  );

  const from = meta && meta.total > 0 ? (meta.page - 1) * meta.limit + 1 : 0;
  const to = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-200 p-4 sm:p-5 dark:border-slate-800">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-slate-100">Order</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Daftar transaksi pembelian document guide dari seluruh pengguna.
        </p>
      </div>

      <div className="p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative w-full sm:max-w-sm sm:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Cari email, judul guide, order id…"
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            className="h-10 w-full sm:w-40"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as "" | OrderStatusPayment);
              setPage(1);
            }}
          >
            <option value="">Semua status</option>
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
            <option value="FAILED">FAILED</option>
            <option value="CANCELED">CANCELED</option>
          </Select>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <DataTable
          columns={columns}
          data={rows}
          getRowKey={(row) => row.id}
          emptyMessage={loading ? "Memuat…" : "Belum ada order."}
        />

        {meta && !loading ? (
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
            <p className="min-w-0 flex-1">
              {meta.total === 0
                ? "Tidak ada data."
                : `Menampilkan ${from}–${to} dari ${meta.total} (halaman ${meta.page} / ${meta.totalPages})`}
            </p>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col gap-1">
                <label
                  className="text-xs font-medium text-slate-600 dark:text-slate-400"
                  htmlFor="order-page-size"
                >
                  Baris per halaman ({MIN_LIMIT}–{MAX_LIMIT})
                </label>
                <Select
                  id="order-page-size"
                  className="h-9 w-24 min-w-0 text-sm"
                  value={String(clampLimit(limit))}
                  disabled={loading}
                  onChange={(e) => {
                    setLimit(clampLimit(Number(e.target.value)));
                    setPage(1);
                  }}
                >
                  {LIMIT_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex items-center gap-2 pb-0.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={loading || meta.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={loading || meta.page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
