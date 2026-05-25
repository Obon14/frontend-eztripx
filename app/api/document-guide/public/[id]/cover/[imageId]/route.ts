import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string; imageId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const base = process.env.API_BASE_URL;
  if (!base) {
    return NextResponse.json(
      { message: "Server misconfiguration: API_BASE_URL is not set." },
      { status: 500 },
    );
  }

  const { id, imageId } = await params;

  try {
    const res = await fetch(
      `${base.replace(/\/$/, "")}/document-guide/public/${encodeURIComponent(id)}/cover/${encodeURIComponent(imageId)}`,
      { cache: "no-store" },
    );

    if (!res.ok) {
      return NextResponse.json(
        { message: "Cover not found." },
        { status: res.status },
      );
    }

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("Content-Type") ?? "image/jpeg";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ message: "Failed to reach upstream server." }, { status: 502 });
  }
}
