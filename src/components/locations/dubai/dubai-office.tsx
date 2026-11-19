import Image from "next/image";
import { Fragment } from "react";

import { LineBreaks } from "@/components/blocks/title-text";
import { resolveImage, type SectionImage } from "@/components/sections/section-image";
import { canvasSizes } from "@/components/sections/section-media";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Section } from "@/components/ui/section";
import type { TitleLines } from "@/content/blocks";
import { cn } from "@/lib/cn";

import type { DubaiBlockProps } from "./dubai-block-props";
import { DUBAI_TITLE } from "./dubai-title";

/** One row of the office details (`dt` / `dd`). */
export type OfficeDetail = {
  readonly term: string;
  readonly value: string;
  /** Makes the value a link (`tel:`, `mailto:`). */
  readonly href?: string;
  /** Second, smaller line under the value (the original's address placeholder note). */
  readonly note?: string;
};

/** Copy of the office block (plain data: will come from Laravel with the office record). */
export type DubaiOfficeContent = {
  readonly kicker: string;
  readonly title: TitleLines;
  readonly details: readonly OfficeDetail[];
  /** "Get Directions": a maps search, opened in a new tab. */
  readonly directions: { readonly label: string; readonly href: string };
  readonly image: SectionImage;
};

/**
 * Office and contact details (`#p-dubai section.ks#dubai-office .koff`, original line 4185; global
 * `.koff` rules 2311–2331): kicker, title, a two-column `dl` (150px terms in text-safe orange,
 * Inter 16/1.6 values), "Get Directions", and a photo filling the right column (at least 460px
 * tall). One column below 1100px, 28px apart; on phones the terms column shrinks to its content
 * and long values wrap anywhere.
 *
 * Fixes: the title scales 58 → 46 → 34 (KI-N04); the terms are 11px on phones (KI-A10), tracked
 * a little tighter so their column keeps the original's width and no value wraps; the photo's
 * alt describes it (KI-A13). The address placeholder stays visible, as in the original (KI-C02).
 */
export function DubaiOffice({
  content,
  tone,
  id = "dubai-office",
}: DubaiBlockProps<DubaiOfficeContent>) {
  const titleId = `${id}-title`;
  return (
    <Section tone={tone} id={id} aria-labelledby={titleId}>
      <Container className="grid grid-cols-2 gap-64 max-lg:grid-cols-[minmax(0,1fr)] max-lg:gap-28">
        <div>
          <Kicker>{content.kicker}</Kicker>
          <SectionTitle id={titleId} className={cn("mt-22", DUBAI_TITLE)}>
            <LineBreaks lines={content.title} />
          </SectionTitle>
          <dl className="mt-36 grid grid-cols-[150px_1fr] gap-x-20 gap-y-18 font-sans max-md:grid-cols-[minmax(0,auto)_minmax(0,1fr)]">
            {content.details.map((detail) => (
              <Fragment key={detail.term}>
                <dt className="pt-4 text-[10px] font-semibold tracking-[0.18em] text-kicker uppercase max-md:text-[11px] max-md:tracking-[0.1em]">
                  {detail.term}
                </dt>
                <dd className="min-w-0 text-[16px] leading-[1.6] text-fg max-md:wrap-anywhere">
                  {detail.href ? (
                    <a
                      href={detail.href}
                      className="transition-colors duration-200 hover:text-kicker"
                    >
                      {detail.value}
                    </a>
                  ) : (
                    detail.value
                  )}
                  {detail.note ? (
                    <>
                      <br />
                      <span className="text-[13px]">{detail.note}</span>
                    </>
                  ) : null}
                </dd>
              </Fragment>
            ))}
          </dl>
          <ButtonLink
            href={content.directions.href}
            target="_blank"
            rel="noopener"
            variant="outline"
            icon="up-right"
            className="mt-34"
          >
            {content.directions.label}
          </ButtonLink>
        </div>
        <div className="relative min-h-460 overflow-hidden">
          <Image
            src={resolveImage(content.image.src)}
            alt={content.image.alt}
            fill
            sizes={canvasSizes(602, "calc(100vw - 72px)", "calc(100vw - 40px)")}
            className="object-cover"
          />
        </div>
      </Container>
    </Section>
  );
}
