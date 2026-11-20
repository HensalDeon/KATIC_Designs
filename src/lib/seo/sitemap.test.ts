import { describe, expect, it } from "vitest";

import { builtDivisionSlugs } from "@/content/divisions/pages";
import { POST_CATEGORIES, POSTS } from "@/content/posts";
import { builtProjectSlugs } from "@/content/project-details";
import { builtServiceSlugs } from "@/content/service-pages";
import { SITE_SETTINGS } from "@/content/site";
import { routes } from "@/lib/routes";

import { pageMetadata } from "./metadata";
import { absoluteUrl } from "./site-url";
import { sitemapEntries, sitemapPages, type SitemapSources } from "./sitemap";

const SOURCES: SitemapSources = {
  servicePages: builtServiceSlugs(),
  projectPages: builtProjectSlugs(),
  divisionPages: builtDivisionSlugs(),
  postCategories: POST_CATEGORIES,
  posts: POSTS,
};

describe("sitemap", () => {
  const paths = sitemapPages(SOURCES).map((page) => page.path);

  it("lists every built page once", () => {
    expect(new Set(paths).size).toBe(paths.length);
    for (const path of [
      routes.home,
      routes.about,
      routes.services,
      routes.works,
      routes.reviews,
      routes.news,
      routes.blog,
      routes.location("india"),
      routes.location("dubai"),
      ...builtServiceSlugs().map(routes.service),
      ...builtDivisionSlugs().map(routes.division),
      ...builtProjectSlugs().map(routes.project),
      ...POST_CATEGORIES.map(({ slug }) => routes.blogCategory(slug)),
      ...POSTS.map(({ slug }) => routes.article(slug)),
    ]) {
      expect(paths).toContain(path);
    }
    expect(paths).toHaveLength(9 + 8 + 5 + 1 + 9 + 9);
  });

  it("leaves out the thank-you page and the API", () => {
    expect(paths).not.toContain(routes.thankYou);
    expect(paths.some((path) => path.startsWith("/api"))).toBe(false);
  });

  it("uses absolute URLs and dates articles", () => {
    const entries = sitemapEntries(sitemapPages(SOURCES));
    for (const entry of entries) expect(entry.url.startsWith(absoluteUrl("/"))).toBe(true);
    const post = POSTS[0];
    expect(entries).toContainEqual({
      url: absoluteUrl(routes.article(post?.slug ?? "")),
      lastModified: post?.publishedAt,
    });
  });
});

describe("pageMetadata", () => {
  it("sets the canonical, Open Graph and Twitter card of a page", () => {
    const metadata = pageMetadata({ path: "/about", title: "T", description: "D" }, SITE_SETTINGS);
    expect(metadata.title).toEqual({ absolute: "T" });
    expect(metadata.alternates?.canonical).toBe(absoluteUrl("/about"));
    expect(metadata.openGraph).toMatchObject({
      url: absoluteUrl("/about"),
      title: "T",
      description: "D",
      type: "website",
      images: [{ url: absoluteUrl("/og-image.jpg"), width: 1200, height: 630 }],
    });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image", title: "T" });
    expect(metadata.robots).toBeUndefined();
  });

  it("marks articles and noindex pages", () => {
    const article = pageMetadata(
      {
        path: "/blog/x",
        title: "T",
        description: "D",
        article: { publishedTime: "2026-10-14", section: "Architecture" },
      },
      SITE_SETTINGS,
    );
    expect(article.openGraph).toMatchObject({ type: "article", publishedTime: "2026-10-14" });
    const hidden = pageMetadata(
      {
        path: "/thank-you",
        title: "T",
        description: "D",
        noindex: true,
      },
      SITE_SETTINGS,
    );
    expect(hidden.robots).toEqual({ index: false });
  });
});
