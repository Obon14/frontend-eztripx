import { NextResponse } from "next/server";
import { beAuthenticatedFetch } from "@/lib/api/be-authenticated-fetch";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const idPart = id?.trim() ?? "";
    if (!idPart) {
      return NextResponse.json({ message: "Invalid promo id." }, { status: 400 });
    }

    const res = await beAuthenticatedFetch(`/promo/${encodeURIComponent(idPart)}`);
    const text = await res.text();
    let body: unknown;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      return NextResponse.json(
        { message: "Invalid response from upstream." },
        { status: 502 },
      );
    }
    return NextResponse.json(body, { status: res.status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg.includes("API_BASE_URL")) {
      return NextResponse.json(
        { message: "Server misconfiguration: API_BASE_URL is not set." },
        { status: 500 },
      );
    }
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const idPart = id?.trim() ?? "";
    if (!idPart) {
      return NextResponse.json({ message: "Invalid promo id." }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
    }

    const res = await beAuthenticatedFetch(`/promo/${encodeURIComponent(idPart)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let out: unknown;
    try {
      out = text ? JSON.parse(text) : null;
    } catch {
      return NextResponse.json(
        { message: "Invalid response from upstream." },
        { status: 502 },
      );
    }
    return NextResponse.json(out ?? {}, { status: res.status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg.includes("API_BASE_URL")) {
      return NextResponse.json(
        { message: "Server misconfiguration: API_BASE_URL is not set." },
        { status: 500 },
      );
    }
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const idPart = id?.trim() ?? "";
    if (!idPart) {
      return NextResponse.json({ message: "Invalid promo id." }, { status: 400 });
    }

    const res = await beAuthenticatedFetch(`/promo/${encodeURIComponent(idPart)}`, {
      method: "DELETE",
    });

    const text = await res.text();
    let out: unknown;
    try {
      out = text ? JSON.parse(text) : null;
    } catch {
      return NextResponse.json(
        { message: "Invalid response from upstream." },
        { status: 502 },
      );
    }
    return NextResponse.json(out ?? {}, { status: res.status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg.includes("API_BASE_URL")) {
      return NextResponse.json(
        { message: "Server misconfiguration: API_BASE_URL is not set." },
        { status: 500 },
      );
    }
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
