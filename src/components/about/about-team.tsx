import Image from "next/image";

import { TitleLines } from "@/components/home/title-lines";
import { resolveImage } from "@/components/sections/section-image";
import { canvasSizes } from "@/components/sections/section-media";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Section } from "@/components/ui/section";
import type { AboutTeamContent } from "@/content/about";
import { cn } from "@/lib/cn";

import { ABOUT_TITLE_CLASS, AboutColumns } from "./about-columns";

type AboutTeamProps = {
  readonly content: AboutTeamContent;
};

/**
 * Management team (`#p-about section.ld`, white): kicker and title beside a short paragraph, then
 * four 290px grey cards (photo, name, orange role, bio). Two columns below 1100px, one on phones
 * with the photo full width. Cards are not links and, as in the original, have no hover change.
 *
 * Names are client placeholders (KI-C04). Fixes: the section grows instead of being zoomed down
 * (KI-L13); roles are at least 11px on phones (KI-A10).
 */
export function AboutTeam({ content }: AboutTeamProps) {
  const titleId = "about-team-title";
  return (
    <Section tone="light" data-parity="ld" aria-labelledby={titleId}>
      <Container className="text-black">
        <AboutColumns
          start={
            <>
              <Kicker className="text-black">{content.kicker}</Kicker>
              <SectionTitle id={titleId} className={cn("mt-16 text-black", ABOUT_TITLE_CLASS)}>
                <TitleLines lines={content.title} />
              </SectionTitle>
            </>
          }
          end={
            <p className="mt-6 font-sans text-[16.5px] leading-[1.7] text-[#222]">{content.body}</p>
          }
        />

        <ul className="mt-62 grid grid-cols-[repeat(4,290px)] gap-24 max-lg:grid-cols-2 max-md:grid-cols-1">
          {content.members.map((member) => (
            <li
              key={member.name}
              className="border border-[#e0e0e0] bg-[#f1f1f1] px-24 pt-24 pb-60"
            >
              <Image
                src={resolveImage(member.photo.src)}
                alt={member.photo.alt}
                sizes={canvasSizes(242, "242px", "calc(100vw - 90px)")}
                className="h-222 w-242 max-w-full object-cover max-md:w-full"
              />
              <h3 className="mt-22 font-sans text-[23px] font-medium">{member.name}</h3>
              <p className="mt-12 font-sans text-[9.5px] font-medium tracking-[0.16em] text-[#ad4517] max-md:text-[11px]">
                {member.role}
              </p>
              <p className="mt-10 font-sans text-[13px] leading-[2] text-[#444]">{member.bio}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
