import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookie-names";
import {
  ACCESS_MAX_AGE_SEC,
  REFRESH_MAX_AGE_SEC,
  authCookieBaseOptions,
} from "@/lib/auth/session-constants";

type LoginBody = { email?: string; password?: string };
type BeLoginResponse = { accessToken: string; refreshToken: string };

export async function POST(request: Request) {
  const base = process.env.API_BASE_URL;
  if (!base) {
    return NextResponse.json({ message: "Server misconfiguration: API_BASE_URL is not set." }, { status: 500 });
  }

  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  const beRes = await fetch(`${base.replace(/\/$/, "")}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = (await beRes.json().catch(() => null)) as BeLoginResponse | { message?: string } | null;

  if (!beRes.ok) {
    const msg =
      data && typeof data === "object" && "message" in data && typeof data.message === "string"
        ? data.message
        : "Login failed.";
    return NextResponse.json({ message: msg }, { status: beRes.status });
  }

  if (
    !data ||
    typeof data !== "object" ||
    typeof (data as BeLoginResponse).accessToken !== "string" ||
    typeof (data as BeLoginResponse).refreshToken !== "string"
  ) {
    return NextResponse.json({ message: "Unrecognized response format from upstream server." }, { status: 502 });
  }

  const { accessToken, refreshToken } = data as BeLoginResponse;
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

  return NextResponse.json({ ok: true });
}
