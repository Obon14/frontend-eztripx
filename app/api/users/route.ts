import { NextResponse } from "next/server";
import { beAuthenticatedFetch } from "@/lib/api/be-authenticated-fetch";
import { parseBeErrorMessage } from "@/lib/auth/parse-be-error";
import { parseListQuery } from "@/lib/api/list-query";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = parseListQuery(searchParams);
    const qs = new URLSearchParams({
      page: String(q.page),
      limit: String(q.limit),
      search: q.search,
    });
    const res = await beAuthenticatedFetch(`/users?${qs.toString()}`);
    const text = await res.text();
    let body: unknown;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      return NextResponse.json({ message: "Invalid response from upstream." }, { status: 502 });
    }
    return NextResponse.json(body, { status: res.status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg.includes("API_BASE_URL")) {
      return NextResponse.json({ message: "Server misconfiguration: API_BASE_URL is not set." }, { status: 500 });
    }
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await beAuthenticatedFetch("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(
        { message: parseBeErrorMessage(data, "Failed to create user.") },
        { status: res.status },
      );
    }
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg.includes("API_BASE_URL")) {
      return NextResponse.json({ message: "Server misconfiguration: API_BASE_URL is not set." }, { status: 500 });
    }
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
