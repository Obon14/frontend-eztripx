import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { beApiUrl } from "@/lib/api/be-api-url";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookie-names";
import { fetchRefreshedTokens } from "@/lib/auth/refresh-backend";
import {
  ACCESS_MAX_AGE_SEC,
  REFRESH_MAX_AGE_SEC,
  authCookieBaseOptions,
} from "@/lib/auth/session-constants";

export async function GET() {
  const base = process.env.API_BASE_URL;
  if (!base) {
    return NextResponse.json(
      { message: "Server misconfiguration: API_BASE_URL is not set." },
      { status: 500 },
    );
  }

  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";
  const opts = authCookieBaseOptions(isProd);
  let access = cookieStore.get(ACCESS_COOKIE)?.value;
  const refresh = cookieStore.get(REFRESH_COOKIE)?.value;
  const url = beApiUrl(base, "/auth/me/avatar");

  async function doFetch(token: string | undefined): Promise<Response> {
    const headers = new Headers();
    headers.set("Accept", "image/*, */*");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(url, { headers, cache: "no-store" });
  }

  let res = await doFetch(access);
  if (res.status === 401 && refresh) {
    const tokens = await fetchRefreshedTokens(base, refresh);
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

  if (!res.ok) {
    return NextResponse.json({ message: "Avatar not found." }, { status: res.status });
  }

  const buffer = await res.arrayBuffer();
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "image/jpeg",
      "Cache-Control": "private, max-age=60",
    },
  });
}
