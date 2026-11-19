/**
 * Content schema of the service detail pages (`/services/[slug]`, original `#p-<slug>`,
 * docs/analysis/03 §4). One `ServicePageContent` per page, rendered by
 * `src/components/service-page/service-page.tsx`.
 *
 * Everything here is plain, serialisable data (no JSX), so Laravel can serve the same shape later.
 * Shared entities are referenced by id or slug and resolved by the renderer: services
 * (`related-services.ts`), sectors, divisions, testimonials, master process stages and projects.
 * Section item types reuse the section components' own exported types.
 *
 * ## Page anatomy
 *
 * `hero` → `sections[]` (in order) → contact + FAQ (always last). Every page of the original
 * follows this skeleton (analysis/03 §2.11).
 *
 * ## Tones
 *
 * Sections strictly alternate white/black after the hero, starting white, so a section's tone is
 * derived from its index (`light` at 0, 2, 4…). `tone` overrides one section (the alternation of
 * the others is unchanged). The contact section takes the opposite of the last section's tone.
 * See `src/components/service-page/page-plan.ts`.
 *
 * ## Extending
 *
 * - **A new page:** add `<slug>.ts` exporting a `ServicePageContent`, and register it in
 *   `index.ts`. The route prerenders it automatically.
 * - **A page-specific block** (e.g. architecture's `.ap`, `.sv`, `.pr`, `.ap2`): add its type to
 *   `BespokeSection` below (a `type` literal plus `SectionBase`), and add its `case` to the switch
 *   in `src/components/service-page/service-section.tsx`. The switch is exhaustive, so the build
 *   fails until the renderer handles the new member. Nothing else changes.
 */
import type { BeforeAfterPair } from "@/components/sections/before-after";
import type { CardGridColumns } from "@/components/sections/card-grid";
import type { EnquiryFormConfig, FaqContent } from "@/components/sections/contact-faq";
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
import type { ArchIntroContent } from "@/components/service-page/arch/arch-intro";
import type { ArchProcessContent } from "@/components/service-page/arch/arch-process";
import type { ArchProjectsContent } from "@/components/service-page/arch/arch-projects";
import type { ArchServicesContent } from "@/components/service-page/arch/arch-services";
import type { ProcessStageId } from "@/content/process-stages";
import type { ProjectSlug } from "@/content/projects";
import type { RelatedServiceSlug } from "@/content/related-services";
import type { SectorKey, SectorTile } from "@/content/sectors";
import type { TestimonialId } from "@/content/testimonials";
import type { DivisionSlug, ServiceSlug } from "@/lib/routes";
import type { Tone } from "@/lib/tone";

/** Title lines as authored (the original's `<br>` breaks). */
export type TitleLines = readonly string[];

/**
 * A title with an orange accent (`<span class="or">`). The accent ends the last line, after a
 * space (`"Interiors Made" / "for <Everyday Life>"`), or forms its own line with
 * `accentOnNewLine` (factory: `"Crafted In-House." / "<Finished by Hand.>"`).
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

/** Banner (`.hero.kh-hero`, or the architecture variant). */
export type ServiceHeroContent = {
  readonly variant?: PageHeroVariant;
  readonly image: SectionImage;
  readonly kicker: string;
  readonly title: AccentTitle;
  readonly lead?: string;
  /**
   * Usually `{ kind: "contact", service }` (the original `data-go="contact" data-svc`): scrolls to
   * the page's enquiry form and preselects the service. The renderer points it at the page's form.
   */
  readonly primaryCta?: SectionAction;
  /** Outline button; not rendered by the architecture variant. */
  readonly secondaryCta?: SectionAction;
  /** Bottom caption of the architecture variant. */
  readonly caption?: string;
};

/** Fields every section may carry. */
export type SectionBase = {
  /** Deep-link id kept from the original (e.g. `ba`, `pc-services`). Unique per page. */
  readonly id?: string;
  /** Overrides the index-derived tone of this section only. */
  readonly tone?: Tone;
  /** Decorative plant behind the content (`.pp-host`). */
  readonly plant?: PlantSpec;
};

