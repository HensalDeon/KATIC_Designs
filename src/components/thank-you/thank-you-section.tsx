import { LineBreaks } from "@/components/blocks/title-text";
import { FeatureGrid } from "@/components/sections/feature-grid";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Lead } from "@/components/ui/text";
import { THANK_YOU_PREPAINT_SCRIPT } from "@/lib/leads/thank-you";
import type { ThankYouContent } from "@/lib/schemas/thank-you";

import { LeadActions } from "./lead-actions";
import { LeadReferences } from "./lead-references";

/**
 * `#p-thank-you section.ks` (original lines 4381–4393): one white section, 200px from the top at
 * every width (the original's inline `padding-top:200px!important`, as a class) under the fixed
 * header, with the centred `.kty` column (760px): the orange check, the title, the lead, the
 * Source / Service chips, three "next steps" tiles (`.kfeat.grid3`, no 3D icons), the fallback box
 * and the buttons. Server-rendered; only the chips and the actions are client islands, filled in
 * from the remembered lead. No auto-zoom on short screens (the original's `fit()` shrinks it to
 * ~0.7 at 1440×900: KI-L13).
 */
export function ThankYouSection({ copy }: { readonly copy: ThankYouContent }) {
  return (
    <Section
      tone="light"
      spacing="none"
      aria-labelledby="thank-you-title"
      data-parity="ks"
      className="pt-200 pb-120 max-lg:pb-80"
    >
      <Container className="max-w-760 text-center">
        <div className="mx-auto grid size-84 place-items-center rounded-[50%] bg-brand">
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.4"
            aria-hidden
            focusable={false}
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>
        <h1
          id="thank-you-title"
          className="mt-34 font-display text-[64px] leading-[1.05] font-medium text-fg uppercase max-md:text-[34px]"
        >
          <LineBreaks lines={copy.title} />
        </h1>
        <Lead className="mt-22 max-w-none text-[17px] leading-[1.75]">{copy.lead}</Lead>
        <LeadReferences copy={{ sourceLabel: copy.sourceLabel, serviceLabel: copy.serviceLabel }} />
        {/* Writes the remembered lead into the chips before the first paint (no layout shift). */}
        <script dangerouslySetInnerHTML={{ __html: THANK_YOU_PREPAINT_SCRIPT }} />
        <FeatureGrid columns={3} art={false} items={copy.steps} className="mt-56 text-left" />
        {/* Client islands get only their own copy (it is serialised into the page). */}
        <LeadActions
          copy={{
            fallback: copy.fallback,
            whatsapp: copy.whatsapp,
            back: copy.back,
            projects: copy.projects,
          }}
        />
      </Container>
    </Section>
  );
}
