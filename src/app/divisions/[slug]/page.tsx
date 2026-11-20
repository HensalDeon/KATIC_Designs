import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DivisionPage } from "@/components/division-page/division-page";
import { JsonLd } from "@/components/seo/json-ld";
import { builtDivisionSlugs, getDivisionPage } from "@/content/divisions/pages";
import { getSite, getTrailLabels } from "@/lib/data";
import { routes } from "@/lib/routes";
import { divisionTrail } from "@/lib/seo/breadcrumbs";
import { breadcrumbLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

/**
 * Division pages (`/divisions/<slug>`, original `#p-div-<slug>`; DECISIONS P0-08). Only the pages
 * in the registry (`src/content/divisions/pages.ts`) are prerendered. Cache Components does not
 * allow `dynamicParams`, so any other slug renders the 404 page through `notFound()`.
 *
 * `ensureStatic = "navigation"` makes the build fail if a page stops being fully static, and makes
 * a request for an unlisted slug wait for its result (a real 404) instead of streaming the App
 * Shell with a 200 (same pattern as `/services/[slug]`, P6-02).
 */
export const ensureStatic = "navigation";

export function generateStaticParams(): { slug: string }[] {
  return builtDivisionSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/divisions/[slug]">): Promise<Metadata> {
  const content = getDivisionPage((await params).slug);
  if (!content) notFound();
  // The original's `data-title` is complete (it names the division, not the studio).
  return pageMetadata({ path: routes.division(content.slug), ...content.seo }, await getSite());
}

export default async function DivisionDetailPage({ params }: PageProps<"/divisions/[slug]">) {
  const content = getDivisionPage((await params).slug);
  if (!content) notFound();
  return (
    <>
      <DivisionPage content={content} />
      <JsonLd data={breadcrumbLd(divisionTrail(content.slug, await getTrailLabels()))} />
    </>
  );
}
