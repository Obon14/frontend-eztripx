import type { Metadata } from "next";
import { ProfilePanel } from "@/components/landing/profile-panel";
import { LandingShell } from "@/components/landing/landing-shell";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your EzTripx account profile.",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <LandingShell>
      <ProfilePanel />
    </LandingShell>
  );
}
