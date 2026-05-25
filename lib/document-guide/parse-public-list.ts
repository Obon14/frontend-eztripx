import type { ListMeta } from "@/types/geo-api";

export type PublicCoverImage = {
  id: string;
  url: string;
  sortOrder: number;
};

export type PublicDocumentGuideCard = {
  id: string;
  title: string;
  tripDays: number | null;
  priceIdr: string | null;
  priceUsd: string | null;
  coverImages: PublicCoverImage[];
  locationLabel: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function parseMeta(v: unknown): ListMeta | null {
  if (!isRecord(v)) return null;
  const page = typeof v.page === "number" ? v.page : Number(v.page);
  const limit = typeof v.limit === "number" ? v.limit : Number(v.limit);
  const total = typeof v.total === "number" ? v.total : Number(v.total);
  const totalPages =
    typeof v.totalPages === "number" ? v.totalPages : Number(v.totalPages);
  if (![page, limit, total, totalPages].every((n) => Number.isFinite(n))) {
    return null;
  }
  return { page, limit, total, totalPages };
}

function parseCoverImages(raw: unknown): PublicCoverImage[] {
  if (!Array.isArray(raw)) {
    if (isRecord(raw) && typeof raw.coverImageUrl === "string") {
      return [];
    }
    return [];
  }
  const out: PublicCoverImage[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    const id = typeof item.id === "string" ? item.id : null;
    const url = typeof item.url === "string" ? item.url : null;
    if (!id || !url) continue;
    const sortOrder =
      typeof item.sortOrder === "number" ? item.sortOrder : Number(item.sortOrder) || 0;
    out.push({ id, url, sortOrder });
  }
  return out.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function parsePublicGuideItem(raw: unknown): PublicDocumentGuideCard | null {
  if (!isRecord(raw)) return null;
  const id = typeof raw.id === "string" ? raw.id : null;
  if (!id) return null;

  const tripDays =
    typeof raw.tripDays === "number"
      ? raw.tripDays
      : raw.tripDays === null
        ? null
        : null;

  let coverImages = parseCoverImages(raw.coverImages);
  if (coverImages.length === 0 && typeof raw.coverImageUrl === "string") {
    coverImages = [{ id: "legacy", url: raw.coverImageUrl, sortOrder: 0 }];
  }

  return {
    id,
    title: typeof raw.title === "string" ? raw.title : "",
    tripDays,
    priceIdr: typeof raw.priceIdr === "string" ? raw.priceIdr : null,
    priceUsd: typeof raw.priceUsd === "string" ? raw.priceUsd : null,
    coverImages,
    locationLabel:
      typeof raw.locationLabel === "string" ? raw.locationLabel : "",
  };
}

export function parsePublicGuideListResponse(body: unknown): {
  data: PublicDocumentGuideCard[];
  meta: ListMeta | null;
} {
  if (!isRecord(body) || !Array.isArray(body.data)) {
    return { data: [], meta: null };
  }
  const data: PublicDocumentGuideCard[] = [];
  for (const item of body.data) {
    const row = parsePublicGuideItem(item);
    if (row) data.push(row);
  }
  return { data, meta: parseMeta(body.meta) };
}

/** Client-safe cover URL via Next BFF (no auth). */
export function publicGuideCoverSrc(guideId: string, imageId: string): string {
  if (imageId === "legacy") {
    return `/api/document-guide/public/${encodeURIComponent(guideId)}/cover`;
  }
  return `/api/document-guide/public/${encodeURIComponent(guideId)}/cover/${encodeURIComponent(imageId)}`;
}
