"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { projectCountLabel, type ShowcaseFilter } from "@/content/home/works";
import type { ProjectCategory } from "@/content/projects";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { cn } from "@/lib/cn";
import { pinProgress, type ScrollRect } from "@/lib/motion";

import { cardPoseVars, coverFlowPose, showcaseHeight, showcasePosition } from "./showcase-math";

/** The pinned cover-flow runs on the desktop canvas only, and never with reduced motion. */
export const PINNED_QUERY = "(min-width: 1100px) and (prefers-reduced-motion: no-preference)";
/** Below 1100px the cards sit in a horizontal scroller. */
export const SCROLLER_QUERY = "(max-width: 1099px)";

export type ShowcaseCardSlot = {
  readonly slug: string;
  readonly categories: readonly ProjectCategory[];
  /** Server-rendered card content (image, shade, caption). */
  readonly content: ReactNode;
};

type ShowcaseStageProps = {
  readonly id: string;
  /** Kicker, title, lead and CTA (`.top`), server-rendered. */
  readonly header: ReactNode;
  readonly filters: readonly ShowcaseFilter[];
  readonly cards: readonly ShowcaseCardSlot[];
  /** Accessible name of the tab group. */
  readonly filtersLabel: string;
  /** Accessible name of the card track. */
  readonly trackLabel: string;
};

/*
 * Three layouts, chosen in CSS so the server render is already right:
 * - pinned (≥1100, motion allowed): the original cover-flow, `lg:motion-safe:*` classes below;
 * - ≥1100 with reduced motion: a static 3-column grid (the original stacked every card on top of
 *   each other here, KI-L02);
 * - ≤1099: the original horizontal scroll-snap track (`max-lg:*`), keyboard-focusable (KI-A08).
 */

/** `Section tone="light"` (it takes no ref, so the classes are repeated here) + `.wk` padding. */
const SECTION = cn(
  "relative overflow-hidden bg-surface pt-118 pb-80 text-fg",
  "lg:motion-safe:h-[calc(var(--svh)*var(--sc-screens))] lg:motion-safe:overflow-visible lg:motion-safe:py-0",
);

const PIN = cn(
  "relative",
  "lg:motion-safe:sticky lg:motion-safe:top-0 lg:motion-safe:flex lg:motion-safe:h-(--svh) lg:motion-safe:flex-col lg:motion-safe:justify-center lg:motion-safe:overflow-hidden lg:motion-safe:pt-56",
);

const TRACK = cn(
  "mx-86 mt-24 grid grid-cols-3 gap-24 outline-offset-0",
  "max-lg:mx-0 max-lg:flex max-lg:snap-x max-lg:snap-mandatory max-lg:gap-16 max-lg:overflow-x-auto max-lg:px-20",
  "lg:motion-safe:relative lg:motion-safe:mx-0 lg:motion-safe:block lg:motion-safe:h-430",
);

const CARD = cn(
  "relative aspect-[568/426] overflow-hidden bg-ink-2",
  // `.sc-card::after`: bottom gradient under the caption.
  "after:absolute after:inset-0 after:bg-[linear-gradient(180deg,rgba(0,0,0,0)_35%,rgba(0,0,0,.72)_100%)] after:content-['']",
  "max-lg:aspect-auto max-lg:h-380 max-lg:w-[82vw] max-lg:flex-none max-lg:snap-center",
  "lg:motion-safe:absolute lg:motion-safe:top-0 lg:motion-safe:left-1/2 lg:motion-safe:-ml-284 lg:motion-safe:aspect-auto lg:motion-safe:h-426 lg:motion-safe:w-568",
  "lg:motion-safe:z-(--sc-z) lg:motion-safe:[transform:translate3d(var(--sc-x),var(--sc-y),0)_scale(var(--sc-s))] lg:motion-safe:will-change-transform",
  "[transition:box-shadow_.3s] lg:motion-safe:data-centred:[box-shadow:var(--shadow-card-active)]",
);

const TAB = cn(
  "flex h-35 cursor-pointer items-center border border-[#cfccc6] bg-white px-19 font-display text-[11.5px] font-medium tracking-[0.16em] text-ink-2 uppercase hover:border-ink-2 max-md:flex-none",
  "aria-pressed:border-brand-fill aria-pressed:bg-brand-fill aria-pressed:px-20 aria-pressed:text-white",
);

