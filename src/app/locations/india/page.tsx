import type { Metadata } from "next";

import { IndiaPage } from "@/components/locations/india/india-page";
import { JsonLd } from "@/components/seo/json-ld";
import { INDIA_PAGE } from "@/content/locations/india";
import { routes } from "@/lib/routes";
import { locationTrail } from "@/lib/seo/breadcrumbs";
import { breadcrumbLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

/**
 * Fully static: the project filter reads `?area=` on the client (inside its own Suspense boundary),
 * so the build fails if anything here starts rendering per request.
 */
export const ensureStatic = "navigation";

// The original's `data-title` / `data-desc`; `?area=` filters share the one canonical.
export const metadata: Metadata = pageMetadata({
  path: routes.location("india"),
  ...INDIA_PAGE.seo,
});

/** India (`#p-india`, original lines 4071–4096; the legacy `#kochi` is an alias). */
export default function IndiaLocationPage() {
  return (
    <>
      <IndiaPage />
      <JsonLd data={breadcrumbLd(locationTrail("india"))} />
    </>
  );
}
