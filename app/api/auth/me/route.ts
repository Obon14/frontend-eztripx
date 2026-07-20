import { NextResponse } from "next/server";
import { beAuthenticatedFetch } from "@/lib/api/be-authenticated-fetch";
import { parseBeErrorMessage } from "@/lib/auth/parse-be-error";

type MeResponse = {
  id: string;
  email: string;
  role: string;
};

export async function GET() {
  try {
    const res = await beAuthenticatedFetch("/auth/me");
    const text = await res.text();
    let body: MeResponse | { message?: string } | null = null;
    try {
      body = text ? ((JSON.parse(text) as MeResponse | { message?: string }) ?? null) : null;
    } catch {
      return NextResponse.json({ message: "Invalid response from upstream." }, { status: 502 });
    }

    if (!res.ok) {
      return NextResponse.json(
        { message: parseBeErrorMessage(body, "Unauthorized.") },
        { status: res.status },
      );
    }

    return NextResponse.json(body, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg.includes("API_BASE_URL")) {
      return NextResponse.json(
        { message: "Server misconfiguration: API_BASE_URL is not set." },
        { status: 500 },
      );
    }
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
