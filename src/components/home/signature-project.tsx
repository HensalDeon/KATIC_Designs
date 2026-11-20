import Image from "next/image";
import Link from "next/link";

import { ParallaxImage } from "@/components/motion/parallax-image";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Section } from "@/components/ui/section";
import type { HomeSignatureContent } from "@/content/home/signature";
import { resolveMedia } from "@/lib/media/resolve";
import { routes } from "@/lib/routes";

import { TitleLines } from "./title-lines";

type SignatureProjectProps = {
  readonly content: HomeSignatureContent;
};

/**
 * Home signature project (`section.sig#home-signature`): black section over a parallax photo
 * (`ParallaxImage variant="signature"`, E26), kicker / title / "View Project" beside a paragraph,
 * then four room cards (`.sc-card` in `.sig-grid`: four columns on the canvas, a horizontal
 * snap scroller below 1100px).
 *
 * KI-A15: the original's cards are `<article>`s that look clickable but do nothing. Here each
 * card is a real link to the signature project page (the same target as "View Project"); the look
 * is unchanged apart from the focus ring.
 */
export function SignatureProject({ content }: SignatureProjectProps) {
  const href = routes.project(content.projectSlug);
  return (
    <Section tone="dark" spacing="home" id="home-signature" aria-labelledby="home-signature-title">
      <ParallaxImage
        variant="signature"
        src={resolveMedia(content.background.image)}
        alt={content.background.alt}
        sizes="100vw"
        frameClassName="absolute inset-0 after:absolute after:inset-0 after:bg-[linear-gradient(180deg,rgba(0,0,0,0.62)_0%,rgba(0,0,0,0.72)_45%,rgba(0,0,0,0.9)_80%,#000_100%)] after:content-['']"
      />
      <Container className="z-2">
        <div className="grid grid-cols-[640px_1fr] gap-4 max-lg:grid-cols-1 max-lg:gap-36">
          <div>
            <Reveal>
              <Kicker font="home">{content.kicker}</Kicker>
            </Reveal>
            <Reveal variant="clip">
              <SectionTitle id="home-signature-title" scale="home" className="mt-14">
                <TitleLines lines={content.title} />
              </SectionTitle>
            </Reveal>
            <Reveal>
              <ButtonLink
                href={href}
                variant="dark"
                size="base"
                font="home"
                icon={null}
                className="mt-24 h-50 border-[rgba(255,255,255,0.18)] px-32"
              >
                {content.cta}
              </ButtonLink>
            </Reveal>
          </div>
          <Reveal>
            <p className="mt-34 max-w-560 font-display text-[15px] leading-[1.75] text-[#f1f1f1]">
              {content.text}
            </p>
          </Reveal>
        </div>

        <ul className="mt-44 grid h-320 grid-cols-4 gap-20 max-lg:-mx-20 max-lg:flex max-lg:snap-x max-lg:snap-mandatory max-lg:overflow-x-auto max-lg:px-20">
          {content.rooms.map((room) => (
            <li
              key={room.title}
              className="h-320 max-lg:w-[72vw] max-lg:flex-none max-lg:snap-center"
            >
              <Link
                href={href}
                className="relative block size-full overflow-hidden bg-ink-2 after:absolute after:inset-0 after:bg-[linear-gradient(180deg,rgba(0,0,0,0)_35%,rgba(0,0,0,0.72)_100%)] after:content-['']"
              >
                <Image
                  src={resolveMedia(room.image)}
                  alt=""
                  sizes="(max-width: 1099px) 72vw, 302px"
                  className="absolute inset-0 size-full object-cover"
                />
                <div className="absolute inset-x-22 bottom-22 z-3">
                  <span className="inline-flex h-22 w-max max-w-full items-center rounded-[20px] border border-[rgba(255,255,255,0.35)] bg-[rgba(0,0,0,0.45)] px-12 font-display text-[10px] font-medium tracking-[0.2em] uppercase">
                    {content.pill}
                  </span>
                  <h3 className="mt-14 font-display text-[28px] leading-[1.1] font-medium uppercase max-md:text-[22px]">
                    {room.title}
                  </h3>
                  <p className="mt-8 font-display text-[13px] text-mist">{room.subtitle}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
