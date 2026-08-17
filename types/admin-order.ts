import type { OrderStatusPayment } from "@/types/order";

export type AdminOrderRow = {
  id: string;
  price: string;
  currency: string;
  statusPayment: OrderStatusPayment;
  paymentProvider: string;
  paymentUrl: string | null;
  gatewayTransactionId: string | null;
  paidAt: string | null;
  emailDeliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  userEmail: string;
  guideTitle: string;
  documentGuideId: string;
};
