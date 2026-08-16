/**
 * Join API_BASE_URL with a Nest path. All BE routes live under /api.
 */
export function beApiUrl(apiBase: string, pathAndQuery: string): string {
  const normalizedBase = apiBase.replace(/\/$/, "");
  const path = pathAndQuery.startsWith("/") ? pathAndQuery : `/${pathAndQuery}`;
  if (path === "/api" || path.startsWith("/api/") || path.startsWith("/api?")) {
    return `${normalizedBase}${path}`;
  }
  return `${normalizedBase}/api${path}`;
}
