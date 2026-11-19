import type { Metadata } from "next";

import { IndiaPage } from "@/components/locations/india/india-page";
import { INDIA_PAGE } from "@/content/locations/india";

/**
 * Fully static: the project filter reads `?area=` on the client (inside its own Suspense boundary),
 * so the build fails if anything here starts rendering per request.
 */
export const ensureStatic = "navigation";

export const metadata: Metadata = {
  // The original's `data-title` already ends in "| Katic Designs".
  title: { absolute: INDIA_PAGE.seo.title },
  description: INDIA_PAGE.seo.description,
};

/** India (`#p-india`, original lines 4071–4096; the legacy `#kochi` is an alias). */
export default function IndiaLocationPage() {
  return <IndiaPage />;
}
