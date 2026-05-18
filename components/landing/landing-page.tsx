"use client";

import { AuthModals } from "@/components/landing/auth-modals";
import { CtaSection } from "@/components/landing/cta";
import { DestinationsSection } from "@/components/landing/destinations";
import { LandingFooter } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/hero";
import { LandingHeader } from "@/components/landing/header";
import { LandingProvider } from "@/components/landing/language-provider";
import { MapSection } from "@/components/landing/map-section";
import { StoriesSection } from "@/components/landing/stories";
import { TestimonialsSection } from "@/components/landing/testimonials";

export function LandingPage() {
  return (
    <LandingProvider>
      <div className="min-h-screen bg-white">
        <LandingHeader />
        <main>
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
    </LandingProvider>
  );
}
