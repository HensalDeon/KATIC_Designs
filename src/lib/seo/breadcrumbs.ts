import { DIVISIONS } from "@/content/divisions";
import { HEADER_NAV } from "@/content/navigation";
import { ARTICLE_PAGE, type Post, type PostCategory, postCategorySlug } from "@/content/posts";
import { getProject, isProjectSlug } from "@/content/projects";
import { RELATED_SERVICES } from "@/content/related-services";
import { type DivisionSlug, type LocationSlug, routes, type ServiceSlug } from "@/lib/routes";

import type { Crumb } from "./json-ld";

/**
 * Breadcrumb trails (BreadcrumbList) of the pages that sit in a hierarchy. Names come from the
 * site's own labels (navigation, service and division names, the article's "Blog" crumb). Trails
 * only pass through pages that exist: there is no `/divisions` or `/locations` index, so those
 * pages hang directly off Home.
 */

function navLabel(key: (typeof HEADER_NAV)[number]["key"]): string {
  const item = HEADER_NAV.find((entry) => entry.key === key);
  if (!item) throw new Error(`No header item "${key}"`);
  return item.label;
}

const HOME: Crumb = { name: navLabel("home"), path: routes.home };
const SERVICES: Crumb = { name: navLabel("services"), path: routes.services };
const WORKS: Crumb = { name: navLabel("projects"), path: routes.works };
const BLOG: Crumb = { name: ARTICLE_PAGE.breadcrumb, path: routes.blog };

/**
 * Factory is the interior service's workshop (its hero kicker: "Interior Design · Factory &
 * Manufacturing"), so it sits under Interior Design.
 */
const FACTORY_NAME = "Factory & Manufacturing";

export function serviceTrail(slug: ServiceSlug): Crumb[] {
  if (slug === "factory") {
    const interior = RELATED_SERVICES.interior;
    return [
      HOME,
      SERVICES,
      { name: interior.title, path: interior.href },
      { name: FACTORY_NAME, path: routes.service(slug) },
    ];
  }
  const service = RELATED_SERVICES[slug];
  return [HOME, SERVICES, { name: service.title, path: service.href }];
}

export function divisionTrail(slug: DivisionSlug): Crumb[] {
  const division = DIVISIONS[slug];
  return [HOME, { name: division.name, path: division.href }];
}

/** Label of a header dropdown link ("India", "Dubai"). */
function dropdownLabel(href: string): string {
  const link = HEADER_NAV.flatMap((item) => item.dropdown?.groups ?? [])
    .flatMap((group) => group.links)
    .find((entry) => entry.href === href);
  if (!link) throw new Error(`No header link to "${href}"`);
  return link.label;
}

export function locationTrail(slug: LocationSlug): Crumb[] {
  const path = routes.location(slug);
  return [HOME, { name: dropdownLabel(path), path }];
}

export function projectTrail(slug: string): Crumb[] {
  if (!isProjectSlug(slug)) throw new Error(`Unknown project: ${slug}`);
  return [HOME, WORKS, { name: getProject(slug).name, path: routes.project(slug) }];
}

export function blogCategoryTrail(category: PostCategory): Crumb[] {
  return [HOME, BLOG, { name: category.name, path: routes.blogCategory(category.slug) }];
}

export function articleTrail(post: Post): Crumb[] {
  const categorySlug = postCategorySlug(post.category);
  return [
    HOME,
    BLOG,
    { name: post.category, path: routes.blogCategory(categorySlug) },
    { name: post.title, path: routes.article(post.slug) },
  ];
}
