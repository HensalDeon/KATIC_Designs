import Image from "next/image";

import { resolveImage } from "@/components/sections/section-image";
import { canvasSizes } from "@/components/sections/section-media";
import { Container } from "@/components/ui/container";
import { Kicker } from "@/components/ui/kicker";
import { Section } from "@/components/ui/section";
import type { AboutFounderContent } from "@/content/about";
import { cn } from "@/lib/cn";

const PARAGRAPH = "max-w-500 font-sans text-[17px] leading-[1.75]";

type AboutFounderProps = {
  readonly content: AboutFounderContent;
};

/**
 * Founder's note (`#p-about section.fd#about-founder`, deep-linked from "Meet the Founder"): the
 * kicker, then the founder's name (Inter 500 56px), role, two paragraphs and the quote beside a
 * 696px portrait, vertically centred. One column below 1100px; a 360px portrait on phones.
 * The name and first paragraph are client placeholders (KI-C04).
 */
export function AboutFounder({ content }: AboutFounderProps) {
  const titleId = "about-founder-title";
  return (
    <Section tone="light" id="about-founder" aria-labelledby={titleId}>
      <Container>
        <Kicker>{content.kicker}</Kicker>
        <div className="mt-60 grid grid-cols-[1fr_696px] items-center gap-60 max-lg:grid-cols-1 max-lg:gap-36">
          <div>
            <h2
              id={titleId}
              className="font-sans text-[56px] font-medium tracking-[-0.01em] text-ink max-md:text-[34px] max-md:leading-[1.1]"
            >
              {content.name}
            </h2>
            <p className="mt-26 font-sans text-[12.5px] font-medium tracking-[0.14em] text-[#555]">
              {content.role}
            </p>
            {content.paragraphs.map((paragraph, index) => (
              <p key={paragraph} className={cn(PARAGRAPH, "text-[#555]", index === 0 && "mt-20")}>
                {paragraph}
              </p>
            ))}
            <blockquote className={cn(PARAGRAPH, "font-medium text-ink-2")}>
              <p>{content.quote}</p>
            </blockquote>
          </div>
          <Image
            src={resolveImage(content.photo.src)}
            alt={content.photo.alt}
            sizes={canvasSizes(696, "calc(100vw - 72px)", "calc(100vw - 40px)")}
            className="h-520 w-full object-cover max-md:h-360"
          />
        </div>
      </Container>
    </Section>
  );
}
