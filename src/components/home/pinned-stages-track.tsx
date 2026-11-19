"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";

import { Container } from "@/components/ui/container";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { cn } from "@/lib/cn";
import { pinProgress, type ScrollRect } from "@/lib/motion";

import { PINNED_QUERY, SCROLLER_QUERY } from "./pinned-showcase-stage";
import {
  activeStage,
  defaultStageTravel,
  STAGE_START_X,
  stageIsDrawn,
  stageOffset,
  stageTravel,
} from "./showcase-math";

export type StageSlot = {
  readonly key: string;
  /** Server-rendered stage content (art, icon, title, text). */
  readonly content: ReactNode;
};

type StagesTrackProps = {
  readonly id: string;
  /** Kicker and title, server-rendered. */
  readonly header: ReactNode;
  readonly stages: readonly StageSlot[];
  /** Accessible name of the row (a scroller below 1100px). */
  readonly label: string;
};

/*
 * Three layouts, chosen in CSS so the server render is already right:
 * - pinned (≥1100, motion allowed): `lg:motion-safe:*`, the row slides left while the stage sticks;
 * - ≥1100 with reduced motion: a 4 + 3 grid, every stage visible (the original cut off stages 5–7
 *   in a hidden-scrollbar scroller, KI-L04);
 * - ≤1099: the original horizontal scroll-snap row, focusable and labelled (KI-A08), without the
 *   `cursor: grab` that promised a drag it never had (KI-L36).
 */

/** `Section tone="dark"` (it takes no ref, so the classes are repeated here) + `.stg` padding. */
const SECTION = cn(
  "relative overflow-hidden bg-surface py-120 text-fg",
  "lg:motion-safe:h-[calc(var(--svh)_+_var(--stg-travel)_*_1.25)] lg:motion-safe:overflow-visible lg:motion-safe:py-0",
);

const PIN = cn(
  "lg:motion-safe:sticky lg:motion-safe:top-0 lg:motion-safe:flex lg:motion-safe:h-(--svh) lg:motion-safe:flex-col lg:motion-safe:justify-center lg:motion-safe:overflow-hidden",
);

const ROW = cn(
  "mt-20 outline-offset-0",
  "max-lg:w-[calc(100%_+_86px)] max-lg:snap-x max-lg:snap-mandatory max-lg:[scrollbar-width:none] max-lg:overflow-x-auto max-lg:[&::-webkit-scrollbar]:hidden",
  "lg:motion-safe:w-full lg:motion-safe:[transform:translate3d(var(--stg-x),0,0)] lg:motion-safe:will-change-transform",
);

const LIST = cn(
  "relative grid grid-cols-[repeat(4,292px)] justify-between gap-y-64",
  "max-lg:flex max-lg:gap-96 max-md:gap-40",
  "lg:motion-safe:flex lg:motion-safe:gap-96",
);

/**
 * KI-L31: scale a title down until it fits its 292px column ("CONSTRUCTION" is 29px too wide at
 * 42px). The line box keeps its height, so the text below stays aligned with the other stages.
 */
function fitTitles(list: HTMLElement) {
  for (const title of list.querySelectorAll<HTMLElement>("[data-fit]")) {
    title.style.removeProperty("font-size");
    title.style.removeProperty("line-height");
    if (title.scrollWidth <= title.clientWidth) continue;
    const { fontSize, lineHeight } = getComputedStyle(title);
    const size = parseFloat(fontSize);
    const fitted = Math.floor(((size * title.clientWidth) / title.scrollWidth) * 2) / 2;
    title.style.lineHeight = lineHeight;
    title.style.fontSize = `${String(fitted)}px`;
  }
}

/**
 * Client part of the home "Seven stages" strip (`.stg`, E22/E23). Scroll frames write the row's
 * `--stg-x` and the measured `--stg-travel`; React re-renders only when the current stage changes.
 * See `pinned-stages.tsx` for the full contract.
 */
export function StagesTrack({ id, header, stages, label }: StagesTrackProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const initialTravel = defaultStageTravel(stages.length);
  const travelRef = useRef(initialTravel);
  const [active, setActive] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const pinned = useMediaQuery(PINNED_QUERY);
  const scroller = useMediaQuery(SCROLLER_QUERY);

  useScrollProgress(
    sectionRef,
    (rect: ScrollRect, viewportHeight: number) => {
      const section = sectionRef.current;
      const row = rowRef.current;
      const last = listRef.current?.lastElementChild;
      if (!section || !row || !(last instanceof HTMLElement)) return;

      // Travel in canvas px: offsets and clientWidth are canvas px, like the translate it feeds.
      const travel = stageTravel(last.offsetLeft + last.offsetWidth, row.clientWidth);
      if (travel !== travelRef.current) {
        travelRef.current = travel;
        section.style.setProperty("--stg-travel", `${String(travel)}px`);
      }

      const progress = pinProgress(rect, viewportHeight);
      row.style.setProperty("--stg-x", `${String(stageOffset(progress, travel))}px`);
      const current = activeStage(progress, stages.length);
      if (current !== active) setActive(current);
      if (current > furthest) setFurthest(current);
    },
    { enabled: pinned },
  );

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let frame = 0;
    const refit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        fitTitles(list);
      });
    };
    void document.fonts.ready.then(refit);
    window.addEventListener("resize", refit);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", refit);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id={id}
      data-tone="dark"
      data-stages=""
      className={SECTION}
      style={{ "--stg-travel": `${String(initialTravel)}px` } as CSSProperties}
    >
      <div className={PIN}>
        <Container>
          {header}
          <div
            ref={rowRef}
            role="region"
            aria-label={label}
            // A horizontal scroller must be focusable so keyboard users can scroll it (KI-A08, WCAG
            // 2.1.1, axe `scrollable-region-focusable`); it is only focusable while it scrolls.
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={scroller ? 0 : undefined}
            className={ROW}
            style={{ "--stg-x": `${String(STAGE_START_X)}px` } as CSSProperties}
          >
            <ol ref={listRef} className={LIST}>
              {stages.map((stage, index) => (
                <li
                  key={stage.key}
                  data-stage={index}
                  data-current={index === active ? "" : undefined}
                  data-on={stageIsDrawn(index, furthest) ? "" : undefined}
                  aria-current={pinned && index === active ? "step" : undefined}
                  className="w-292 flex-none snap-start"
                >
                  {stage.content}
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </div>
    </section>
  );
}
