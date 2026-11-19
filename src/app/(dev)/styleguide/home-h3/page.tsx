import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ClientStories } from "@/components/home/client-stories";
import { DivisionsCarousel } from "@/components/home/divisions-carousel";
import { HomeContact } from "@/components/home/home-contact";
import { ServicesExplorer } from "@/components/home/services-explorer";

/**
 * Dev-only preview of the home sections built in Phase 4 group H3, in home order with their
 * tones: services explorer (black), divisions carousel (white), client stories (white), contact +
 * FAQ (white). Used for visual review and by tests/e2e/home-h3.spec.ts. Same gating as /styleguide.
 */
const ENABLED = process.env.NODE_ENV !== "production" || process.env["ENABLE_STYLEGUIDE"] === "1";

export const metadata: Metadata = {
  title: "Styleguide: home sections (H3)",
  robots: { index: false, follow: false },
};

export default function HomeH3StyleguidePage() {
  if (!ENABLED) notFound();

  return (
    <>
      <ServicesExplorer />
      <DivisionsCarousel />
      <ClientStories />
      <HomeContact />
    </>
  );
}
