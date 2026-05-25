import { NextResponse } from "next/server";
import { parseBeErrorMessage } from "@/lib/auth/parse-be-error";

/** Public registration — backend always assigns role USER (never ADMIN). */
type RegisterBody = { email?: string; password?: string };

export async function POST(request: Request) {
  const base = process.env.API_BASE_URL;
  if (!base) {
    return NextResponse.json(
      { message: "Server misconfiguration: API_BASE_URL is not set." },
      { status: 500 },
    );
  }

  let body: RegisterBody;
  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  const beRes = await fetch(`${base.replace(/\/$/, "")}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await beRes.json().catch(() => null);

  if (!beRes.ok) {
    return NextResponse.json(
      { message: parseBeErrorMessage(data, "Registration failed.") },
      { status: beRes.status },
    );
  }

  return NextResponse.json({ ok: true, user: data });
}
