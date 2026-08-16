import { NextResponse } from "next/server";
import { beApiUrl } from "@/lib/api/be-api-url";

type Params = { params: Promise<{ id: string }> };

function forwardPreviewHeaders(from: Headers): Headers {
  const out = new Headers();
  for (const name of [
    "content-type",
    "content-disposition",
    "content-length",
    "cache-control",
  ]) {
    const v = from.get(name);
    if (v) out.set(name, v);
  }
  return out;
}

/** Public PDF preview BFF — no auth. Upstream truncates when previewMode=hide. */
export async function GET(_request: Request, { params }: Params) {
  const base = process.env.API_BASE_URL;
  if (!base) {
    return NextResponse.json(
      { message: "Server misconfiguration: API_BASE_URL is not set." },
      { status: 500 },
    );
  }

  const { id } = await params;
  const idPart = id?.trim() ?? "";
  if (!idPart || idPart.includes("/") || idPart.includes("..")) {
    return NextResponse.json({ message: "Invalid document guide id." }, { status: 400 });
  }

  try {
    const res = await fetch(
      beApiUrl(base, `/document-guide/public/${encodeURIComponent(idPart)}/preview`),
      { cache: "no-store" },
    );

    if (!res.ok) {
      const text = await res.text();
      let message = text.slice(0, 500);
      try {
        const j: unknown = JSON.parse(text);
        if (
          typeof j === "object" &&
          j !== null &&
          "message" in j &&
          typeof (j as { message: unknown }).message === "string"
        ) {
          message = (j as { message: string }).message;
        }
      } catch {
        /* use text */
      }
      return NextResponse.json(
        { message: message || "Preview failed." },
        { status: res.status },
      );
    }

    if (res.body == null) {
      return NextResponse.json({ message: "Empty preview response." }, { status: 502 });
    }

    return new NextResponse(res.body, {
      status: res.status,
      headers: forwardPreviewHeaders(res.headers),
    });
  } catch {
    return NextResponse.json({ message: "Failed to reach upstream server." }, { status: 502 });
  }
}
