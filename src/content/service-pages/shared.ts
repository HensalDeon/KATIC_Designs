/**
 * Copy the original repeats verbatim on every service page (docs/analysis/03 §4, "Identical
 * across pages").
 */

/** Header of every testimonials block (`.kq`); shared by every block page. */
export { TESTIMONIALS_HEADER } from "@/content/blocks";

/**
 * FAQ header of the contact + FAQ section. Only architecture changes the title ("Architecture /
 * FAQ"). The FAQ intro and "Ask us directly" link are authored but removed at runtime by the
 * original, so pages omit them (KI-C12).
 */
export const FAQ_HEADER = {
  kicker: "Questions, answered",
  titleLines: ["Frequently asked", "questions"],
} as const;
