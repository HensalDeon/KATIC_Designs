"use client";

import { cn } from "@/lib/cn";

import { AUTOPLAY_CONTROL_ATTR } from "./services-explorer-autoplay";

type AutoplayToggleProps = {
  readonly paused: boolean;
  readonly onToggle: () => void;
  /** What rotates, e.g. "services slideshow" ("Pause services slideshow"). */
  readonly subject: string;
  readonly className?: string;
};

/**
 * Pause / play control for auto-advancing content (WCAG 2.2.2, KI-A01). Not in the original.
 * Hidden under reduced motion, where nothing auto-advances. Colours come from `className`.
 */
export function AutoplayToggle({ paused, onToggle, subject, className }: AutoplayToggleProps) {
  return (
    <button
      type="button"
      {...{ [AUTOPLAY_CONTROL_ATTR]: "" }}
      aria-label={`${paused ? "Play" : "Pause"} ${subject}`}
      onClick={onToggle}
      className={cn(
        "grid size-32 cursor-pointer place-items-center rounded-[50%] border transition-[background-color,color,border-color] duration-300 motion-reduce:hidden",
        className,
      )}
    >
      <svg viewBox="0 0 10 10" width={10} height={10} aria-hidden focusable={false}>
        {paused ? (
          <path d="M2.5 1.5v7l6-3.5z" fill="currentColor" />
        ) : (
          <path d="M2.5 1.5v7M7.5 1.5v7" stroke="currentColor" strokeWidth={1.6} />
        )}
      </svg>
    </button>
  );
}
