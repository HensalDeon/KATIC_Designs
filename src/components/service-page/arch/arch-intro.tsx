import Image from "next/image";

import { ActionButton, type SectionAction } from "@/components/sections/section-action";
import { resolveImage, type SectionImage } from "@/components/sections/section-image";
import { canvasSizes } from "@/components/sections/section-media";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/tone";

import { LineBreaks } from "../title-text";
import { ARCH_TITLE } from "./arch-header";

/** Content of the architecture introduction (`#p-architecture section.ap`). Plain data. */
export type ArchIntroContent = {
  readonly kicker: string;
  /** Title lines (the original's `<br>` breaks). */
  readonly title: readonly string[];
  readonly lead: string;
  /** Small outline button under the lead ("Our Process" → the process section). */
  readonly cta: SectionAction;
  /** Figures under the lead, e.g. `{ value: "12+", label: "Years designing" }`. */
  readonly stats: readonly { readonly value: string; readonly label: string }[];
  readonly image: SectionImage;
  /** Caption row under the photo: an uppercase label left, a place right. */
  readonly caption: { readonly label: string; readonly place: string };
};

type ArchIntroProps = {
  readonly content: ArchIntroContent;
  /** White in the original (index 0 after the hero). */
  readonly tone?: Tone;
  readonly id?: string;
  /** The original block has no id; the parity tool matches it by its class (P5-01). */
  readonly "data-parity"?: string;
};

/** Small grey labels of the stats and the caption row; 11px on phones (KI-A10). */
const META = "font-sans text-[9.5px] font-medium tracking-[0.2em] max-md:text-[11px]";
const META_COLOUR = "text-[#555] in-data-[tone=dark]:text-[#bbb]";

/**
 * Architecture introduction (`#p-architecture section.ap`, stripped HTML lines 3327–3336, page
 * `<style>` 3246–3258): kicker, title, lead, an outline "Our Process" button and two figures in a
 * column beside a 700px × 523px photo with a caption row. One column below 1100px; the photo is
 * 320px tall on phones.
 *
 * Fixes: the empty 230px `.spacer` under the content is dropped (KI-L21), so the section is one
 * screen tall with its content centred like every other block (no `fit()` zoom, KI-L13); the
 * title scales 58 → 46 → 34 (KI-N04); the small labels are 11px on phones (KI-A10); the photo has
 * a descriptive alt instead of the headline (KI-A13). The stats sit side by side in two equal
 * columns on narrow phones instead of squeezing the second into 85px.
 */
export function ArchIntro({
  content,
  tone = "light",
  id,
  "data-parity": parity = "ap",
}: ArchIntroProps) {
  const titleId = `${id ?? "arch-intro"}-title`;
  return (
    <Section tone={tone} id={id} data-parity={parity} aria-labelledby={titleId}>
      <Container className="grid grid-cols-[1fr_700px] gap-60 max-lg:grid-cols-1 max-lg:gap-36">
        <div>
          <Kicker>{content.kicker}</Kicker>
          <SectionTitle id={titleId} className={cn("mt-22", ARCH_TITLE)}>
            <LineBreaks lines={content.title} />
          </SectionTitle>
          <p className="mt-26 max-w-500 font-sans text-[17px] leading-[1.7] text-[#555] in-data-[tone=dark]:text-[#bbb] max-md:text-[15px]">
            {content.lead}
          </p>
          <ActionButton
            action={content.cta}
            className={buttonVariants({
              variant: tone === "dark" ? "outline-light" : "outline",
              size: "sm",
              className: "mt-22",
            })}
          />
          <dl className="mt-56 grid grid-cols-[265px_1fr] max-xs:grid-cols-2">
            {content.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse">
                <dt className={cn("mt-8 uppercase", META, META_COLOUR)}>{stat.label}</dt>
                <dd className="font-sans text-[26px] text-fg">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <figure className="pt-38">
          <Image
            src={resolveImage(content.image.src)}
            alt={content.image.alt}
            sizes={canvasSizes(700, "100vw")}
            className="h-523 w-full object-cover max-md:h-320"
          />
          <figcaption className={cn("mt-18 flex justify-between", META, META_COLOUR)}>
            <span className="uppercase">{content.caption.label}</span>
            <span className="text-[10.5px] tracking-normal max-md:text-[11px]">
              {content.caption.place}
            </span>
          </figcaption>
        </figure>
      </Container>
    </Section>
  );
}
