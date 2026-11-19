import type { SVGProps } from "react";

type PlayPauseIconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  /** Shows the pause glyph while playing, the play glyph while paused. */
  readonly playing: boolean;
  readonly size?: number;
};

/** Pause (two bars) / play (triangle) glyph for the hero video and logo marquee controls. */
export function PlayPauseIcon({ playing, size = 10, ...props }: PlayPauseIconProps) {
  return (
    <svg
      viewBox="0 0 10 10"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden
      focusable={false}
      {...props}
    >
      {playing ? <path d="M1.5 1h2.4v8H1.5zM6.1 1h2.4v8H6.1z" /> : <path d="M2 1v8l7-4z" />}
    </svg>
  );
}
