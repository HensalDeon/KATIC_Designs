import { RichTextRuns, TitleLines } from "@/components/home/title-lines";
import { ParallaxImage } from "@/components/motion/parallax-image";
import { CardGrid } from "@/components/sections/card-grid";
import { ContentSection } from "@/components/sections/content-section";
import { CtaBand } from "@/components/sections/cta-band";
import { resolveImage } from "@/components/sections/section-image";
import { SectorGrid } from "@/components/sections/sector-grid";
import { SplitFeature } from "@/components/sections/split-feature";
import { getRefs } from "@/lib/data";
import type {
  WorksCaseStudyContent,
  WorksCtaContent,
  WorksDivisionsContent,
  WorksSectorsContent,
} from "@/lib/schemas/works";

import { WORKS_TITLE_CLASS } from "./works-title";

/** `#p-works .st` line height for the split's title (`SplitFeature` takes no title classes). */
const SPLIT_TITLE_CLASS = "[&_h2]:leading-[1.14] max-md:[&_h2]:leading-[1.14]";

/**
 * "Project categories" (`#p-works section.ks.dk`, markup 3723): the standard `.kh` header and the
 * four sector tiles (`.ksec`), each opening the portfolio filtered by its sector
 * (`/works?category=<sector>#works-list`). Black.
 */
export async function WorksSectors({ content }: { readonly content: WorksSectorsContent }) {
  const refs = await getRefs();
  return (
    <ContentSection
      tone="dark"
      data-parity="ks"
      header={{
        kicker: content.kicker,
        title: <TitleLines lines={content.title} />,
        lead: content.lead,
        titleClassName: WORKS_TITLE_CLASS,
      }}
    >
      <SectorGrid sectors={content.sectors.map((key) => refs.sector(key))} />
    </ContentSection>
  );
}

/**
 * "Selected case study" (`#p-works section.pp-host.ks.dk`, markup 3753): the bird-of-paradise plant
 * at the bottom right (141px), and a `.ksplit` with the zoomable photo (lightbox) and its caption,
 * the concept lead, challenge and outcome, four facts and "View Case Study" to the project page.
 * Black.
 */
export async function WorksCaseStudy({ content }: { readonly content: WorksCaseStudyContent }) {
  const refs = await getRefs();
  return (
    <ContentSection
      tone="dark"
      data-parity="pp-host"
      plant={{ asset: "plants/bird-of-paradise-white-pot", corner: "bottom-right", width: 141 }}
    >
      <SplitFeature
        image={content.image}
        caption={content.caption}
        kicker={content.kicker}
        title={<TitleLines lines={content.title} />}
        lead={content.lead}
        body={<RichTextRuns runs={content.body} />}
        bullets={content.facts}
        cta={{
          kind: "link",
          label: content.cta,
          href: refs.projectHref(refs.project(content.project)),
          variant: "primary",
        }}
        className={SPLIT_TITLE_CLASS}
      />
    </ContentSection>
  );
}

/**
 * "Explore divisions" (`#p-works section.ks.dk`, markup 3768): header without a lead, then the
 * five division cards (`.kc-grid.c5`, "Explore Division") from the shared divisions list. Black.
 */
export async function WorksDivisions({ content }: { readonly content: WorksDivisionsContent }) {
  const refs = await getRefs();
  return (
    <ContentSection
      tone="dark"
      data-parity="ks"
      header={{
        kicker: content.kicker,
        title: <TitleLines lines={content.title} />,
        titleClassName: WORKS_TITLE_CLASS,
      }}
    >
      <CardGrid
        variant="service"
        columns={5}
        moreLabel="Explore Division"
        items={refs.divisions(content.divisions).map((division) => ({
          href: division.href,
          image: division.image,
          alt: division.alt,
          title: division.name,
          text: division.description,
        }))}
      />
    </ContentSection>
  );
}

/**
 * "Start a project" (`#p-works section.ctasec`, markup 3769–3778): the works `CtaBand` with the
 * "Prefer to call?" box. Its photo drifts with the scroll like the original's
 * `#p-works .ctasec>img` (E25, `ParallaxImage`; static with reduced motion).
 */
export function WorksCta({ content }: { readonly content: WorksCtaContent }) {
  return (
    <CtaBand
      variant="works"
      data-parity="ctasec"
      image={resolveImage(content.image.src)}
      alt={content.image.alt}
      kicker={content.kicker}
      title={<TitleLines lines={content.title} />}
      text={content.text}
      cta={content.cta}
      call={content.call}
      renderImage={() => (
        <ParallaxImage
          variant="inner"
          src={resolveImage(content.image.src)}
          alt={content.image.alt}
          sizes="100vw"
          frameClassName="size-full"
        />
      )}
    />
  );
}
