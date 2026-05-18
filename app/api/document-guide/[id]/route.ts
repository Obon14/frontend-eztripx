import { NextResponse } from "next/server";
import { beAuthenticatedFetch } from "@/lib/api/be-authenticated-fetch";
import { beAuthenticatedFormDataFetch } from "@/lib/api/be-authenticated-form-data";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const idPart = id?.trim() ?? "";
    if (!idPart) {
      return NextResponse.json({ message: "Document guide id is required." }, { status: 400 });
    }

    const res = await beAuthenticatedFetch(`/document-guide/${encodeURIComponent(idPart)}`, {
      method: "DELETE",
    });
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

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const idPart = id?.trim() ?? "";
    if (!idPart) {
      return NextResponse.json({ message: "Document guide id is required." }, { status: 400 });
    }

    let incoming: FormData;
    try {
      incoming = await request.formData();
    } catch {
      return NextResponse.json({ message: "Expected multipart form data." }, { status: 400 });
    }

    const res = await beAuthenticatedFormDataFetch(
      `/document-guide/${encodeURIComponent(idPart)}`,
      incoming,
      "PATCH",
    );
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
