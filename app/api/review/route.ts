import { NextResponse } from "next/server";
import { beAuthenticatedFetch } from "@/lib/api/be-authenticated-fetch";
import { parseBeErrorMessage } from "@/lib/auth/parse-be-error";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const res = await beAuthenticatedFetch("/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(
        { message: parseBeErrorMessage(data, "Failed to submit review.") },
        { status: res.status },
      );
    }
    return NextResponse.json(data, { status: res.status });
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
