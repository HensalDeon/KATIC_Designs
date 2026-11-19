import type { Metadata } from "next";

import { ThankYouSection } from "@/components/thank-you/thank-you-section";
import { THANK_YOU_SEO } from "@/content/thank-you";

export const metadata: Metadata = {
  // The original's title already ends in "| Katic Designs".
  title: { absolute: THANK_YOU_SEO.title },
  description: THANK_YOU_SEO.description,
  // A confirmation page, not content: keep it out of search results (docs/analysis/04 §10).
  robots: { index: false },
};

/**
 * Thank-you (`#p-thank-you`, original lines 4380–4395), where the enquiry form and the
 * Start-a-Project popup continue after sending. No hero; the footer comes from the layout. No
 * reveal-on-scroll (the original runs it on Home only, D7).
 */
export default function ThankYouPage() {
  return <ThankYouSection />;
}
