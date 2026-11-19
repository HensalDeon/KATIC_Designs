"use client";

import "./logo-marquee.css";

import Image from "next/image";
import { type CSSProperties, useState } from "react";

import { Reveal } from "@/components/motion/reveal";
import { Kicker } from "@/components/ui/kicker";
import type { Partner } from "@/content/home/about";
import { cn } from "@/lib/cn";
import { fixedCanvasSizes } from "@/lib/media/sizes";
import type { WithImages } from "@/lib/media/types";

import { PlayPauseIcon } from "./play-pause-icon";

/** A partner with its logo resolved on the server, so this island does not import the media manifest. */
export type ResolvedPartner = WithImages<Partner, "logo">;

type LogoMarqueeProps = {
  /** Kicker above the strip (`.kick.pk`), e.g. "General Partners". */
  readonly heading: string;
  readonly logos: readonly ResolvedPartner[];
  /** Seconds for the strip to travel one logo set (original 18s); the animation spans two sets. */
  readonly durationS?: number;
  readonly className?: string;
};

/**
 * Copies of the logo set in the track. The animation moves it by −50% (two sets), so the loop is
 * seamless while the visible strip is at most two sets wide (1328px: the full-width strip at
 * 1024 is 952px). Only the first copy is exposed to assistive tech.
 */
const COPIES = 4;

/** One copy of the logo set; clones carry empty alts and are hidden from AT. */
function LogoSet({
  logos,
  clone,
}: {
  readonly logos: readonly ResolvedPartner[];
  readonly clone: boolean;
}) {
  return (
    <ul className="flex flex-none" aria-hidden={clone || undefined}>
      {logos.map((partner) => (
        <li key={partner.name} className="mr-16 flex-none">
          <Image
            src={partner.logo}
            alt={clone ? "" : partner.name}
            sizes={fixedCanvasSizes(150)}
            className="h-72 w-150 border border-[#eee] object-cover"
          />
        </li>
      ))}
    </ul>
  );
}

/**
 * Partner logos scrolling right to left (`.ab .logos`, E19): 150×72 tiles, one loop every 18s,
 * paused on hover and by the pause button next to the heading (WCAG 2.2.2, KI-A01). Static under
 * reduced motion. The duplicate sets carry empty alts and `aria-hidden` (KI-A13). The heading row
 * and the strip reveal on scroll like the original's `.pk` and `.logos`.
 */
export function LogoMarquee({ heading, logos, durationS = 18, className }: LogoMarqueeProps) {
  const [paused, setPaused] = useState(false);

  return (
    <div className={className}>
      <Reveal className="mt-22 flex w-604 items-center justify-between max-lg:w-full">
        <Kicker font="home">{heading}</Kicker>
        <button
          type="button"
          aria-label={paused ? "Play partner logos" : "Pause partner logos"}
          onClick={() => setPaused((value) => !value)}
          data-testid="marquee-toggle"
          className={cn(
            "logo-marquee-toggle",
            "-my-4 grid size-24 flex-none place-items-center rounded-full border border-line text-ink-2 transition-colors duration-200 hover:border-ink-2",
          )}
        >
          <PlayPauseIcon playing={!paused} size={8} />
        </button>
      </Reveal>
      <Reveal className="logo-marquee-viewport mt-12 h-72 w-604 overflow-hidden max-lg:w-full">
        <div
          data-testid="marquee-track"
          data-paused={paused || undefined}
          style={{ "--marquee-duration": `${durationS * (COPIES / 2)}s` } as CSSProperties}
          className="logo-marquee-track flex w-max"
        >
          {Array.from({ length: COPIES }, (_, copy) => (
            <LogoSet key={copy} logos={logos} clone={copy > 0} />
          ))}
        </div>
      </Reveal>
    </div>
  );
}
