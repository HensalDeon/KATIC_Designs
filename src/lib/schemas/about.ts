import { z } from "zod";

import type { AboutPage } from "@/lib/data/repository";

import { projectSlugSchema, relatedServiceSlugSchema } from "./entities";
import { titleLineSchema } from "./home";
import {
  divisionSlugSchema,
  hrefSchema,
  list,
  sectionCtaSchema,
  sectionImageSchema,
  serviceIconSchema,
  shaped,
} from "./primitives";

/** The About page resource (`GET /pages/about`): one object per section, in page order. */

const linkSchema = z.object({ label: z.string(), href: hrefSchema });
const titleSchema = list(titleLineSchema);

function cardsSchema<S extends z.ZodType<string>>(slug: S) {
  return z.object({
    kicker: z.string(),
    title: titleSchema,
    lead: z.string(),
    cta: sectionCtaSchema.exactOptional(),
    items: list(slug),
  });
}

export const aboutPageSchema = shaped<AboutPage>()(
  z.object({
    seo: z.object({ title: z.string(), description: z.string() }),
    hero: z.object({
      image: sectionImageSchema,
      kicker: z.string(),
      title: titleSchema,
      lead: z.string(),
      primaryCta: linkSchema,
      secondaryCta: linkSchema,
      labels: z.tuple([z.string(), z.string()]).readonly(),
    }),
    intro: z.object({
      kicker: z.string(),
      title: titleSchema,
      lead: z.string(),
      body: z.string(),
      cta: linkSchema,
      images: z.tuple([sectionImageSchema, sectionImageSchema]).readonly(),
      studio: z.object({ label: z.string(), text: z.string(), places: z.string() }),
    }),
    philosophy: z.object({
      kicker: z.string(),
      title: z.string(),
      image: sectionImageSchema,
      caption: z.string(),
      lead: z.string(),
      body: z.string(),
      tags: list(z.string()),
      cta: linkSchema,
    }),
    approach: z.object({
      kicker: z.string(),
      title: titleSchema,
      lead: z.string(),
      cta: sectionCtaSchema,
      steps: list(z.object({ icon: serviceIconSchema, title: z.string(), text: z.string() })),
    }),
    services: cardsSchema(relatedServiceSlugSchema),
    divisions: cardsSchema(divisionSlugSchema),
    founder: z.object({
      kicker: z.string(),
      name: z.string(),
      role: z.string(),
      paragraphs: list(z.string()),
      quote: z.string(),
      photo: sectionImageSchema,
    }),
    experience: z.object({
      kicker: z.string(),
      title: titleSchema,
      lead: z.string(),
      cta: linkSchema,
      stats: list(z.object({ value: z.string(), label: z.string(), caption: z.string() })),
    }),
    team: z.object({
      kicker: z.string(),
      title: titleSchema,
      body: z.string(),
      members: list(
        z.object({
          name: z.string(),
          role: z.string(),
          bio: z.string(),
          photo: sectionImageSchema,
        }),
      ),
    }),
    works: z.object({
      kicker: z.string(),
      title: z.string(),
      body: z.string(),
      cta: linkSchema,
      tiles: list(
        z.object({ project: projectSlugSchema, layout: z.enum(["big", "tall", "small"]) }),
      ),
    }),
  }),
);
