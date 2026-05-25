export type OrderCurrency = "IDR" | "USD";

export type OrderStatusPayment = "PENDING" | "PAID" | "FAILED" | "CANCELED";

export type OrderDocumentGuide = {
  id: string;
  title: string;
};

export type OrderItem = {
  id: string;
  price: string;
  currency: string;
  statusPayment: OrderStatusPayment;
  paymentProvider: string;
  paymentUrl: string | null;
  gatewayTransactionId: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  documentGuide: OrderDocumentGuide;
};
