import type { SearchableSelectOption } from "@/components/ui/searchable-select";
import { MAX_LIMIT } from "@/lib/api/list-query";
import type { CityListItem, CountryListItem, RegionListItem } from "@/types/geo-api";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function parseDataArray<T>(body: unknown): T[] | null {
  if (!isRecord(body) || !Array.isArray(body.data)) return null;
  return body.data as T[];
}

function parsePagedBody(body: unknown): { rows: unknown[]; hasMore: boolean } | null {
  if (!isRecord(body) || !Array.isArray(body.data)) return null;
  const rows = body.data;
  let hasMore = false;
  const meta = body.meta;
  if (isRecord(meta)) {
    const page = Number(meta.page);
    const totalPages = Number(meta.totalPages);
    if (Number.isFinite(page) && Number.isFinite(totalPages) && totalPages > 0) {
      hasMore = page < totalPages;
    } else {
      const total = Number(meta.total);
      const lim = Number(meta.limit ?? meta.pageSize);
      if (Number.isFinite(page) && Number.isFinite(total) && Number.isFinite(lim) && lim > 0) {
        hasMore = page * lim < total;
      } else if (rows.length >= MAX_LIMIT) {
        hasMore = true;
      }
    }
  } else if (rows.length >= MAX_LIMIT) {
    hasMore = true;
  }
  return { rows, hasMore };
}

export type PagedSelectOptions = { options: SearchableSelectOption[]; hasMore: boolean };

export async function loadRegionOptionsPage(search: string, page: number): Promise<PagedSelectOptions> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(MAX_LIMIT),
    search,
  });
  const res = await fetch(`/api/region?${params}`, { credentials: "include" });
  if (!res.ok) return { options: [], hasMore: false };
  const body: unknown = await res.json().catch(() => null);
  const parsed = parsePagedBody(body);
  if (!parsed) return { options: [], hasMore: false };
  const data = parsed.rows as RegionListItem[];
  const options = data.map((r) => ({ id: String(r.id), label: r.name }));
  return { options, hasMore: parsed.hasMore };
}

export async function loadCountryOptionsPage(search: string, page: number): Promise<PagedSelectOptions> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(MAX_LIMIT),
    search,
  });
  const res = await fetch(`/api/country?${params}`, { credentials: "include" });
  if (!res.ok) return { options: [], hasMore: false };
  const body: unknown = await res.json().catch(() => null);
  const parsed = parsePagedBody(body);
  if (!parsed) return { options: [], hasMore: false };
  const data = parsed.rows as CountryListItem[];
  const options = data.map((c) => ({ id: String(c.id), label: c.name }));
  return { options, hasMore: parsed.hasMore };
}

export async function loadCityOptionsPage(search: string, page: number): Promise<PagedSelectOptions> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(MAX_LIMIT),
    search,
  });
  const res = await fetch(`/api/city?${params}`, { credentials: "include" });
  if (!res.ok) return { options: [], hasMore: false };
  const body: unknown = await res.json().catch(() => null);
  const parsed = parsePagedBody(body);
  if (!parsed) return { options: [], hasMore: false };
  const data = parsed.rows as CityListItem[];
  const options = data.map((c) => ({ id: String(c.id), label: c.name }));
  return { options, hasMore: parsed.hasMore };
}

export async function loadRegionOptions(search: string): Promise<SearchableSelectOption[]> {
  return (await loadRegionOptionsPage(search, 1)).options;
}

export async function loadCountryOptions(search: string): Promise<SearchableSelectOption[]> {
  return (await loadCountryOptionsPage(search, 1)).options;
}

export async function loadCityOptions(search: string): Promise<SearchableSelectOption[]> {
  return (await loadCityOptionsPage(search, 1)).options;
}
