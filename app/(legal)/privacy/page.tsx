import type { Metadata } from "next";
import { LegalDocument } from "@/components/landing/legal-document";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Kebijakan privasi EzTripx: data akun, pesanan, ulasan, cookie sesi, pembayaran Midtrans, dan hak pelindungan data pribadi.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return <LegalDocument kind="privacy" />;
}
