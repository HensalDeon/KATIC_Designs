import type { Metadata } from "next";

import { DubaiPage } from "@/components/locations/dubai/dubai-page";
import { JsonLd } from "@/components/seo/json-ld";
import { getDubaiPage, getSite, getTrailLabels } from "@/lib/data";
import { routes } from "@/lib/routes";
import { locationTrail } from "@/lib/seo/breadcrumbs";
import { breadcrumbLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

// The original's `data-title` / `data-desc` (the title already ends in the brand).
export async function generateMetadata(): Promise<Metadata> {
  const [page, site] = await Promise.all([getDubaiPage(), getSite()]);
  return pageMetadata({ path: routes.location("dubai"), ...page.seo }, site);
}

/**
 * Dubai (`#p-dubai`, original lines 4097–4215, docs/analysis/04 §8). Order and tones as the
 * original renders them: hero, "KATIC in Dubai" (white), services (black), divisions (white),
 * cross-border split (black), "How it works" steps (white), "Why KATIC" features (black), the
 * office block (white), the project mosaic (black, `data-fx=168`) and the contact section (white,
 * `data-fx=169`). Sections keep the original ids (`#dubai-context`, `#dubai-office`,
 * `#dubai-contact`). The footer comes from the layout.
 */
export default async function DubaiRoute() {
  const [page, labels] = await Promise.all([getDubaiPage(), getTrailLabels()]);
  return (
    <>
      <DubaiPage content={page} />
      <JsonLd data={breadcrumbLd(locationTrail("dubai", labels))} />
    </>
  );
}
