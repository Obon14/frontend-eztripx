import { NextResponse } from "next/server";
import { forwardIdListParams } from "@/lib/api/forward-query-ids";
import { parseListQuery } from "@/lib/api/list-query";

export async function GET(request: Request) {
  const base = process.env.API_BASE_URL;
  if (!base) {
    return NextResponse.json(
      { message: "Server misconfiguration: API_BASE_URL is not set." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const q = parseListQuery(searchParams);
  const qs = new URLSearchParams({
    page: String(q.page),
    limit: String(q.limit),
    search: q.search,
  });

  forwardIdListParams(searchParams, qs, "countryId", "countryIds");

  try {
    const res = await fetch(
      `${base.replace(/\/$/, "")}/geo/public/city?${qs.toString()}`,
      { headers: { Accept: "application/json" }, cache: "no-store" },
    );
    const text = await res.text();
    let body: unknown;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      return NextResponse.json({ message: "Invalid response from upstream." }, { status: 502 });
    }
    return NextResponse.json(body, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Failed to reach upstream server." }, { status: 502 });
  }
}
