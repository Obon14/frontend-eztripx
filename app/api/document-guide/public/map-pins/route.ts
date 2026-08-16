import { NextResponse } from "next/server";
import { beApiUrl } from "@/lib/api/be-api-url";

export async function GET(request: Request) {
  const base = process.env.API_BASE_URL;
  if (!base) {
    return NextResponse.json(
      { message: "Server misconfiguration: API_BASE_URL is not set." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const qs = new URLSearchParams();
  const locale = searchParams.get("locale");
  if (locale === "id" || locale === "en") {
    qs.set("locale", locale);
  }

  try {
    const res = await fetch(
      beApiUrl(base, `/document-guide/public/map-pins?${qs.toString()}`),
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
