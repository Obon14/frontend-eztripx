import { NextResponse } from "next/server";
import { beAuthenticatedFetch } from "@/lib/api/be-authenticated-fetch";
import { beAuthenticatedFormDataFetch } from "@/lib/api/be-authenticated-form-data";
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

    const res = await beAuthenticatedFetch(`/document-guide?${qs.toString()}`);
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
    let incoming: FormData;
    try {
      incoming = await request.formData();
    } catch {
      return NextResponse.json({ message: "Expected multipart form data." }, { status: 400 });
    }

    const res = await beAuthenticatedFormDataFetch(`/document-guide`, incoming);
    const text = await res.text();
    let body: unknown;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      return new NextResponse(text, {
        status: res.status,
        headers: { "Content-Type": res.headers.get("Content-Type") ?? "text/plain" },
      });
    }
    return NextResponse.json(body ?? {}, { status: res.status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg.includes("API_BASE_URL")) {
      return NextResponse.json({ message: "Server misconfiguration: API_BASE_URL is not set." }, { status: 500 });
    }
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
