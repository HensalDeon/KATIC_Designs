/**
 * The public origin of the site, for canonical URLs, Open Graph, JSON-LD and the sitemap.
 *
 * `NEXT_PUBLIC_SITE_URL` (see `.env.example`) wins; without it the production domain is used, so
 * a build never publishes `localhost` URLs.
 *
 * TODO(content): the client confirms the production domain. `https://www.katicdesigns.com` is the
 * original's canonical (`<link rel=canonical>`, `og:url`, JSON-LD `@id`s) and matches the email
 * domain (`hello@katicdesigns.com`).
 */
export const PRODUCTION_SITE_URL = "https://www.katicdesigns.com";

/** Parses a configured site URL down to its origin (plus base path, without a trailing slash). */
export function resolveSiteUrl(configured: string | undefined): URL {
  const value = configured?.trim();
  if (!value) return new URL(PRODUCTION_SITE_URL);
  const url = new URL(value);
  url.pathname = url.pathname.replace(/\/+$/, "");
  url.search = "";
  url.hash = "";
  return url;
}

export const SITE_URL: URL = resolveSiteUrl(process.env["NEXT_PUBLIC_SITE_URL"]);

/** Absolute URL of a site path (`/blog` → `https://www.katicdesigns.com/blog`). */
export function absoluteUrl(path: string, base: URL = SITE_URL): string {
  const basePath = base.pathname === "/" ? "" : base.pathname;
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return `${base.origin}${basePath}${normalised === "/" && basePath ? "" : normalised}`;
}
