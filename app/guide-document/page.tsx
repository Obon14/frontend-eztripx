import type { Metadata } from "next";
import { Suspense } from "react";
import { GuideDocumentCatalog } from "@/components/landing/guide-document-catalog";
import { LandingShell } from "@/components/landing/landing-shell";

export const metadata: Metadata = {
  title: "Document Guides",
  description:
    "Browse and buy curated travel document guides from EzTripx. Filter by destination and download PDF panduan perjalanan.",
  alternates: {
    canonical: "/guide-document",
  },
};

export default function GuideDocumentPage() {
  return (
    <LandingShell>
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
            …
          </div>
        }
      >
        <GuideDocumentCatalog />
      </Suspense>
    </LandingShell>
  );
}
