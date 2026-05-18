import { cookies } from "next/headers";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookie-names";
import { fetchRefreshedTokens } from "@/lib/auth/refresh-backend";
import {
  ACCESS_MAX_AGE_SEC,
  REFRESH_MAX_AGE_SEC,
  authCookieBaseOptions,
} from "@/lib/auth/session-constants";

/**
 * Server-only: call BE with Bearer access cookie; on 401 attempt refresh and retry once.
 */
export async function beAuthenticatedFetch(pathAndQuery: string, init: RequestInit = {}): Promise<Response> {
  const base = process.env.API_BASE_URL;
  if (!base) {
    throw new Error("API_BASE_URL is not set");
  }

  const normalizedBase = base.replace(/\/$/, "");
  const path = pathAndQuery.startsWith("/") ? pathAndQuery : `/${pathAndQuery}`;
  const url = `${normalizedBase}${path}`;

  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";
  const opts = authCookieBaseOptions(isProd);

  let access = cookieStore.get(ACCESS_COOKIE)?.value;
  const refresh = cookieStore.get(REFRESH_COOKIE)?.value;

  async function doFetch(token: string | undefined): Promise<Response> {
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(url, { ...init, headers });
  }

  let res = await doFetch(access);

  if (res.status === 401 && refresh) {
    const tokens = await fetchRefreshedTokens(normalizedBase, refresh);
    if (tokens) {
      cookieStore.set(ACCESS_COOKIE, tokens.accessToken, {
        ...opts,
        maxAge: ACCESS_MAX_AGE_SEC,
      });
      cookieStore.set(REFRESH_COOKIE, tokens.refreshToken, {
        ...opts,
        maxAge: REFRESH_MAX_AGE_SEC,
      });
      res = await doFetch(tokens.accessToken);
    }
  }

  return res;
}
