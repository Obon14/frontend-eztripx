import { NextResponse } from "next/server";

/**
 * Machine ingest proxy → Nest POST /api/document-guides.
 * Forwards multipart body and requires x-api-key (same as BE DocumentGuideIngestGuard).
 * Optional fallback: DOCUMENT_GUIDE_INGEST_KEY on the Next server if the client omits the header.
 */
export async function POST(request: Request) {
  const base = process.env.API_BASE_URL;
  if (!base) {
    return NextResponse.json(
      { message: "Server misconfiguration: API_BASE_URL is not set." },
      { status: 500 },
    );
  }

  const fromHeader = request.headers.get("x-api-key")?.trim() ?? "";
  const fromEnv = process.env.DOCUMENT_GUIDE_INGEST_KEY?.trim() ?? "";
  const apiKey = fromHeader || fromEnv;
  if (!apiKey) {
    return NextResponse.json(
      { message: "Missing x-api-key (or DOCUMENT_GUIDE_INGEST_KEY on server)." },
      { status: 401 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ message: "Expected multipart form data." }, { status: 400 });
  }

  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/api/document-guides`, {
      method: "POST",
      headers: {
        Accept: "application/json, */*",
        "x-api-key": apiKey,
      },
      body: formData,
      cache: "no-store",
    });

    const text = await res.text();
    try {
      return NextResponse.json(text ? JSON.parse(text) : null, { status: res.status });
    } catch {
      return new NextResponse(text, {
        status: res.status,
        headers: { "Content-Type": res.headers.get("Content-Type") ?? "text/plain" },
      });
    }
  } catch {
    return NextResponse.json({ message: "Failed to reach upstream server." }, { status: 502 });
  }
}
