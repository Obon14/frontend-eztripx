import type { SearchableSelectOption } from "@/components/ui/searchable-select";
import { MAX_LIMIT } from "@/lib/api/list-query";
import type { CityListItem, CountryListItem, RegionListItem } from "@/types/geo-api";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
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
    } else if (rows.length >= MAX_LIMIT) {
      hasMore = true;
    }
  } else if (rows.length >= MAX_LIMIT) {
    hasMore = true;
  }
  return { rows, hasMore };
}

export type PagedSelectOptions = { options: SearchableSelectOption[]; hasMore: boolean };

function appendIdList(params: URLSearchParams, key: string, ids: number[]) {
  for (const id of ids) {
    params.append(key, String(id));
  }
}

export async function loadPublicRegionOptionsPage(
  search: string,
  page: number,
): Promise<PagedSelectOptions> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(MAX_LIMIT),
    search,
  });
  const res = await fetch(`/api/geo/public/region?${params}`);
  if (!res.ok) return { options: [], hasMore: false };
  const body: unknown = await res.json().catch(() => null);
  const parsed = parsePagedBody(body);
  if (!parsed) return { options: [], hasMore: false };
  const data = parsed.rows as RegionListItem[];
  return {
    options: data.map((r) => ({ id: String(r.id), label: r.name })),
    hasMore: parsed.hasMore,
  };
}

export async function loadPublicCountryOptionsPage(
  search: string,
  page: number,
  regionIds: number[],
): Promise<PagedSelectOptions> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(MAX_LIMIT),
    search,
  });
  if (regionIds.length > 0) {
    appendIdList(params, "regionIds", regionIds);
  }
  const res = await fetch(`/api/geo/public/country?${params}`);
  if (!res.ok) return { options: [], hasMore: false };
  const body: unknown = await res.json().catch(() => null);
  const parsed = parsePagedBody(body);
  if (!parsed) return { options: [], hasMore: false };
  const data = parsed.rows as CountryListItem[];
  return {
    options: data.map((c) => ({ id: String(c.id), label: c.name })),
    hasMore: parsed.hasMore,
  };
}

export async function loadPublicCityOptionsPage(
  search: string,
  page: number,
  countryIds: number[],
): Promise<PagedSelectOptions> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(MAX_LIMIT),
    search,
  });
  if (countryIds.length > 0) {
    appendIdList(params, "countryIds", countryIds);
  }
  const res = await fetch(`/api/geo/public/city?${params}`);
  if (!res.ok) return { options: [], hasMore: false };
  const body: unknown = await res.json().catch(() => null);
  const parsed = parsePagedBody(body);
  if (!parsed) return { options: [], hasMore: false };
  const data = parsed.rows as CityListItem[];
  return {
    options: data.map((c) => ({ id: String(c.id), label: c.name })),
    hasMore: parsed.hasMore,
  };
}
