"use client";

import {
  AlertCircle,
  Calendar,
  Check,
  CheckSquare,
  Clock,
  Edit2,
  Filter,
  Plus,
  Search,
  Square,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { DataTable } from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { DocumentAvailability, Promo, PromoStatus } from "@/types/admin";
import type { ListMeta } from "@/types/geo-api";

const formatIdr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateInput(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

type PromoFormState = {
  name: string;
  discountPercent: string;
  isPermanent: boolean;
  startDate: string;
  endDate: string;
  isActive: boolean;
  selectedDocIds: string[];
};

const initialForm: PromoFormState = {
  name: "",
  discountPercent: "20",
  isPermanent: true,
  startDate: "",
  endDate: "",
  isActive: true,
  selectedDocIds: [],
};

export function PromoTablePage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [form, setForm] = useState<PromoFormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Document availability state
  const [availableDocs, setAvailableDocs] = useState<DocumentAvailability[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [docSearch, setDocSearch] = useState("");

  // Delete modal states
  const [deleteTarget, setDeleteTarget] = useState<Promo | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Quick toggle status
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchPromos = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/promo?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal mengambil data promo");
      const json = await res.json();
      setPromos(json.data ?? []);
      setMeta(json.meta ?? null);
    } catch {
      setPromos([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const loadDocumentAvailability = useCallback(async (excludePromoId?: string) => {
    try {
      setLoadingDocs(true);
      const qs = excludePromoId ? `?excludePromoId=${encodeURIComponent(excludePromoId)}` : "";
      const res = await fetch(`/api/promo/availability${qs}`);
      if (!res.ok) throw new Error("Gagal memuat ketersediaan dokumen");
      const data: DocumentAvailability[] = await res.json();
      setAvailableDocs(data);
    } catch {
      setAvailableDocs([]);
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  const openCreateModal = () => {
    setEditingPromo(null);
    setForm(initialForm);
    setFormError(null);
    setDocSearch("");
    loadDocumentAvailability();
    setModalOpen(true);
  };

  const openEditModal = async (promo: Promo) => {
    setEditingPromo(promo);
    setFormError(null);
    setDocSearch("");
    setModalOpen(true);

    try {
      setLoadingDocs(true);
      const [promoDetailRes, availRes] = await Promise.all([
        fetch(`/api/promo/${encodeURIComponent(promo.id)}`),
        fetch(`/api/promo/availability?excludePromoId=${encodeURIComponent(promo.id)}`),
      ]);

      const detail: Promo = promoDetailRes.ok ? await promoDetailRes.json() : promo;
      const availData: DocumentAvailability[] = availRes.ok ? await availRes.json() : [];

      const docIds = (detail.documents ?? []).map((d) => d.id);
      setAvailableDocs(availData);
      setForm({
        name: detail.name,
        discountPercent: String(detail.discountPercent),
        isPermanent: !detail.endDate && !detail.startDate,
        startDate: formatDateInput(detail.startDate),
        endDate: formatDateInput(detail.endDate),
        isActive: detail.isActive,
        selectedDocIds: docIds,
      });
    } catch {
      setFormError("Gagal memuat rincian promo.");
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleToggleActive = async (promo: Promo) => {
    try {
      setTogglingId(promo.id);
      const res = await fetch(`/api/promo/${encodeURIComponent(promo.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !promo.isActive }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Gagal mengubah status promo.");
        return;
      }
      await fetchPromos();
    } catch {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const name = form.name.trim();
    if (!name) {
      setFormError("Nama promo wajib diisi.");
      return;
    }

    const discountNum = Number(form.discountPercent);
    if (isNaN(discountNum) || discountNum < 1 || discountNum > 100) {
      setFormError("Diskon harus berupa angka antara 1% sampai 100%.");
      return;
    }

    let startDate: string | null = null;
    let endDate: string | null = null;

    if (!form.isPermanent) {
      if (form.startDate) startDate = new Date(form.startDate).toISOString();
      if (form.endDate) endDate = new Date(form.endDate + "T23:59:59.999Z").toISOString();
      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        setFormError("Tanggal selesai tidak boleh sebelum tanggal mulai.");
        return;
      }
    }

    try {
      setSaving(true);
      const payload = {
        name,
        discountPercent: discountNum,
        startDate,
        endDate,
        isActive: form.isActive,
        documentGuideIds: form.selectedDocIds,
      };

      const url = editingPromo ? `/api/promo/${encodeURIComponent(editingPromo.id)}` : "/api/promo";
      const method = editingPromo ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(body.message || "Gagal menyimpan promo.");
        return;
      }

      setModalOpen(false);
      await fetchPromos();
    } catch {
      setFormError("Terjadi kesalahan server saat menyimpan promo.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePromo = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/promo/${encodeURIComponent(deleteTarget.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Gagal menghapus promo.");
        return;
      }
      setDeleteTarget(null);
      await fetchPromos();
    } catch {
      alert("Terjadi kesalahan saat menghapus promo.");
    } finally {
      setDeleting(false);
    }
  };

  // Filtered documents inside modal
  const filteredDocs = useMemo(() => {
    if (!docSearch.trim()) return availableDocs;
    const q = docSearch.toLowerCase();
    return availableDocs.filter(
      (d) =>
        d.titleId.toLowerCase().includes(q) ||
        (d.titleEn && d.titleEn.toLowerCase().includes(q)) ||
        d.locationLabel.toLowerCase().includes(q),
    );
  }, [availableDocs, docSearch]);

  const toggleDocSelection = (docId: string, isAvailable: boolean) => {
    if (!isAvailable && !form.selectedDocIds.includes(docId)) return;
    setForm((prev) => {
      const exists = prev.selectedDocIds.includes(docId);
      return {
        ...prev,
        selectedDocIds: exists
          ? prev.selectedDocIds.filter((id) => id !== docId)
          : [...prev.selectedDocIds, docId],
      };
    });
  };

  const handleSelectAllAvailable = () => {
    const selectable = filteredDocs.filter((d) => d.isAvailable).map((d) => d.id);
    setForm((prev) => ({
      ...prev,
      selectedDocIds: Array.from(new Set([...prev.selectedDocIds, ...selectable])),
    }));
  };

  const handleDeselectAll = () => {
    const currentFilteredIds = new Set(filteredDocs.map((d) => d.id));
    setForm((prev) => ({
      ...prev,
      selectedDocIds: prev.selectedDocIds.filter((id) => !currentFilteredIds.has(id)),
    }));
  };

  // Filtered promos for display
  const displayedPromos = useMemo(() => {
    if (statusFilter === "all") return promos;
    return promos.filter((p) => p.status === statusFilter);
  }, [promos, statusFilter]);

  const renderStatusBadge = (status: PromoStatus, isActive: boolean) => {
    if (!isActive) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          Nonaktif
        </span>
      );
    }
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Aktif
          </span>
        );
      case "scheduled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
            <Clock className="h-3 w-3" />
            Terjadwal
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Kedaluwarsa
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Promo & Campaign
            </h1>
            <Badge variant="primary" className="font-normal">
              {meta?.total ?? promos.length} Campaign
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Atur program diskon promosi berkala atau permanen dan tentukan dokumen panduan wisata yang berhak mendapat potongan harga.
          </p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Tambah Promo
        </Button>
      </div>

      {/* Info Card: Default New User Discount */}
      <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
            <Tag className="h-4 w-4" />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-emerald-900 dark:text-emerald-300">
              Diskon Pengguna Baru: Otomatis 50% untuk Pembelian Pertama
            </p>
            <p className="mt-0.5 text-emerald-800/80 dark:text-emerald-400">
              Sistem secara default memberikan potongan harga 50% untuk setiap pengguna yang belum pernah melakukan pembelian (First-Time Buyer). Jika dokumen memiliki promo campaign, sistem otomatis mengambil potongan terbesar.
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Cari nama promo..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/50 p-1 dark:border-slate-800 dark:bg-slate-900/50">
              <span className="px-2 text-xs font-medium text-slate-500">Status:</span>
              {[
                { id: "all", label: "Semua" },
                { id: "active", label: "Aktif" },
                { id: "scheduled", label: "Terjadwal" },
                { id: "expired", label: "Kedaluwarsa" },
                { id: "inactive", label: "Nonaktif" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition",
                    statusFilter === tab.id
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Select
              value={String(limit)}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="w-28"
            >
              <option value="10">10 / hal</option>
              <option value="20">20 / hal</option>
              <option value="50">50 / hal</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <DataTable
          columns={[
            {
              key: "name",
              header: "Nama Promo",
              render: (row: Promo) => (
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{row.name}</p>
                  <p className="text-xs text-slate-400">Dibuat: {formatDate(row.createdAt)}</p>
                </div>
              ),
            },
            {
              key: "discountPercent",
              header: "Diskon",
              render: (row: Promo) => (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
                  <Tag className="h-3 w-3" />
                  {row.discountPercent}% OFF
                </span>
              ),
            },
            {
              key: "period",
              header: "Periode Promo",
              render: (row: Promo) => {
                if (!row.startDate && !row.endDate) {
                  return (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <Calendar className="h-3.5 w-3.5" />
                      Permanen (Tanpa Batas)
                    </span>
                  );
                }
                return (
                  <div className="flex flex-col text-xs text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {row.startDate ? formatDate(row.startDate) : "Mulai Sekarang"} &rarr;{" "}
                      {row.endDate ? formatDate(row.endDate) : "Seterusnya"}
                    </span>
                  </div>
                );
              },
            },
            {
              key: "documentCount",
              header: "Dokumen",
              render: (row: Promo) => (
                <Badge variant="neutral" className="font-medium text-xs">
                  {row.documentCount} Panduan Terpilih
                </Badge>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (row: Promo) => renderStatusBadge(row.status, row.isActive),
            },
            {
              key: "isActive",
              header: "Aktifkan",
              render: (row: Promo) => (
                <button
                  type="button"
                  disabled={togglingId === row.id}
                  onClick={() => handleToggleActive(row)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    row.isActive ? "bg-emerald-600" : "bg-slate-200 dark:bg-slate-700",
                    togglingId === row.id && "opacity-50 cursor-wait",
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      row.isActive ? "translate-x-5" : "translate-x-0",
                    )}
                  />
                </button>
              ),
            },
            {
              key: "actions",
              header: "Aksi",
              render: (row: Promo) => (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(row)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteTarget(row)}
                    className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ),
            },
          ]}
          data={displayedPromos}
          emptyMessage="Belum ada data promo yang dibuat."
        />

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 p-4 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              Halaman {meta.page} dari {meta.totalPages} ({meta.total} promo)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create / Edit Promo Modal */}
      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editingPromo ? "Edit Promo Campaign" : "Tambah Promo Campaign"}
        panelClassName="max-w-3xl"
      >
        <form onSubmit={handleSavePromo} className="space-y-6">
          {formError && (
            <div className="flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1">{formError}</div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Promo Name */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Nama Promo <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="Contoh: Promo Liburan Akhir Tahun, Flash Sale 10.10"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            {/* Discount Percent */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Besar Diskon (%) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="20"
                  value={form.discountPercent}
                  onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))}
                  className="pr-8"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  %
                </span>
              </div>
              <div className="flex gap-1.5 pt-1">
                {["10", "15", "20", "25", "30", "50"].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, discountPercent: pct }))}
                    className={cn(
                      "rounded px-2 py-0.5 text-xs font-semibold transition",
                      form.discountPercent === pct
                        ? "bg-orange-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300",
                    )}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Switch Active */}
            <div className="space-y-1.5 flex flex-col justify-between">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Status Campaign
              </label>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    form.isActive ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700",
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      form.isActive ? "translate-x-5" : "translate-x-0",
                    )}
                  />
                </button>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {form.isActive ? "Aktif & Berlaku" : "Nonaktif (Draft)"}
                </span>
              </div>
            </div>
          </div>

          {/* Period Setting */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                Periode Waktu Promo
              </label>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={form.isPermanent}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        isPermanent: e.target.checked,
                        startDate: e.target.checked ? "" : f.startDate,
                        endDate: e.target.checked ? "" : f.endDate,
                      }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                  />
                  Promo Permanen (Tanpa Batas Tanggal)
                </label>
              </div>
            </div>

            {!form.isPermanent && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Tanggal Mulai (Opsional)
                  </label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Tanggal Selesai (Otomatis Expired)
                  </label>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Document Guide Selector */}
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Pilih Dokumen Panduan Wisata
                </label>
                <p className="text-xs text-slate-500">
                  {form.selectedDocIds.length} dari {availableDocs.length} dokumen dipilih untuk promo ini
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllAvailable}
                  className="h-8 text-xs flex items-center gap-1"
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                  Pilih Semua Tersedia
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  className="h-8 text-xs flex items-center gap-1"
                >
                  <Square className="h-3.5 w-3.5" />
                  Batal Pilih
                </Button>
              </div>
            </div>

            {/* Search documents */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Cari judul dokumen atau lokasi..."
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                className="pl-8 text-xs h-9"
              />
            </div>

            {/* Document list box */}
            <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-inner dark:border-slate-800 dark:bg-slate-900/60 divide-y divide-slate-100 dark:divide-slate-800/60">
              {loadingDocs ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Memuat daftar dokumen...
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Tidak ada dokumen yang sesuai pencarian.
                </div>
              ) : (
                filteredDocs.map((doc) => {
                  const isSelected = form.selectedDocIds.includes(doc.id);
                  const isConflict = !doc.isAvailable && !isSelected;

                  return (
                    <div
                      key={doc.id}
                      onClick={() => !isConflict && toggleDocSelection(doc.id, doc.isAvailable)}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-lg transition text-xs",
                        isConflict
                          ? "opacity-50 bg-slate-50/50 dark:bg-slate-800/20 cursor-not-allowed"
                          : "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50",
                        isSelected && "bg-orange-50/80 dark:bg-orange-950/20",
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isConflict}
                          onChange={() => {}}
                          className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {doc.titleId}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            {doc.locationLabel && <span>{doc.locationLabel}</span>}
                            {doc.tripDays && <span>• {doc.tripDays} Hari</span>}
                            {doc.priceIdr && (
                              <span>• {formatIdr.format(Number(doc.priceIdr))}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isConflict ? (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-300">
                            <AlertCircle className="h-3 w-3" />
                            Aktif di &quot;{doc.conflictPromoName}&quot;
                          </span>
                        ) : isSelected ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 dark:text-orange-400">
                            <Check className="h-3.5 w-3.5" />
                            Terpilih
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                            Tersedia
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : editingPromo ? "Simpan Perubahan" : "Buat Promo"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Hapus Promo Campaign"
        panelClassName="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Apakah Anda yakin ingin menghapus promo{" "}
            <strong className="text-slate-900 dark:text-slate-100">&quot;{deleteTarget?.name}&quot;</strong>?
            Dokumen yang terhubung akan kembali ke harga normal.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={handleDeletePromo}
              disabled={deleting}
            >
              {deleting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
