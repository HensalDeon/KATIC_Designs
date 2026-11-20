import type { CSSProperties } from "react";

import { ProcessSteps } from "@/components/sections/process-steps";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Plant } from "@/components/ui/plant";
import { Section } from "@/components/ui/section";
import { Body, Lead } from "@/components/ui/text";
import { resolveMedia } from "@/lib/media/resolve";
import type { WhatWeDoContent } from "@/lib/schemas/services-page";

import { plantRoom } from "./plant-room";

const PLANT = { asset: "plants/heliconia", width: 110 } as const;

type WhatWeDoProps = {
  readonly content: WhatWeDoContent;
};

/**
 * "What we do" (`#p-services section.pp-host.wd2`): white, one screen on the canvas. A two-column
 * intro (`.two`: kicker, title and a large statement on the left; lead, body copy and "Our Process"
 * on the right, one column below 1100px), then the four practice steps with their isometric
 * drawings (`ProcessSteps`, `.ksteps.lt`).
 *
 * The hanging heliconia (`.pp-heli`) hangs from the top-left corner, 28px past the edge (18px on
 * phones) and clipped by the section (KI-L32); it stays unmirrored and still, as rendered (KI-L39).
 * On phones the section gives the plant its own room above the content, like the original's
 * plant-room script (80px + 90% of the plant height).
 */
export function WhatWeDo({ content }: WhatWeDoProps) {
  return (
    <Section
      tone="light"
      data-parity="pp-host"
      style={
        {
          "--plant-room": `${plantRoom(resolveMedia(PLANT.asset), PLANT.width)}px`,
        } as CSSProperties
      }
      className="isolate max-md:pt-[calc(80px+var(--plant-room))]"
    >
      <Plant
        asset={PLANT.asset}
        width={PLANT.width}
        corner="top-left"
        behind
        className="-left-28 max-md:-left-18"
      />
      <Container>
        <div className="grid grid-cols-[646px_1fr] max-lg:grid-cols-[minmax(0,1fr)] max-lg:gap-36">
          <div>
            <Kicker>{content.kicker}</Kicker>
            <SectionTitle className="mt-18 text-ink">{content.title}</SectionTitle>
            <p className="mt-34 max-w-540 font-sans text-[26px] leading-[1.3] text-ink">
              {content.statement}
            </p>
          </div>
          <div className="pt-18">
            <Lead className="max-w-none text-[17px] leading-[1.75] text-fg-body">
              {content.lead}
            </Lead>
            <Body variant="base" className="mt-16">
              {content.body}
            </Body>
            <ButtonLink
              href={content.cta.href}
              variant="outline"
              size="sm"
              icon="up-right"
              className="mt-22"
            >
              {content.cta.label}
            </ButtonLink>
          </div>
        </div>
        <ProcessSteps steps={content.steps} className="mt-52" />
      </Container>
    </Section>
  );
}
