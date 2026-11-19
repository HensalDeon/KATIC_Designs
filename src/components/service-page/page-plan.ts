import type { SectionAction } from "@/components/sections/section-action";
import type { ServicePageContent, ServiceSection } from "@/content/service-pages";
import type { ServiceSlug } from "@/lib/routes";
import { alternatingTone, type Tone } from "@/lib/tone";

/** A section with its resolved tone and a stable React key. */
export type PlannedSection = {
  readonly section: ServiceSection;
  readonly tone: Tone;
  readonly key: string;
};

/** The resolved order and tones of a service page, between the (dark) hero and the contact. */
export type ServicePagePlan = {
  readonly sections: readonly PlannedSection[];
  readonly contact: { readonly id: string; readonly tone: Tone };
};

/**
 * Tone of the section at `index` (after the hero): white and black alternate starting with white,
 * as on every service page of the original (docs/analysis/03 §0). `section.tone` overrides it.
 */
export function sectionTone(section: Pick<ServiceSection, "tone">, index: number): Tone {
  return section.tone ?? alternatingTone(index, "light");
}

/**
 * Tone of the contact + FAQ section: the opposite of the section above it (the original forces
 * it light with `data-fx` after a dark section, and leaves it dark otherwise). Right after the
 * dark hero, it is light.
 */
export function contactTone(previous: Tone | undefined): Tone {
  return previous === "light" ? "dark" : "light";
}

/** The contact section's id, as the original renames it at runtime (`<slug>-contact`). */
export function contactSectionId(slug: ServiceSlug): string {
  return `${slug}-contact`;
}

/** Order, keys and tones of every section of a page. */
export function planServicePage(content: Pick<ServicePageContent, "slug" | "sections">) {
  const sections = content.sections.map((section, index) => ({
    section,
    tone: sectionTone(section, index),
    key: `${String(index)}-${section.type}`,
  }));
  return {
    sections,
    contact: { id: contactSectionId(content.slug), tone: contactTone(sections.at(-1)?.tone) },
  } satisfies ServicePagePlan;
}

/**
 * Points a "go to contact" action at the page's own form (its no-JavaScript fallback), unless the
 * content gives an explicit target.
 */
export function withContactTarget(action: SectionAction, contactId: string): SectionAction {
  return action.kind === "contact" && action.href === undefined
    ? { ...action, href: `#${contactId}` }
    : action;
}
