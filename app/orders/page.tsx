import type { Metadata } from "next";
import { OrdersList } from "@/components/landing/orders-list";
import { LandingShell } from "@/components/landing/landing-shell";

export const metadata: Metadata = {
  title: "My orders",
  description: "View your EzTripx document guide orders, continue payment, preview, or download.",
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return (
    <LandingShell>
      <OrdersList />
    </LandingShell>
  );
}
