import type { ContactSectionContent } from "@/components/sections/contact-section";

/**
 * Copy of the original's CONTACT template (JS 4654), shared by every page's contact section. Pages
 * with a FAQ add it on top (`HOME_CONTACT`). Verbatim; the phone number is a placeholder (KI-C04).
 */
export const CONTACT_TEMPLATE = {
  kicker: "Get in Touch",
  heading: { lines: ["Have a Project in", "Mind?"] },
  lead: "Tell us a little about your site, timeline, and the service you need — we’ll get back to you within one business day to schedule a first conversation.",
  channels: ["email", "phone"],
  form: { service: { mode: "select" } },
} as const satisfies ContactSectionContent;
