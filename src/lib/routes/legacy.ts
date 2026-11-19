import {
  DIVISION_SLUGS,
  type DivisionSlug,
  routes,
  SERVICE_SLUGS,
  type ServiceSlug,
  WORKS_CATEGORIES,
  type WorksCategory,
} from "./index";

/**
 * Maps the original single-page site's hash URLs (`#<page>[/<anchor>[/<filter>]]`) to the new
 * routes, so old bookmarks, shared links and indexed URLs keep working (decision D5). Hash
 * fragments never reach the server, so this runs client-side on `/` (LegacyHashRedirect).
 *
 * Returns `null` for hashes that are not legacy page URLs, e.g. in-page anchors like `#start`.
 * Section anchors keep their original ids in the new pages, so they pass through unchanged.
 */
export function resolveLegacyHash(hash: string): string | null {
  const [page = "", anchor, filter] = hash.replace(/^#/, "").split("/");
  const withAnchor = (path: string) => (anchor ? `${path}#${anchor}` : path);

  if (isServiceSlug(page)) return withAnchor(routes.service(page));

  if (page.startsWith("div-")) {
    const slug = page.slice(4);
    return isDivisionSlug(slug) ? withAnchor(routes.division(slug)) : null;
  }

  switch (page) {
    case "home":
      if (anchor === "contact-sec") return `${routes.home}#start`;
      return anchor ? `${routes.home}#${anchor}` : routes.home;
    case "contact":
      return `${routes.home}#start`;
    case "about":
      return withAnchor(routes.about);
    case "services":
      return withAnchor(routes.services);
    case "works":
      if (filter && isWorksCategory(filter)) return routes.worksCategory(filter);
      return withAnchor(routes.works);
    case "project":
      return withAnchor(routes.project("the-courtyard-house"));
    case "news":
      return routes.news;
    case "blog":
      if (filter && filter !== "all") return routes.blogCategory(filter);
      return routes.blog;
    case "article":
      return anchor ? routes.article(anchor) : routes.blog;
    case "india":
    case "kochi":
      if (filter && anchor) return `${routes.location("india")}?area=${filter}#${anchor}`;
      return withAnchor(routes.location("india"));
    case "dubai":
      return withAnchor(routes.location("dubai"));
    case "reviews":
      return withAnchor(routes.reviews);
    case "thank-you":
      return routes.thankYou;
    default:
      return null;
  }
}

function isServiceSlug(value: string): value is ServiceSlug {
  return (SERVICE_SLUGS as readonly string[]).includes(value);
}

function isDivisionSlug(value: string): value is DivisionSlug {
  return (DIVISION_SLUGS as readonly string[]).includes(value);
}

function isWorksCategory(value: string): value is WorksCategory {
  return (WORKS_CATEGORIES as readonly string[]).includes(value);
}
