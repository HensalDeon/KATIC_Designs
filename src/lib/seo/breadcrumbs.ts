import type { Post, PostCategory } from "@/content/posts";
import { type DivisionSlug, type LocationSlug, routes, type ServiceSlug } from "@/lib/routes";
import type { Division, Project, RelatedService } from "@/lib/schemas/entities";
import type { NavItem, NavKey } from "@/lib/schemas/navigation";

import type { Crumb } from "./json-ld";

/**
 * Breadcrumb trails (BreadcrumbList) of the pages that sit in a hierarchy. Names come from the
 * site's own labels (navigation, service and division names, the article's "Blog" crumb), passed in
 * as `TrailLabels` (`getTrailLabels()` in `@/lib/data`). Trails only pass through pages that
 * exist: there is no `/divisions` or `/locations` index, so those pages hang directly off Home.
 */
export type TrailLabels = {
  /** Header menu (`getNavigation().header`). */
  readonly nav: readonly NavItem[];
  /** Service cards (`listRelatedServices()`): service names and paths. */
  readonly services: readonly RelatedService[];
  readonly divisions: readonly Division[];
  /** The article page's "Blog" crumb. */
  readonly blog: string;
};

function navLabel(labels: TrailLabels, key: NavKey): string {
  const item = labels.nav.find((entry) => entry.key === key);
  if (!item) throw new Error(`No header item "${key}"`);
  return item.label;
}

const home = (labels: TrailLabels): Crumb => ({
  name: navLabel(labels, "home"),
  path: routes.home,
});
const blog = (labels: TrailLabels): Crumb => ({ name: labels.blog, path: routes.blog });

/**
 * Factory is the interior service's workshop (its hero kicker: "Interior Design · Factory &
 * Manufacturing"), so it sits under Interior Design.
 */
const FACTORY_NAME = "Factory & Manufacturing";

function service(labels: TrailLabels, slug: RelatedService["slug"]): Crumb {
  const entry = labels.services.find((candidate) => candidate.slug === slug);
  if (!entry) throw new Error(`Unknown service: ${slug}`);
  return { name: entry.title, path: entry.href };
}

export function serviceTrail(slug: ServiceSlug, labels: TrailLabels): Crumb[] {
  const services = { name: navLabel(labels, "services"), path: routes.services };
  if (slug === "factory") {
    return [
      home(labels),
      services,
      service(labels, "interior"),
      { name: FACTORY_NAME, path: routes.service(slug) },
    ];
  }
  return [home(labels), services, service(labels, slug)];
}

export function divisionTrail(slug: DivisionSlug, labels: TrailLabels): Crumb[] {
  const division = labels.divisions.find((entry) => entry.slug === slug);
  if (!division) throw new Error(`Unknown division: ${slug}`);
  return [home(labels), { name: division.name, path: division.href }];
}

/** Label of a header dropdown link ("India", "Dubai"). */
function dropdownLabel(labels: TrailLabels, href: string): string {
  const link = labels.nav
    .flatMap((item) => item.dropdown?.groups ?? [])
    .flatMap((group) => group.links)
    .find((entry) => entry.href === href);
  if (!link) throw new Error(`No header link to "${href}"`);
  return link.label;
}

export function locationTrail(slug: LocationSlug, labels: TrailLabels): Crumb[] {
  const path = routes.location(slug);
  return [home(labels), { name: dropdownLabel(labels, path), path }];
}

export function projectTrail(
  project: Pick<Project, "slug" | "name">,
  labels: TrailLabels,
): Crumb[] {
  return [
    home(labels),
    { name: navLabel(labels, "projects"), path: routes.works },
    { name: project.name, path: routes.project(project.slug) },
  ];
}

export function blogCategoryTrail(category: PostCategory, labels: TrailLabels): Crumb[] {
  return [
    home(labels),
    blog(labels),
    { name: category.name, path: routes.blogCategory(category.slug) },
  ];
}

/** `category` is the post's category (its name is `post.category`). */
export function articleTrail(post: Post, category: PostCategory, labels: TrailLabels): Crumb[] {
  return [
    home(labels),
    blog(labels),
    { name: post.category, path: routes.blogCategory(category.slug) },
    { name: post.title, path: routes.article(post.slug) },
  ];
}
