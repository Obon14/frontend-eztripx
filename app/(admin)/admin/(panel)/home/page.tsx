import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { dashboardStats, documentGuides } from "@/lib/mock/admin-data";

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
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">Home</h1>
        <p className="text-sm text-slate-600">Ringkasan data admin panel document guide untuk traveler.</p>
      </div>

      <Alert variant="success">
        Prototype frontend aktif. Nanti bisa langsung disambungkan ke backend/API tanpa ubah struktur utama.
      </Alert>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-sm text-slate-500">Total Document</p>
          <p className="mt-1 text-2xl font-bold text-admin-primary-700">{dashboardStats.totalDocuments}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Total Region</p>
          <p className="mt-1 text-2xl font-bold text-admin-accent-700">{dashboardStats.totalRegions}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Total Country</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{dashboardStats.totalCountries}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Total City</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{dashboardStats.totalCities}</p>
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Latest Document Guides</h2>
        <DataTable
          data={documentGuides}
          getRowKey={(row) => row.id}
          columns={[
            { key: "title", header: "Title", render: (row) => row.title },
            {
              key: "priceIdr",
              header: "Harga Rupiah",
              render: (row) => formatIdr.format(row.priceIdr),
            },
            {
              key: "priceUsd",
              header: "Harga USD",
              render: (row) => formatUsd.format(row.priceUsd),
            },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <Badge variant={row.status === "published" ? "accent" : "primary"}>{row.status}</Badge>
              ),
            },
            {
              key: "fileName",
              header: "File",
              render: (row) => row.fileName,
            },
          ]}
        />
      </Card>
    </section>
  );
}
