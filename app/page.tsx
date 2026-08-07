import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: {
    absolute: "EzTripx — Live Your Adventure",
  },
  description:
    "Jelajahi destinasi dan temukan panduan perjalanan PDF dari EzTripx. Live your adventure dengan document guide yang siap dipakai traveler.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return <LandingPage />;
}
