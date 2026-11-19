import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import type { Tone } from "@/lib/tone";

import { ContentSection } from "./content-section";

export type DivisionsStripItem = { readonly name: string; readonly href: string };

type DivisionsStripProps = Omit<
  ComponentPropsWithoutRef<"section">,
  "children" | "className" | "id"
> & {
  readonly tone: Tone;
  readonly items: readonly DivisionsStripItem[];
  readonly label?: string;
  readonly id?: string;
  readonly className?: string;
};

/**
 * "Explore our divisions" strip (`.ks.slim` with `.kdiv`): a full-height section holding a list of
 * 46px uppercase division links between hairline rules, each with a 28px orange ↗; links turn orange
 * on hover. 26px on phones. Renders its own section (it has no header); other section attributes
 * (e.g. `data-parity`) go to it.
 */
export function DivisionsStrip({
  tone,
  items,
  label = "Explore our divisions",
  id,
  className,
  ...sectionProps
}: DivisionsStripProps) {
  return (
    <ContentSection
      tone={tone}
      {...(id ? { id } : {})}
      {...(className ? { className } : {})}
      {...sectionProps}
    >
      <nav aria-label={label}>
        <p className="mb-26 font-display text-[11px] font-medium tracking-[0.22em] text-brand uppercase">
          {label}
        </p>
        <ul>
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center justify-between gap-12 border-b border-[#ddd] py-22 font-display text-[46px] leading-none font-medium text-fg uppercase transition-colors duration-200 hover:text-brand in-data-[tone=dark]:border-[#2a2a2a] max-md:py-16 max-md:text-[26px] [li:first-child>&]:border-t"
              >
                {item.name}
                <i className="text-[28px] text-brand not-italic" aria-hidden>
                  ↗
                </i>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </ContentSection>
  );
}
