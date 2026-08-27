import type { ListMeta } from "@/types/geo-api";
import type { AdminOrderRow } from "@/types/admin-order";
import type { OrderStatusPayment } from "@/types/order";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

const STATUSES: OrderStatusPayment[] = ["PENDING", "PAID", "FAILED", "CANCELED"];

function parseMeta(v: unknown): ListMeta | null {
  if (!isRecord(v)) return null;
  const page = Number(v.page);
  const limit = Number(v.limit);
  const total = Number(v.total);
  const totalPages = Number(v.totalPages);
  if (![page, limit, total, totalPages].every((n) => Number.isFinite(n))) return null;
  return { page, limit, total, totalPages };
}

function guideTitleFromRaw(guideRaw: unknown): { id: string; title: string } {
  if (!isRecord(guideRaw)) return { id: "", title: "—" };
  const titleId =
    typeof guideRaw.titleId === "string"
      ? guideRaw.titleId
      : typeof guideRaw.title === "string"
        ? guideRaw.title
        : "";
  const titleEn = typeof guideRaw.titleEn === "string" ? guideRaw.titleEn : null;
  return {
    id: typeof guideRaw.id === "string" ? guideRaw.id : "",
    title: titleEn?.trim() || titleId || "—",
  };
}

export function parseAdminOrderItem(raw: unknown): AdminOrderRow | null {
  if (!isRecord(raw)) return null;
  const id = typeof raw.id === "string" ? raw.id : null;
  if (!id) return null;

  const statusRaw = raw.statusPayment;
  const statusPayment = STATUSES.includes(statusRaw as OrderStatusPayment)
    ? (statusRaw as OrderStatusPayment)
    : "PENDING";

  const guide = guideTitleFromRaw(raw.documentGuide);
  const userRaw = raw.user;
  const userEmail =
    isRecord(userRaw) && typeof userRaw.email === "string" ? userRaw.email : "—";

  return {
    id,
    price: typeof raw.price === "string" ? raw.price : String(raw.price ?? ""),
    currency: typeof raw.currency === "string" ? raw.currency : "IDR",
    statusPayment,
    paymentProvider: typeof raw.paymentProvider === "string" ? raw.paymentProvider : "MIDTRANS",
    paymentUrl: typeof raw.paymentUrl === "string" ? raw.paymentUrl : null,
    gatewayTransactionId:
      typeof raw.gatewayTransactionId === "string" ? raw.gatewayTransactionId : null,
    paidAt: typeof raw.paidAt === "string" ? raw.paidAt : null,
    emailDeliveredAt:
      typeof raw.emailDeliveredAt === "string" ? raw.emailDeliveredAt : null,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : "",
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : "",
    userEmail,
    guideTitle: guide.title,
    documentGuideId: guide.id,
  };
}

export function parseAdminOrderList(body: unknown): {
  data: AdminOrderRow[];
  meta: ListMeta | null;
} {
  if (!isRecord(body) || !Array.isArray(body.data)) {
    return { data: [], meta: null };
  }
  const data: AdminOrderRow[] = [];
  for (const row of body.data) {
    const parsed = parseAdminOrderItem(row);
    if (parsed) data.push(parsed);
  }
  return { data, meta: parseMeta(body.meta) };
}
