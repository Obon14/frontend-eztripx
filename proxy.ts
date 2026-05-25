import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { applyAuthCookiesToNextResponse } from "@/lib/auth/apply-auth-cookies";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookie-names";
import { fetchRefreshedTokens } from "@/lib/auth/refresh-backend";
import { isAdminRole } from "@/lib/auth/verify-access-token";
import { resolveUserRole } from "@/lib/auth/resolve-user-role";

function clearAuthCookies(res: NextResponse) {
  res.cookies.delete(ACCESS_COOKIE);
  res.cookies.delete(REFRESH_COOKIE);
}

async function tokenIsAdmin(accessToken: string): Promise<boolean> {
  const base = process.env.API_BASE_URL;
  if (!base) return false;
  const role = await resolveUserRole(base, accessToken);
  return role !== null && isAdminRole(role);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const base = process.env.API_BASE_URL;
  const isProd = process.env.NODE_ENV === "production";

  let accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  const isLoginPath = pathname === "/admin" || pathname === "/admin/login";

  if (
    !isLoginPath &&
    pathname.startsWith("/admin/") &&
    !accessToken &&
    refreshToken &&
    base
  ) {
    const tokens = await fetchRefreshedTokens(base, refreshToken);
    if (tokens) {
      const adminOk = await tokenIsAdmin(tokens.accessToken);
      if (!adminOk) {
        const res = NextResponse.redirect(new URL("/admin", request.url));
        clearAuthCookies(res);
        return res;
      }
      accessToken = tokens.accessToken;
      const res = NextResponse.next();
      applyAuthCookiesToNextResponse(res, tokens, isProd);
      return res;
    }
    const res = NextResponse.redirect(new URL("/admin", request.url));
    clearAuthCookies(res);
    return res;
  }

  if (isLoginPath) {
    if (accessToken) {
      const adminOk = await tokenIsAdmin(accessToken);
      if (adminOk) {
        return NextResponse.redirect(new URL("/admin/home", request.url));
      }
      const res = NextResponse.next();
      clearAuthCookies(res);
      return res;
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin/")) {
    if (!accessToken) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    const adminOk = await tokenIsAdmin(accessToken);
    if (!adminOk) {
      const res = NextResponse.redirect(new URL("/admin", request.url));
      clearAuthCookies(res);
      return res;
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/login", "/admin/:path*"],
};
