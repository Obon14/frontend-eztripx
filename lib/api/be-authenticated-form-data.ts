import { cookies } from "next/headers";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookie-names";
import { fetchRefreshedTokens } from "@/lib/auth/refresh-backend";
import {
  ACCESS_MAX_AGE_SEC,
  REFRESH_MAX_AGE_SEC,
  authCookieBaseOptions,
} from "@/lib/auth/session-constants";

async function cloneFormData(source: FormData): Promise<FormData> {
  const out = new FormData();
  for (const [key, value] of source.entries()) {
    if (value instanceof File) {
      const buf = await value.arrayBuffer();
      out.append(
        key,
        new File([buf], value.name || "file", {
          type: value.type || "application/octet-stream",
        }),
      );
    } else {
      out.append(key, String(value));
    }
  }
  return out;
}

/**
 * Authenticated BE request with multipart body. Do not set Content-Type (boundary is automatic).
 * Clones FormData per attempt so file streams are safe on 401 retry.
 */
export async function beAuthenticatedFormDataFetch(
  pathAndQuery: string,
  formData: FormData,
  method: "POST" | "PATCH" | "PUT" = "POST",
): Promise<Response> {
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

  async function doFetch(token: string | undefined, body: FormData): Promise<Response> {
    const headers = new Headers();
    headers.set("Accept", "application/json, */*");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(url, { method, body, headers });
  }

  let res = await doFetch(access, await cloneFormData(formData));

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
      res = await doFetch(tokens.accessToken, await cloneFormData(formData));
    }
  }

  return res;
}
