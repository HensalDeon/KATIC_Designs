import { z } from "zod";

import type { ArchProjectCard } from "@/components/service-page/arch/arch-projects";
import type { BespokeSection, ServicePageContent } from "@/content/service-pages";

import { contactFaqSchema, contentBlockSchema, pageHeroSchema, processStepSchema } from "./blocks";
import { projectSlugSchema } from "./entities";
import {
  list,
  sectionActionSchema,
  sectionImageSchema,
  serviceIconSchema,
  serviceOptionSchema,
  serviceSlugSchema,
  shaped,
  titleLinesSchema,
  toneSchema,
} from "./primitives";

/**
 * Service detail pages (`GET /services/{slug}`, P6-01): SEO, banner, an ordered list of blocks
 * (the generic `ContentBlock`s plus architecture's four bespoke blocks) and the contact + FAQ.
 */

/** Bespoke blocks carry an id and a tone override, but no plant. */
const bespokeBase = {
  id: z.string().min(1).exactOptional(),
  tone: toneSchema.exactOptional(),
};

const archHeader = { kicker: z.string(), title: titleLinesSchema };

export const archIntroSectionSchema = z.object({
  ...bespokeBase,
  ...archHeader,
  type: z.literal("archIntro"),
  lead: z.string(),
  cta: sectionActionSchema,
  stats: list(z.object({ value: z.string(), label: z.string() })),
  image: sectionImageSchema,
  caption: z.object({ label: z.string(), place: z.string() }),
});

export const archServicesSectionSchema = z.object({
  ...bespokeBase,
  ...archHeader,
  type: z.literal("archServices"),
  items: list(z.object({ icon: serviceIconSchema, title: z.string() })),
  enquiryService: serviceOptionSchema,
  cta: sectionActionSchema,
  images: z.tuple([sectionImageSchema, sectionImageSchema, sectionImageSchema]).readonly(),
});

export const archProcessSectionSchema = z.object({
  ...bespokeBase,
  ...archHeader,
  type: z.literal("archProcess"),
  lead: z.string(),
  cta: sectionActionSchema,
  images: z.tuple([sectionImageSchema, sectionImageSchema]).readonly(),
  steps: list(processStepSchema),
  stepsId: z.string().min(1).exactOptional(),
});

const archProjectCardSchema = shaped<ArchProjectCard>()(
  z.object({
    project: projectSlugSchema,
    meta: z.string(),
    text: z.string(),
    image: sectionImageSchema.exactOptional(),
  }),
);

export const archProjectsSectionSchema = z.object({
  ...bespokeBase,
  ...archHeader,
  type: z.literal("archProjects"),
  lead: z.string(),
  featured: archProjectCardSchema,
  grid: list(archProjectCardSchema),
});

export const bespokeSectionSchema = shaped<BespokeSection>()(
  z.discriminatedUnion("type", [
    archIntroSectionSchema,
    archServicesSectionSchema,
    archProcessSectionSchema,
    archProjectsSectionSchema,
  ]),
);

export const serviceSectionSchema = z.union([contentBlockSchema, bespokeSectionSchema]);

/** The `/services/{slug}` resource. */
export const servicePageSchema = shaped<ServicePageContent>()(
  z.object({
    slug: serviceSlugSchema,
    /** The original's `data-title` (already ends in the brand) and `data-desc`. */
    seo: z.object({ title: z.string(), description: z.string() }),
    sectionTitleLeading: z.enum(["standard", "relaxed"]).exactOptional(),
    hero: pageHeroSchema,
    sections: list(serviceSectionSchema),
    contact: contactFaqSchema,
  }),
);
