import type { ComponentProps, ReactNode } from "react";

import { ButtonLink } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Lead } from "@/components/ui/text";
import { cn } from "@/lib/cn";

export type SectionCta = {
  readonly label: string;
  readonly href: string;
  /** `.ol` on light sections, `.dk` / `.dko` on dark ones, `outline-ink` = `.dko` on light (home). */
  readonly variant?: "outline" | "dark" | "outline-light" | "outline-ink";
};

export type SectionHeaderProps = {
  readonly kicker: string;
  /** Use `<br />` for the original's authored line breaks. */
  readonly title: ReactNode;
  readonly lead?: ReactNode;
  readonly cta?: SectionCta;
  /** `split` = `.kh` (title left, lead right); `center` = `.ctr`. */
  readonly align?: "split" | "center";
  readonly titleAs?: ComponentProps<typeof SectionTitle>["as"];
  /** Page-level title override (P1-04), e.g. architecture's 1.14 line height. */
  readonly titleClassName?: string;
  readonly className?: string;
};

/**
 * Section header (`.ks .kh`): kicker + title on the left (646px on the canvas), lead and optional
 * CTA on the right, bottom-aligned. One column below 1100px. The right column is always rendered,
 * even empty, so the title column keeps its width.
 */
export function SectionHeader({
  kicker,
  title,
  lead,
  cta,
  align = "split",
  titleAs,
  titleClassName,
  className,
}: SectionHeaderProps) {
  if (align === "center") {
    return (
      <div className={cn("text-center", className)}>
        <Kicker align="center">{kicker}</Kicker>
        <SectionTitle as={titleAs} className={cn("mt-22", titleClassName)}>
          {title}
        </SectionTitle>
        {lead ? <Lead className="mx-auto mt-20 max-w-640 leading-[1.75]">{lead}</Lead> : null}
        {cta ? <HeaderCta cta={cta} /> : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-[646px_1fr] items-end max-lg:grid-cols-1 max-lg:gap-28",
        className,
      )}
    >
      <div>
        <Kicker>{kicker}</Kicker>
        <SectionTitle as={titleAs} className={cn("mt-22", titleClassName)}>
          {title}
        </SectionTitle>
      </div>
      <div>
        {lead ? <Lead>{lead}</Lead> : null}
        {cta ? <HeaderCta cta={cta} /> : null}
      </div>
    </div>
  );
}

function HeaderCta({ cta }: { cta: SectionCta }) {
  return (
    <ButtonLink
      href={cta.href}
      variant={cta.variant ?? "outline"}
      icon="up-right"
      className="mt-22"
    >
      {cta.label}
    </ButtonLink>
  );
}
