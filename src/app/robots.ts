import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo/site-url";

/**
 * `/robots.txt`: everything is crawlable except the lead API, and the sitemap is announced.
 * `/thank-you` is deliberately not disallowed: crawlers must fetch it to see its `noindex`.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
