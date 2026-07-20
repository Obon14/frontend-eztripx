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

  const locale = searchParams.get("locale");
  if (locale) qs.set("locale", locale);

  const sort = searchParams.get("sort");
  if (sort === "popular" || sort === "newest") qs.set("sort", sort);

  const tripDays = searchParams.get("tripDays");
  if (tripDays) qs.set("tripDays", tripDays);

  forwardIdListParams(searchParams, qs, "regionId", "regionIds");
  forwardIdListParams(searchParams, qs, "countryId", "countryIds");
  forwardIdListParams(searchParams, qs, "cityId", "cityIds");

  try {
    const res = await fetch(
      `${base.replace(/\/$/, "")}/document-guide/public?${qs.toString()}`,
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
