"use client";

import { AlertTriangle, Download, Eye, Pencil, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AsyncMultiSelect } from "@/components/ui/async-multi-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { DataTable } from "@/components/ui/table";
import { buildDocumentGuideTags } from "@/lib/geo/document-guide-tags";
import { resolveTripleFromCityId, resolveTripleFromCountryId } from "@/lib/geo/document-guide-resolve";
import {
  loadCityOptionsPage,
  loadCountryOptionsPage,
  loadRegionOptionsPage,
} from "@/lib/geo/select-options";
import { parseDocumentGuideListResponse } from "@/lib/document-guide/parse-list-response";
import { publicGuideCoverSrc } from "@/lib/document-guide/parse-public-list";
import { cn } from "@/lib/utils";
import type { DocumentGuide } from "@/types/admin";
import { PdfJsPreview } from "@/components/admin/pdf-js-preview";

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

/** File name for Content-Disposition / download (ensure .pdf). */
function pdfDownloadName(fileName: string): string {
  const t = fileName.trim() || "document";
  return /\.pdf$/i.test(t) ? t : `${t}.pdf`;
}

function namesFromIds(ids: string[]) {
  if (ids.length === 0) return "—";
  return ids.join(", ");
}

function getTagDisplayLines(row: DocumentGuide): { region: string; country: string; city: string }[] {
  if (row.structuredTags && row.structuredTags.length > 0) {
    return row.structuredTags.map((t) => ({
      region: t.region?.name ?? "—",
      country: t.country?.name ?? "—",
      city: t.city?.name ?? "—",
    }));
  }
  return [
    {
      region: namesFromIds(row.regionIds),
      country: namesFromIds(row.countryIds),
      city: namesFromIds(row.cityIds),
    },
  ];
}

function GeoStack({ lines }: { lines: string[] }) {
  return (
    <div className="space-y-1 text-left text-xs leading-snug text-slate-700">
      {lines.map((line, i) => (
        <div
          key={i}
          className="border-b border-slate-100 py-1 last:border-b-0 last:pb-0 first:pt-0"
        >
          {line}
        </div>
      ))}
    </div>
  );
}

function buildGeoLabelsFromRow(row: DocumentGuide): Record<string, string> {
  const out: Record<string, string> = {};
  if (row.structuredTags) {
    for (const t of row.structuredTags) {
      if (t.region) out[String(t.region.id)] = t.region.name;
      if (t.country) out[String(t.country.id)] = t.country.name;
      if (t.city) out[String(t.city.id)] = t.city.name;
    }
  }
  return out;
}

type GuideFormState = {
  titleId: string;
  titleEn: string;
  tripDays: string;
  priceIdr: string;
  priceUsd: string;
  fileName: string;
  status: DocumentGuide["status"];
  regionIds: string[];
  countryIds: string[];
  cityIds: string[];
};

function isPdfFile(file: File): boolean {
  const nameOk = /\.pdf$/i.test(file.name);
  const typeOk = file.type === "application/pdf" || file.type === "application/x-pdf";
  return nameOk || typeOk;
}

function isCoverImageFile(file: File): boolean {
  const nameOk = /\.(jpe?g|png|webp)$/i.test(file.name);
  const typeOk = /^image\/(jpeg|png|webp)$/i.test(file.type);
  return nameOk || typeOk;
}

const DEFAULT_COVER = "/images/default-guide-cover.svg";

