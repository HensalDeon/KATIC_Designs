"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import type { ClientStoriesContent, ClientStory } from "@/content/home/stories";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/cn";
import type { WithImages } from "@/lib/media/types";
import { wrapIndex } from "@/lib/motion";

/** E29: the outgoing quote fades out over 250ms, then the next one fades in over 250ms. */
export const STORY_FADE_MS = 250;

export type ResolvedClientStory = WithImages<ClientStory, "portrait" | "project">;
export type ResolvedClientStoriesContent = Omit<ClientStoriesContent, "stories"> & {
  readonly stories: readonly ResolvedClientStory[];
};

type ClientStoriesRotatorProps = {
  /** Content with both photos of each story resolved on the server (`WithImages`). */
  readonly content: ResolvedClientStoriesContent;
};

const fadeClass = "transition-opacity duration-250";

/**
 * Interactive part of `ClientStories`: portrait card, quote with prev/next, project card.
 * Prev/next fade the quote, both photos and their captions out, swap the story and fade them in
 * again (no autoplay, as in the original). Every story's photos are rendered up front, stacked,
 * so the swap never waits for a download. The quote text sits in a polite live region, so the new
 * story is announced. Under reduced motion the swap is immediate.
 */
export function ClientStoriesRotator({ content }: ClientStoriesRotatorProps) {
  const { stories } = content;
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const pending = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!fading) return;
    const timer = window.setTimeout(() => {
      if (pending.current !== null) setIndex(pending.current);
      pending.current = null;
      setFading(false);
    }, STORY_FADE_MS);
    return () => window.clearTimeout(timer);
  }, [fading]);

  function step(direction: -1 | 1) {
    const next = wrapIndex(pending.current ?? index, direction, stories.length);
    if (reducedMotion) {
      setIndex(next);
      return;
    }
    pending.current = next;
    setFading(true);
  }

  const story = stories[index];
  if (!story) return null;
  const visible = fading ? "opacity-0" : "opacity-100";

  return (
    <div
      data-part="grid"
      className="mt-14 grid grid-cols-[346px_minmax(0,1fr)_346px] max-lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)] max-md:grid-cols-1"
    >
      <StoryCard
        part="portrait"
        stories={stories}
        index={index}
        visible={visible}
        image={(s) => s.portrait}
        alt={(s) => `${s.name} — client portrait`}
        caption={story.name}
        pill={content.pill}
      />

      <Reveal data-part="quote" className="pt-76 text-center max-md:py-40">
        <div
          data-part="mark"
          aria-hidden
          className="text-[28px] leading-none font-bold text-brand italic"
        >
          “
        </div>
        <div aria-live="polite" aria-atomic="true" data-part="story">
          <blockquote
            className={cn(
              "mx-auto mt-14 min-h-105 max-w-440 text-[29px] leading-[1.22] tracking-[0.005em] text-ink-2",
              fadeClass,
              visible,
            )}
          >
            {story.quote}
          </blockquote>
          <p data-part="who" className="mt-22 text-[10.5px] font-medium tracking-[0.14em] text-ink">
            {story.name}
          </p>
          <p data-part="co" className="mt-6 text-[10.5px] tracking-[0.14em] text-[#555]">
            {story.company}
          </p>
        </div>
        <div
          data-part="controls"
          className="mt-22 flex items-center justify-center gap-14 max-lg:flex-wrap"
        >
          <ArrowButton direction={-1} onClick={() => step(-1)} />
          <ArrowButton direction={1} onClick={() => step(1)} />
          <ButtonLink
            href={content.cta.href}
            variant="outline"
            size="section"
            font="home"
            icon={null}
            className="ml-16 gap-14 border-[1.5px] border-[#ccc] px-30 text-ink [box-shadow:0_2px_6px_rgba(0,0,0,0.06)]"
          >
            {content.cta.label}
          </ButtonLink>
        </div>
      </Reveal>

      <StoryCard
        part="project"
        stories={stories}
        index={index}
        visible={visible}
        image={(s) => s.project}
        alt={(s) => s.company}
        caption={story.company}
        className="max-md:hidden"
        captionClassName="font-normal"
      />
    </div>
  );
}

function ArrowButton({ direction, onClick }: { direction: -1 | 1; onClick: () => void }) {
  return (
    <button
      type="button"
      data-q={direction}
      aria-label={direction < 0 ? "Previous story" : "Next story"}
      onClick={onClick}
      className="grid size-44 cursor-pointer place-items-center border border-[#ccc] transition-colors duration-200 hover:border-ink-2"
    >
      <svg width={9} height={9} viewBox="0 0 10 10" aria-hidden focusable={false}>
        <path
          d={direction < 0 ? "M6.5 1.5 3 5l3.5 3.5" : "M3.5 1.5 7 5 3.5 8.5"}
          fill="none"
          stroke="#111"
          strokeWidth={1.4}
        />
      </svg>
    </button>
  );
}

function StoryCard({
  part,
  stories,
  index,
  visible,
  image,
  alt,
  caption,
  pill,
  className,
  captionClassName,
}: {
  part: "portrait" | "project";
  stories: readonly ResolvedClientStory[];
  index: number;
  visible: string;
  image: (story: ResolvedClientStory) => ResolvedClientStory["portrait"];
  alt: (story: ResolvedClientStory) => string;
  caption: string;
  pill?: string;
  className?: string;
  captionClassName?: string;
}) {
  return (
    <figure
      data-part={part}
      className={cn(
        "relative h-432 overflow-hidden [box-shadow:0_18px_38px_rgba(0,0,0,0.22)] max-md:h-360",
        className,
      )}
    >
      {stories.map((story, i) => (
        <Image
          key={story.quote}
          src={image(story)}
          alt={alt(story)}
          aria-hidden={i !== index}
          fill
          sizes="(max-width: 860px) calc(100vw - 40px), (max-width: 1099px) 30vw, 25vw"
          className={cn(
            "object-cover object-center max-md:object-[50%_20%] max-xs:object-center",
            fadeClass,
            i === index ? visible : "opacity-0",
          )}
        />
      ))}
      {pill ? (
        <span
          data-part="pill"
          className="absolute top-18 left-18 rounded-[20px] border border-[rgba(255,255,255,0.4)] bg-[rgba(0,0,0,0.25)] px-11 py-5 text-[9px] font-medium tracking-[0.14em] text-white"
        >
          {pill}
        </span>
      ) : null}
      <figcaption
        data-part="name"
        className={cn(
          "absolute bottom-14 left-16 text-[11px] font-medium tracking-[0.06em] text-white",
          fadeClass,
          visible,
          captionClassName,
        )}
      >
        {caption}
      </figcaption>
    </figure>
  );
}
