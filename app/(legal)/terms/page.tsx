import type { Metadata } from "next";
import { LegalDocument } from "@/components/landing/legal-document";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description:
    "Syarat dan ketentuan penggunaan EzTripx, termasuk akun, pembelian panduan PDF, pembayaran, lisensi, dan tanggung jawab pengguna.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return <LegalDocument kind="terms" />;
}
