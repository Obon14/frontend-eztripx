"use client";

import { AlertTriangle, Download, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AsyncMultiSelect } from "@/components/ui/async-multi-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { RowActionMenu } from "@/components/ui/row-action-menu";
import { DataTable } from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import {
  LocationTagsCell,
  GuideTitleCell,
  resolveGuideDisplayTitle,
} from "@/components/admin/location-tags-cell";
import { GuideCoverCarousel } from "@/components/landing/guide-cover-carousel";
import { buildDocumentGuideTags } from "@/lib/geo/document-guide-tags";
import { resolveTripleFromCityId, resolveTripleFromCountryId } from "@/lib/geo/document-guide-resolve";
import {
  loadCityOptionsPage,
  loadCountryOptionsPage,
  loadRegionOptionsPage,
} from "@/lib/geo/select-options";
import { parseDocumentGuideListResponse } from "@/lib/document-guide/parse-list-response";
import { publicGuideCoverSrc } from "@/lib/document-guide/parse-public-list";
import {
  clampLimit,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  MIN_LIMIT,
} from "@/lib/api/list-query";
import { cn } from "@/lib/utils";
import type { DocumentGuide } from "@/types/admin";
import type { ListMeta } from "@/types/geo-api";
import { PdfJsPreview } from "@/components/admin/pdf-js-preview";
import { Textarea } from "@/components/ui/textarea";

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

/** Thousand separators with `.` (e.g. 49000 → 49.000). */
function formatThousandDots(digits: string): string {
  if (!digits) return "";
  const trimmed = digits.replace(/^0+(?=\d)/, "") || "0";
  return trimmed.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Format IDR input while typing (integers only). */
function formatIdrInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return formatThousandDots(digits);
}

/** Format USD input: `.` thousands, `,` decimals (max 2). */
function formatUsdInput(raw: string): string {
  const normalized = raw.replace(/[^\d.,]/g, "");
  if (!normalized) return "";

  const commaIdx = normalized.indexOf(",");
  let intPart: string;
  let decPart: string | null = null;

  if (commaIdx >= 0) {
    intPart = normalized.slice(0, commaIdx).replace(/\D/g, "");
    decPart = normalized.slice(commaIdx + 1).replace(/\D/g, "").slice(0, 2);
  } else {
    // Treat `.` as thousand sep; also allow trailing `.` typed as start of decimal via `,` only
    intPart = normalized.replace(/\D/g, "");
  }

  const formattedInt = formatThousandDots(intPart || (decPart !== null ? "0" : ""));
  if (decPart !== null) {
    return `${formattedInt},${decPart}`;
  }
  return formattedInt;
}

function parseIdrInput(formatted: string): number {
  return Number(formatted.replace(/\./g, ""));
}

function parseUsdInput(formatted: string): number {
  const cleaned = formatted.replace(/\./g, "").replace(",", ".");
  return Number(cleaned);
}

function idrFromNumber(n: number): string {
  if (!Number.isFinite(n)) return "";
  return formatThousandDots(String(Math.round(n)));
}

function usdFromNumber(n: number): string {
  if (!Number.isFinite(n)) return "";
  const fixed = n.toFixed(2);
  const [intRaw, dec] = fixed.split(".");
  const intFormatted = formatThousandDots(intRaw);
  if (dec === "00") return intFormatted;
  return `${intFormatted},${dec}`;
}

