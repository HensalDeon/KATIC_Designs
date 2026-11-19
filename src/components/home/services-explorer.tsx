import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Section } from "@/components/ui/section";
import { Lead } from "@/components/ui/text";
import { type ExplorerContent, HOME_EXPLORER } from "@/content/home/explorer";
import { cn } from "@/lib/cn";

import { ServicesExplorerBody } from "./services-explorer-client";

type ServicesExplorerProps = {
  readonly content?: ExplorerContent;
  readonly className?: string;
};

/**
 * Home "Services" explorer (original `section.svx.dk#home-deliver`, E27). Always black, as rendered.
 *
 * Canvas (≥861px): full-bleed split, one screen tall (`max(--svh, 720px)`, no padding): a 506px
 * list column with the 86px gutter and a #262626 rule, and the photo filling the rest with a bottom
 * gradient, a 3px orange progress bar and the caption overlaid bottom-left (2 columns ≥1100px).
 * Phones (≤860px): home rhythm (104/36), list, then a 4:3 photo and the caption below it.
 *
 * Deliberate differences: tablist semantics and keyboard support (KI-A06), a pause control
 * (KI-A01), and at 861–1099px the caption grows upwards from its bottom offset instead of a fixed
 * 150px box, so its links no longer fall outside the section. Service order is the home order
 * (KI-D03).
 */
export function ServicesExplorer({ content = HOME_EXPLORER, className }: ServicesExplorerProps) {
  return (
    <Section
      tone="dark"
      id="home-deliver"
      spacing="none"
      fullHeight={false}
      className={cn("max-md:pt-104 max-md:pb-36 md:h-[max(var(--svh),720px)]", className)}
    >
      <ServicesExplorerBody
        content={content}
        header={
          <>
            <Kicker font="home">{content.kicker}</Kicker>
            <SectionTitle scale="home" className="mt-14 max-md:mt-16">
              {content.title}
            </SectionTitle>
            <Lead
              variant="home"
              data-part="lead"
              className="mt-12 max-w-330 text-[14.5px] leading-[1.7] text-[#aaa] max-md:mt-16 max-md:text-[15px]"
            >
              {content.lead}
            </Lead>
          </>
        }
      />
    </Section>
  );
}
