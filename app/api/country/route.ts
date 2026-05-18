import { NextResponse } from "next/server";
import { beAuthenticatedFetch } from "@/lib/api/be-authenticated-fetch";
import { parseListQuery } from "@/lib/api/list-query";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = parseListQuery(searchParams);
    const qs = new URLSearchParams({
      page: String(q.page),
      limit: String(q.limit),
      search: q.search,
    });

    const res = await beAuthenticatedFetch(`/country?${qs.toString()}`);
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
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
    }

    const name = isRecord(body) && typeof body.name === "string" ? body.name.trim() : "";
    const regionIdRaw = isRecord(body) ? body.regionId : undefined;
    const regionId =
      typeof regionIdRaw === "number" && Number.isFinite(regionIdRaw)
        ? regionIdRaw
        : typeof regionIdRaw === "string" && /^\d+$/.test(regionIdRaw)
          ? Number(regionIdRaw)
          : NaN;

    if (!name) {
      return NextResponse.json({ message: "Name is required." }, { status: 400 });
    }
    if (!Number.isFinite(regionId)) {
      return NextResponse.json({ message: "regionId is required." }, { status: 400 });
    }

    const res = await beAuthenticatedFetch(`/country`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, regionId }),
    });

    const text = await res.text();
    let out: unknown;
    try {
      out = text ? JSON.parse(text) : null;
    } catch {
      return NextResponse.json({ message: "Invalid response from upstream." }, { status: 502 });
    }
    return NextResponse.json(out ?? {}, { status: res.status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg.includes("API_BASE_URL")) {
      return NextResponse.json({ message: "Server misconfiguration: API_BASE_URL is not set." }, { status: 500 });
    }
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
