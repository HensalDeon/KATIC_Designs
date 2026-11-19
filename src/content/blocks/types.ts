/**
 * The content-block vocabulary of the inner pages (the original's `section.ks` blocks,
 * docs/analysis/03 §1 and 04 §3, §11). Service, division and location pages are an ordered list of
 * these blocks after a banner; `src/components/blocks/block-section.tsx` renders one block and
 * `BlockStack` renders a list with its tones.
 *
 * Everything here is plain, serialisable data (no JSX), so Laravel can serve the same shape later.
 * Shared entities are referenced by id or slug and resolved by the renderer: services
 * (`related-services.ts`), sectors, divisions, testimonials, master process stages and projects.
 * Block item types reuse the section components' own exported types.
 *
 * ## Tones
 *
 * Blocks strictly alternate white/black after the (dark) hero, starting white, so a block's tone is
 * derived from its index. `tone` overrides one block (the alternation of the others is unchanged).
 * A page ending (contact section) takes the opposite of the last block. See
 * `src/components/blocks/block-plan.ts`.
 *
 * ## Extending
 *
 * - **A generic block** (usable by any page): add a member to `ContentBlock` and its type literal
 *   to `CONTENT_BLOCK_TYPES` (`./index.ts`), then add its `case` to `BlockSection`. Both are
 *   exhaustive, so the build fails until the renderer handles it.
 * - **A page-specific block** (e.g. architecture's `.ap`): keep it in the page family's own union
 *   (`BespokeSection` in `src/content/service-pages/types.ts`) and render it through the
 *   `renderBespoke` prop of `BlockStack`.
 */
import type { BeforeAfterPair } from "@/components/sections/before-after";
import type { CardGridColumns, CardItem } from "@/components/sections/card-grid";
import type { PlantSpec } from "@/components/sections/content-section";
import type { FeatureGridItem } from "@/components/sections/feature-grid";
import type { GalleryItem } from "@/components/sections/gallery";
import type { PageHeroVariant } from "@/components/sections/page-hero";
import type { ProcessStep } from "@/components/sections/process-steps";
import type { RowListItem } from "@/components/sections/row-list";
import type { SectionAction } from "@/components/sections/section-action";
import type { SectionCta } from "@/components/sections/section-header";
import type { SectionImage } from "@/components/sections/section-image";
import type { ImageInput } from "@/components/sections/section-media";
import type { ProcessStageId } from "@/content/process-stages";
import type { ProjectSlug } from "@/content/projects";
import type { RelatedServiceSlug } from "@/content/related-services";
import type { SectorKey, SectorTile } from "@/content/sectors";
import type { TestimonialId } from "@/content/testimonials";
import type { DivisionSlug } from "@/lib/routes";
import type { Tone } from "@/lib/tone";

/** Title lines as authored (the original's `<br>` breaks). */
export type TitleLines = readonly string[];

/**
 * A title with an orange accent (`<span class="or">`). The accent ends the last line, after a
 * space (`"Interiors Made" / "for <Everyday Life>"`, `"KATIC <Design>"`), or forms its own line
 * with `accentOnNewLine` (factory: `"Crafted In-House." / "<Finished by Hand.>"`).
 */
export type AccentTitle = {
  readonly lines: TitleLines;
  readonly accent: string;
  readonly accentOnNewLine?: boolean;
};

/** The standard section header (`.kh`): kicker and title left, lead and CTA right. */
export type SectionHeaderContent = {
  readonly kicker: string;
  readonly title: TitleLines;
  /** Omit to keep the right column empty (the original renders an empty `<div>`). */
  readonly lead?: string;
  readonly cta?: SectionCta;
};

/** Banner of an inner page (`.hero.kh-hero`, or the architecture variant). */
export type PageHeroContent = {
  readonly variant?: PageHeroVariant;
  readonly image: SectionImage;
  readonly kicker: string;
  readonly title: AccentTitle;
  readonly lead?: string;
  /**
   * Cream button. `{ kind: "contact", service }` (the original `data-go="contact" data-svc`)
   * scrolls to the page's enquiry form; `{ kind: "enquiry", service }` opens Start-a-Project
   * (pages without a form of their own).
   */
  readonly primaryCta?: SectionAction;
  /** Outline button; not rendered by the architecture variant. */
  readonly secondaryCta?: SectionAction;
  /** Bottom caption of the architecture variant. */
  readonly caption?: string;
};

/** Fields every block may carry. */
export type BlockBase = {
  /** Deep-link id kept from the original (e.g. `ba`, `pc-services`). Unique per page. */
  readonly id?: string;
  /** Overrides the index-derived tone of this block only. */
  readonly tone?: Tone;
  /** Decorative plant behind the content (`.pp-host`). */
  readonly plant?: PlantSpec;
};

/** `.ksplit` (`.rev` = `reverse`): image + kicker, title, lead, body, bullets and an optional CTA. */
export type SplitBlock = BlockBase & {
  readonly type: "split";
  readonly image: SectionImage;
  /** Dark chip over the image. */
  readonly caption?: string;
  readonly kicker: string;
  readonly title: TitleLines;
  readonly lead?: string;
  readonly body?: string;
  readonly bullets?: readonly string[];
  readonly cta?: SectionAction & { readonly variant?: "outline" | "dark" | "light" | "primary" };
  readonly reverse?: boolean;
};

