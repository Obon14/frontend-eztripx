import type { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookie-names";
import {
  ACCESS_MAX_AGE_SEC,
  REFRESH_MAX_AGE_SEC,
  authCookieBaseOptions,
} from "@/lib/auth/session-constants";
import type { TokenPair } from "@/lib/auth/refresh-backend";

export function applyAuthCookiesToNextResponse(
  res: NextResponse,
  tokens: TokenPair,
  isProd: boolean,
) {
  const base = authCookieBaseOptions(isProd);
  res.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    ...base,
    maxAge: ACCESS_MAX_AGE_SEC,
  });
  res.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...base,
    maxAge: REFRESH_MAX_AGE_SEC,
  });
}
