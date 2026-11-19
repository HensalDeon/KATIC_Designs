import { Fragment } from "react";

import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Section } from "@/components/ui/section";
import { Lead } from "@/components/ui/text";
import { type ClientStoriesContent, HOME_STORIES } from "@/content/home/stories";
import { media } from "@/content/media";
import { cn } from "@/lib/cn";

import { ClientStoriesRotator } from "./client-stories-client";

type ClientStoriesProps = {
  readonly content?: ClientStoriesContent;
  readonly className?: string;
};

function Lines({ lines }: { lines: readonly string[] }) {
  return lines.map((line, i) => (
    <Fragment key={line}>
      {i > 0 ? <br /> : null}
      {line}
    </Fragment>
  ));
}

/**
 * Home client stories (original `section.cs#home-stories`, E29). Always white, as rendered.
 *
 * Title left and a right-aligned intro, then a three-column row: a 346px portrait card, the
 * centred quote with prev/next and "View all stories", and a 346px project card (both cards
 * 432px with a soft shadow). Phones: one column, a 360px portrait card, no project card.
 *
 * Fixes: below 1100px the columns are fluid (`1fr 1.2fr 1fr`) instead of fixed 346px tracks, so
 * the page no longer overflows sideways at 861–1099px (KI-L01); on tablets the portrait is cropped
 * from the top third so the face stays in frame (KI-L29). The kicker uses the text-safe orange on
 * white (KI-A11). Reveals as in the original (`.cs .kick`, `h2` clip, `.top p`, `.q`).
 */
export function ClientStories({ content = HOME_STORIES, className }: ClientStoriesProps) {
  return (
    <Section tone="light" id="home-stories" spacing="home" className={cn("text-ink", className)}>
      <Container data-part="wrap">
        <div
          data-part="top"
          className="flex items-end justify-between max-md:flex-col max-md:items-start"
        >
          <div>
            <Reveal>
              <Kicker font="home">{content.kicker}</Kicker>
            </Reveal>
            <Reveal variant="clip">
              <SectionTitle scale="home" className="mt-16 text-ink">
                <Lines lines={content.titleLines} />
              </SectionTitle>
            </Reveal>
          </div>
          <Reveal>
            <Lead variant="home" className="mb-24 text-right text-[#222] max-md:text-left">
              <Lines lines={content.introLines} />
            </Lead>
          </Reveal>
        </div>
        <ClientStoriesRotator
          content={{
            ...content,
            stories: content.stories.map((story) => ({
              ...story,
              portrait: media[story.portrait].image,
              project: media[story.project].image,
            })),
          }}
        />
      </Container>
    </Section>
  );
}
