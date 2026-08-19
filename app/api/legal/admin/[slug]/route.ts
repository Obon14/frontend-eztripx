import { NextResponse } from "next/server";
import { beAuthenticatedFetch } from "@/lib/api/be-authenticated-fetch";
import { parseBeErrorMessage } from "@/lib/auth/parse-be-error";

type Params = { params: Promise<{ slug: string }> };

function invalidSlug(slug: string) {
  return slug !== "terms" && slug !== "privacy";
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const slugPart = slug?.trim() ?? "";
    if (invalidSlug(slugPart)) {
      return NextResponse.json({ message: "Invalid legal document." }, { status: 400 });
    }
    const res = await beAuthenticatedFetch(`/legal/admin/${encodeURIComponent(slugPart)}`);
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(
        { message: parseBeErrorMessage(data, "Failed to load legal document.") },
        { status: res.status },
      );
    }
    return NextResponse.json(data, { status: res.status });
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

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const slugPart = slug?.trim() ?? "";
    if (invalidSlug(slugPart)) {
      return NextResponse.json({ message: "Invalid legal document." }, { status: 400 });
    }
    const body = await request.json().catch(() => null);
    const res = await beAuthenticatedFetch(`/legal/admin/${encodeURIComponent(slugPart)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(
        { message: parseBeErrorMessage(data, "Failed to update legal document.") },
        { status: res.status },
      );
    }
    return NextResponse.json(data, { status: res.status });
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
