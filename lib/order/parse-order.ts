import type { OrderItem, OrderStatusPayment } from "@/types/order";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

const STATUSES: OrderStatusPayment[] = ["PENDING", "PAID", "FAILED", "CANCELED"];

export function parseOrderItem(raw: unknown): OrderItem | null {
  if (!isRecord(raw)) return null;
  const id = typeof raw.id === "string" ? raw.id : null;
  if (!id) return null;

  const statusRaw = raw.statusPayment;
  const statusPayment = STATUSES.includes(statusRaw as OrderStatusPayment)
    ? (statusRaw as OrderStatusPayment)
    : "PENDING";

  const guideRaw = raw.documentGuide;
  let documentGuide = { id: "", title: "" };
  if (isRecord(guideRaw)) {
    const titleId =
      typeof guideRaw.titleId === "string"
        ? guideRaw.titleId
        : typeof guideRaw.title === "string"
          ? guideRaw.title
          : "";
    const titleEn =
      typeof guideRaw.titleEn === "string" ? guideRaw.titleEn : null;
    documentGuide = {
      id: typeof guideRaw.id === "string" ? guideRaw.id : "",
      title: titleEn?.trim() || titleId,
    };
  }

  return {
    id,
    price: typeof raw.price === "string" ? raw.price : String(raw.price ?? ""),
    currency: typeof raw.currency === "string" ? raw.currency : "IDR",
    statusPayment,
    paymentProvider: typeof raw.paymentProvider === "string" ? raw.paymentProvider : "XENDIT",
    paymentUrl: typeof raw.paymentUrl === "string" ? raw.paymentUrl : null,
    gatewayTransactionId:
      typeof raw.gatewayTransactionId === "string" ? raw.gatewayTransactionId : null,
    paidAt: typeof raw.paidAt === "string" ? raw.paidAt : null,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : "",
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : "",
    documentGuide,
  };
}

export function parseOrderResponse(body: unknown): OrderItem | null {
  if (isRecord(body) && "data" in body && !Array.isArray(body.data)) {
    return parseOrderItem(body.data);
  }
  return parseOrderItem(body);
}

export function parseOrderList(body: unknown): OrderItem[] {
  if (Array.isArray(body)) {
    return body
      .map((row) => parseOrderItem(row))
      .filter((row): row is OrderItem => row !== null);
  }
  if (!isRecord(body)) return [];
  const rows = Array.isArray(body.data) ? body.data : [];
  const items: OrderItem[] = [];
  for (const row of rows) {
    const parsed = parseOrderItem(row);
    if (parsed) items.push(parsed);
  }
  return items;
}
