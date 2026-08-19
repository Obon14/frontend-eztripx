"use client";

import dynamic from "next/dynamic";
import { AuthModals } from "@/components/landing/auth-modals";
import { CtaSection } from "@/components/landing/cta";
import { DestinationsSection } from "@/components/landing/destinations";
import { LandingFooter } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/hero";
import { LandingHeader } from "@/components/landing/header";
import { LandingProvider } from "@/components/landing/language-provider";
import { LandingSearchProvider } from "@/components/landing/landing-search-provider";
import { StoriesSection } from "@/components/landing/stories";
import { TestimonialsSection } from "@/components/landing/testimonials";

const MapSection = dynamic(
  () =>
    import("@/components/landing/map-section").then((m) => m.MapSection),
  {
    ssr: false,
    loading: () => (
      <section className="bg-white py-12 sm:py-20 dark:bg-slate-950">
        <div className="mx-auto mt-8 flex aspect-[3/4] max-w-4xl items-center justify-center rounded-2xl bg-slate-900 text-sm text-slate-400 sm:mt-12 sm:aspect-[3/2] sm:rounded-3xl lg:aspect-[2/1]">
          …
        </div>
      </section>
    ),
  },
);

export function LandingPage() {
  return (
    <LandingProvider>
      <LandingSearchProvider>
        <div className="flex min-h-dvh flex-col bg-white dark:bg-slate-950">
          <LandingHeader />
          <main className="flex-1">
            <HeroSection />
            <DestinationsSection />
            <StoriesSection />
            <MapSection />
            <TestimonialsSection />
            <CtaSection />
          </main>
          <LandingFooter />
          <AuthModals />
        </div>
      </LandingSearchProvider>
    </LandingProvider>
  );
}
