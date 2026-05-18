export type TokenPair = { accessToken: string; refreshToken: string };

type BeRefreshResponse = { accessToken?: unknown; refreshToken?: unknown };

/**
 * POST /auth/refresh with { refreshToken }.
 * If BE only returns accessToken, the previous refresh token is reused for the cookie.
 */
export async function fetchRefreshedTokens(
  apiBase: string,
  refreshToken: string,
): Promise<TokenPair | null> {
  const res = await fetch(`${apiBase.replace(/\/$/, "")}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) return null;

  const data = (await res.json().catch(() => null)) as BeRefreshResponse | null;
  if (!data || typeof data.accessToken !== "string") return null;

  const nextRefresh =
    typeof data.refreshToken === "string" ? data.refreshToken : refreshToken;

  return { accessToken: data.accessToken, refreshToken: nextRefresh };
}
