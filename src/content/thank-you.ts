import { routes } from "@/lib/routes";
import type { ThankYouContent } from "@/lib/schemas/thank-you";

/**
 * Thank-you page (`#p-thank-you`, original lines 4380–4395), copy verbatim. The labels, links and
 * fallback that depend on the enquiry just sent are filled in from the remembered lead
 * (`src/lib/leads/thank-you.ts`).
 */

/** `data-title` / `data-desc` of `#p-thank-you`. */
export const THANK_YOU_SEO = {
  title: "Thank You | Katic Designs",
  description:
    "Thank you for your enquiry. A member of the Katic Designs team will be in touch within one business day.",
} as const;

export const THANK_YOU = {
  title: ["Thank you.", "We’ve received", "your enquiry."],
  lead: "Your message has reached the KATIC team.",
  sourceLabel: "Source:",
  serviceLabel: "Service:",
  steps: [
    {
      icon: "message",
      title: "What happens next",
      text: "A member of our team reviews your enquiry and calls or emails you to arrange a first conversation.",
    },
    {
      icon: "clock",
      title: "Response time",
      text: "We reply within one business day (Mon–Sat, 9:30 AM–6:30 PM IST).",
    },
    {
      icon: "message",
      title: "Talk sooner",
      text: "Prefer to chat now? Continue the conversation with us on WhatsApp.",
    },
  ],
  // Shown when the enquiry could not be delivered. The original had two messages for its `mail` /
  // `queued` states, neither of which exists here; this one keeps their wording.
  // TODO(content): client to confirm.
  fallback: {
    message:
      "We couldn’t reach our server just now, so your enquiry may not have reached us. To be sure we get it today, send it by WhatsApp or email using the buttons below, or copy your details.",
    email: "Send by email",
    copy: "Copy my details",
    copied: "Copied",
  },
  whatsapp: "Continue on WhatsApp",
  back: "Back to Previous Page",
  projects: { label: "Explore Projects", href: `${routes.works}#works-list` },
} as const satisfies ThankYouContent;
