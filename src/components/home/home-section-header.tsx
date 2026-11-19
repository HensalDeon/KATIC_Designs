import { ButtonLink } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Lead } from "@/components/ui/text";
import type { TitleLine } from "@/content/home/hero";

import { TitleLines } from "./title-lines";

type HomeSectionHeaderProps = {
  readonly kicker: string;
  readonly title: readonly TitleLine[];
  /** Id for the section's `aria-labelledby`. */
  readonly titleId?: string;
  readonly lead: string;
  readonly cta: { readonly label: string; readonly href: string };
};

/**
 * The `.ks .kh` header as the home page renders it (news and blog teasers): kicker and title on
 * the left (646px on the canvas), lead and ↗ button on the right, bottom-aligned; one column with
 * a 28px gap below 1100px. Home type system: Jost kicker 11px, title 56/1.02, lead 15/1.75.
 */
export function HomeSectionHeader({ kicker, title, titleId, lead, cta }: HomeSectionHeaderProps) {
  return (
    <div className="grid grid-cols-[646px_1fr] items-end max-lg:grid-cols-1 max-lg:gap-28">
      <div>
        <Kicker font="home">{kicker}</Kicker>
        <SectionTitle id={titleId} scale="home" className="mt-22">
          <TitleLines lines={title} />
        </SectionTitle>
      </div>
      <div>
        <Lead variant="home" className="max-w-600">
          {lead}
        </Lead>
        <ButtonLink href={cta.href} variant="outline" font="home" icon="up-right" className="mt-22">
          {cta.label}
        </ButtonLink>
      </div>
    </div>
  );
}