export function DocumentGuideTablePage() {
  const router = useRouter();
  const [rows, setRows] = useState<DocumentGuide[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DocumentGuide | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteDialogError, setDeleteDialogError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GuideFormState>({
    titleId: "",
    titleEn: "",
    tripDays: "",
    priceIdr: "0",
    priceUsd: "0",
    fileName: "",
    status: "draft",
    regionIds: [],
    countryIds: [],
    cityIds: [],
  });

  const [createRegionIds, setCreateRegionIds] = useState<string[]>([]);
  const [createCountryIds, setCreateCountryIds] = useState<string[]>([]);
  const [createCityIds, setCreateCityIds] = useState<string[]>([]);
  /** Display names for ids merged from city/country resolution (not picked in dropdown). */
  const [createGeoLabels, setCreateGeoLabels] = useState<Record<string, string>>({});
  const createCityIdsRef = useRef(createCityIds);
  createCityIdsRef.current = createCityIds;
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFiles, setCoverFiles] = useState<File[]>([]);
  const [removeCoverIds, setRemoveCoverIds] = useState<string[]>([]);
  const [existingCovers, setExistingCovers] = useState<
    { id: string; url: string }[]
  >([]);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const previewAbortRef = useRef<AbortController | null>(null);

  const loadRows = useCallback(
    async (searchQuery: string, signal?: AbortSignal) => {
      setListLoading(true);
      setListError(null);
      try {
        const params = new URLSearchParams({
          page: "1",
          limit: "50",
          search: searchQuery,
        });
        const res = await fetch(`/api/document-guide?${params}`, {
          credentials: "include",
          signal,
        });
        if (res.status === 401) {
          router.push("/admin");
          router.refresh();
          return;
        }
        const body: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          const msg =
            typeof body === "object" &&
            body !== null &&
            "message" in body &&
            typeof (body as { message: string }).message === "string"
              ? (body as { message: string }).message
              : `Gagal memuat daftar (${res.status}).`;
          setListError(msg);
          setRows([]);
          return;
        }
        const { data } = parseDocumentGuideListResponse(body);
        setRows(data);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setListError("Tidak dapat memuat daftar document guide.");
        setRows([]);
      } finally {
        setListLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    const controller = new AbortController();
    const q = search.trim();
    const delay = q === "" ? 0 : 300;
    const t = window.setTimeout(() => void loadRows(q, controller.signal), delay);
    return () => {
      controller.abort();
      window.clearTimeout(t);
    };
  }, [search, loadRows]);

  const closePreviewModal = useCallback(() => {
    previewAbortRef.current?.abort();
    previewAbortRef.current = null;
    setPreviewOpen(false);
    setPreviewLoading(false);
    setPreviewError(null);
    setPreviewTitle("");
    setPreviewFileName("");
    setPreviewDocumentId(null);
    setPreviewUrl((u) => {
      if (u) URL.revokeObjectURL(u);
      return null;
    });
  }, []);

  const openDocumentPreview = useCallback(
    async (row: DocumentGuide) => {
      previewAbortRef.current?.abort();
      const ac = new AbortController();
      previewAbortRef.current = ac;

      setPreviewTitle(row.title);
      setPreviewFileName(row.fileName);
      setPreviewDocumentId(row.id);
      setPreviewError(null);
      setPreviewUrl((u) => {
        if (u) URL.revokeObjectURL(u);
        return null;
      });
      setPreviewOpen(true);
      setPreviewLoading(true);

      try {
        const res = await fetch(`/api/document-guide/${encodeURIComponent(row.id)}/preview`, {
          credentials: "include",
          signal: ac.signal,
        });
        if (res.status === 401) {
          closePreviewModal();
          router.push("/admin");
          router.refresh();
          return;
        }
        if (!res.ok) {
          let message = `Gagal memuat preview (${res.status}).`;
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
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setPreviewError("Tidak dapat memuat preview.");
      } finally {
        if (!ac.signal.aborted) setPreviewLoading(false);
      }
    },
    [router, closePreviewModal],
  );

  const closeDeleteDialog = useCallback(() => {
    if (deleteSubmitting) return;
    setDeleteTarget(null);
    setDeleteDialogError(null);
  }, [deleteSubmitting]);

  const openDeleteDialog = useCallback((row: DocumentGuide) => {
    setDeleteTarget(row);
    setDeleteDialogError(null);
  }, []);

  const performDelete = useCallback(async () => {
    const row = deleteTarget;
    if (!row) return;
    setDeleteSubmitting(true);
    setDeleteDialogError(null);
    try {
      const res = await fetch(`/api/document-guide/${encodeURIComponent(row.id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.status === 401) {
        router.push("/admin");
        router.refresh();
        setDeleteTarget(null);
        return;
      }
      if (!res.ok) {
        const body: unknown = await res.json().catch(() => null);
        const msg =
          typeof body === "object" &&
          body !== null &&
          "message" in body &&
          typeof (body as { message: string }).message === "string"
            ? (body as { message: string }).message
            : `Penghapusan gagal (kode ${res.status}).`;
        setDeleteDialogError(msg);
        return;
      }
      await loadRows(search.trim());
      setDeleteTarget(null);
    } catch {
      setDeleteDialogError("Tidak dapat menghubungi server. Periksa koneksi lalu coba lagi.");
    } finally {
      setDeleteSubmitting(false);
    }
  }, [deleteTarget, router, loadRows, search]);

  const columns = useMemo(
    () => [
      {
        key: "title",
        header: "Title",
        render: (row: DocumentGuide) => (
          <div>
            <div className="font-medium">{row.titleId}</div>
            {row.titleEn ? (
              <div className="text-xs text-slate-500">{row.titleEn}</div>
            ) : null}
          </div>
        ),
      },
      {
        key: "cover",
        header: "Cover",
        render: (row: DocumentGuide) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={publicGuideCoverSrc(
              row.id,
              row.coverImages[0]?.id ?? "legacy",
            )}
            alt=""
            className="h-10 w-14 rounded object-cover"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_COVER;
            }}
          />
        ),
      },
      {
        key: "tripDays",
        header: "Hari",
        render: (row: DocumentGuide) => (row.tripDays ? `${row.tripDays} hari` : "—"),
      },
      {
        key: "region",
        header: "Region",
        className: "min-w-[100px] max-w-[140px] align-top",
        render: (row: DocumentGuide) => (
          <GeoStack lines={getTagDisplayLines(row).map((l) => l.region)} />
        ),
      },
      {
        key: "country",
        header: "Country",
        className: "min-w-[110px] max-w-[160px] align-top",
        render: (row: DocumentGuide) => (
          <GeoStack lines={getTagDisplayLines(row).map((l) => l.country)} />
        ),
      },
      {
        key: "city",
        header: "City",
        className: "min-w-[110px] max-w-[160px] align-top",
        render: (row: DocumentGuide) => (
          <GeoStack lines={getTagDisplayLines(row).map((l) => l.city)} />
        ),
      },
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
      { key: "fileName", header: "File", render: (row: DocumentGuide) => row.fileName },
      {
        key: "action",
        header: "Action",
        className: "w-[150px]",
        render: (row: DocumentGuide) => (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-9 w-9 shrink-0 p-0 text-slate-600 hover:text-admin-primary-700"
              aria-label={`Preview PDF: ${row.title}`}
              onClick={() => void openDocumentPreview(row)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-9 w-9 shrink-0 p-0 text-slate-600 hover:text-admin-primary-700"
              aria-label={`Edit ${row.title}`}
              onClick={() => {
                setEditingId(row.id);
                setForm({
                  titleId: row.titleId,
                  titleEn: row.titleEn ?? "",
                  tripDays: row.tripDays ? String(row.tripDays) : "",
                  priceIdr: String(row.priceIdr),
                  priceUsd: String(row.priceUsd),
                  fileName: row.fileName,
                  status: row.status,
                  regionIds: [...row.regionIds],
                  countryIds: [...row.countryIds],
                  cityIds: [...row.cityIds],
                });
                setCreateRegionIds([...row.regionIds]);
                setCreateCountryIds([...row.countryIds]);
                setCreateCityIds([...row.cityIds]);
                setCreateGeoLabels(buildGeoLabelsFromRow(row));
                setPdfFile(null);
                setCoverFiles([]);
                setRemoveCoverIds([]);
                setExistingCovers(
                  row.coverImages.map((c) => ({ id: c.id, url: c.url })),
                );
                setCreateError(null);
                setOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-9 w-9 shrink-0 p-0 text-slate-600 hover:text-red-600"
              aria-label={`Delete ${row.title}`}
              onClick={() => openDeleteDialog(row)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [openDocumentPreview, openDeleteDialog],
  );

  function openCreate() {
    setEditingId(null);
    setForm({
      titleId: "",
      titleEn: "",
      tripDays: "",
      priceIdr: "",
      priceUsd: "",
      fileName: "",
      status: "draft",
      regionIds: [],
      countryIds: [],
      cityIds: [],
    });
    setCreateRegionIds([]);
    setCreateCountryIds([]);
    setCreateCityIds([]);
    setCreateGeoLabels({});
    setPdfFile(null);
    setCoverFiles([]);
    setRemoveCoverIds([]);
    setExistingCovers([]);
    setCreateError(null);
    setOpen(true);
  }

  function handleModalClose() {
    setOpen(false);
    setEditingId(null);
    setCreateError(null);
    setCreateSubmitting(false);
    setPdfFile(null);
    setCoverFiles([]);
    setRemoveCoverIds([]);
    setExistingCovers([]);
    setCreateRegionIds([]);
    setCreateCountryIds([]);
    setCreateCityIds([]);
    setCreateGeoLabels({});
  }

  const handleCreateCountriesChange = useCallback(
    async (next: string[]) => {
      const prev = createCountryIds;
      const added = next.filter((id) => !prev.includes(id));
      const removed = prev.filter((id) => !next.includes(id));
      setCreateCountryIds(next);

      if (removed.length > 0) {
        const drop = new Set(removed);
        const cityStillOk: string[] = [];
        for (const cid of createCityIdsRef.current) {
          const t = await resolveTripleFromCityId(cid);
          if (t && drop.has(String(t.countryId))) continue;
          cityStillOk.push(cid);
        }
        setCreateCityIds(cityStillOk);
      }

      const mergeRegions: string[] = [];
      const labelPatch: Record<string, string> = {};
      for (const id of added) {
        const r = await resolveTripleFromCountryId(id);
        if (r) {
          mergeRegions.push(String(r.regionId));
          if (r.regionLabel.trim()) labelPatch[String(r.regionId)] = r.regionLabel.trim();
          if (r.countryLabel.trim()) labelPatch[String(r.countryId)] = r.countryLabel.trim();
        }
      }
      if (Object.keys(labelPatch).length > 0) {
        setCreateGeoLabels((prev) => ({ ...prev, ...labelPatch }));
      }
      if (mergeRegions.length > 0) {
        setCreateRegionIds((p) => [...new Set([...p, ...mergeRegions])]);
      }
    },
    [createCountryIds],
  );

  const handleCreateCitiesChange = useCallback(
    async (next: string[]) => {
      const prev = createCityIds;
      const added = next.filter((id) => !prev.includes(id));
      setCreateCityIds(next);

      const newRegions: string[] = [];
      const newCountries: string[] = [];
      const labelPatch: Record<string, string> = {};
      for (const id of added) {
        const t = await resolveTripleFromCityId(id);
        if (t) {
          newRegions.push(String(t.regionId));
          newCountries.push(String(t.countryId));
          if (t.regionLabel.trim()) labelPatch[String(t.regionId)] = t.regionLabel.trim();
          if (t.countryLabel.trim()) labelPatch[String(t.countryId)] = t.countryLabel.trim();
        }
      }
      if (Object.keys(labelPatch).length > 0) {
        setCreateGeoLabels((prev) => ({ ...prev, ...labelPatch }));
      }
      if (newRegions.length > 0) {
        setCreateRegionIds((p) => [...new Set([...p, ...newRegions])]);
      }
      if (newCountries.length > 0) {
        setCreateCountryIds((p) => [...new Set([...p, ...newCountries])]);
      }
    },
    [createCityIds],
  );

  const submitSave = useCallback(async () => {
    setCreateError(null);
    const titleId = form.titleId.trim();
    const titleEn = form.titleEn.trim();
    const priceIdrStr = form.priceIdr.trim();
    const priceUsdStr = form.priceUsd.trim();

    if (!titleId) {
      setCreateError("Title (Indonesian) is required.");
      return;
    }
    if (!priceIdrStr || !priceUsdStr) {
      setCreateError("Price IDR and price USD are required.");
      return;
    }
    const priceIdrNum = Number(priceIdrStr);
    const priceUsdNum = Number(priceUsdStr);
    if (Number.isNaN(priceIdrNum) || Number.isNaN(priceUsdNum) || priceIdrNum < 0 || priceUsdNum < 0) {
      setCreateError("Prices must be valid non-negative numbers.");
      return;
    }

    const tagsPayload = await buildDocumentGuideTags(
      createRegionIds,
      createCountryIds,
      createCityIds,
    );
    if (tagsPayload.length === 0) {
      setCreateError("Pilih minimal satu lokasi: region, negara, dan/atau kota (tags tidak boleh kosong).");
      return;
    }

    const isEdit = Boolean(editingId);
    if (!isEdit && !pdfFile) {
      setCreateError("PDF document is required.");
      return;
    }
    if (pdfFile && !isPdfFile(pdfFile)) {
      setCreateError("Only PDF files are allowed.");
      return;
    }
    for (const f of coverFiles) {
      if (!isCoverImageFile(f)) {
        setCreateError("Cover must be JPEG, PNG, or WebP.");
        return;
      }
    }
    const remainingCovers =
      existingCovers.length - removeCoverIds.length + coverFiles.length;
    if (remainingCovers > 8) {
      setCreateError("Maximum 8 cover images allowed.");
      return;
    }

    const tripDaysStr = form.tripDays.trim();
    if (tripDaysStr) {
      const td = Number(tripDaysStr);
      if (!Number.isInteger(td) || td < 1 || td > 365) {
        setCreateError("Trip days must be an integer between 1 and 365.");
        return;
      }
    }

    setCreateSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("titleId", titleId);
      if (titleEn) {
        fd.append("titleEn", titleEn);
      }
      if (tripDaysStr) {
        fd.append("tripDays", tripDaysStr);
      }
      fd.append("priceIdr", String(Math.round(priceIdrNum)));
      fd.append("priceUsd", String(priceUsdNum));
      fd.append("tags", JSON.stringify(tagsPayload));
      if (pdfFile) {
        fd.append("document", pdfFile, pdfFile.name);
      }
      for (const f of coverFiles) {
        fd.append("coverImages", f, f.name);
      }
      if (removeCoverIds.length > 0) {
        fd.append("removeCoverIds", JSON.stringify(removeCoverIds));
      }

      const url = isEdit ? `/api/document-guide/${encodeURIComponent(editingId!)}` : "/api/document-guide";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        body: fd,
        credentials: "include",
      });

      if (res.status === 401) {
        router.push("/admin");
        router.refresh();
        return;
      }

      const body: unknown = await res.json().catch(() => null);
      const msg =
        typeof body === "object" &&
        body !== null &&
        "message" in body &&
        typeof (body as { message: string }).message === "string"
          ? (body as { message: string }).message
          : `Request failed (${res.status}).`;

      if (!res.ok) {
        setCreateError(msg);
        return;
      }

      await loadRows(search.trim());
      handleModalClose();
    } catch {
      setCreateError("Could not reach the server.");
    } finally {
      setCreateSubmitting(false);
    }
  }, [
    editingId,
    form.titleId,
    form.titleEn,
    form.tripDays,
    form.priceIdr,
    form.priceUsd,
    createRegionIds,
    createCountryIds,
    createCityIds,
    pdfFile,
    coverFiles,
    removeCoverIds,
    existingCovers,
    router,
    search,
    loadRows,
  ]);

  return (
    <section>
      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Document Guide</h1>
            <p className="mt-1 text-sm text-slate-600">
              Kelola e-book panduan liburan: lokasi, harga, file, dan status publikasi.
            </p>
          </div>
          <Button onClick={openCreate}>Add Document Guide</Button>
        </div>

        <div className="p-5">
          <div className="relative mb-4 max-w-xs sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Cari judul / dokumen / lokasi (ke server)…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search document guides"
            />
          </div>

          {listError ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {listError}
            </div>
          ) : null}

          {listLoading && rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">Memuat daftar…</p>
          ) : (
            <DataTable
              columns={columns}
              data={rows}
              emptyMessage="No document guides"
              getRowKey={(row) => row.id}
            />
          )}
        </div>
      </Card>

      <Modal
        open={open}
        onClose={() => {
          if (!createSubmitting) handleModalClose();
        }}
        title={editingId ? "Edit Document Guide" : "Create Document Guide"}
        description={
          editingId
            ? "Perbarui di server (PATCH). Form sama seperti buat baru; PDF baru opsional jika hanya mengubah judul, harga, atau lokasi."
            : "Upload PDF ke server. Region / negara / kota bisa multi-select; pilih negara atau kota akan menambah region ke daftar. Country & city boleh kosong di payload (null). Hapus item lewat silang pada chip."
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleModalClose} disabled={createSubmitting}>
              Cancel
            </Button>
            <Button onClick={() => void submitSave()} disabled={createSubmitting}>
              {createSubmitting
                ? editingId
                  ? "Menyimpan…"
                  : "Mengunggah…"
                : "Save"}
            </Button>
          </div>
        }
      >
        <div className="max-h-[70vh] space-y-4 overflow-visible pr-1">
          {createError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {createError}
            </div>
          ) : null}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Title (Indonesian)
            </label>
            <Input
              value={form.titleId}
              onChange={(e) => setForm((f) => ({ ...f, titleId: e.target.value }))}
              disabled={createSubmitting}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Title (English)
            </label>
            <Input
              value={form.titleEn}
              onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))}
              placeholder="Optional"
              disabled={createSubmitting}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Lama liburan (hari)
            </label>
            <Input
              type="number"
              min={1}
              max={365}
              step={1}
              value={form.tripDays}
              onChange={(e) => setForm((f) => ({ ...f, tripDays: e.target.value }))}
              placeholder="Contoh: 3"
              disabled={createSubmitting}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Cover images (max 8)
            </label>
            {existingCovers.length > 0 ? (
              <ul className="mb-2 space-y-1">
                {existingCovers.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-2 rounded border border-slate-100 px-2 py-1 text-xs"
                  >
                    <span className="truncate">{c.id.slice(0, 8)}…</span>
                    {removeCoverIds.includes(c.id) ? (
                      <button
                        type="button"
                        className="text-admin-primary-600"
                        onClick={() =>
                          setRemoveCoverIds((ids) => ids.filter((x) => x !== c.id))
                        }
                      >
                        Undo
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="text-red-600"
                        onClick={() =>
                          setRemoveCoverIds((ids) => [...ids, c.id])
                        }
                      >
                        Remove
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              className="block w-full cursor-pointer text-sm text-slate-600 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-admin-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-admin-primary-700 hover:file:bg-admin-primary-100"
              disabled={createSubmitting}
              onChange={(e) =>
                setCoverFiles(Array.from(e.target.files ?? []))
              }
            />
            {coverFiles.length > 0 ? (
              <p className="mt-1 text-xs text-slate-500">
                {coverFiles.length} file baru dipilih
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                Opsional. JPEG, PNG, atau WebP. Bisa lebih dari satu.
              </p>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Harga Rupiah (IDR)</label>
              <Input
                type="number"
                min={0}
                step={1}
                value={form.priceIdr}
                onChange={(e) => setForm((f) => ({ ...f, priceIdr: e.target.value }))}
                placeholder="150000"
                disabled={createSubmitting}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Harga USD</label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.priceUsd}
                onChange={(e) => setForm((f) => ({ ...f, priceUsd: e.target.value }))}
                placeholder="9.99"
                disabled={createSubmitting}
              />
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <span className="text-sm font-medium text-slate-800">Lokasi (multi-select)</span>
              <p className="mt-1 text-xs text-slate-500">
                Tidak ada filter silang: semua region/negara/kota bisa dicari. Menambah negara (mis. Indonesia)
                otomatis menambah region (Asia). Menambah kota (mis. Bandung) otomatis menambah negara & region.
                Gunakan silang pada chip untuk menghapus satu pilihan.
              </p>
            </div>

            <AsyncMultiSelect
              label="Region"
              value={createRegionIds}
              onChange={setCreateRegionIds}
              loadPage={loadRegionOptionsPage}
              resolvedLabels={createGeoLabels}
              placeholder="Cari & pilih region…"
              searchPlaceholder="Cari region…"
              disabled={createSubmitting}
              emptyHint="Tidak ada region."
            />

            <AsyncMultiSelect
              label="Country (opsional)"
              value={createCountryIds}
              onChange={(ids) => void handleCreateCountriesChange(ids)}
              loadPage={loadCountryOptionsPage}
              resolvedLabels={createGeoLabels}
              placeholder="Cari & pilih negara…"
              searchPlaceholder="Cari negara…"
              disabled={createSubmitting}
              emptyHint="Tidak ada negara."
            />

            <AsyncMultiSelect
              label="City (opsional)"
              value={createCityIds}
              onChange={(ids) => void handleCreateCitiesChange(ids)}
              loadPage={loadCityOptionsPage}
              resolvedLabels={createGeoLabels}
              placeholder="Cari & pilih kota…"
              searchPlaceholder="Cari kota…"
              disabled={createSubmitting}
              emptyHint="Tidak ada kota."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Document (PDF only)</label>
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="block w-full cursor-pointer text-sm text-slate-600 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-admin-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-admin-primary-700 hover:file:bg-admin-primary-100"
              disabled={createSubmitting}
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setPdfFile(file);
                setForm((f) => ({ ...f, fileName: file ? file.name : f.fileName }));
              }}
            />
            {pdfFile ? (
              <p className="mt-1 text-xs text-slate-500">File baru: {pdfFile.name}</p>
            ) : editingId ? (
              <p className="mt-1 text-xs text-slate-500">
                Berkas saat ini: {form.fileName || "—"}. Pilih PDF baru untuk mengganti (opsional).
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">Belum ada file dipilih (wajib untuk buat baru).</p>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={previewOpen}
        onClose={closePreviewModal}
        title={previewTitle ? `Preview · ${previewTitle}` : "Preview dokumen"}
        description={previewFileName || undefined}
        panelClassName="w-full max-w-[min(1280px,96vw)]"
        rootClassName="z-[100]"
        footer={
          previewDocumentId && previewUrl && !previewLoading && !previewError ? (
            <div className="flex justify-end">
              <a
                href={`/api/document-guide/${encodeURIComponent(previewDocumentId)}/download`}
                download={pdfDownloadName(previewFileName)}
                className={cn(
                  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2",
                )}
              >
                <Download className="h-4 w-4 shrink-0" aria-hidden />
                Download PDF
              </a>
            </div>
          ) : null
        }
      >
        <div className="space-y-3">
          {previewLoading ? (
            <p className="py-16 text-center text-sm text-slate-500">Memuat PDF…</p>
          ) : null}
          {previewError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {previewError}
            </div>
          ) : null}
          {previewUrl && !previewLoading ? <PdfJsPreview url={previewUrl} /> : null}
        </div>
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={closeDeleteDialog}
        title="Hapus dari katalog panduan?"
        description="Panduan ini beserta berkas PDF dan pengaturan harga akan dihapus dari server. Setelah sukses, data tidak dapat dikembalikan lewat panel admin."
        footer={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button type="button" variant="outline" disabled={deleteSubmitting} onClick={closeDeleteDialog}>
              Batal
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={deleteSubmitting}
              className="border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50 focus-visible:ring-red-300"
              onClick={() => void performDelete()}
            >
              {deleteSubmitting ? "Menghapus…" : "Ya, hapus panduan"}
            </Button>
          </div>
        }
      >
        {deleteTarget ? (
          <div className="space-y-4">
            {deleteDialogError ? (
              <div
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                role="alert"
              >
                {deleteDialogError}
              </div>
            ) : null}

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Judul</p>
              <p className="mt-0.5 font-semibold text-slate-900">{deleteTarget.title}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-slate-500">Berkas</p>
                  <p className="truncate font-mono text-xs text-slate-800">{deleteTarget.fileName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Status</p>
                  <p className="mt-0.5">
                    <Badge variant={deleteTarget.status === "published" ? "accent" : "primary"}>
                      {deleteTarget.status}
                    </Badge>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 rounded-lg border border-slate-200 bg-admin-primary-50 px-3 py-2.5 text-sm text-slate-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-admin-primary-700" aria-hidden />
              <p className="leading-snug">
                Mohon cek ulang judul dan nama berkas. Jika kurang yakin, tutup lewat{" "}
                <span className="font-medium text-slate-900">Batal</span> — tidak ada perubahan sampai Anda
                menekan hapus.
              </p>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
