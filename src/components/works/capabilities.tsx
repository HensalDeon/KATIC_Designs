import Image from "next/image";
import Link from "next/link";

import { TitleLines } from "@/components/home/title-lines";
import { ServiceIcon } from "@/components/icons/service-icon";
import { resolveImage } from "@/components/sections/section-image";
import { canvasSizes } from "@/components/sections/section-media";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Section } from "@/components/ui/section";
import { WORKS_CAPABILITIES, type WorksCapabilitiesContent } from "@/content/works";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

import { WORKS_TITLE_CLASS } from "./works-title";

type CapabilitiesProps = {
  readonly content?: WorksCapabilitiesContent;
};

/**
 * "Our capabilities" (`#p-works section.xp`, markup 3754–3767, page `<style>` 3669–3683). Authored
 * dark, it renders white with black text (`data-fx="106"`): the `.two` header with the paragraph
 * 60px down, then four service cards (258px photo with icon and "+", a ruled 21px title, text and
 * "Explore Service →"; the photo zooms to 1.05 on hover). Two columns below 1100px, one on phones.
 */
export function Capabilities({ content = WORKS_CAPABILITIES }: CapabilitiesProps) {
  const titleId = "works-capabilities-title";
  return (
    <Section tone="light" data-parity="xp" aria-labelledby={titleId}>
      <Container size="wide">
        <div className="grid grid-cols-[660px_1fr] max-lg:grid-cols-[minmax(0,1fr)] max-lg:gap-36">
          <div>
            <Kicker className="text-black">{content.kicker}</Kicker>
            <SectionTitle id={titleId} className={cn("mt-44 text-black", WORKS_TITLE_CLASS)}>
              <TitleLines lines={content.title} />
            </SectionTitle>
          </div>
          <div className="pt-60">
            <p className="max-w-640 font-sans text-[14px] leading-[1.9] text-[#444]">
              {content.text}
            </p>
          </div>
        </div>

        <ul className="mt-62 grid grid-cols-4 gap-18 max-lg:grid-cols-2 max-lg:gap-y-28 max-md:grid-cols-1">
          {content.cards.map((card) => (
            <li key={card.service}>
              <Link href={routes.service(card.service)} className="group block">
                <span className="relative block h-258 overflow-hidden">
                  <Image
                    src={resolveImage(card.image.src)}
                    alt={card.image.alt}
                    sizes={canvasSizes(311, "50vw")}
                    className="size-full object-cover transition-transform duration-800 group-hover:scale-[1.05]"
                  />
                  <ServiceIcon
                    name={card.icon}
                    size={20}
                    className="absolute top-12 left-12 text-white"
                  />
                  <i
                    aria-hidden
                    className="absolute bottom-10 left-12 font-sans text-[20px] font-light text-white not-italic"
                  >
                    +
                  </i>
                </span>
                <h3 className="mt-18 border-t border-[rgba(0,0,0,0.18)] pt-16 font-sans text-[21px] font-normal text-black">
                  {card.title}
                </h3>
                <p className="mt-12 min-h-42 font-sans text-[12px] leading-[1.7] text-[#444]">
                  {card.text}
                </p>
                <span className="mt-22 inline-flex gap-10 font-sans text-[11.5px] font-semibold text-black">
                  {content.cardLinkLabel}
                  <b aria-hidden className="font-black text-brand">
                    →
                  </b>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
