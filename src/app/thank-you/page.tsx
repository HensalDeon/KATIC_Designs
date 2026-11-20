import type { Metadata } from "next";

import { ThankYouSection } from "@/components/thank-you/thank-you-section";
import { THANK_YOU_SEO } from "@/content/thank-you";
import { getSite } from "@/lib/data";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";

// A confirmation page, not content: kept out of search results and the sitemap (docs/analysis/04 §10).
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(
    {
      path: routes.thankYou,
      ...THANK_YOU_SEO,
      noindex: true,
    },
    await getSite(),
  );
}

/**
 * Thank-you (`#p-thank-you`, original lines 4380–4395), where the enquiry form and the
 * Start-a-Project popup continue after sending. No hero; the footer comes from the layout. No
 * reveal-on-scroll (the original runs it on Home only, D7).
 */
export default function ThankYouPage() {
  return <ThankYouSection />;
}
