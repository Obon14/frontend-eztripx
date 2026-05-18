import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookie-names";
import { fetchRefreshedTokens } from "@/lib/auth/refresh-backend";
import {
  ACCESS_MAX_AGE_SEC,
  REFRESH_MAX_AGE_SEC,
  authCookieBaseOptions,
} from "@/lib/auth/session-constants";

export async function POST() {
  const base = process.env.API_BASE_URL;
  if (!base) {
    return NextResponse.json({ message: "Server misconfiguration: API_BASE_URL is not set." }, { status: 500 });
  }

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "No refresh token." }, { status: 401 });
  }

  const tokens = await fetchRefreshedTokens(base, refreshToken);
  if (!tokens) {
    cookieStore.delete(ACCESS_COOKIE);
    cookieStore.delete(REFRESH_COOKIE);
    return NextResponse.json({ message: "Refresh failed." }, { status: 401 });
  }

  const isProd = process.env.NODE_ENV === "production";
  const opts = authCookieBaseOptions(isProd);

  cookieStore.set(ACCESS_COOKIE, tokens.accessToken, {
    ...opts,
    maxAge: ACCESS_MAX_AGE_SEC,
  });
  cookieStore.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...opts,
    maxAge: REFRESH_MAX_AGE_SEC,
  });

  return NextResponse.json({ ok: true });
}
