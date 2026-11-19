"use client";

import "./divisions-carousel.css";

import Image from "next/image";
import Link from "next/link";
import {
  type CSSProperties,
  type KeyboardEvent,
  type TouchEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { ArrowIcon } from "@/components/icons/arrow-icon";
import { canvasSizes } from "@/components/sections/section-media";
import { AutoplayToggle } from "@/components/ui/autoplay-toggle";
import type { DivisionSlide } from "@/content/home/divisions";
import { media } from "@/content/media";
import { useAutoplay } from "@/hooks/use-autoplay";
import { cn } from "@/lib/cn";
import { swipeStep, wrapIndex } from "@/lib/motion";
import type { DivisionSlug } from "@/lib/routes";

/** E28: one division every 5s while ≥35% of the carousel is visible. */
export const CAROUSEL_INTERVAL_MS = 5000;
export const CAROUSEL_VISIBLE_THRESHOLD = 0.35;

/** The division icons of the original tag (`.dvx-k b.nico`), 24×24 strokes. */
const ICONS: Record<DivisionSlug, readonly string[]> = {
  design: ["M3 21h18M5 21V9l7-5 7 5v12", "M9 21v-6h6v6M9 11h.01M15 11h.01"],
  interior: [
    "M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3",
    "M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2z",
    "M5 18v2M19 18v2",
  ],
  infrastructure: ["M6 21V4l12 3H6M6 7l6-3", "M15 7v5M13 12h4v3h-4zM3 21h8"],
  developers: ["M3 11 12 4l9 7", "M5 10v10h14V10M10 20v-5h4v5"],
  care: ["M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z", "m9 12 2 2 4-4"],
};

/** Headline lines rise one after another (.07s stagger), only when their slide comes in. */
const LINE_DELAYS = [
  "",
  "group-data-active/slide:delay-70",
  "group-data-active/slide:delay-140",
] as const;

type DivisionsCarouselBodyProps = {
  readonly slides: readonly DivisionSlide[];
  /** Accessible name of the carousel. */
  readonly label: string;
  readonly exploreLabel: string;
};

/**
 * Interactive part of `DivisionsCarousel`: cross-fading photos beside a white card of stacked
 * slides with prev/next, a 5s progress bar and a pause control.
 *
 * Accessibility (KI-A05, KI-A01): the row is a labelled carousel region; slides are labelled
 * groups ("2 of 5"), hidden ones `inert`; a polite live region names the new slide after visitor
 * navigation (silent while rotating); ←/→ anywhere in the carousel and horizontal swipes (>45px)
 * change slides. Hover, focus inside, a hidden tab or the pause control hold the rotation; reduced
 * motion turns it off.
 */
export function DivisionsCarouselBody({ slides, label, exploreLabel }: DivisionsCarouselBodyProps) {
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const touchX = useRef<number | null>(null);
  const restoreFocus = useRef(false);
  const [index, setIndex] = useState(0);
  const count = slides.length;

  const autoplay = useAutoplay({
    ref: rootRef,
    threshold: CAROUSEL_VISIBLE_THRESHOLD,
    interval: CAROUSEL_INTERVAL_MS,
    index,
    onAdvance: () => setIndex((current) => wrapIndex(current, 1, count)),
  });

  function go(step: number) {
    // Focus inside the outgoing slide would be lost once it turns inert: move it along.
    restoreFocus.current = slideRefs.current[index]?.contains(document.activeElement) ?? false;
    setIndex(wrapIndex(index, step, count));
  }

  useEffect(() => {
    if (!restoreFocus.current) return;
    restoreFocus.current = false;
    slideRefs.current[index]?.querySelector<HTMLElement>("a")?.focus();
  }, [index]);

  function onKeyDown(event: KeyboardEvent) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    go(event.key === "ArrowRight" ? 1 : -1);
  }

  function onTouchStart(event: TouchEvent) {
    touchX.current = event.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(event: TouchEvent) {
    const start = touchX.current;
    touchX.current = null;
    const end = event.changedTouches[0]?.clientX;
    if (start === null || end === undefined) return;
    const step = swipeStep(end - start);
    if (step !== 0) go(step);
  }

  const slidesId = `${baseId}-slides`;
  const current = slides[index];
  const announce = current ? `${current.name}, ${String(index + 1)} of ${String(count)}` : "";

  return (
    // The carousel region takes ←/→ from whatever control inside it has focus (APG carousel).
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      data-part="row"
      {...autoplay.rootProps}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="mt-36 grid h-560 grid-cols-2 gap-12 max-md:mt-28 max-md:h-auto max-md:grid-cols-1 max-md:gap-10 lg:h-auto lg:min-h-480 lg:flex-1"
    >
      <div
        data-part="media"
        className="relative overflow-hidden bg-[#2a2622] max-md:aspect-[4/3.2]"
      >
        {slides.map((slide, i) => (
          <Image
            key={slide.slug}
            src={media[slide.image].image}
            alt={slide.name}
            aria-hidden={i !== index}
            fill
            sizes={canvasSizes(628, "calc(50vw - 42px)", "calc(100vw - 40px)")}
            data-active={i === index || undefined}
            className="[transform:scale(1.06)] object-cover opacity-0 [transition:opacity_1s_ease,transform_1.8s_var(--ease-out-k)] data-active:[transform:scale(1)] data-active:opacity-100"
          />
        ))}
      </div>

      <div
        data-part="card"
        className="relative grid overflow-hidden border border-[#e3e3e3] bg-white max-xs:min-h-[clamp(440px,118vw,540px)]"
      >
        <div id={slidesId} className="contents">
          {slides.map((slide, i) => (
            <Slide
              key={slide.slug}
              ref={(element) => {
                slideRefs.current[i] = element;
              }}
              slide={slide}
              position={i + 1}
              count={count}
              active={i === index}
              exploreLabel={exploreLabel}
            />
          ))}
        </div>

        <div
          data-part="nav"
          className="absolute bottom-48 left-44 z-2 flex items-center max-md:bottom-34 max-md:left-24"
        >
          <div className="relative flex items-center">
            <NavButton direction="prev" controls={slidesId} onClick={() => go(-1)} />
            <NavButton direction="next" controls={slidesId} onClick={() => go(1)} />
            <i
              data-part="bar"
              aria-hidden
              className="absolute inset-x-4 -bottom-16 h-2 overflow-hidden rounded-[2px] bg-[#ece9e3]"
            >
              <b
                key={`${String(index)}-${String(autoplay.cycle)}`}
                className="home-dvx-bar"
                data-run={autoplay.phase !== "off" || undefined}
                data-hold={autoplay.phase === "held" || undefined}
                style={{ "--interval": `${String(CAROUSEL_INTERVAL_MS)}ms` } as CSSProperties}
              />
            </i>
          </div>
          <AutoplayToggle
            paused={autoplay.paused}
            onToggle={autoplay.togglePaused}
            subject="divisions slideshow"
            className="ml-14 border-[#1d1d1b]/40 text-[#1d1d1b] hover:border-[#1d1d1b] hover:bg-[#1d1d1b] hover:text-white"
          />
        </div>

        <p
          className="sr-only"
          aria-live={autoplay.phase === "running" ? "off" : "polite"}
          aria-atomic="true"
          data-part="live"
        >
          {announce}
        </p>
      </div>
    </div>
  );
}

function NavButton({
  direction,
  controls,
  onClick,
}: {
  direction: "prev" | "next";
  controls: string;
  onClick: () => void;
}) {
  const prev = direction === "prev";
  return (
    <button
      type="button"
      aria-label={prev ? "Previous division" : "Next division"}
      aria-controls={controls}
      onClick={onClick}
      className={
        prev
          ? "group/nav relative z-1 grid size-62 cursor-pointer place-items-center rounded-[50%] border border-[#1d1d1b] bg-white text-[#1d1d1b] transition-[background-color,color,border-color] duration-300 hover:bg-[#1d1d1b] hover:text-white max-md:size-58"
          : "group/nav relative ml-10 grid size-62 cursor-pointer place-items-center rounded-[50%] border border-[#1d1d1b] bg-white text-[#1d1d1b] transition-[background-color,color,border-color] duration-300 hover:bg-[#1d1d1b] hover:text-white max-md:size-58"
      }
    >
      <svg
        viewBox="0 0 16 16"
        width={16}
        height={16}
        aria-hidden
        focusable={false}
        className={
          prev
            ? "transition-transform duration-250 group-hover/nav:[transform:translateX(-2px)]"
            : "transition-transform duration-250 group-hover/nav:[transform:translateX(2px)]"
        }
      >
        <path
          d={prev ? "M10 3 5 8l5 5" : "m6 3 5 5-5 5"}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        />
      </svg>
    </button>
  );
}

function Slide({
  ref,
  slide,
  position,
  count,
  active,
  exploreLabel,
}: {
  ref: (element: HTMLDivElement | null) => void;
  slide: DivisionSlide;
  position: number;
  count: number;
  active: boolean;
  exploreLabel: string;
}) {
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      aria-label={`${String(position)} of ${String(count)}`}
      inert={!active}
      data-active={active || undefined}
      className="group/slide pointer-events-none flex min-w-0 flex-col px-44 py-40 [grid-area:1/1] data-active:pointer-events-auto max-lg:pb-138 max-md:px-24 max-md:pt-30 max-md:pb-128"
    >
      <p
        data-part="tag"
        className="inline-flex [transform:translateX(-10px)] items-stretch self-start bg-[#111] text-[17px] font-semibold tracking-[0.1em] text-white uppercase opacity-0 [transition:opacity_0.5s_ease,transform_0.6s_var(--ease-out-k)] group-data-active/slide:[transform:none] group-data-active/slide:opacity-100 max-md:text-[14px]"
      >
        <span aria-hidden className="grid place-items-center bg-brand px-13">
          <svg
            viewBox="0 0 24 24"
            width={22}
            height={22}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            focusable={false}
          >
            {ICONS[slide.slug].map((d) => (
              <path key={d} d={d} />
            ))}
          </svg>
        </span>
        <span className="pt-12 pr-16 pb-11 pl-16 max-md:pt-10 max-md:pr-13 max-md:pb-9 max-md:pl-13">
          {slide.name}
        </span>
      </p>
      <h3 className="mt-22 text-[42px] leading-[1.05] font-medium tracking-normal text-[#1d1d1b] uppercase max-lg:text-[36px] max-md:mt-18 max-md:text-[30px]">
        {slide.titleLines.map((line, i) => (
          <span key={line} className="-mb-[0.08em] block overflow-hidden pb-[0.08em]">
            <span
              className={cn(
                "block [transform:translateY(105%)] transition-transform duration-900 ease-out-k group-data-active/slide:[transform:none]",
                LINE_DELAYS[i],
              )}
            >
              {line}
            </span>
          </span>
        ))}
      </h3>
      <div
        data-part="ft"
        className="mt-auto ml-auto max-w-340 [transform:translateY(12px)] opacity-0 [transition:opacity_0.5s_ease,transform_0.7s_var(--ease-out-k)] group-data-active/slide:[transform:none] group-data-active/slide:opacity-100 group-data-active/slide:delay-250 max-lg:ml-0 max-lg:max-w-300 max-md:max-w-none"
      >
        <p className="text-[14.5px] leading-[1.7] text-[#444]">{slide.description}</p>
        <Link
          href={slide.href}
          className="mt-16 inline-flex items-center gap-10 border-b border-[#1d1d1b] pb-4 text-[11.5px] font-medium tracking-[0.14em] text-[#1d1d1b] uppercase transition-[color,border-color] duration-300 hover:border-brand hover:text-kicker"
        >
          {exploreLabel}
          <ArrowIcon direction="up-right" width={10} height={10} className="flex-none" />
        </Link>
      </div>
    </div>
  );
}
