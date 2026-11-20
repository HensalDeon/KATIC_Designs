import type { Metadata } from "next";

import type { SiteSettings } from "@/lib/schemas/site";

import { absoluteUrl, SITE_URL } from "./site-url";

/**
 * Per-route metadata in one shape. The original swapped `document.title`, the description, the
 * Open Graph / Twitter tags and the canonical on every hash change, all pointing at
 * `https://www.katicdesigns.com/#<page>` (KI-S01); each route now states its own.
 *
 * Next merges metadata shallowly (a page's `openGraph` replaces the layout's whole object), so this
 * builds every nested object in full instead of relying on inheritance.
 */
export type PageSeo = {
  /** Site path of the page, e.g. `/services/architecture`; becomes the canonical and `og:url`. */
  readonly path: string;
  /** Complete document title (the original's `data-title` already ends in the brand). */
  readonly title: string;
  readonly description: string;
  /** Articles: `og:type=article` with its publication date. */
  readonly article?: { readonly publishedTime: string; readonly section?: string };
  /** Keep the page out of search results (thank-you). */
  readonly noindex?: boolean;
};

/** The settings these helpers read: the site's name and its SEO defaults. */
export type SeoSettings = Pick<SiteSettings, "name" | "seo">;

function ogImage({ seo }: SeoSettings) {
  return {
    url: absoluteUrl(seo.ogImage.path),
    width: seo.ogImage.width,
    height: seo.ogImage.height,
    alt: seo.ogImage.alt,
    type: "image/jpeg",
  };
}

/** Site-wide defaults for the root layout (also what a 404 inherits). */
export function rootMetadata(site: SeoSettings): Metadata {
  const { name, seo } = site;
  const image = ogImage(site);
  return {
    metadataBase: SITE_URL,
    title: seo.title,
    description: seo.description,
    applicationName: name,
    authors: [{ name }],
    // The original's `<meta name="robots">`.
    robots: { index: true, follow: true, "max-image-preview": "large" },
    openGraph: {
      type: "website",
      siteName: name,
      locale: seo.locale,
      title: seo.title,
      description: seo.description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [image],
    },
    other: {
      "geo.region": seo.geo.region,
      "geo.placename": seo.geo.placename,
    },
  };
}

/**
 * Metadata of one page: title, description, canonical, Open Graph and Twitter card. `site` is the
 * settings resource (`await getSite()`).
 */
export function pageMetadata(
  { path, title, description, article, noindex }: PageSeo,
  site: SeoSettings,
): Metadata {
  const url = absoluteUrl(path);
  const shared = { title, description, images: [ogImage(site)] };
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      ...shared,
      url,
      siteName: site.name,
      locale: site.seo.locale,
      ...(article
        ? {
            type: "article",
            publishedTime: article.publishedTime,
            ...(article.section ? { section: article.section } : {}),
          }
        : { type: "website" }),
    },
    twitter: { card: "summary_large_image", ...shared },
    // Replaces the layout's robots: `noindex` (links are still followed by default).
    ...(noindex ? { robots: { index: false } } : {}),
  };
}
