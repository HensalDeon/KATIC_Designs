import { routes } from "@/lib/routes";

import type { SectionHeaderContent } from "./types";

/**
 * Copy the original repeats verbatim on every service page (docs/analysis/03 §4, "Identical
 * across pages").
 */

/** Header of every testimonials block (`.kq`); `TestimonialsSection.header` overrides it. */
export const TESTIMONIALS_HEADER = {
  kicker: "Client testimonials",
  title: ["In our clients’", "words"],
  // TODO(content): KI-C08. Placeholder note shown verbatim by the original.
  lead: "Selected feedback from people we’ve designed and built for. Representative copy — replace with approved client testimonials.",
  cta: { label: "Read All Client Reviews", href: routes.reviews, variant: "dark" },
} as const satisfies SectionHeaderContent;

/**
 * FAQ header of the contact + FAQ section. Only architecture changes the title ("Architecture /
 * FAQ"). The FAQ intro and "Ask us directly" link are authored but removed at runtime by the
 * original, so pages omit them (KI-C12).
 */
export const FAQ_HEADER = {
  kicker: "Questions, answered",
  titleLines: ["Frequently asked", "questions"],
} as const;
