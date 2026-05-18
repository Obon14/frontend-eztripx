/** List endpoints: shared pagination + search rules (FE + BFF). */

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MIN_LIMIT = 1;
export const MAX_LIMIT = 100;
export const MAX_SEARCH_LENGTH = 200;

export function clampLimit(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, Math.floor(value)));
}

export function clampPage(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_PAGE;
  return Math.max(1, Math.floor(value));
}

export function sanitizeSearch(raw: string | null | undefined): string {
  return (raw ?? "").trim().slice(0, MAX_SEARCH_LENGTH);
}

/**
 * Parse query for BFF routes (clamp page/limit; trim search).
 */
export function parseListQuery(searchParams: URLSearchParams): {
  page: number;
  limit: number;
  search: string;
} {
  const pageRaw = Number.parseInt(searchParams.get("page") ?? String(DEFAULT_PAGE), 10);
  const limitRaw = Number.parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10);

  return {
    page: clampPage(pageRaw),
    limit: clampLimit(limitRaw),
    search: sanitizeSearch(searchParams.get("search")),
  };
}
