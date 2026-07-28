import { Suspense } from "react";
import { GuideDocumentCatalog } from "@/components/landing/guide-document-catalog";
import { LandingShell } from "@/components/landing/landing-shell";

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
