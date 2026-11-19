import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ServicePage } from "@/components/service-page/service-page";
import { builtServiceSlugs, getServicePage } from "@/content/service-pages";

/**
 * Service detail pages (`/services/<slug>`, original `#p-<slug>`; DECISIONS P0-08). Only the pages
 * in the registry (`src/content/service-pages`) are prerendered. Cache Components does not allow
 * `dynamicParams`, so any other slug renders the 404 page through `notFound()`.
 *
 * `ensureStatic = "navigation"` makes the build fail if a page stops being fully static, and makes
 * a request for an unlisted slug wait for its result (a real 404) instead of streaming the App
 * Shell with a 200.
 */
export const ensureStatic = "navigation";

export function generateStaticParams(): { slug: string }[] {
  return builtServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const content = getServicePage((await params).slug);
  if (!content) notFound();
  return {
    // The original's `data-title` already ends in the brand.
    title: { absolute: content.seo.title },
    description: content.seo.description,
  };
}

export default async function ServiceDetailPage({ params }: PageProps<"/services/[slug]">) {
  const content = getServicePage((await params).slug);
  if (!content) notFound();
  return <ServicePage content={content} />;
}
