import type { OrderStatusPayment } from "@/types/order";

export type DashboardGuideRef = {
  id: string;
  titleId: string;
  titleEn: string | null;
};

export type DashboardRecentOrder = {
  id: string;
  price: string;
  currency: string;
  statusPayment: OrderStatusPayment;
  paidAt: string | null;
  emailDeliveredAt: string | null;
  createdAt: string;
  user: { id: string; email: string };
  documentGuide: DashboardGuideRef;
};

export type DashboardTopGuide = DashboardGuideRef & {
  paidCount: number;
};

export type DashboardAttentionOrder = {
  id: string;
  paidAt: string | null;
  userEmail: string;
  documentGuide: DashboardGuideRef;
};

export type DashboardSummary = {
  periodDays: number;
  since: string;
  kpis: {
    revenueIdr: string;
    revenueUsd: string;
    paidOrders: number;
    pendingOrders: number;
    newUsers: number;
  };
  orderCounts: Record<OrderStatusPayment, number>;
  catalog: {
    published: number;
    draft: number;
  };
  recentOrders: DashboardRecentOrder[];
  topGuides: DashboardTopGuide[];
  attention: {
    unpaidEmail: DashboardAttentionOrder[];
    draftCount: number;
    pendingCount: number;
  };
};
