import {
  blockTone,
  endingTone,
  planBlocks,
  type PlannedBlock,
  withContactTarget as withContactHref,
} from "@/components/blocks/block-plan";
import type { SectionAction } from "@/components/sections/section-action";
import type { ServicePageContent, ServiceSection } from "@/content/service-pages";
import type { ServiceSlug } from "@/lib/routes";
import type { Tone } from "@/lib/tone";

/**
 * Service-page names for the shared block plan (`src/components/blocks/block-plan.ts`): service
 * pages alternate white/black after the hero, starting white, and end with the contact + FAQ in
 * the opposite tone of the last section.
 */

/** A section with its resolved tone and a stable React key. */
export type PlannedSection = Omit<PlannedBlock<ServiceSection>, "block" | "index"> & {
  readonly section: ServiceSection;
};

/** The resolved order and tones of a service page, between the (dark) hero and the contact. */
export type ServicePagePlan = {
  readonly sections: readonly PlannedSection[];
  readonly contact: { readonly id: string; readonly tone: Tone };
};

/** Tone of the section at `index` (after the hero); `section.tone` overrides it. */
export function sectionTone(section: Pick<ServiceSection, "tone">, index: number): Tone {
  return blockTone(section, index);
}

/** Tone of the contact + FAQ section: the opposite of the section above it. */
export const contactTone = endingTone;

/** The contact section's id, as the original renames it at runtime (`<slug>-contact`). */
export function contactSectionId(slug: ServiceSlug): string {
  return `${slug}-contact`;
}

/** Order, keys and tones of every section of a page. */
export function planServicePage(
  content: Pick<ServicePageContent, "slug" | "sections">,
): ServicePagePlan {
  const plan = planBlocks(content.sections);
  return {
    sections: plan.blocks.map(({ block, tone, key }) => ({ section: block, tone, key })),
    contact: { id: contactSectionId(content.slug), tone: plan.endingTone },
  };
}

/**
 * Points a "go to contact" action at the page's own form (its no-JavaScript fallback), unless the
 * content gives an explicit target.
 */
export function withContactTarget(action: SectionAction, contactId: string): SectionAction {
  return withContactHref(action, `#${contactId}`);
}
