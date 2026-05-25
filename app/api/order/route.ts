import { NextResponse } from "next/server";
import { beAuthenticatedFetch } from "@/lib/api/be-authenticated-fetch";
import { parseBeErrorMessage } from "@/lib/auth/parse-be-error";

type CreateBody = { documentGuideId?: string; currency?: string };

export async function GET() {
  try {
    const res = await beAuthenticatedFetch("/order");
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
    let body: CreateBody;
    try {
      body = (await request.json()) as CreateBody;
    } catch {
      return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
    }

    const documentGuideId =
      typeof body.documentGuideId === "string" ? body.documentGuideId.trim() : "";
    const currency = body.currency === "USD" ? "USD" : body.currency === "IDR" ? "IDR" : "";

    if (!documentGuideId || !currency) {
      return NextResponse.json(
        { message: "documentGuideId and currency (IDR|USD) are required." },
        { status: 400 },
      );
    }

    const res = await beAuthenticatedFetch("/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentGuideId, currency }),
    });

    const text = await res.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      return NextResponse.json({ message: "Invalid response from upstream." }, { status: 502 });
    }

    if (!res.ok) {
      return NextResponse.json(
        { message: parseBeErrorMessage(data, "Failed to create order.") },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg.includes("API_BASE_URL")) {
      return NextResponse.json({ message: "Server misconfiguration: API_BASE_URL is not set." }, { status: 500 });
    }
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
