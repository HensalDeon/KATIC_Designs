import { z } from "zod";

import type { HomePage } from "@/lib/data/repository";

import { contactChannelSchema, enquiryFormConfigSchema, faqSchema } from "./blocks";
import { projectSlugSchema } from "./entities";
import {
  divisionSlugSchema,
  hrefSchema,
  list,
  mediaIdSchema,
  serviceIconSchema,
  serviceOptionSchema,
  serviceSlugSchema,
  shaped,
  stageIndexSchema,
  titleLinesSchema,
  worksCategorySchema,
} from "./primitives";

/**
 * The home page resource (`GET /pages/home`): one object per section, in page order (P4-01).
 * Teasers carry only their copy; their cards are the newest `/posts` and `/news`.
 */

/** A title line: plain, or the orange accent line. */
export const titleLineSchema = z.union([z.string(), z.object({ accent: z.string() })]);
/** A paragraph with bold runs. */
export const richTextSchema = list(z.union([z.string(), z.object({ strong: z.string() })]));

const linkSchema = z.object({ label: z.string(), href: hrefSchema });
const sitePath = z.templateLiteral(["/", z.string()]);

export const homeHeroSchema = z.object({
  eyebrow: z.string(),
  title: list(titleLineSchema),
  lead: z.string(),
  primaryCta: z.string(),
  secondaryCta: z.string(),
  video: z.object({
    desktopSrc: sitePath,
    mobileSrc: sitePath,
    desktopPoster: mediaIdSchema,
    mobilePoster: mediaIdSchema,
  }),
});

export const homeAboutSchema = z.object({
  kicker: z.string(),
  title: list(titleLineSchema),
  established: z.string(),
  paragraphs: list(richTextSchema),
  partnersKicker: z.string(),
  partners: list(z.object({ name: z.string(), logo: mediaIdSchema })),
  cta: z.string(),
  stats: list(
    z.object({
      value: z.union([z.number(), z.string()]),
      suffix: z.string().exactOptional(),
      label: z.string(),
    }),
  ),
  values: list(
    z.object({
      title: z.string(),
      text: z.string(),
      icon: z.enum(["target", "bulb", "compass", "hand"]),
    }),
  ),
});

export const homeSignatureSchema = z.object({
  kicker: z.string(),
  title: list(titleLineSchema),
  text: z.string(),
  cta: z.string(),
  projectSlug: z.string().min(1),
  background: z.object({ image: mediaIdSchema, alt: z.string() }),
  pill: z.string(),
  rooms: list(z.object({ title: z.string(), subtitle: z.string(), image: mediaIdSchema })),
});

export const homeExplorerSchema = z.object({
  kicker: z.string(),
  title: z.string(),
  lead: z.string(),
  allLabel: z.string(),
  viewLabel: z.string(),
  quoteLabel: z.string(),
  services: list(
    z.object({
      slug: serviceSlugSchema,
      name: serviceOptionSchema,
      group: z.enum(["Design", "Construction"]),
      description: z.string(),
      highlights: z.tuple([z.string(), z.string(), z.string(), z.string()]).readonly(),
      image: mediaIdSchema,
    }),
  ),
});

export const homeWorksSchema = z.object({
  kicker: z.string(),
  title: titleLinesSchema,
  lead: z.string(),
  cta: linkSchema,
  filters: list(
    z.object({ label: z.string(), category: z.union([worksCategorySchema, z.literal("all")]) }),
  ),
  projects: list(projectSlugSchema),
  cardLinkLabel: z.string(),
});

export const homeProcessSchema = z.object({
  kicker: z.string(),
  title: titleLinesSchema,
  stages: list(
    z.object({
      title: z.string(),
      text: z.string(),
      icon: serviceIconSchema,
      art: stageIndexSchema,
    }),
  ),
});

export const homeDivisionsSchema = z.object({
  kicker: z.string(),
  titleLines: titleLinesSchema,
  lead: z.string(),
  cta: linkSchema,
  exploreLabel: z.string(),
  label: z.string(),
  slides: list(
    z.object({
      slug: divisionSlugSchema,
      name: z.string(),
      href: hrefSchema,
      titleLines: z.tuple([z.string(), z.string(), z.string()]).readonly(),
      description: z.string(),
      image: mediaIdSchema,
    }),
  ),
});

export const homeStoriesSchema = z.object({
  kicker: z.string(),
  titleLines: titleLinesSchema,
  introLines: titleLinesSchema,
  pill: z.string(),
  cta: linkSchema,
  stories: list(
    z.object({
      quote: z.string(),
      name: z.string(),
      company: z.string(),
      portrait: mediaIdSchema,
      project: mediaIdSchema,
    }),
  ),
});

const teaserCopy = {
  kicker: z.string(),
  title: titleLinesSchema,
  lead: z.string(),
  cta: z.string(),
  readMore: z.string(),
};

export const homeContactSchema = z.object({
  kicker: z.string().exactOptional(),
  heading: z.object({ lines: titleLinesSchema, accent: z.string().exactOptional() }),
  lead: z.string(),
  channels: list(contactChannelSchema).exactOptional(),
  form: enquiryFormConfigSchema,
  faq: faqSchema,
});

export const homePageSchema = shaped<HomePage>()(
  z.object({
    seo: z.object({ title: z.string(), description: z.string() }),
    hero: homeHeroSchema,
    about: homeAboutSchema,
    works: homeWorksSchema,
    explorer: homeExplorerSchema,
    process: homeProcessSchema,
    signature: homeSignatureSchema,
    divisions: homeDivisionsSchema,
    stories: homeStoriesSchema,
    blogTeaser: z.object({ ...teaserCopy, featuredLabel: z.string() }),
    newsTeaser: z.object(teaserCopy),
    contact: homeContactSchema,
  }),
);
