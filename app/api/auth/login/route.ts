import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookie-names";
import { parseBeErrorMessage } from "@/lib/auth/parse-be-error";
import {
  ACCESS_MAX_AGE_SEC,
  REFRESH_MAX_AGE_SEC,
  authCookieBaseOptions,
} from "@/lib/auth/session-constants";
import { isAdminRole } from "@/lib/auth/verify-access-token";
import { resolveUserRole } from "@/lib/auth/resolve-user-role";

type LoginBody = {
  email?: string;
  password?: string;
  /** "admin" requires ADMIN role before cookies are set */
  scope?: string;
};
type BeLoginResponse = { accessToken: string; refreshToken: string };

export async function POST(request: Request) {
  const base = process.env.API_BASE_URL;
  if (!base) {
    return NextResponse.json(
      { message: "Server misconfiguration: API_BASE_URL is not set." },
      { status: 500 },
    );
  }

  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const scope = typeof body.scope === "string" ? body.scope.trim().toLowerCase() : "user";

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  const beRes = await fetch(`${base.replace(/\/$/, "")}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = (await beRes.json().catch(() => null)) as BeLoginResponse | null;

  if (!beRes.ok) {
    return NextResponse.json(
      { message: parseBeErrorMessage(data, "Login failed.") },
      { status: beRes.status },
    );
  }

  if (
    !data ||
    typeof data.accessToken !== "string" ||
    typeof data.refreshToken !== "string"
  ) {
    return NextResponse.json(
      { message: "Unrecognized response format from upstream server." },
      { status: 502 },
    );
  }

  const { accessToken, refreshToken } = data;

  if (scope === "admin") {
    const role = await resolveUserRole(base, accessToken);
    if (!role) {
      return NextResponse.json(
        {
          message:
            "Tidak bisa memverifikasi role. Pastikan JWT_ACCESS_SECRET di frontend .env sama dengan backend, lalu restart npm run dev.",
        },
        { status: 500 },
      );
    }
    if (!isAdminRole(role)) {
      return NextResponse.json(
        {
          message:
            "Akun ini bukan admin. Gunakan kredensial admin atau hubungi administrator.",
        },
        { status: 403 },
      );
    }
  }

  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";
  const opts = authCookieBaseOptions(isProd);

  cookieStore.set(ACCESS_COOKIE, accessToken, {
    ...opts,
    maxAge: ACCESS_MAX_AGE_SEC,
  });
  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    ...opts,
    maxAge: REFRESH_MAX_AGE_SEC,
  });

  return NextResponse.json({ ok: true, scope });
}
