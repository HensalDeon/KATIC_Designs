import type { CSSProperties } from "react";

import { LineBreaks } from "@/components/blocks/title-text";
import { ServiceIcon } from "@/components/icons/service-icon";
import { ZoomableImage } from "@/components/overlays/lightbox";
import { resolveImage, type SectionImage } from "@/components/sections/section-image";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Plant } from "@/components/ui/plant";
import { Section } from "@/components/ui/section";
import type { TitleLines } from "@/content/blocks";
import { media } from "@/content/media";
import { cn } from "@/lib/cn";

import type { DubaiBlockProps } from "./dubai-block-props";
import { DUBAI_TITLE } from "./dubai-title";

/** Copy of the "KATIC in Dubai" block (plain data: will come from Laravel). */
export type DubaiContextContent = {
  readonly image: SectionImage;
  /** The two ends of the caption under the photo (`.cpt`): a label left, a place right. */
  readonly caption: readonly [label: string, place: string];
  readonly kicker: string;
  readonly title: TitleLines;
  readonly body: string;
  readonly cta: { readonly label: string; readonly href: string };
};

/** The cactus group (`img.cac.plant.pot`): 327px wide, 190px from the right, on the bottom edge. */
const CACTUS = { asset: "plants/cactus-group", width: 327 } as const;

/**
 * Cactus width on phones (≤860px). The original's two cactus rules both match its single cactus
 * (`.cac:first-of-type` 240px, then `.cac:last-of-type` 92px, KI-L25), which leaves a 92px
 * thumbnail; this keeps the first rule's 240px, left-aligned 10px from the edge.
 */
const CACTUS_PHONE_WIDTH = 240;

/**
 * Room under the content for the cactus on phones: the original's plant-room script adds 95% of a
 * bottom plant's height to the section's 80px padding (JS 5285–5293, as `phonePlantRoom` does for
 * `.pp` plants), computed here once from the image's aspect ratio (KI-N11).
 */
function cactusPhoneRoom(): CSSProperties {
  const { width, height } = media[CACTUS.asset].image;
  const room = CACTUS_PHONE_WIDTH * (height / width) * 0.95;
  return { "--plant-room": `${room.toFixed(2)}px` } as CSSProperties;
}

/**
 * "KATIC in Dubai" (`#p-dubai section.s1#dubai-context`, original lines 4169–4178, page `<style>`
 * 4106–4123): a 663px photo (614px tall, opens the lightbox) with its two-part caption, beside a
 * column with the kicker and a 46px pin-icon box, the title, a rule, the paragraph and "Our
 * Process". A cactus group stands on the bottom edge, in front of the content.
 *
 * One column below 1100px (photo first, 74px apart); a 340px photo on phones.
 *
 * Fixes: the cactus keeps its proportions (KI-L08: the original stretches it to 327×379, 0.63× its
 * aspect ratio) and is 240px on phones instead of 92px (KI-L25); the section grows with its
 * content (KI-L13); the title scales 58 → 46 → 34 (KI-N04); the caption is 11px on phones (KI-A10);
 * the photo's alt describes it (KI-A13).
 */
export function DubaiContext({
  content,
  tone,
  id = "dubai-context",
}: DubaiBlockProps<DubaiContextContent>) {
  const titleId = `${id}-title`;
  return (
    <Section
      tone={tone}
      id={id}
      aria-labelledby={titleId}
      className="max-md:pb-[calc(80px+var(--plant-room))]"
      style={cactusPhoneRoom()}
    >
      <Container className="grid grid-cols-[663px_1fr] gap-74 max-lg:grid-cols-[minmax(0,1fr)]">
        <div>
          <ZoomableImage
            image={resolveImage(content.image.src)}
            alt={content.image.alt}
            sizes="(max-width: 860px) calc(100vw - 40px), (max-width: 1099px) calc(100vw - 72px), 47vw"
            buttonClassName="h-614 w-full max-md:h-340"
            className="size-full object-cover"
          />
          <p className="mt-18 flex justify-between font-sans text-[10px] tracking-[0.2em] text-[#555] max-md:text-[11px]">
            <span>{content.caption[0]}</span>
            <span className="tracking-normal">{content.caption[1]}</span>
          </p>
        </div>

        <div className="pt-20">
          <div className="flex items-center justify-between">
            <Kicker>{content.kicker}</Kicker>
            <span className="grid size-46 place-items-center border border-chip-line text-brand">
              <ServiceIcon name="pin" />
            </span>
          </div>
          <SectionTitle id={titleId} className={cn("mt-30 text-ink", DUBAI_TITLE)}>
            <LineBreaks lines={content.title} />
          </SectionTitle>
          <div aria-hidden className="mt-32 h-1 bg-[#ddd]" />
          <p className="mt-62 max-w-470 font-sans text-[16px] leading-[1.7] text-[#555]">
            {content.body}
          </p>
          <ButtonLink
            href={content.cta.href}
            variant="outline"
            icon="up-right"
            className="mt-22 h-54 px-22"
          >
            {content.cta.label}
          </ButtonLink>
        </div>
      </Container>

      <Plant
        asset={CACTUS.asset}
        corner="bottom-right"
        width={CACTUS.width}
        className="right-190 max-md:right-auto max-md:left-10 max-md:w-240"
      />
    </Section>
  );
}
