"use client";

import { Pencil, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Select } from "@/components/ui/select";
import { DataTable } from "@/components/ui/table";
import { loadCountryOptions, loadRegionOptions } from "@/lib/geo/select-options";
import {
  clampLimit,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  MIN_LIMIT,
} from "@/lib/api/list-query";
import type {
  CityListItem,
  CountryListItem,
  ListMeta,
  PaginatedResponse,
  RegionListItem,
} from "@/types/geo-api";

type GeoKind = "region" | "country" | "city";

type GeoListPageProps = {
  title: string;
  description: string;
  kind: GeoKind;
  /** POST/PATCH + add/edit UI (per kind: region, country, city) */
  enableMutations?: boolean;
};

const API_PATH: Record<GeoKind, string> = {
  region: "/api/region",
  country: "/api/country",
  city: "/api/city",
};

const LIMIT_OPTIONS = [10, 25, 50, 100] as const;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function parsePaginated<T>(body: unknown): PaginatedResponse<T> | null {
  if (!isRecord(body) || !Array.isArray(body.data) || !isRecord(body.meta)) return null;
  const m = body.meta;
  const page = Number(m.page);
  const limit = Number(m.limit);
  const total = Number(m.total);
  const totalPages = Number(m.totalPages);
  if (![page, limit, total, totalPages].every((n) => Number.isFinite(n))) return null;
  return {
    data: body.data as T[],
    meta: { page, limit, total, totalPages },
  };
}

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

type FetchQuery = {
  page: number;
  limit: number;
  search: string;
};

