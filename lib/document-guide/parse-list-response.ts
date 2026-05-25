import type { DocumentGuide, DocumentGuideGeoRef, DocumentGuideStructuredTag } from "@/types/admin";
import type { ListMeta } from "@/types/geo-api";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && /^\d+$/.test(v)) return Number(v);
  return null;
}

function parsePrice(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function parseGeoRef(v: unknown): DocumentGuideGeoRef {
  if (v == null) return null;
  if (!isRecord(v)) return null;
  const id = num(v.id);
  const name = typeof v.name === "string" ? v.name : "";
  if (id == null) return null;
  return { id, name };
}

function parseStructuredTag(v: unknown): DocumentGuideStructuredTag | null {
  if (!isRecord(v)) return null;
  const id = num(v.id);
  if (id == null) return null;
  return {
    id,
    region: parseGeoRef(v.region),
    country: parseGeoRef(v.country),
    city: parseGeoRef(v.city),
  };
}

function parseMeta(v: unknown): ListMeta | null {
  if (!isRecord(v)) return null;
  const page = num(v.page);
  const limit = num(v.limit);
  const total = num(v.total);
  const totalPages = num(v.totalPages);
  if (page == null || limit == null || total == null || totalPages == null) return null;
  return { page, limit, total, totalPages };
}

function parseCoverImages(raw: unknown, guideId: string): DocumentGuide["coverImages"] {
  if (!Array.isArray(raw)) return [];
  const out: DocumentGuide["coverImages"] = [];
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

export function parseDocumentGuideListItem(raw: unknown): DocumentGuide | null {
  if (!isRecord(raw)) return null;
  const id = typeof raw.id === "string" ? raw.id : typeof raw.id === "number" ? String(raw.id) : null;
  if (!id) return null;

  const titleId =
    typeof raw.titleId === "string"
      ? raw.titleId
      : typeof raw.title === "string"
        ? raw.title
        : "";
  const titleEn =
    typeof raw.titleEn === "string" ? raw.titleEn : raw.titleEn === null ? null : null;

  const nameDocument =
    typeof raw.nameDocument === "string"
      ? raw.nameDocument
      : typeof raw.fileName === "string"
        ? raw.fileName
        : "";

  const structuredTags: DocumentGuideStructuredTag[] = [];
  if (Array.isArray(raw.tags)) {
    for (const t of raw.tags) {
      const parsed = parseStructuredTag(t);
      if (parsed) structuredTags.push(parsed);
    }
  }

  const regionIds = [
    ...new Set(
      structuredTags
        .map((t) => (t.region ? String(t.region.id) : null))
        .filter((x): x is string => x != null),
    ),
  ];
  const countryIds = [
    ...new Set(
      structuredTags
        .map((t) => (t.country ? String(t.country.id) : null))
        .filter((x): x is string => x != null),
    ),
  ];
  const cityIds = [
    ...new Set(
      structuredTags
        .map((t) => (t.city ? String(t.city.id) : null))
        .filter((x): x is string => x != null),
    ),
  ];

  const tags: string[] = [titleId, titleEn ?? "", nameDocument];
  for (const t of structuredTags) {
    if (t.region?.name) tags.push(t.region.name);
    if (t.country?.name) tags.push(t.country.name);
    if (t.city?.name) tags.push(t.city.name);
  }

  const statusRaw = raw.status;
  const status =
    statusRaw === "published" || statusRaw === "draft" ? statusRaw : ("draft" as const);

  const tripDays =
    typeof raw.tripDays === "number" && Number.isFinite(raw.tripDays)
      ? raw.tripDays
      : raw.tripDays === null
        ? null
        : null;

  const coverImages = parseCoverImages(raw.coverImages, id);
  const coverImageUrl =
    coverImages[0]?.url ??
    (typeof raw.coverImageUrl === "string" ? raw.coverImageUrl : null);

  return {
    id,
    titleId,
    titleEn,
    title: titleId,
    tripDays,
    coverImages,
    coverImageUrl,
    priceIdr: parsePrice(raw.priceIdr),
    priceUsd: parsePrice(raw.priceUsd),
    regionIds,
    countryIds,
    cityIds,
    tags,
    fileName: nameDocument,
    status,
    structuredTags: structuredTags.length > 0 ? structuredTags : undefined,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
  };
}

export type DocumentGuideListParseResult = {
  data: DocumentGuide[];
  meta: ListMeta | null;
};

export function parseDocumentGuideListResponse(body: unknown): DocumentGuideListParseResult {
  if (!isRecord(body) || !Array.isArray(body.data)) {
    return { data: [], meta: null };
  }
  const data: DocumentGuide[] = [];
  for (const item of body.data) {
    const row = parseDocumentGuideListItem(item);
    if (row) data.push(row);
  }
  const meta = parseMeta(body.meta);
  return { data, meta };
}
