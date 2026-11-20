import type { Metadata } from "next";

import { IndiaPage } from "@/components/locations/india/india-page";
import { JsonLd } from "@/components/seo/json-ld";
import { getIndiaPage, getSite, getTrailLabels } from "@/lib/data";
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
export async function generateMetadata(): Promise<Metadata> {
  const [page, site] = await Promise.all([getIndiaPage(), getSite()]);
  return pageMetadata({ path: routes.location("india"), ...page.seo }, site);
}

/** India (`#p-india`, original lines 4071–4096; the legacy `#kochi` is an alias). */
export default async function IndiaLocationPage() {
  const [page, labels] = await Promise.all([getIndiaPage(), getTrailLabels()]);
  return (
    <>
      <IndiaPage content={page} />
      <JsonLd data={breadcrumbLd(locationTrail("india", labels))} />
    </>
  );
}
