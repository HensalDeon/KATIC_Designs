import "server-only";

import { cache } from "react";

import { FALLBACK_PROJECT_SLUG, type ProjectSlug } from "@/content/projects";
import type { DivisionSlug } from "@/lib/routes";
import { routes } from "@/lib/routes";
import type {
  Division,
  ProcessStage,
  Project,
  RelatedService,
  SectorTile,
  Testimonial,
} from "@/lib/schemas/entities";

import {
  listDivisions,
  listProcessStages,
  listProjectPageSlugs,
  listProjects,
  listRelatedServices,
  listSectors,
  listTestimonials,
} from "./accessors";

/**
 * The shared collections a page's content points at by id (D6): projects, testimonials, process
 * stages, sectors, divisions and service cards, with the lookups the renderers need.
 *
 * Page content stays ids; the server component that renders a reference resolves it here
 * (`const refs = await getRefs()`), so neither the route nor the components in between thread the
 * pools through props. Every list is a cached read (`./index.ts`), and `getRefs` is memoised per
 * request, so a page with many references reads each pool once.
 *
 * Lookups throw on an unknown id: a dangling reference fails the build instead of rendering a
 * broken card.
 */
export type ContentRefs = {
  readonly project: (slug: string) => Project;
  readonly projects: (slugs: readonly string[]) => Project[];
  /** Every project, in the site's order. */
  readonly allProjects: readonly Project[];
  /**
   * Where a project card links: its own `/works/<slug>` when it has a detail page, else the page
   * every card used in the original (The Courtyard House, KI-F09), so no card leads to a 404.
   */
  readonly projectHref: (project: Pick<Project, "slug">) => string;
  readonly testimonials: (ids: readonly Testimonial["id"][]) => Testimonial[];
  readonly processStage: (id: ProcessStage["id"]) => ProcessStage;
  readonly sector: (key: string) => SectorTile;
  readonly divisions: (slugs: readonly DivisionSlug[]) => Division[];
  readonly relatedServices: (slugs: readonly RelatedService["slug"][]) => RelatedService[];
};

export const getRefs = cache(async (): Promise<ContentRefs> => {
  const [projects, detailSlugs, testimonials, stages, sectors, divisions, services] =
    await Promise.all([
      listProjects(),
      listProjectPageSlugs(),
      listTestimonials(),
      listProcessStages(),
      listSectors(),
      listDivisions(),
      listRelatedServices(),
    ]);

  const project = lookup(projects, (entry) => entry.slug, "project");
  const testimonial = lookup(testimonials, (entry) => entry.id, "testimonial");
  const processStage = lookup(stages, (entry) => entry.id, "process stage");
  const sector = lookup(sectors, (entry) => entry.key, "sector");
  const division = lookup(divisions, (entry) => entry.slug, "division");
  const service = lookup(services, (entry) => entry.slug, "related service");
  const withPage = new Set(detailSlugs);

  return {
    project,
    projects: (slugs) => slugs.map(project),
    allProjects: projects,
    projectHref: ({ slug }) =>
      routes.project(withPage.has(slug) ? slug : (FALLBACK_PROJECT_SLUG satisfies ProjectSlug)),
    testimonials: (ids) => ids.map(testimonial),
    processStage,
    sector: (key) => {
      const { key: _key, ...tile } = sector(key);
      return tile;
    },
    divisions: (slugs) => slugs.map(division),
    relatedServices: (slugs) => slugs.map(service),
  };
});

function lookup<T>(items: readonly T[], key: (item: T) => string, kind: string) {
  const byKey = new Map(items.map((item) => [key(item), item]));
  return (id: string): T => {
    const item = byKey.get(id);
    if (!item) throw new Error(`Unknown ${kind}: ${id}`);
    return item;
  };
}
