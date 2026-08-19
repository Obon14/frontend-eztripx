import { NextResponse } from "next/server";
import { beApiUrl } from "@/lib/api/be-api-url";

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: Params) {
  const base = process.env.API_BASE_URL;
  if (!base) {
    return NextResponse.json(
      { message: "Server misconfiguration: API_BASE_URL is not set." },
      { status: 500 },
    );
  }

  const { slug } = await params;
  const slugPart = slug?.trim() ?? "";
  if (slugPart !== "terms" && slugPart !== "privacy") {
    return NextResponse.json({ message: "Invalid legal document." }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "id";

  try {
    const res = await fetch(
      beApiUrl(base, `/legal/public/${encodeURIComponent(slugPart)}?locale=${locale}`),
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
      },
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
