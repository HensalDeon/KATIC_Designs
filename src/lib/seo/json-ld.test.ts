import { describe, expect, it } from "vitest";

import { DIVISIONS } from "@/content/divisions";
import { HOME_CONTACT } from "@/content/home/contact";
import { HEADER_NAV } from "@/content/navigation";
import { ARTICLE_PAGE, POST_CATEGORIES, postCategorySlug, POSTS } from "@/content/posts";
import { getProject } from "@/content/projects";
import { RELATED_SERVICES } from "@/content/related-services";
import { builtServiceSlugs, getServicePage } from "@/content/service-pages";
import { OFFICES, SITE_SETTINGS } from "@/content/site";
import { DIVISION_SLUGS, LOCATION_SLUGS, routes } from "@/lib/routes";

import {
  articleTrail,
  blogCategoryTrail,
  divisionTrail,
  locationTrail,
  projectTrail,
  serviceTrail,
  type TrailLabels,
} from "./breadcrumbs";
import {
  blogPostingLd,
  breadcrumbLd,
  faqAnswerText,
  faqPageLd,
  LD_IDS,
  localBusinessLd,
  serializeJsonLd,
  siteJsonLd,
} from "./json-ld";
import { absoluteUrl, PRODUCTION_SITE_URL, resolveSiteUrl } from "./site-url";

const SITE = SITE_SETTINGS;
const DIVISION_LIST = DIVISION_SLUGS.map((slug) => DIVISIONS[slug]);
const LABELS: TrailLabels = {
  nav: HEADER_NAV,
  services: Object.values(RELATED_SERVICES),
  divisions: DIVISION_LIST,
  blog: ARTICLE_PAGE.breadcrumb,
};

function categoryOf(post: (typeof POSTS)[number]) {
  const category = POST_CATEGORIES.find((entry) => entry.slug === postCategorySlug(post.category));
  if (!category) throw new Error(post.category);
  return category;
}

/** The values of a graph document, by `@type`. */
function graphTypes(doc: ReturnType<typeof siteJsonLd>): string[] {
  return "@graph" in doc ? doc["@graph"].map((node) => node["@type"]) : [doc["@type"]];
}

describe("site URL", () => {
  it("falls back to the production domain and trims trailing slashes", () => {
    expect(resolveSiteUrl(undefined).href).toBe(`${PRODUCTION_SITE_URL}/`);
    expect(resolveSiteUrl("  ").href).toBe(`${PRODUCTION_SITE_URL}/`);
    expect(resolveSiteUrl("https://staging.example.com/").href).toBe(
      "https://staging.example.com/",
    );
  });

  it("joins paths, keeping a base path", () => {
    const base = resolveSiteUrl("https://example.com");
    expect(absoluteUrl("/", base)).toBe("https://example.com/");
    expect(absoluteUrl("/blog", base)).toBe("https://example.com/blog");
    const sub = resolveSiteUrl("https://example.com/site/");
    expect(absoluteUrl("/", sub)).toBe("https://example.com/site");
    expect(absoluteUrl("/blog", sub)).toBe("https://example.com/site/blog");
  });
});

describe("site-wide graph", () => {
  const doc = siteJsonLd(SITE, DIVISION_LIST);

  it("is Organization, two local businesses and the WebSite", () => {
    expect(graphTypes(doc)).toEqual([
      "Organization",
      "HomeAndConstructionBusiness",
      "HomeAndConstructionBusiness",
      "WebSite",
    ]);
  });

  it("publishes no placeholder contact data (KI-C01, KI-C02)", () => {
    const json = JSON.stringify(doc);
    expect(json).not.toMatch(/0000|Ridgeline|400001|telephone|streetAddress|postalCode/);
    expect(json).not.toContain("FAQPage");
  });

  it("links the offices to the organisation and their location pages", () => {
    const kochi = localBusinessLd(OFFICES.kochi, SITE);
    expect(kochi.parentOrganization).toEqual({ "@id": LD_IDS.organization });
    expect(kochi.url).toBe(absoluteUrl(routes.location("india")));
    expect(kochi.address).toMatchObject({ addressLocality: "Kochi", addressCountry: "IN" });
    expect(kochi.makesOffer).toHaveLength(7);
    const dubai = localBusinessLd(OFFICES.dubai, SITE);
    expect(dubai.url).toBe(absoluteUrl(routes.location("dubai")));
    expect(dubai.address).toEqual({
      "@type": "PostalAddress",
      addressLocality: "Dubai",
      addressCountry: "AE",
    });
    expect(dubai.openingHoursSpecification[0]?.dayOfWeek).toHaveLength(5);
  });
});

