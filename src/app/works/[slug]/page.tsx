import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectPage } from "@/components/project/project-page";
import { builtProjectSlugs, getProjectDetail } from "@/content/project-details";

/**
 * Project detail pages (`/works/<slug>`, original `#p-project`; DECISIONS P0-08). Only projects in
 * the detail registry (`src/content/project-details`) are prerendered. Cache Components does not
 * allow `dynamicParams`, so any other slug renders the 404 page through `notFound()`.
 *
 * `ensureStatic = "navigation"` makes the build fail if a page stops being fully static, and makes
 * a request for an unlisted slug wait for its result (a real 404) instead of streaming the App
 * Shell with a 200 (same pattern as `/services/[slug]`, P6-02).
 */
export const ensureStatic = "navigation";

export function generateStaticParams(): { slug: string }[] {
  return builtProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/works/[slug]">): Promise<Metadata> {
  const detail = getProjectDetail((await params).slug);
  if (!detail) notFound();
  return {
    // The original's `data-title` already ends in the brand.
    title: { absolute: detail.seo.title },
    description: detail.seo.description,
  };
}

export default async function ProjectDetailPage({ params }: PageProps<"/works/[slug]">) {
  const detail = getProjectDetail((await params).slug);
  if (!detail) notFound();
  return <ProjectPage detail={detail} />;
}
