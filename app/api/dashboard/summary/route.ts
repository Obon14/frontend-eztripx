import { NextResponse } from "next/server";
import { beAuthenticatedFetch } from "@/lib/api/be-authenticated-fetch";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = searchParams.get("days");
    const qs = days ? `?days=${encodeURIComponent(days)}` : "";
    const res = await beAuthenticatedFetch(`/dashboard/summary${qs}`);
    const text = await res.text();
    let body: unknown;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      return NextResponse.json(
        { message: "Invalid response from upstream." },
        { status: 502 },
      );
    }
    return NextResponse.json(body, { status: res.status });
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