/** `.krows`: icon, title, text, and ↗ when the row links somewhere. */
export type RowsBlock = BlockBase & {
  readonly type: "rows";
  readonly header: SectionHeaderContent;
  readonly items: readonly RowListItem[];
};

/** `.kfeat`: bordered tiles with an isometric icon picked from the title. */
export type FeaturesBlock = BlockBase & {
  readonly type: "features";
  readonly header: SectionHeaderContent;
  readonly columns: 3 | 4 | 5;
  readonly items: readonly FeatureGridItem[];
};

/** `.ksteps`: one column per step. Master stages by id, page-specific steps inline. */
export type ProcessBlock = BlockBase & {
  readonly type: "process";
  readonly header: SectionHeaderContent;
  readonly steps: readonly (ProcessStageId | ProcessStep)[];
};

/** `.ksec`: the shared sector tiles, plus an optional extra non-link tile (exterior). */
export type SectorsBlock = BlockBase & {
  readonly type: "sectors";
  readonly header: SectionHeaderContent;
  readonly sectors: readonly SectorKey[];
  readonly extra?: SectorTile;
};

/** A featured-project card: the project by slug, with the card's own meta line. */
export type ProjectCardContent = {
  readonly project: ProjectSlug;
  /**
   * The small orange line, verbatim per card ("Residential · Interiors · Dubai, UAE"). Cards
   * describe the same project differently across pages (KI-D01), so it is not derived.
   */
  readonly meta: string;
  /** Overrides the project's cover image (and its alt). */
  readonly image?: { readonly src: ImageInput; readonly alt: string };
  /** Status badge over the image (`.tg`, e.g. "Completed"; developers division). */
  readonly tag?: string;
};

/** `.kc-grid` of project cards. */
export type ProjectsBlock = BlockBase & {
  readonly type: "projects";
  readonly header: SectionHeaderContent;
  readonly columns: CardGridColumns;
  readonly items: readonly ProjectCardContent[];
};

/** A finished-product card (factory): image, title and text, linking to the project it belongs to. */
export type ProductCardContent = {
  readonly title: string;
  readonly text: string;
  readonly image: ImageInput;
  readonly alt: string;
  readonly project?: ProjectSlug;
};

/** `.kc-grid` of product cards (factory). */
export type ProductsBlock = BlockBase & {
  readonly type: "products";
  readonly header: SectionHeaderContent;
  readonly columns: CardGridColumns;
  readonly items: readonly ProductCardContent[];
};

/**
 * `.kc-grid` of free-form cards: image, optional meta line, title, optional text and `.tg` tag.
 * A card with `href` is a link (hover zoom, orange title, "more" label); without one it is a plain
 * `div.kc` (developers "What we develop", the India office cards that are not links).
 */
export type CardsBlock = BlockBase & {
  readonly type: "cards";
  readonly header: SectionHeaderContent;
  readonly columns: CardGridColumns;
  readonly items: readonly CardItem[];
  /** Label of the link cards' "more" line (default "View Project"). */
  readonly moreLabel?: string;
};

/** `.kgal` (factory, interior division). */
export type GalleryBlock = BlockBase & {
  readonly type: "gallery";
  readonly header: SectionHeaderContent;
  readonly items: readonly GalleryItem[];
};

/** `.kba` (renovation): static before/after pairs. */
export type BeforeAfterBlock = BlockBase & {
  readonly type: "beforeAfter";
  readonly header: SectionHeaderContent;
  readonly pairs: readonly BeforeAfterPair[];
};

/** `.kc-grid` of the shared related-service cards, in the given order. */
export type RelatedBlock = BlockBase & {
  readonly type: "related";
  readonly header: SectionHeaderContent;
  readonly columns: CardGridColumns;
  readonly services: readonly RelatedServiceSlug[];
};

/** `.kc-grid` of the shared division cards ("Explore Division"), in the given order. */
export type DivisionCardsBlock = BlockBase & {
  readonly type: "divisionCards";
  readonly header: SectionHeaderContent;
  readonly columns: CardGridColumns;
  readonly divisions: readonly DivisionSlug[];
};

/** `.ks.slim` divisions strip (no header; no page puts a plant on it). */
export type DivisionsStripBlock = Omit<BlockBase, "plant"> & {
  readonly type: "divisions";
  readonly divisions: readonly DivisionSlug[];
};

/** `.kq`: three testimonials from the shared pool. The header defaults to the shared template. */
export type TestimonialsBlock = BlockBase & {
  readonly type: "testimonials";
  readonly header?: SectionHeaderContent;
  readonly testimonials: readonly TestimonialId[];
};

/** Every generic block type (the `section.ks` vocabulary shared by inner pages). */
export type ContentBlock =
  | SplitBlock
  | RowsBlock
  | FeaturesBlock
  | ProcessBlock
  | SectorsBlock
  | ProjectsBlock
  | ProductsBlock
  | CardsBlock
  | GalleryBlock
  | BeforeAfterBlock
  | RelatedBlock
  | DivisionCardsBlock
  | DivisionsStripBlock
  | TestimonialsBlock;

export type ContentBlockType = ContentBlock["type"];