/** `.ksplit` (`.rev` = `reverse`): image + kicker, title, lead, body, bullets and an optional CTA. */
export type SplitSection = SectionBase & {
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
export type RowsSection = SectionBase & {
  readonly type: "rows";
  readonly header: SectionHeaderContent;
  readonly items: readonly RowListItem[];
};

/** `.kfeat`: bordered tiles with an isometric icon picked from the title. */
export type FeaturesSection = SectionBase & {
  readonly type: "features";
  readonly header: SectionHeaderContent;
  readonly columns: 3 | 4 | 5;
  readonly items: readonly FeatureGridItem[];
};

/** `.ksteps`: one column per step. Master stages by id, page-specific steps inline. */
export type ProcessSection = SectionBase & {
  readonly type: "process";
  readonly header: SectionHeaderContent;
  readonly steps: readonly (ProcessStageId | ProcessStep)[];
};

/** `.ksec`: the shared sector tiles, plus an optional extra non-link tile (exterior). */
export type SectorsSection = SectionBase & {
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
};

/** `.kc-grid` of project cards. */
export type ProjectsSection = SectionBase & {
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
export type ProductsSection = SectionBase & {
  readonly type: "products";
  readonly header: SectionHeaderContent;
  readonly columns: CardGridColumns;
  readonly items: readonly ProductCardContent[];
};

/** `.kgal` (factory). */
export type GallerySection = SectionBase & {
  readonly type: "gallery";
  readonly header: SectionHeaderContent;
  readonly items: readonly GalleryItem[];
};

/** `.kba` (renovation): static before/after pairs. */
export type BeforeAfterSection = SectionBase & {
  readonly type: "beforeAfter";
  readonly header: SectionHeaderContent;
  readonly pairs: readonly BeforeAfterPair[];
};

/** `.kc-grid` of the shared related-service cards, in the given order. */
export type RelatedSection = SectionBase & {
  readonly type: "related";
  readonly header: SectionHeaderContent;
  readonly columns: CardGridColumns;
  readonly services: readonly RelatedServiceSlug[];
};

/** `.ks.slim` divisions strip (no header; no page puts a plant on it). */
export type DivisionsSection = Omit<SectionBase, "plant"> & {
  readonly type: "divisions";
  readonly divisions: readonly DivisionSlug[];
};

/** `.kq`: three testimonials from the shared pool. The header defaults to the shared template. */
export type TestimonialsSection = SectionBase & {
  readonly type: "testimonials";
  readonly header?: SectionHeaderContent;
  readonly testimonials: readonly TestimonialId[];
};

/** The `.ks` block types every standard page draws from (analysis/03 §1). */
export type StandardSection =
  | SplitSection
  | RowsSection
  | FeaturesSection
  | ProcessSection
  | SectorsSection
  | ProjectsSection
  | ProductsSection
  | GallerySection
  | BeforeAfterSection
  | RelatedSection
  | DivisionsSection
  | TestimonialsSection;

/** Architecture introduction (`.ap`): see `ArchIntro`. */
export type ArchIntroSection = SectionBase & { readonly type: "archIntro" } & ArchIntroContent;
/** Architecture services list (`.sv#services-list`): see `ArchServices`. */
export type ArchServicesSection = SectionBase & {
  readonly type: "archServices";
} & ArchServicesContent;
/** Architecture process and photos (`.pr#process`): see `ArchProcess`. */
export type ArchProcessSection = SectionBase & {
  readonly type: "archProcess";
} & ArchProcessContent;
/** Architecture featured projects (`.ap2#arch-projects`): see `ArchProjects`. */
export type ArchProjectsSection = SectionBase & {
  readonly type: "archProjects";
} & ArchProjectsContent;

/**
 * Page-specific blocks: architecture's `.ap`, `.sv`, `.pr` and `.ap2` (analysis/03 §1.15). Their
 * content types live with their components in `src/components/service-page/arch/`. A `plant` is
 * not rendered on them (the original puts none there).
 */
export type BespokeSection =
  ArchIntroSection | ArchServicesSection | ArchProcessSection | ArchProjectsSection;

export type ServiceSection = StandardSection | BespokeSection;
export type ServiceSectionType = ServiceSection["type"];

/** Contact + FAQ (`.contact.combo`): always the last section; its tone is derived. */
export type ServiceContactContent = {
  /** Heading lines; `accent` is the orange last line. */
  readonly heading: { readonly lines: TitleLines; readonly accent?: string };
  readonly lead: string;
  readonly form: EnquiryFormConfig;
  readonly faq: FaqContent;
  readonly plant?: PlantSpec;
};

export type ServicePageContent = {
  readonly slug: ServiceSlug;
  /** The original's `data-title` (already ends in the brand) and `data-desc`. */
  readonly seo: { readonly title: string; readonly description: string };
  /**
   * Line height of the standard section titles: `relaxed` is architecture's 1.14 (its page rule
   * `#p-architecture .st`), `standard` (default) the global 1.12 / 1.1.
   */
  readonly sectionTitleLeading?: "standard" | "relaxed";
  readonly hero: ServiceHeroContent;
  readonly sections: readonly ServiceSection[];
  readonly contact: ServiceContactContent;
};
