import type { Metadata } from "next";

import { SITE, SITE_SEO } from "@/content/site";

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

const OG_IMAGE = {
  url: absoluteUrl(SITE_SEO.ogImage.path),
  width: SITE_SEO.ogImage.width,
  height: SITE_SEO.ogImage.height,
  alt: SITE_SEO.ogImage.alt,
  type: "image/jpeg",
};

/** Site-wide defaults for the root layout (also what a 404 inherits). */
export const ROOT_METADATA: Metadata = {
  metadataBase: SITE_URL,
  title: SITE_SEO.title,
  description: SITE_SEO.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  // The original's `<meta name="robots">`.
  robots: { index: true, follow: true, "max-image-preview": "large" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE_SEO.locale,
    title: SITE_SEO.title,
    description: SITE_SEO.description,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_SEO.title,
    description: SITE_SEO.description,
    images: [OG_IMAGE],
  },
  other: {
    "geo.region": SITE_SEO.geo.region,
    "geo.placename": SITE_SEO.geo.placename,
  },
};

/** Metadata of one page: title, description, canonical, Open Graph and Twitter card. */
export function pageMetadata({ path, title, description, article, noindex }: PageSeo): Metadata {
  const url = absoluteUrl(path);
  const shared = { title, description, images: [OG_IMAGE] };
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      ...shared,
      url,
      siteName: SITE.name,
      locale: SITE_SEO.locale,
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