describe("FAQPage", () => {
  it("is built from the FAQ a page renders", () => {
    const doc = faqPageLd(HOME_CONTACT.faq.items, routes.home);
    expect(doc).toMatchObject({ "@type": "FAQPage", url: absoluteUrl("/") });
    expect("mainEntity" in doc && doc.mainEntity.map((q) => q.name)).toEqual(
      HOME_CONTACT.faq.items.map((item) => item.question),
    );
  });

  it("flattens answers with inline links to text", () => {
    expect(faqAnswerText(["See ", { label: "our work", href: "/works" }, "."])).toBe(
      "See our work.",
    );
  });

  it("exists for every service page", () => {
    for (const slug of builtServiceSlugs()) {
      const page = getServicePage(slug);
      expect(page?.contact.faq.items.length, slug).toBeGreaterThan(0);
    }
  });
});

describe("BlogPosting", () => {
  const post = POSTS[0];
  if (!post) throw new Error("no posts");

  it("describes the article with an organisation author (KI-S02)", () => {
    const doc = blogPostingLd(post, SITE, "/cover.webp");
    expect(doc).toMatchObject({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.publishedAt,
      image: absoluteUrl("/cover.webp"),
      url: absoluteUrl(routes.article(post.slug)),
      author: { "@type": "Organization", name: post.author },
      publisher: { "@id": LD_IDS.organization },
    });
  });
});

describe("breadcrumbs", () => {
  it("numbers the trail and uses absolute URLs", () => {
    const doc = breadcrumbLd(serviceTrail("architecture", LABELS));
    expect("itemListElement" in doc && doc.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Services", item: absoluteUrl("/services") },
      {
        "@type": "ListItem",
        position: 3,
        name: "Architectural Design",
        item: absoluteUrl("/services/architecture"),
      },
    ]);
  });

  it("ends every trail on the page itself", () => {
    const trails = [
      ...builtServiceSlugs().map(
        (slug) => [serviceTrail(slug, LABELS), routes.service(slug)] as const,
      ),
      ...DIVISION_SLUGS.map(
        (slug) => [divisionTrail(slug, LABELS), routes.division(slug)] as const,
      ),
      ...LOCATION_SLUGS.map(
        (slug) => [locationTrail(slug, LABELS), routes.location(slug)] as const,
      ),
      [
        projectTrail(getProject("the-courtyard-house"), LABELS),
        routes.project("the-courtyard-house"),
      ] as const,
      ...POST_CATEGORIES.map(
        (category) =>
          [blogCategoryTrail(category, LABELS), routes.blogCategory(category.slug)] as const,
      ),
      ...POSTS.map(
        (post) =>
          [articleTrail(post, categoryOf(post), LABELS), routes.article(post.slug)] as const,
      ),
    ];
    for (const [trail, path] of trails) {
      expect(trail[0]?.path).toBe("/");
      expect(trail.at(-1)?.path).toBe(path);
      for (const crumb of trail) expect(crumb.name.length, path).toBeGreaterThan(0);
    }
  });

  it("puts the factory under Interior Design", () => {
    expect(serviceTrail("factory", LABELS).map((crumb) => crumb.path)).toEqual([
      "/",
      "/services",
      "/services/interior",
      "/services/factory",
    ]);
  });
});

describe("serializeJsonLd", () => {
  it("cannot close the script element", () => {
    const json = serializeJsonLd(
      breadcrumbLd([{ name: "</script><script>alert(1)</script> & co", path: "/" }]),
    );
    expect(json).not.toMatch(/[<>&]/);
    expect(JSON.parse(json)).toMatchObject({
      itemListElement: [{ name: "</script><script>alert(1)</script> & co" }],
    });
  });
});
