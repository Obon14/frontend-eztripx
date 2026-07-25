"use client";

import type { ReactNode } from "react";
import { AuthModals } from "@/components/landing/auth-modals";
import { LandingFooter } from "@/components/landing/footer";
import { LandingHeader } from "@/components/landing/header";
import { LandingProvider } from "@/components/landing/language-provider";

export function LandingShell({ children }: { children: ReactNode }) {
  return (
    <LandingProvider>
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <LandingHeader />
        <main>{children}</main>
        <LandingFooter />
        <AuthModals />
      </div>
    </LandingProvider>
  );
}
