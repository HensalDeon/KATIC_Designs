import { z } from "zod";

import type { BeforeAfterPair } from "@/components/sections/before-after";
import type { CardItem } from "@/components/sections/card-grid";
import type { FaqContent } from "@/components/sections/contact-faq";
import type { ContactSectionContent } from "@/components/sections/contact-section";
import type { EnquiryFormConfig } from "@/components/sections/enquiry-form";
import type { FaqItem } from "@/components/sections/faq";
import type { FeatureGridItem } from "@/components/sections/feature-grid";
import type { GalleryItem } from "@/components/sections/gallery";
import type { ProcessStep } from "@/components/sections/process-steps";
import type { RowListItem } from "@/components/sections/row-list";
import type {
  BeforeAfterBlock,
  CardsBlock,
  ContentBlock,
  DivisionCardsBlock,
  DivisionsStripBlock,
  FeaturesBlock,
  GalleryBlock,
  PageHeroContent,
  ProcessBlock,
  ProductsBlock,
  ProjectsBlock,
  RelatedBlock,
  RowsBlock,
  SectorsBlock,
  SplitBlock,
  TestimonialsBlock,
} from "@/content/blocks";

import {
  processStageIdSchema,
  projectSlugSchema,
  relatedServiceSlugSchema,
  sectorKeySchema,
  sectorTileSchema,
  testimonialIdSchema,
} from "./entities";
import {
  accentTitleSchema,
  artIconSchema,
  divisionSlugSchema,
  hrefSchema,
  list,
  mediaRefSchema,
  plantSpecSchema,
  sectionActionSchema,
  sectionHeaderSchema,
  sectionImageSchema,
  serviceIconSchema,
  serviceOptionSchema,
  shaped,
  stageIndexSchema,
  titleLinesSchema,
  toneSchema,
} from "./primitives";

/**
 * The content-block vocabulary of the inner pages (P8-01, `src/content/blocks/types.ts`): one
 * schema per `ContentBlock` member, discriminated by `type`. Service, division and location pages
 * are a banner plus an ordered list of these, so Laravel serves one block model for all of them.
 *
 * Block and item types are owned by their components; each schema here is `shaped<T>()` against
 * that type, so a component changing its props without the schema fails to compile.
 */

// ---------------------------------------------------------------------------------------------
// Items
// ---------------------------------------------------------------------------------------------

export const rowListItemSchema = shaped<RowListItem>()(
  z.object({
    icon: serviceIconSchema,
    title: z.string(),
    text: z.string(),
    href: hrefSchema.exactOptional(),
  }),
);

export const featureGridItemSchema = shaped<FeatureGridItem>()(
  z.object({
    icon: serviceIconSchema,
    title: z.string(),
    text: z.string(),
    artIcon: artIconSchema.exactOptional(),
  }),
);

export const processStepSchema = shaped<ProcessStep>()(
  z.object({
    icon: serviceIconSchema,
    title: z.string(),
    text: z.string(),
    artStage: stageIndexSchema.exactOptional(),
  }),
);

