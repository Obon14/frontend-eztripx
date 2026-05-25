import { NextResponse } from "next/server";
import { beAuthenticatedFetch } from "@/lib/api/be-authenticated-fetch";
import { parseBeErrorMessage } from "@/lib/auth/parse-be-error";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const res = await beAuthenticatedFetch(`/users/${encodeURIComponent(id)}`);
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

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const res = await beAuthenticatedFetch(`/users/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(
        { message: parseBeErrorMessage(data, "Failed to update user.") },
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

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const res = await beAuthenticatedFetch(`/users/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const text = await res.text();
    let body: unknown;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      return new NextResponse(text, { status: res.status });
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
