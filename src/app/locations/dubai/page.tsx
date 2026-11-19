import type { Metadata } from "next";

import { DubaiPage } from "@/components/locations/dubai/dubai-page";
import { DUBAI_SEO } from "@/content/locations/dubai";

export const metadata: Metadata = {
  // The original's title already ends in "| Katic Designs".
  title: { absolute: DUBAI_SEO.title },
  description: DUBAI_SEO.description,
};

/**
 * Dubai (`#p-dubai`, original lines 4097–4215, docs/analysis/04 §8). Order and tones as the
 * original renders them: hero, "KATIC in Dubai" (white), services (black), divisions (white),
 * cross-border split (black), "How it works" steps (white), "Why KATIC" features (black), the
 * office block (white), the project mosaic (black, `data-fx=168`) and the contact section (white,
 * `data-fx=169`). Sections keep the original ids (`#dubai-context`, `#dubai-office`,
 * `#dubai-contact`). The footer comes from the layout.
 */
export default function DubaiRoute() {
  return <DubaiPage />;
}