export const cardGridColumnsSchema = z.union([
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const cardItemSchema = shaped<CardItem>()(
  z.object({
    href: hrefSchema.exactOptional(),
    contact: z.boolean().exactOptional(),
    image: mediaRefSchema,
    alt: z.string(),
    title: z.string(),
    meta: z.string().exactOptional(),
    text: z.string().exactOptional(),
    tag: z.string().exactOptional(),
    moreLabel: z.string().exactOptional(),
  }),
);

export const galleryItemSchema = shaped<GalleryItem>()(
  z.object({
    image: mediaRefSchema,
    alt: z.string(),
    caption: z.string(),
    wide: z.boolean().exactOptional(),
  }),
);

const beforeAfterImageSchema = z.object({ image: mediaRefSchema, alt: z.string() });

export const beforeAfterPairSchema = shaped<BeforeAfterPair>()(
  z.object({
    before: beforeAfterImageSchema,
    after: beforeAfterImageSchema,
    title: z.string(),
    meta: z.string(),
    text: z.string(),
  }),
);

// ---------------------------------------------------------------------------------------------
// Banner
// ---------------------------------------------------------------------------------------------

export const pageHeroSchema = shaped<PageHeroContent>()(
  z.object({
    variant: z.enum(["service", "architecture"]).exactOptional(),
    image: sectionImageSchema,
    kicker: z.string(),
    title: accentTitleSchema,
    lead: z.string().exactOptional(),
    primaryCta: sectionActionSchema.exactOptional(),
    secondaryCta: sectionActionSchema.exactOptional(),
    caption: z.string().exactOptional(),
  }),
);

// ---------------------------------------------------------------------------------------------
// Blocks
// ---------------------------------------------------------------------------------------------

/** Fields every block may carry (`BlockBase`). */
export const blockBaseShape = {
  id: z.string().min(1).exactOptional(),
  tone: toneSchema.exactOptional(),
  plant: plantSpecSchema.exactOptional(),
};

export const splitBlockSchema = shaped<SplitBlock>()(
  z.object({
    ...blockBaseShape,
    type: z.literal("split"),
    image: sectionImageSchema,
    caption: z.string().exactOptional(),
    kicker: z.string(),
    title: titleLinesSchema,
    lead: z.string().exactOptional(),
    body: z.string().exactOptional(),
    bullets: list(z.string()).exactOptional(),
    cta: z
      .intersection(
        sectionActionSchema,
        z.object({ variant: z.enum(["outline", "dark", "light", "primary"]).exactOptional() }),
      )
      .exactOptional(),
    reverse: z.boolean().exactOptional(),
  }),
);

export const rowsBlockSchema = shaped<RowsBlock>()(
  z.object({
    ...blockBaseShape,
    type: z.literal("rows"),
    header: sectionHeaderSchema,
    items: list(rowListItemSchema),
  }),
);

export const featuresBlockSchema = shaped<FeaturesBlock>()(
  z.object({
    ...blockBaseShape,
    type: z.literal("features"),
    header: sectionHeaderSchema,
    columns: z.union([z.literal(3), z.literal(4), z.literal(5)]),
    items: list(featureGridItemSchema),
  }),
);

export const processBlockSchema = shaped<ProcessBlock>()(
  z.object({
    ...blockBaseShape,
    type: z.literal("process"),
    header: sectionHeaderSchema,
    /** Master stages by id, page-specific steps inline. */
    steps: list(z.union([processStageIdSchema, processStepSchema])),
  }),
);

export const sectorsBlockSchema = shaped<SectorsBlock>()(
  z.object({
    ...blockBaseShape,
    type: z.literal("sectors"),
    header: sectionHeaderSchema,
    sectors: list(sectorKeySchema),
    extra: sectorTileSchema.exactOptional(),
  }),
);

export const projectCardSchema = z.object({
  project: projectSlugSchema,
  meta: z.string(),
  image: z.object({ src: mediaRefSchema, alt: z.string() }).exactOptional(),
  tag: z.string().exactOptional(),
});

export const projectsBlockSchema = shaped<ProjectsBlock>()(
  z.object({
    ...blockBaseShape,
    type: z.literal("projects"),
    header: sectionHeaderSchema,
    columns: cardGridColumnsSchema,
    items: list(projectCardSchema),
  }),
);

export const productsBlockSchema = shaped<ProductsBlock>()(
  z.object({
    ...blockBaseShape,
    type: z.literal("products"),
    header: sectionHeaderSchema,
    columns: cardGridColumnsSchema,
    items: list(
      z.object({
        title: z.string(),
        text: z.string(),
        image: mediaRefSchema,
        alt: z.string(),
        project: projectSlugSchema.exactOptional(),
      }),
    ),
  }),
);

export const cardsBlockSchema = shaped<CardsBlock>()(
  z.object({
    ...blockBaseShape,
    type: z.literal("cards"),
    header: sectionHeaderSchema,
    columns: cardGridColumnsSchema,
    items: list(cardItemSchema),
    moreLabel: z.string().exactOptional(),
  }),
);

export const galleryBlockSchema = shaped<GalleryBlock>()(
  z.object({
    ...blockBaseShape,
    type: z.literal("gallery"),
    header: sectionHeaderSchema,
    items: list(galleryItemSchema),
  }),
);

export const beforeAfterBlockSchema = shaped<BeforeAfterBlock>()(
  z.object({
    ...blockBaseShape,
    type: z.literal("beforeAfter"),
    header: sectionHeaderSchema,
    pairs: list(beforeAfterPairSchema),
  }),
);

export const relatedBlockSchema = shaped<RelatedBlock>()(
  z.object({
    ...blockBaseShape,
    type: z.literal("related"),
    header: sectionHeaderSchema,
    columns: cardGridColumnsSchema,
    services: list(relatedServiceSlugSchema),
  }),
);

export const divisionCardsBlockSchema = shaped<DivisionCardsBlock>()(
  z.object({
    ...blockBaseShape,
    type: z.literal("divisionCards"),
    header: sectionHeaderSchema,
    columns: cardGridColumnsSchema,
    divisions: list(divisionSlugSchema),
  }),
);

export const divisionsStripBlockSchema = shaped<DivisionsStripBlock>()(
  z.object({
    id: blockBaseShape.id,
    tone: blockBaseShape.tone,
    type: z.literal("divisions"),
    divisions: list(divisionSlugSchema),
  }),
);

export const testimonialsBlockSchema = shaped<TestimonialsBlock>()(
  z.object({
    ...blockBaseShape,
    type: z.literal("testimonials"),
    header: sectionHeaderSchema.exactOptional(),
    testimonials: list(testimonialIdSchema),
  }),
);

/** Every generic block (`ContentBlock`), discriminated by `type`. */
export const contentBlockSchema = shaped<ContentBlock>()(
  z.discriminatedUnion("type", [
    splitBlockSchema,
    rowsBlockSchema,
    featuresBlockSchema,
    processBlockSchema,
    sectorsBlockSchema,
    projectsBlockSchema,
    productsBlockSchema,
    cardsBlockSchema,
    galleryBlockSchema,
    beforeAfterBlockSchema,
    relatedBlockSchema,
    divisionCardsBlockSchema,
    divisionsStripBlockSchema,
    testimonialsBlockSchema,
  ]),
);

// ---------------------------------------------------------------------------------------------
// Contact, enquiry form and FAQ
// ---------------------------------------------------------------------------------------------

export const enquiryFormConfigSchema = shaped<EnquiryFormConfig>()(
  z.object({
    service: z.discriminatedUnion("mode", [
      z.object({ mode: z.literal("select"), defaultService: serviceOptionSchema.exactOptional() }),
      z.object({ mode: z.literal("hidden"), service: serviceOptionSchema }),
    ]),
    extraFields: list(
      z.object({ name: z.string().min(1), label: z.string(), options: list(z.string()) }),
    ).exactOptional(),
    note: z.string().exactOptional(),
    prefillLocation: z.string().exactOptional(),
  }),
);

const faqLinkSchema = z.union([
  z.object({ label: z.string(), href: hrefSchema }),
  z.object({
    label: z.string(),
    action: z.enum(["contact", "popup"]),
    service: serviceOptionSchema.exactOptional(),
  }),
]);

const faqAnswerPartSchema = z.union([
  z.string(),
  z.object({ label: z.string(), href: hrefSchema }),
]);

export const faqItemSchema = shaped<FaqItem>()(
  z.object({
    question: z.string(),
    answer: z.union([z.string(), list(faqAnswerPartSchema)]),
    link: faqLinkSchema.exactOptional(),
  }),
);

/** A FAQ (`GET /faqs?page=`): header copy and the questions. */
export const faqSchema = shaped<FaqContent>()(
  z.object({
    kicker: z.string(),
    titleLines: titleLinesSchema,
    intro: z.string().exactOptional(),
    askLabel: z.string().exactOptional(),
    items: list(faqItemSchema),
  }),
);

export const contactChannelSchema = z.enum(["email", "phone", "whatsapp"]);

const contactHeadingSchema = z.object({
  lines: titleLinesSchema,
  accent: z.string().exactOptional(),
});

/** The CONTACT template every page's contact section shares (`GET /contact`). */
export const contactTemplateSchema = shaped<ContactSectionContent>()(
  z.object({
    kicker: z.string(),
    heading: contactHeadingSchema,
    lead: z.string(),
    channels: list(contactChannelSchema),
    form: enquiryFormConfigSchema,
  }),
);

/** A page's contact + FAQ section (service pages; home has its own variant). */
export const contactFaqSchema = z.object({
  heading: contactHeadingSchema,
  lead: z.string(),
  form: enquiryFormConfigSchema,
  faq: faqSchema,
  plant: plantSpecSchema.exactOptional(),
});

// ---------------------------------------------------------------------------------------------
// Block defaults
// ---------------------------------------------------------------------------------------------

/**
 * Copy a block shows unless the page overrides it (`GET /block-defaults`), the copy the original
 * repeats verbatim wherever the block appears (docs/analysis/03 §4).
 */
export const blockDefaultsSchema = z.object({
  /** Header of every testimonials block (`.kq`); `TestimonialsBlock.header` overrides it. */
  testimonialsHeader: sectionHeaderSchema,
});
export type BlockDefaults = z.infer<typeof blockDefaultsSchema>;