export function GeoListPage({ title, description, kind, enableMutations = false }: GeoListPageProps) {
  const router = useRouter();
  const regionCrud = enableMutations && kind === "region";
  const countryCrud = enableMutations && kind === "country";
  const cityCrud = enableMutations && kind === "city";
  const showAddButton = regionCrud || countryCrud || cityCrud;
  const [searchInput, setSearchInput] = useState("");
  const [fetchQuery, setFetchQuery] = useState<FetchQuery>({
    page: 1,
    limit: DEFAULT_LIMIT,
    search: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regions, setRegions] = useState<RegionListItem[]>([]);
  const [countries, setCountries] = useState<CountryListItem[]>([]);
  const [cities, setCities] = useState<CityListItem[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);

  const [regionModalOpen, setRegionModalOpen] = useState(false);
  const [regionModalMode, setRegionModalMode] = useState<"create" | "edit">("create");
  const [editingRegion, setEditingRegion] = useState<RegionListItem | null>(null);
  const [regionNameInput, setRegionNameInput] = useState("");
  const [regionFormError, setRegionFormError] = useState<string | null>(null);
  const [regionSaving, setRegionSaving] = useState(false);

  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [countryModalMode, setCountryModalMode] = useState<"create" | "edit">("create");
  const [editingCountry, setEditingCountry] = useState<CountryListItem | null>(null);
  const [countryNameInput, setCountryNameInput] = useState("");
  const [countryRegionPick, setCountryRegionPick] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [countryFormError, setCountryFormError] = useState<string | null>(null);
  const [countrySaving, setCountrySaving] = useState(false);

  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [cityModalMode, setCityModalMode] = useState<"create" | "edit">("create");
  const [editingCity, setEditingCity] = useState<CityListItem | null>(null);
  const [cityNameInput, setCityNameInput] = useState("");
  const [cityCountryPick, setCityCountryPick] = useState<{ id: string; label: string } | null>(null);
  const [cityFormError, setCityFormError] = useState<string | null>(null);
  const [citySaving, setCitySaving] = useState(false);

  const openRegionCreate = useCallback(() => {
    setRegionModalMode("create");
    setEditingRegion(null);
    setRegionNameInput("");
    setRegionFormError(null);
    setRegionModalOpen(true);
  }, []);

  const openRegionEdit = useCallback((row: RegionListItem) => {
    setRegionModalMode("edit");
    setEditingRegion(row);
    setRegionNameInput(row.name);
    setRegionFormError(null);
    setRegionModalOpen(true);
  }, []);

  const closeRegionModal = useCallback(() => {
    setRegionModalOpen(false);
    setEditingRegion(null);
    setRegionNameInput("");
    setRegionFormError(null);
  }, []);

  const openCountryCreate = useCallback(() => {
    setCountryModalMode("create");
    setEditingCountry(null);
    setCountryNameInput("");
    setCountryRegionPick(null);
    setCountryFormError(null);
    setCountryModalOpen(true);
  }, []);

  const openCountryEdit = useCallback((row: CountryListItem) => {
    setCountryModalMode("edit");
    setEditingCountry(row);
    setCountryNameInput(row.name);
    setCountryRegionPick(
      row.region ? { id: String(row.region.id), label: row.region.name } : null,
    );
    setCountryFormError(null);
    setCountryModalOpen(true);
  }, []);

  const closeCountryModal = useCallback(() => {
    setCountryModalOpen(false);
    setEditingCountry(null);
    setCountryNameInput("");
    setCountryRegionPick(null);
    setCountryFormError(null);
  }, []);

  const openCityCreate = useCallback(() => {
    setCityModalMode("create");
    setEditingCity(null);
    setCityNameInput("");
    setCityCountryPick(null);
    setCityFormError(null);
    setCityModalOpen(true);
  }, []);

  const openCityEdit = useCallback((row: CityListItem) => {
    setCityModalMode("edit");
    setEditingCity(row);
    setCityNameInput(row.name);
    setCityCountryPick(
      row.country ? { id: String(row.country.id), label: row.country.name } : null,
    );
    setCityFormError(null);
    setCityModalOpen(true);
  }, []);

  const closeCityModal = useCallback(() => {
    setCityModalOpen(false);
    setEditingCity(null);
    setCityNameInput("");
    setCityCountryPick(null);
    setCityFormError(null);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setFetchQuery((prev) => {
        if (prev.search === searchInput) return prev;
        return { ...prev, search: searchInput, page: 1 };
      });
    }, 400);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const safeLimit = clampLimit(fetchQuery.limit);
    const safePage = Math.max(1, fetchQuery.page);
    const params = new URLSearchParams({
      page: String(safePage),
      limit: String(safeLimit),
      search: fetchQuery.search.trim(),
    });

    try {
      const res = await fetch(`${API_PATH[kind]}?${params.toString()}`, {
        credentials: "include",
      });

      if (res.status === 401) {
        router.push("/admin");
        router.refresh();
        return;
      }

      const body: unknown = await res.json().catch(() => null);
      const msg =
        isRecord(body) && typeof body.message === "string" ? body.message : `Request failed (${res.status}).`;

      if (!res.ok) {
        setError(msg);
        setRegions([]);
        setCountries([]);
        setCities([]);
        setMeta(null);
        return;
      }

      if (kind === "region") {
        const parsed = parsePaginated<RegionListItem>(body);
        if (!parsed) {
          setError("Unexpected response shape.");
          setRegions([]);
          setMeta(null);
          return;
        }
        setRegions(parsed.data);
        setMeta(parsed.meta);
      } else if (kind === "country") {
        const parsed = parsePaginated<CountryListItem>(body);
        if (!parsed) {
          setError("Unexpected response shape.");
          setCountries([]);
          setMeta(null);
          return;
        }
        setCountries(parsed.data);
        setMeta(parsed.meta);
      } else {
        const parsed = parsePaginated<CityListItem>(body);
        if (!parsed) {
          setError("Unexpected response shape.");
          setCities([]);
          setMeta(null);
          return;
        }
        setCities(parsed.data);
        setMeta(parsed.meta);
      }
    } catch {
      setError("Could not reach the server.");
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [kind, fetchQuery.page, fetchQuery.limit, fetchQuery.search, router]);

  useEffect(() => {
    void load();
  }, [load]);

  const submitRegionModal = useCallback(async () => {
    const name = regionNameInput.trim();
    if (!name) {
      setRegionFormError("Name is required.");
      return;
    }
    if (regionModalMode === "edit" && !editingRegion) {
      setRegionFormError("No region selected.");
      return;
    }
    setRegionSaving(true);
    setRegionFormError(null);
    try {
      const url = regionModalMode === "create" ? "/api/region" : `/api/region/${editingRegion!.id}`;
      const method = regionModalMode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.status === 401) {
        router.push("/admin");
        router.refresh();
        return;
      }

      const body: unknown = await res.json().catch(() => null);
      const msg =
        isRecord(body) && typeof body.message === "string" ? body.message : `Request failed (${res.status}).`;

      if (!res.ok) {
        setRegionFormError(msg);
        return;
      }

      closeRegionModal();
      await load();
    } catch {
      setRegionFormError("Could not reach the server.");
    } finally {
      setRegionSaving(false);
    }
  }, [regionNameInput, regionModalMode, editingRegion, router, closeRegionModal, load]);

  const submitCountryModal = useCallback(async () => {
    const name = countryNameInput.trim();
    if (!name) {
      setCountryFormError("Name is required.");
      return;
    }
    if (!countryRegionPick) {
      setCountryFormError("Region is required.");
      return;
    }
    if (countryModalMode === "edit" && !editingCountry) {
      setCountryFormError("No country selected.");
      return;
    }
    const regionId = Number(countryRegionPick.id);
    if (!Number.isFinite(regionId)) {
      setCountryFormError("Invalid region.");
      return;
    }

    setCountrySaving(true);
    setCountryFormError(null);
    try {
      const url = countryModalMode === "create" ? "/api/country" : `/api/country/${editingCountry!.id}`;
      const method = countryModalMode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, regionId }),
      });

      if (res.status === 401) {
        router.push("/admin");
        router.refresh();
        return;
      }

      const body: unknown = await res.json().catch(() => null);
      const msg =
        isRecord(body) && typeof body.message === "string" ? body.message : `Request failed (${res.status}).`;

      if (!res.ok) {
        setCountryFormError(msg);
        return;
      }

      closeCountryModal();
      await load();
    } catch {
      setCountryFormError("Could not reach the server.");
    } finally {
      setCountrySaving(false);
    }
  }, [
    countryNameInput,
    countryRegionPick,
    countryModalMode,
    editingCountry,
    router,
    closeCountryModal,
    load,
  ]);

  const submitCityModal = useCallback(async () => {
    const name = cityNameInput.trim();
    if (!name) {
      setCityFormError("Name is required.");
      return;
    }
    if (!cityCountryPick) {
      setCityFormError("Country is required.");
      return;
    }
    if (cityModalMode === "edit" && !editingCity) {
      setCityFormError("No city selected.");
      return;
    }
    const countryId = Number(cityCountryPick.id);
    if (!Number.isFinite(countryId)) {
      setCityFormError("Invalid country.");
      return;
    }

    setCitySaving(true);
    setCityFormError(null);
    try {
      const url = cityModalMode === "create" ? "/api/city" : `/api/city/${editingCity!.id}`;
      const method = cityModalMode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, countryId }),
      });

      if (res.status === 401) {
        router.push("/admin");
        router.refresh();
        return;
      }

      const body: unknown = await res.json().catch(() => null);
      const msg =
        isRecord(body) && typeof body.message === "string" ? body.message : `Request failed (${res.status}).`;

      if (!res.ok) {
        setCityFormError(msg);
        return;
      }

      closeCityModal();
      await load();
    } catch {
      setCityFormError("Could not reach the server.");
    } finally {
      setCitySaving(false);
    }
  }, [cityNameInput, cityCountryPick, cityModalMode, editingCity, router, closeCityModal, load]);

  const regionColumns = useMemo((): {
    key: string;
    header: string;
    className?: string;
    render: (row: RegionListItem, rowIndex: number) => ReactNode;
  }[] => {
    const cols: {
      key: string;
      header: string;
      className?: string;
      render: (row: RegionListItem, rowIndex: number) => ReactNode;
    }[] = [
      {
        key: "no",
        header: "No.",
        className: "w-14 tabular-nums",
        render: (_row: RegionListItem, rowIndex: number) =>
          meta
            ? String((meta.page - 1) * meta.limit + rowIndex + 1)
            : String(rowIndex + 1),
      },
      {
        key: "name",
        header: "Name",
        render: (row: RegionListItem) => row.name,
      },
      {
        key: "createdAt",
        header: "Created",
        render: (row: RegionListItem) => formatDate(row.createdAt),
      },
    ];
    if (regionCrud) {
      cols.push({
        key: "actions",
        header: "Action",
        className: "w-[120px]",
        render: (row: RegionListItem) => (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-9 gap-1.5 px-2 text-slate-600 hover:text-admin-primary-700"
            onClick={() => openRegionEdit(row)}
          >
            <Pencil className="h-4 w-4 shrink-0" />
            Edit
          </Button>
        ),
      });
    }
    return cols;
  }, [meta, regionCrud, openRegionEdit]);

  const countryColumns = useMemo((): {
    key: string;
    header: string;
    className?: string;
    render: (row: CountryListItem, rowIndex: number) => ReactNode;
  }[] => {
    const cols: {
      key: string;
      header: string;
      className?: string;
      render: (row: CountryListItem, rowIndex: number) => ReactNode;
    }[] = [
      {
        key: "no",
        header: "No.",
        className: "w-14 tabular-nums",
        render: (_row: CountryListItem, rowIndex: number) =>
          meta
            ? String((meta.page - 1) * meta.limit + rowIndex + 1)
            : String(rowIndex + 1),
      },
      { key: "name", header: "Name", render: (row: CountryListItem) => row.name },
      {
        key: "region",
        header: "Region",
        render: (row: CountryListItem) => row.region?.name ?? "—",
      },
      {
        key: "createdAt",
        header: "Created",
        render: (row: CountryListItem) => formatDate(row.createdAt),
      },
    ];
    if (countryCrud) {
      cols.push({
        key: "actions",
        header: "Action",
        className: "w-[120px]",
        render: (row: CountryListItem) => (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-9 gap-1.5 px-2 text-slate-600 hover:text-admin-primary-700"
            onClick={() => openCountryEdit(row)}
          >
            <Pencil className="h-4 w-4 shrink-0" />
            Edit
          </Button>
        ),
      });
    }
    return cols;
  }, [meta, countryCrud, openCountryEdit]);

  const cityColumns = useMemo((): {
    key: string;
    header: string;
    className?: string;
    render: (row: CityListItem, rowIndex: number) => ReactNode;
  }[] => {
    const cols: {
      key: string;
      header: string;
      className?: string;
      render: (row: CityListItem, rowIndex: number) => ReactNode;
    }[] = [
      {
        key: "no",
        header: "No.",
        className: "w-14 tabular-nums",
        render: (_row: CityListItem, rowIndex: number) =>
          meta
            ? String((meta.page - 1) * meta.limit + rowIndex + 1)
            : String(rowIndex + 1),
      },
      { key: "name", header: "Name", render: (row: CityListItem) => row.name },
      {
        key: "country",
        header: "Country",
        render: (row: CityListItem) => row.country?.name ?? "—",
      },
      {
        key: "createdAt",
        header: "Created",
        render: (row: CityListItem) => formatDate(row.createdAt),
      },
    ];
    if (cityCrud) {
      cols.push({
        key: "actions",
        header: "Action",
        className: "w-[120px]",
        render: (row: CityListItem) => (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-9 gap-1.5 px-2 text-slate-600 hover:text-admin-primary-700"
            onClick={() => openCityEdit(row)}
          >
            <Pencil className="h-4 w-4 shrink-0" />
            Edit
          </Button>
        ),
      });
    }
    return cols;
  }, [meta, cityCrud, openCityEdit]);

  const from = meta && meta.total > 0 ? (meta.page - 1) * meta.limit + 1 : 0;
  const to = meta && meta.total > 0 ? Math.min(meta.page * meta.limit, meta.total) : 0;

  return (
    <section>
      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          </div>
          {showAddButton ? (
            <Button
              type="button"
              onClick={() => {
                if (regionCrud) openRegionCreate();
                else if (countryCrud) openCountryCreate();
                else openCityCreate();
              }}
            >
              Add {title}
            </Button>
          ) : null}
        </div>

        <div className="p-5">
          {error ? (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          ) : null}

          <div className="relative mb-4 max-w-xs sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder={`Search ${title.toLowerCase()}…`}
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label={`Search ${title}`}
              disabled={loading}
            />
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500">Loading…</p>
          ) : kind === "region" ? (
            <DataTable
              columns={regionColumns}
              data={regions}
              emptyMessage={`No ${title.toLowerCase()} found.`}
              getRowKey={(row) => String(row.id)}
            />
          ) : kind === "country" ? (
            <DataTable
              columns={countryColumns}
              data={countries}
              emptyMessage={`No ${title.toLowerCase()} found.`}
              getRowKey={(row) => String(row.id)}
            />
          ) : (
            <DataTable
              columns={cityColumns}
              data={cities}
              emptyMessage={`No ${title.toLowerCase()} found.`}
              getRowKey={(row) => String(row.id)}
            />
          )}

          {meta && !loading ? (
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
              <p className="min-w-0 flex-1">
                {meta.total === 0
                  ? "No records."
                  : `Showing ${from}–${to} of ${meta.total} (page ${meta.page} of ${meta.totalPages})`}
              </p>
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600" htmlFor={`${kind}-page-size`}>
                    Rows per page ({MIN_LIMIT}–{MAX_LIMIT})
                  </label>
                  <Select
                    id={`${kind}-page-size`}
                    className="h-9 w-24 min-w-0 text-sm"
                    value={String(clampLimit(fetchQuery.limit))}
                    disabled={loading}
                    onChange={(e) => {
                      const next = clampLimit(Number(e.target.value));
                      setFetchQuery((prev) => ({ ...prev, limit: next, page: 1 }));
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
                    onClick={() =>
                      setFetchQuery((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading || meta.page >= meta.totalPages}
                    onClick={() => setFetchQuery((prev) => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </Card>

      {regionCrud ? (
        <Modal
          open={regionModalOpen}
          onClose={() => {
            if (!regionSaving) closeRegionModal();
          }}
          title={regionModalMode === "create" ? `Add ${title}` : `Edit ${title}`}
          description={
            regionModalMode === "create"
              ? "Enter a name for the new region."
              : "Update the name for this region."
          }
          footer={
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeRegionModal}
                disabled={regionSaving}
              >
                Cancel
              </Button>
              <Button type="button" onClick={() => void submitRegionModal()} disabled={regionSaving}>
                {regionSaving ? "Saving…" : "Save"}
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            {regionFormError ? (
              <Alert variant="error" className="text-sm">
                {regionFormError}
              </Alert>
            ) : null}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="region-name-input">
                Name
              </label>
              <Input
                id="region-name-input"
                value={regionNameInput}
                onChange={(e) => setRegionNameInput(e.target.value)}
                placeholder="e.g. Southeast Asia"
                disabled={regionSaving}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void submitRegionModal();
                  }
                }}
              />
            </div>
          </div>
        </Modal>
      ) : null}

      {countryCrud ? (
        <Modal
          open={countryModalOpen}
          onClose={() => {
            if (!countrySaving) closeCountryModal();
          }}
          title={countryModalMode === "create" ? `Add ${title}` : `Edit ${title}`}
          description={
            countryModalMode === "create"
              ? "Enter country name and choose a region."
              : "Update country name and region."
          }
          footer={
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeCountryModal}
                disabled={countrySaving}
              >
                Cancel
              </Button>
              <Button type="button" onClick={() => void submitCountryModal()} disabled={countrySaving}>
                {countrySaving ? "Saving…" : "Save"}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {countryFormError ? (
              <Alert variant="error" className="text-sm">
                {countryFormError}
              </Alert>
            ) : null}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="country-name-input">
                Name
              </label>
              <Input
                id="country-name-input"
                value={countryNameInput}
                onChange={(e) => setCountryNameInput(e.target.value)}
                placeholder="e.g. Indonesia"
                disabled={countrySaving}
              />
            </div>
            <SearchableSelect
              label="Region"
              value={countryRegionPick}
              onChange={setCountryRegionPick}
              loadOptions={loadRegionOptions}
              placeholder="Search and select region…"
              searchPlaceholder="Search regions…"
              disabled={countrySaving}
              emptyHint="No regions found."
            />
          </div>
        </Modal>
      ) : null}

      {cityCrud ? (
        <Modal
          open={cityModalOpen}
          onClose={() => {
            if (!citySaving) closeCityModal();
          }}
          title={cityModalMode === "create" ? `Add ${title}` : `Edit ${title}`}
          description={
            cityModalMode === "create"
              ? "Enter city name and choose a country."
              : "Update city name and country."
          }
          footer={
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeCityModal} disabled={citySaving}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void submitCityModal()} disabled={citySaving}>
                {citySaving ? "Saving…" : "Save"}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {cityFormError ? (
              <Alert variant="error" className="text-sm">
                {cityFormError}
              </Alert>
            ) : null}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="city-name-input">
                Name
              </label>
              <Input
                id="city-name-input"
                value={cityNameInput}
                onChange={(e) => setCityNameInput(e.target.value)}
                placeholder="e.g. Jakarta"
                disabled={citySaving}
              />
            </div>
            <SearchableSelect
              label="Country"
              value={cityCountryPick}
              onChange={setCityCountryPick}
              loadOptions={loadCountryOptions}
              placeholder="Search and select country…"
              searchPlaceholder="Search countries…"
              disabled={citySaving}
              emptyHint="No countries found."
            />
          </div>
        </Modal>
      ) : null}
    </section>
  );
}