/**
 * Client part of the home "Selected Works" showcase (`.wk.pinsec`, E20/E21): filter tabs, the live
 * count and the cover-flow track. Scroll frames write each card's pose as CSS custom properties
 * (`--sc-x`, `--sc-y`, `--sc-s`, `--sh`, `--sc-z`) and toggle `data-centred`; React only re-renders
 * when the filter changes. See `pinned-showcase.tsx` for the full contract.
 */
export function ShowcaseStage({
  id,
  header,
  filters,
  cards,
  filtersLabel,
  trackLabel,
}: ShowcaseStageProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<ProjectCategory | "all">("all");
  const pinned = useMediaQuery(PINNED_QUERY);
  const scroller = useMediaQuery(SCROLLER_QUERY);

  const visible = cards.filter((card) => filter === "all" || card.categories.includes(filter));

  /** Writes the pose of every visible card for the current scroll position (`showTick`). */
  const paint = (rect: ScrollRect, viewportHeight: number) => {
    const track = trackRef.current;
    if (!track) return;
    // Like the original, skip frames while the section is off screen.
    if (rect.top + rect.height < -50 || rect.top > viewportHeight + 50) return;
    const items = [...track.querySelectorAll<HTMLElement>("[data-card]")];
    const position = showcasePosition(pinProgress(rect, viewportHeight), items.length);
    items.forEach((item, index) => {
      const pose = coverFlowPose(index, position);
      for (const [name, value] of Object.entries(cardPoseVars(pose))) {
        item.style.setProperty(name, value);
      }
      item.toggleAttribute("data-centred", pose.centred);
    });
  };

  useScrollProgress(sectionRef, paint, { enabled: pinned });

  // Off-screen cover-flow cards are clipped, so native lazy loading would only fetch each image as
  // it slides in. Load them all once the section is near, as the original's KATIC_LOADIMG did.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        section.querySelectorAll<HTMLImageElement>("img[loading=lazy]").forEach((img) => {
          img.loading = "eager";
        });
        observer.disconnect();
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const select = (next: ProjectCategory | "all") => {
    // Commit the new card list (and section height) first, then jump to the section start and
    // repaint, as the original did after replacing the track's children.
    flushSync(() => setFilter(next));
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    track.scrollLeft = 0;
    const top = section.getBoundingClientRect().top + window.scrollY;
    if (Math.abs(window.scrollY - top) > 4) window.scrollTo({ top, behavior: "instant" });
    if (pinned) {
      const rect = section.getBoundingClientRect();
      paint({ top: rect.top, height: rect.height }, window.innerHeight);
    }
  };

  return (
    <section
      ref={sectionRef}
      id={id}
      data-tone="light"
      data-showcase=""
      className={SECTION}
      style={{ "--sc-screens": showcaseHeight(1, visible.length) } as CSSProperties}
    >
      <div className={PIN}>
        <Container>
          {header}
          <Reveal className="mt-34">
            <div role="group" aria-label={filtersLabel} className="flex gap-10 max-lg:flex-wrap">
              {filters.map((tab) => (
                <button
                  key={tab.category}
                  type="button"
                  aria-pressed={tab.category === filter}
                  onClick={() => {
                    select(tab.category);
                  }}
                  className={TAB}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </Reveal>
          <p role="status" data-showcase-count="" className="sr-only">
            {projectCountLabel(visible.length)}
          </p>
        </Container>
        <div
          ref={trackRef}
          role="region"
          aria-label={trackLabel}
          // A horizontal scroller must be focusable so keyboard users can scroll it (KI-A08, WCAG
          // 2.1.1, axe `scrollable-region-focusable`); it is only focusable while it scrolls.
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={scroller ? 0 : undefined}
          className={TRACK}
        >
          {visible.map((card, index) => {
            const pose = coverFlowPose(index, 0);
            return (
              <article
                key={card.slug}
                data-card={card.slug}
                data-centred={pose.centred ? "" : undefined}
                style={cardPoseVars(pose)}
                className={CARD}
              >
                {card.content}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
