import { Fragment } from "react";

import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Section } from "@/components/ui/section";
import { Lead } from "@/components/ui/text";
import { WHAT_WE_DELIVER, type WhatWeDeliverContent } from "@/content/services-page";

type WhatWeDeliverProps = {
  readonly content?: WhatWeDeliverContent;
};

/**
 * "What we deliver" (`#p-services section.fd`): black (the original's page CSS says cream, its
 * colour freeze renders black). Kicker and a three-line title on the left (646px), the lead on the
 * right; one column below 1100px.
 *
 * KI-L19: on the canvas this is a one-screen section with little content (a 226px block centred
 * in the screen). Kept for parity until the client confirms the copy; it uses the standard
 * one-screen rhythm, so the block stays centred at every height and never clips.
 */
export function WhatWeDeliver({ content = WHAT_WE_DELIVER }: WhatWeDeliverProps) {
  return (
    <Section tone="dark" data-parity="fd">
      <Container className="grid grid-cols-[646px_1fr] max-lg:grid-cols-[minmax(0,1fr)] max-lg:gap-36">
        <div>
          <Kicker className="max-md:text-[9.5px]">{content.kicker}</Kicker>
          <SectionTitle className="mt-20 text-[#f4f4f4]">
            {content.titleLines.map((line, index) => (
              <Fragment key={line}>
                {index > 0 ? <br /> : null}
                {line}
              </Fragment>
            ))}
          </SectionTitle>
        </div>
        <Lead className="max-w-none pt-22 text-[17px] leading-[1.75] text-fg-body">
          {content.lead}
        </Lead>
      </Container>
    </Section>
  );
}
