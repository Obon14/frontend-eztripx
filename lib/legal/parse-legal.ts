import type { AdminLegalDocument, LegalSlug, PublicLegalDocument } from "@/types/legal";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function asSlug(raw: unknown): LegalSlug | null {
  return raw === "terms" || raw === "privacy" ? raw : null;
}

export function parsePublicLegal(raw: unknown): PublicLegalDocument | null {
  const source =
    isRecord(raw) && isRecord(raw.data) && !("slug" in raw) ? raw.data : raw;
  if (!isRecord(source)) return null;
  const slug = asSlug(source.slug);
  const title = typeof source.title === "string" ? source.title : null;
  const titleHighlight = typeof source.titleHighlight === "string" ? source.titleHighlight : null;
  const intro = typeof source.intro === "string" ? source.intro : null;
  const body = typeof source.body === "string" ? source.body : null;
  const updatedAt = typeof source.updatedAt === "string" ? source.updatedAt : null;
  if (!slug || !title || titleHighlight == null || !intro || body == null || !updatedAt) {
    return null;
  }
  return { slug, title, titleHighlight, intro, body, updatedAt };
}

export function parseAdminLegal(raw: unknown): AdminLegalDocument | null {
  const source =
    isRecord(raw) && isRecord(raw.data) && !("slug" in raw) ? raw.data : raw;
  if (!isRecord(source)) return null;
  const slug = asSlug(source.slug);
  const id = typeof source.id === "string" ? source.id : null;
  const titleId = typeof source.titleId === "string" ? source.titleId : null;
  const titleEn = typeof source.titleEn === "string" ? source.titleEn : null;
  const titleHighlightId = typeof source.titleHighlightId === "string" ? source.titleHighlightId : null;
  const titleHighlightEn = typeof source.titleHighlightEn === "string" ? source.titleHighlightEn : null;
  const introId = typeof source.introId === "string" ? source.introId : null;
  const introEn = typeof source.introEn === "string" ? source.introEn : null;
  const bodyId = typeof source.bodyId === "string" ? source.bodyId : null;
  const bodyEn = typeof source.bodyEn === "string" ? source.bodyEn : null;
  const updatedAt = typeof source.updatedAt === "string" ? source.updatedAt : "";
  if (
    !slug ||
    !id ||
    titleId == null ||
    titleEn == null ||
    titleHighlightId == null ||
    titleHighlightEn == null ||
    introId == null ||
    introEn == null ||
    bodyId == null ||
    bodyEn == null
  ) {
    return null;
  }
  return {
    id,
    slug,
    titleId,
    titleEn,
    titleHighlightId,
    titleHighlightEn,
    introId,
    introEn,
    bodyId,
    bodyEn,
    updatedAt,
  };
}

export function parseAdminLegalList(body: unknown): AdminLegalDocument[] {
  const list = Array.isArray(body)
    ? body
    : isRecord(body) && Array.isArray(body.data)
      ? body.data
      : [];
  return list.map(parseAdminLegal).filter((row): row is AdminLegalDocument => row !== null);
}
