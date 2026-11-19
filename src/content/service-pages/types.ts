/**
 * Content schema of the service detail pages (`/services/[slug]`, original `#p-<slug>`,
 * docs/analysis/03 §4). One `ServicePageContent` per page, rendered by
 * `src/components/service-page/service-page.tsx`.
 *
 * Service pages are one consumer of the shared block vocabulary (`src/content/blocks`): their
 * standard sections are `ContentBlock`s, plus four architecture-only blocks below.
 *
 * ## Page anatomy
 *
 * `hero` → `sections[]` (in order) → contact + FAQ (always last). Every page of the original
 * follows this skeleton (analysis/03 §2.11).
 *
 * ## Tones
 *
 * Sections strictly alternate white/black after the hero, starting white (`light` at 0, 2, 4…).
 * `tone` overrides one section. The contact section takes the opposite of the last section's tone.
 * See `src/components/blocks/block-plan.ts`.
 *
 * ## Extending
 *
 * - **A new page:** add `<slug>.ts` exporting a `ServicePageContent`, and register it in
 *   `index.ts`. The route prerenders it automatically.
 * - **A generic block:** see `src/content/blocks/types.ts`.
 * - **A service-page-specific block** (e.g. architecture's `.ap`, `.sv`, `.pr`, `.ap2`): add its
 *   type to `BespokeSection` below (a `type` literal plus `BlockBase`), and add its `case` to the
 *   switch in `src/components/service-page/service-section.tsx`. The switch is exhaustive, so the
 *   build fails until the renderer handles the new member.
 */
import type { EnquiryFormConfig, FaqContent } from "@/components/sections/contact-faq";
import type { PlantSpec } from "@/components/sections/content-section";
import type { ArchIntroContent } from "@/components/service-page/arch/arch-intro";
import type { ArchProcessContent } from "@/components/service-page/arch/arch-process";
import type { ArchProjectsContent } from "@/components/service-page/arch/arch-projects";
import type { ArchServicesContent } from "@/components/service-page/arch/arch-services";
import type {
  BeforeAfterBlock,
  BlockBase,
  ContentBlock,
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
  TitleLines,
} from "@/content/blocks";
import type { ServiceSlug } from "@/lib/routes";

export type {
  AccentTitle,
  ProductCardContent,
  ProjectCardContent,
  SectionHeaderContent,
  TitleLines,
} from "@/content/blocks";

/** Banner (`.hero.kh-hero`, or the architecture variant). */
export type ServiceHeroContent = PageHeroContent;
/** Fields every section may carry. */
export type SectionBase = BlockBase;

// Names of the generic blocks as service sections (kept for existing imports).
export type SplitSection = SplitBlock;
export type RowsSection = RowsBlock;
export type FeaturesSection = FeaturesBlock;
export type ProcessSection = ProcessBlock;
export type SectorsSection = SectorsBlock;
export type ProjectsSection = ProjectsBlock;
export type ProductsSection = ProductsBlock;
export type GallerySection = GalleryBlock;
export type BeforeAfterSection = BeforeAfterBlock;
export type RelatedSection = RelatedBlock;
export type DivisionsSection = DivisionsStripBlock;
export type TestimonialsSection = TestimonialsBlock;

/** The `.ks` block types every standard page draws from (analysis/03 §1). */
export type StandardSection = ContentBlock;

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
