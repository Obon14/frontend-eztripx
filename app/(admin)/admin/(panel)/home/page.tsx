"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { parseDocumentGuideListResponse } from "@/lib/document-guide/parse-list-response";
import type { DocumentGuide } from "@/types/admin";

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

export default function AdminDashboardPage() {
  const [documentGuides, setDocumentGuides] = useState<DocumentGuide[]>([]);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalRegions: 0,
    totalCountries: 0,
    totalCities: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();

    async function loadDashboardData() {
      setLoading(true);
      setError(null);
      try {
        const [docsRes, regionsRes, countriesRes, citiesRes] = await Promise.all([
          fetch("/api/document-guide?page=1&limit=5", { credentials: "include", signal: ac.signal }),
          fetch("/api/region?page=1&limit=1", { credentials: "include", signal: ac.signal }),
          fetch("/api/country?page=1&limit=1", { credentials: "include", signal: ac.signal }),
          fetch("/api/city?page=1&limit=1", { credentials: "include", signal: ac.signal }),
        ]);

        if (!docsRes.ok) {
          throw new Error(`Gagal memuat dokumen (${docsRes.status}).`);
        }

        const docsBody: unknown = await docsRes.json().catch(() => null);
        const { data: latestGuides, meta: docsMeta } = parseDocumentGuideListResponse(docsBody);
        setDocumentGuides(latestGuides);

        const [regionsBody, countriesBody, citiesBody]: unknown[] = await Promise.all([
          regionsRes.json().catch(() => null),
          countriesRes.json().catch(() => null),
          citiesRes.json().catch(() => null),
        ]);

        const countFromBody = (body: unknown): number => {
          if (
            typeof body === "object" &&
            body !== null &&
            "meta" in body &&
            typeof (body as { meta?: unknown }).meta === "object" &&
            (body as { meta?: unknown }).meta !== null &&
            "total" in ((body as { meta: { total?: unknown } }).meta)
          ) {
            const total = (body as { meta: { total?: unknown } }).meta.total;
            return typeof total === "number" ? total : Number(total) || 0;
          }
          return 0;
        };

        setStats({
          totalDocuments: docsMeta.total,
          totalRegions: regionsRes.ok ? countFromBody(regionsBody) : 0,
          totalCountries: countriesRes.ok ? countFromBody(countriesBody) : 0,
          totalCities: citiesRes.ok ? countFromBody(citiesBody) : 0,
        });
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError("Tidak dapat memuat ringkasan dashboard.");
        setDocumentGuides([]);
        setStats({
          totalDocuments: 0,
          totalRegions: 0,
          totalCountries: 0,
          totalCities: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    void loadDashboardData();
    return () => ac.abort();
  }, []);

  const columns = useMemo(
    () => [
      { key: "title", header: "Title", render: (row: DocumentGuide) => row.title },
      {
        key: "priceIdr",
        header: "Harga Rupiah",
        render: (row: DocumentGuide) => formatIdr.format(row.priceIdr),
      },
      {
        key: "priceUsd",
        header: "Harga USD",
        render: (row: DocumentGuide) => formatUsd.format(row.priceUsd),
      },
      {
        key: "status",
        header: "Status",
        render: (row: DocumentGuide) => (
          <Badge variant={row.status === "published" ? "accent" : "primary"}>{row.status}</Badge>
        ),
      },
      {
        key: "fileName",
        header: "File",
        render: (row: DocumentGuide) => row.fileName,
      },
    ],
    [],
  );

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">Home</h1>
        <p className="text-sm text-slate-600">Ringkasan data admin panel document guide untuk traveler.</p>
      </div>

      <Alert variant="success">
        Dashboard terhubung ke API. Angka dan daftar dokumen mengikuti data backend terbaru.
      </Alert>

      {error ? (
        <Alert variant="warning">
          {error}
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-sm text-slate-500">Total Document</p>
          <p className="mt-1 text-2xl font-bold text-admin-primary-700">{stats.totalDocuments}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Total Region</p>
          <p className="mt-1 text-2xl font-bold text-admin-accent-700">{stats.totalRegions}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Total Country</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{stats.totalCountries}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Total City</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{stats.totalCities}</p>
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Latest Document Guides</h2>
        <DataTable
          data={documentGuides}
          getRowKey={(row) => row.id}
          columns={columns}
          emptyMessage={loading ? "Memuat data..." : "Belum ada document guide."}
        />
      </Card>
    </section>
  );
}
