"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

import { useInView } from "@/hooks/use-in-view";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

import { HERO_MOBILE_QUERY } from "./hero-media";
import { PlayPauseIcon } from "./play-pause-icon";

type HeroVideoProps = {
  readonly desktopSrc: string;
  readonly mobileSrc: string;
  readonly pauseLabel?: string;
  readonly playLabel?: string;
};

const noSubscription = () => () => undefined;

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

/** Events that count as a user gesture for retrying a blocked autoplay (original JS 5070). */
const UNLOCK_EVENTS = ["pointerdown", "touchstart", "scroll"] as const;

/**
 * Background video of the home hero (`video.hv`, E33), layered over the server-rendered poster.
 *
 * - Plays the landscape or portrait cut by `HERO_MOBILE_QUERY`, switching live.
 * - Muted, looping, inline, `preload="metadata"`. The source is attached only after hydration
 *   and only once playback is wanted, so reduced-motion visitors download nothing and see the
 *   poster (KI-S05).
 * - Pauses while off screen, while the tab is hidden and when the page is hidden by navigation
 *   (Activity), and resumes afterwards.
 * - A visible pause/play button controls it (WCAG 2.2.2, KI-A01). Under reduced motion it starts
 *   paused and the button offers to play it.
 */
export function HeroVideo({
  desktopSrc,
  mobileSrc,
  pauseLabel = "Pause background video",
  playLabel = "Play background video",
}: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hydrated = useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
  const mobile = useMediaQuery(HERO_MOBILE_QUERY);
  const reduced = useReducedMotion();
  const pageVisible = useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "visible",
    () => true,
  );
  const onScreen = useInView(videoRef, { once: false });

  /** The visitor's explicit choice; `null` until they press the button. */
  const [choice, setChoice] = useState<"play" | "pause" | null>(null);
  const wantsPlay = choice === null ? !reduced : choice === "play";

  // Attach the source the first time playback is wanted, then keep it (pausing must not reset it).
  const [armed, setArmed] = useState(false);
  if (hydrated && wantsPlay && !armed) setArmed(true);

  const cut = mobile ? "mobile" : "desktop";
  const src = armed ? (mobile ? mobileSrc : desktopSrc) : undefined;
  const shouldPlay = wantsPlay && onScreen && pageVisible;

  // Layout effect: its cleanup runs synchronously when Next hides the page with <Activity>, so the
  // video stops instead of playing on in the hidden DOM.
  useLayoutEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    if (!shouldPlay) {
      video.pause();
      return;
    }
    const unlock = new AbortController();
    const play = () => {
      video.muted = true;
      video.play().catch(() => {
        // Autoplay was refused (e.g. power saving): retry on the first user gesture.
        for (const type of UNLOCK_EVENTS) {
          window.addEventListener(type, play, {
            once: true,
            passive: true,
            signal: unlock.signal,
          });
        }
      });
    };
    play();
    return () => {
      unlock.abort();
      video.pause();
    };
  }, [shouldPlay, src]);

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden
        tabIndex={-1}
        data-cut={cut}
        data-state={src && shouldPlay ? "playing" : "paused"}
        data-testid="hero-video"
        className="absolute inset-0 size-full object-cover"
      />
      <button
        type="button"
        aria-label={wantsPlay ? pauseLabel : playLabel}
        onClick={() => setChoice(wantsPlay ? "pause" : "play")}
        data-testid="hero-video-toggle"
        className="absolute right-86 bottom-70 z-3 grid size-40 place-items-center rounded-full border border-[rgba(255,255,255,0.45)] bg-[rgba(0,0,0,0.25)] text-white transition-[background-color,border-color] duration-200 hover:border-white hover:bg-[rgba(0,0,0,0.45)] max-lg:right-36 max-md:top-86 max-md:right-20 max-md:bottom-auto"
      >
        <PlayPauseIcon playing={wantsPlay} />
      </button>
    </>
  );
}