/** File name for Content-Disposition / download (ensure .pdf). */
function pdfDownloadName(fileName: string): string {
  const t = fileName.trim() || "document";
  return /\.pdf$/i.test(t) ? t : `${t}.pdf`;
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
  description: string;
  descriptionEn: string;
  tripDays: string;
  priceIdr: string;
  priceUsd: string;
  fileName: string;
  status: DocumentGuide["status"];
  previewMode: DocumentGuide["previewMode"];
  previewPageCount: string;
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
const LIMIT_OPTIONS = [10, 25, 50, 100] as const;

export function DocumentGuideTablePage() {
  const router = useRouter();
  const [rows, setRows] = useState<DocumentGuide[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
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
    description: "",
    descriptionEn: "",
    tripDays: "",
    priceIdr: "0",
    priceUsd: "0",
    fileName: "",
    status: "draft",
    previewMode: "hide",
    previewPageCount: "3",
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

  const [coverPreview, setCoverPreview] = useState<{
    guideId: string;
    title: string;
    coverImages: DocumentGuide["coverImages"];
  } | null>(null);

  const openCoverPreview = useCallback((row: DocumentGuide) => {
    const { primary } = resolveGuideDisplayTitle(row.titleId, row.titleEn);
    setCoverPreview({
      guideId: row.id,
      title: primary,
      coverImages: row.coverImages,
    });
  }, []);

  const loadRows = useCallback(
    async (searchQuery: string, pageNum: number, pageLimit: number, signal?: AbortSignal) => {
      setListLoading(true);
      setListError(null);
      try {
        const params = new URLSearchParams({
          page: String(pageNum),
          limit: String(clampLimit(pageLimit)),
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
          setMeta(null);
          return;
        }
        const { data, meta: listMeta } = parseDocumentGuideListResponse(body);
        setRows(data);
        setMeta(listMeta);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setListError("Tidak dapat memuat daftar document guide.");
        setRows([]);
        setMeta(null);
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
    const t = window.setTimeout(
      () => void loadRows(q, page, limit, controller.signal),
      delay,
    );
    return () => {
      controller.abort();
      window.clearTimeout(t);
    };
  }, [search, page, limit, loadRows]);

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

  const openEdit = useCallback((row: DocumentGuide) => {
    setEditingId(row.id);
    setForm({
      titleId: row.titleId,
      titleEn: row.titleEn ?? "",
      description: row.description ?? "",
      descriptionEn: row.descriptionEn ?? "",
      tripDays: row.tripDays ? String(row.tripDays) : "",
      priceIdr: idrFromNumber(row.priceIdr),
      priceUsd: usdFromNumber(row.priceUsd),
      fileName: row.fileName,
      status: row.status,
      previewMode: row.previewMode ?? "hide",
      previewPageCount: String(row.previewPageCount ?? 3),
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
    setExistingCovers(row.coverImages.map((c) => ({ id: c.id, url: c.url })));
    setCreateError(null);
    setOpen(true);
  }, []);

  const updateStatus = useCallback(
    async (row: DocumentGuide, status: DocumentGuide["status"]) => {
      if (row.status === status) return;
      try {
        const fd = new FormData();
        fd.append("status", status);
        const res = await fetch(`/api/document-guide/${encodeURIComponent(row.id)}`, {
          method: "PATCH",
          body: fd,
          credentials: "include",
        });
        if (res.status === 401) {
          router.push("/admin");
          router.refresh();
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
              : `Gagal mengubah status (${res.status}).`;
          setListError(msg);
          return;
        }
        setListError(null);
        await loadRows(search.trim(), page, limit);
      } catch {
        setListError("Tidak dapat mengubah status. Periksa koneksi lalu coba lagi.");
      }
    },
    [router, loadRows, search, page, limit],
  );

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
      await loadRows(search.trim(), page, limit);
      setDeleteTarget(null);
    } catch {
      setDeleteDialogError("Tidak dapat menghubungi server. Periksa koneksi lalu coba lagi.");
    } finally {
      setDeleteSubmitting(false);
    }
  }, [deleteTarget, router, loadRows, search, page, limit]);

  const columns = useMemo(
    () => [
      {
        key: "title",
        header: "Title",
        className: "max-w-[240px] align-top",
        render: (row: DocumentGuide) => (
          <GuideTitleCell titleId={row.titleId} titleEn={row.titleEn} />
        ),
      },
      {
        key: "cover",
        header: "Cover",
        className: "w-[72px]",
        render: (row: DocumentGuide) => (
          <button
            type="button"
            className="group relative block cursor-zoom-in overflow-hidden rounded ring-offset-2 transition hover:ring-2 hover:ring-admin-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary"
            aria-label={`Preview cover ${resolveGuideDisplayTitle(row.titleId, row.titleEn).primary}`}
            onClick={() => openCoverPreview(row)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={publicGuideCoverSrc(
                row.id,
                row.coverImages[0]?.id ?? "legacy",
              )}
              alt=""
              className="h-10 w-14 object-cover transition group-hover:brightness-95"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_COVER;
              }}
            />
          </button>
        ),
      },
      {
        key: "tripDays",
        header: "Hari",
        render: (row: DocumentGuide) => (row.tripDays ? `${row.tripDays} hari` : "—"),
      },
      {
        key: "location",
        header: "Lokasi",
        className: "min-w-[140px] max-w-[240px] align-top",
        render: (row: DocumentGuide) => (
          <LocationTagsCell tags={row.structuredTags ?? []} />
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
          <Badge variant={row.status === "published" ? "accent" : "primary"}>
            {row.status === "published" ? "published" : "draft"}
          </Badge>
        ),
      },
      {
        key: "action",
        header: "Action",
        className: "w-[72px]",
        render: (row: DocumentGuide) => (
          <RowActionMenu
            label={`Aksi ${row.title}`}
            items={[
              {
                key: "edit",
                label: "Edit",
                onSelect: () => openEdit(row),
              },
              {
                key: "preview",
                label: "Preview doc",
                onSelect: () => void openDocumentPreview(row),
              },
              {
                key: "status",
                label: row.status === "published" ? "Jadikan draft" : "Post",
                onSelect: () =>
                  void updateStatus(
                    row,
                    row.status === "published" ? "draft" : "published",
                  ),
              },
              {
                key: "delete",
                label: "Hapus",
                tone: "danger",
                onSelect: () => openDeleteDialog(row),
              },
            ]}
          />
        ),
      },
    ],
    [openCoverPreview, openDocumentPreview, openDeleteDialog, openEdit, updateStatus],
  );

  function openCreate() {
    setEditingId(null);
    setForm({
      titleId: "",
      titleEn: "",
      description: "",
      descriptionEn: "",
      tripDays: "",
      priceIdr: "",
      priceUsd: "",
      fileName: "",
      status: "draft",
      previewMode: "hide",
      previewPageCount: "3",
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
    const description = form.description.trim();
    const descriptionEn = form.descriptionEn.trim();
    const priceIdrStr = form.priceIdr.trim();
    const priceUsdStr = form.priceUsd.trim();

    if (!titleId) {
      setCreateError("Title (Indonesian) is required.");
      return;
    }
    if (description.length > 2000) {
      setCreateError("Description (Indonesian) must be at most 2000 characters.");
      return;
    }
    if (descriptionEn.length > 2000) {
      setCreateError("Description (English) must be at most 2000 characters.");
      return;
    }
    if (!priceIdrStr || !priceUsdStr) {
      setCreateError("Price IDR and price USD are required.");
      return;
    }
    const priceIdrNum = parseIdrInput(priceIdrStr);
    const priceUsdNum = parseUsdInput(priceUsdStr);
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

    const previewMode = form.previewMode === "show" ? "show" : "hide";
    let previewPageCount = 3;
    if (previewMode === "hide") {
      const pc = Number(form.previewPageCount.trim());
      if (!Number.isInteger(pc) || pc < 1 || pc > 999) {
        setCreateError("Preview page limit must be an integer between 1 and 999.");
        return;
      }
      previewPageCount = pc;
    }

    setCreateSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("titleId", titleId);
      if (titleEn) {
        fd.append("titleEn", titleEn);
      }
      // Always send so clear/empty on edit stores null.
      fd.append("description", description);
      fd.append("descriptionEn", descriptionEn);
      if (tripDaysStr) {
        fd.append("tripDays", tripDaysStr);
      }
      fd.append("priceIdr", String(Math.round(priceIdrNum)));
      fd.append("priceUsd", String(priceUsdNum));
      fd.append("previewMode", previewMode);
      if (previewMode === "hide") {
        fd.append("previewPageCount", String(previewPageCount));
      }
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

      await loadRows(search.trim(), page, limit);
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
    form.description,
    form.descriptionEn,
    form.tripDays,
    form.priceIdr,
    form.priceUsd,
    form.previewMode,
    form.previewPageCount,
    createRegionIds,
    createCountryIds,
    createCityIds,
    pdfFile,
    coverFiles,
    removeCoverIds,
    existingCovers,
    router,
    search,
    page,
    limit,
    loadRows,
  ]);

  return (
    <section>
      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Document Guide</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              aria-label="Search document guides"
            />
          </div>

          {listError ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
              {listError}
            </div>
          ) : null}

          {listLoading && rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">Memuat daftar…</p>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={rows}
                emptyMessage="No document guides"
                getRowKey={(row) => row.id}
              />
              {meta && !listLoading ? (
                <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
                  <p className="min-w-0 flex-1">
                    {meta.total === 0
                      ? "Tidak ada data."
                      : `Menampilkan ${(meta.page - 1) * meta.limit + 1}–${Math.min(meta.page * meta.limit, meta.total)} dari ${meta.total} (halaman ${meta.page} / ${meta.totalPages})`}
                  </p>
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col gap-1">
                      <label
                        className="text-xs font-medium text-slate-600 dark:text-slate-400"
                        htmlFor="guide-page-size"
                      >
                        Baris per halaman ({MIN_LIMIT}–{MAX_LIMIT})
                      </label>
                      <Select
                        id="guide-page-size"
                        className="h-9 w-24 min-w-0 text-sm"
                        value={String(clampLimit(limit))}
                        disabled={listLoading}
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
                        disabled={listLoading || meta.page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        Previous
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={listLoading || meta.page >= meta.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </>
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
        <div className="space-y-4 pr-1">
          {createError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
              {createError}
            </div>
          ) : null}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Title (Indonesian)
            </label>
            <Input
              value={form.titleId}
              onChange={(e) => setForm((f) => ({ ...f, titleId: e.target.value }))}
              disabled={createSubmitting}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Description (Indonesian)
            </label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Opsional. Ditampilkan di kartu panduan publik (locale ID)."
              maxLength={2000}
              disabled={createSubmitting}
              rows={3}
            />
            <p className="mt-1 text-xs text-slate-500">
              Opsional. Maks. 2000 karakter.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Description (English)
            </label>
            <Textarea
              value={form.descriptionEn}
              onChange={(e) => setForm((f) => ({ ...f, descriptionEn: e.target.value }))}
              placeholder="Optional. Shown on public cards when locale is EN."
              maxLength={2000}
              disabled={createSubmitting}
              rows={3}
            />
            <p className="mt-1 text-xs text-slate-500">
              Optional. Max 2000 characters. Falls back to Indonesian if empty.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
          <div className="grid grid-cols-2 items-end gap-4">
            <div className="min-w-0">
              <label className="mb-1 block truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                Harga Rupiah (IDR)
              </label>
              <Input
                type="text"
                inputMode="numeric"
                className="tabular-nums"
                value={form.priceIdr}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priceIdr: formatIdrInput(e.target.value) }))
                }
                placeholder="150.000"
                disabled={createSubmitting}
              />
            </div>
            <div className="min-w-0">
              <label className="mb-1 block truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                Harga USD
              </label>
              <Input
                type="text"
                inputMode="decimal"
                className="tabular-nums"
                value={form.priceUsd}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priceUsd: formatUsdInput(e.target.value) }))
                }
                placeholder="9,99"
                disabled={createSubmitting}
              />
            </div>
          </div>

          <div>
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Preview doc
            </span>
            <p className="mb-2 text-xs text-slate-500">
              Hide: publik hanya melihat N halaman pertama (dipotong di server). Show: publik
              bisa melihat seluruh PDF — gunakan hati-hati untuk dokumen berbayar.
            </p>
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="previewMode"
                  value="hide"
                  checked={form.previewMode === "hide"}
                  disabled={createSubmitting}
                  onChange={() => setForm((f) => ({ ...f, previewMode: "hide" }))}
                  className="h-4 w-4 accent-admin-primary-600"
                />
                hide
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="previewMode"
                  value="show"
                  checked={form.previewMode === "show"}
                  disabled={createSubmitting}
                  onChange={() => setForm((f) => ({ ...f, previewMode: "show" }))}
                  className="h-4 w-4 accent-admin-primary-600"
                />
                show
              </label>
            </div>
            {form.previewMode === "hide" ? (
              <div className="mt-3 max-w-xs">
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Limit halaman preview
                </label>
                <Input
                  type="number"
                  min={1}
                  max={999}
                  step={1}
                  value={form.previewPageCount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, previewPageCount: e.target.value }))
                  }
                  placeholder="3"
                  disabled={createSubmitting}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Default 3. Hanya halaman 1 sampai angka ini yang dikirim ke publik.
                </p>
              </div>
            ) : null}
          </div>

          <div className="space-y-5">
            <div>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Lokasi (multi-select)</span>
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
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Document (PDF only)</label>
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
        open={coverPreview !== null}
        onClose={() => setCoverPreview(null)}
        title={coverPreview ? `Cover · ${coverPreview.title}` : "Cover preview"}
        panelClassName="w-full max-w-lg"
      >
        {coverPreview ? (
          <GuideCoverCarousel
            guideId={coverPreview.guideId}
            coverImages={coverPreview.coverImages.map((c) => ({
              id: c.id,
              url: c.url,
              sortOrder: c.sortOrder,
            }))}
            alt={coverPreview.title}
          />
        ) : null}
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
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
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
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
                role="alert"
              >
                {deleteDialogError}
              </div>
            ) : null}

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-800/50">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Judul</p>
              <p className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">{deleteTarget.title}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Berkas</p>
                  <p className="truncate font-mono text-xs text-slate-800 dark:text-slate-200">{deleteTarget.fileName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</p>
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
