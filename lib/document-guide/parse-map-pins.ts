export type PublicMapPinGuide = {
  id: string;
  title: string;
  tripDays: number | null;
  coverUrl: string | null;
};

export type PublicMapPin = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  kind: "city" | "country";
  guideCount: number;
  guides: PublicMapPinGuide[];
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function parseGuide(raw: unknown): PublicMapPinGuide | null {
  if (!isRecord(raw)) return null;
  const id = typeof raw.id === "string" ? raw.id : null;
  if (!id) return null;
  const tripDays =
    typeof raw.tripDays === "number" && Number.isFinite(raw.tripDays)
      ? raw.tripDays
      : null;
  let coverUrl: string | null =
    typeof raw.coverUrl === "string" && raw.coverUrl.trim()
      ? raw.coverUrl.trim()
      : null;
  if (coverUrl?.startsWith("/document-guide/")) {
    coverUrl = `/api${coverUrl}`;
  }
  return {
    id,
    title: typeof raw.title === "string" ? raw.title : "",
    tripDays,
    coverUrl,
  };
}

export function parsePublicMapPinsResponse(body: unknown): PublicMapPin[] {
  if (!isRecord(body) || !Array.isArray(body.data)) return [];
  const out: PublicMapPin[] = [];
  for (const item of body.data) {
    if (!isRecord(item)) continue;
    const id = typeof item.id === "string" ? item.id : null;
    const lat = typeof item.lat === "number" ? item.lat : Number(item.lat);
    const lng = typeof item.lng === "number" ? item.lng : Number(item.lng);
    if (!id || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const guides: PublicMapPinGuide[] = [];
    if (Array.isArray(item.guides)) {
      for (const g of item.guides) {
        const parsed = parseGuide(g);
        if (parsed) guides.push(parsed);
      }
    }
    const guideCount =
      typeof item.guideCount === "number" && Number.isFinite(item.guideCount)
        ? item.guideCount
        : guides.length;
    out.push({
      id,
      label: typeof item.label === "string" ? item.label : "",
      lat,
      lng,
      kind: item.kind === "city" ? "city" : "country",
      guideCount,
      guides,
    });
  }
  return out;
}
