import type { AdminReview, PublicReview, ReviewStatus } from "@/types/review";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export function parsePublicReview(raw: unknown): PublicReview | null {
  if (!isRecord(raw)) return null;
  const id = typeof raw.id === "string" ? raw.id : null;
  const comment = typeof raw.comment === "string" ? raw.comment : null;
  const displayName = typeof raw.displayName === "string" ? raw.displayName : null;
  const rating = typeof raw.rating === "number" ? raw.rating : Number(raw.rating);
  if (!id || !comment || !displayName || !Number.isFinite(rating)) return null;
  return {
    id,
    rating: Math.min(5, Math.max(1, Math.round(rating))),
    comment,
    displayName,
    travelerRole: typeof raw.travelerRole === "string" ? raw.travelerRole : null,
  };
}

export function parsePublicReviewList(body: unknown): PublicReview[] {
  if (Array.isArray(body)) {
    return body.map(parsePublicReview).filter((row): row is PublicReview => row !== null);
  }
  if (!isRecord(body) || !Array.isArray(body.data)) return [];
  return body.data.map(parsePublicReview).filter((row): row is PublicReview => row !== null);
}

const STATUSES: ReviewStatus[] = ["pending", "published", "rejected"];

export function parseAdminReview(raw: unknown): AdminReview | null {
  const base = parsePublicReview(raw);
  if (!base || !isRecord(raw)) return null;
  const status = STATUSES.includes(raw.status as ReviewStatus)
    ? (raw.status as ReviewStatus)
    : "pending";
  return {
    ...base,
    status,
    documentGuideId: typeof raw.documentGuideId === "string" ? raw.documentGuideId : "",
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : "",
    userEmail: typeof raw.userEmail === "string" ? raw.userEmail : undefined,
    guideTitle: typeof raw.guideTitle === "string" ? raw.guideTitle : undefined,
  };
}

export function parseAdminReviewList(body: unknown): {
  data: AdminReview[];
  meta: { page: number; limit: number; total: number; totalPages: number } | null;
} {
  if (!isRecord(body) || !Array.isArray(body.data)) {
    return { data: [], meta: null };
  }
  const data = body.data
    .map(parseAdminReview)
    .filter((row): row is AdminReview => row !== null);
  const metaRaw = isRecord(body.meta) ? body.meta : null;
  const meta = metaRaw
    ? {
        page: Number(metaRaw.page) || 1,
        limit: Number(metaRaw.limit) || 10,
        total: Number(metaRaw.total) || data.length,
        totalPages: Number(metaRaw.totalPages) || 1,
      }
    : null;
  return { data, meta };
}
