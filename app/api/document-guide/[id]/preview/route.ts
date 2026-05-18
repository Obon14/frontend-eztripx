import { NextResponse } from "next/server";
import { beAuthenticatedFetch } from "@/lib/api/be-authenticated-fetch";

type RouteContext = { params: Promise<{ id: string }> };

function forwardPreviewHeaders(from: Headers): Headers {
  const out = new Headers();
  for (const name of ["content-type", "content-disposition", "content-length", "cache-control"]) {
    const v = from.get(name);
    if (v) out.set(name, v);
  }
  return out;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const idPart = id?.trim() ?? "";
    if (!idPart || idPart.includes("/") || idPart.includes("..")) {
      return NextResponse.json({ message: "Invalid document guide id." }, { status: 400 });
    }

    const res = await beAuthenticatedFetch(
      `/document-guide/${encodeURIComponent(idPart)}/preview`,
      { method: "GET" },
    );

    if (!res.ok) {
      const text = await res.text();
      let message = text.slice(0, 500);
      try {
        const j: unknown = JSON.parse(text);
        if (typeof j === "object" && j !== null && "message" in j && typeof (j as { message: unknown }).message === "string") {
          message = (j as { message: string }).message;
        }
      } catch {
        /* use text */
      }
      return NextResponse.json({ message: message || "Preview failed." }, { status: res.status });
    }

    if (res.body == null) {
      return NextResponse.json({ message: "Empty preview response." }, { status: 502 });
    }

    return new NextResponse(res.body, {
      status: res.status,
      headers: forwardPreviewHeaders(res.headers),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg.includes("API_BASE_URL")) {
      return NextResponse.json({ message: "Server misconfiguration: API_BASE_URL is not set." }, { status: 500 });
    }
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
