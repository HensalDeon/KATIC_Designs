import { routes } from "@/lib/routes";

import type { SectionHeaderContent } from "./types";

/**
 * Copy the original repeats verbatim wherever a block appears (docs/analysis/03 §4, "Identical
 * across pages").
 */

/** Header of every testimonials block (`.kq`); `TestimonialsBlock.header` overrides it. */
export const TESTIMONIALS_HEADER = {
  kicker: "Client testimonials",
  title: ["In our clients’", "words"],
  // TODO(content): KI-C08. Placeholder note shown verbatim by the original.
  lead: "Selected feedback from people we’ve designed and built for. Representative copy — replace with approved client testimonials.",
  cta: { label: "Read All Client Reviews", href: routes.reviews, variant: "dark" },
} as const satisfies SectionHeaderContent;
