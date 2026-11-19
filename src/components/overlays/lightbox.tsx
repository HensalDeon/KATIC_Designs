"use client";

import Image from "next/image";
import {
  type ComponentPropsWithoutRef,
  createContext,
  type ReactNode,
  use,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/cn";
import type { ImageSource } from "@/lib/media/types";

type LightboxItem = {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly caption?: string;
};

const LightboxContext = createContext<((trigger: HTMLElement) => void) | null>(null);

/** Reads the gallery a trigger belongs to from the DOM, in document order. */
function collectGroup(trigger: HTMLElement): { items: LightboxItem[]; index: number } {
  const group = trigger.dataset["lightboxGroup"];
  const triggers = group
    ? [...document.querySelectorAll<HTMLElement>(`[data-lightbox-group="${CSS.escape(group)}"]`)]
    : [trigger];
  const items = triggers.map((element) => {
    const {
      lightboxSrc = "",
      lightboxWidth,
      lightboxHeight,
      lightboxAlt = "",
      lightboxCaption,
    } = element.dataset;
    return {
      src: lightboxSrc,
      width: Number(lightboxWidth),
      height: Number(lightboxHeight),
      alt: lightboxAlt,
      ...(lightboxCaption ? { caption: lightboxCaption } : {}),
    };
  });
  return { items, index: Math.max(0, triggers.indexOf(trigger)) };
}

/**
 * Full-screen image viewer (`.klb`), rendered outside the zoomed canvas. Adds what the original
 * lacked (KI-F16, KI-A02): keyboard-operable triggers, gallery navigation, captions, scroll lock
 * and dialog semantics.
 */
export function LightboxProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<LightboxItem[]>([]);
  const [index, setIndex] = useState(0);
  const current = items[index];
  const label = current && current.alt !== "" ? current.alt : "Image viewer";
  const showCaption = current?.caption !== undefined || items.length > 1;

  const open = (trigger: HTMLElement) => {
    const gallery = collectGroup(trigger);
    setItems(gallery.items);
    setIndex(gallery.index);
  };
  const close = () => setItems([]);
  const step = (delta: number) => setIndex((i) => (i + delta + items.length) % items.length);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (items.length > 0 && !dialog.open) dialog.showModal();
    if (items.length === 0 && dialog.open) dialog.close();
  }, [items.length]);

  useEffect(() => {
    if (items.length < 2) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") setIndex((i) => (i + 1) % items.length);
      if (event.key === "ArrowLeft") setIndex((i) => (i - 1 + items.length) % items.length);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [items.length]);

  const navButton =
    "absolute top-1/2 z-1 grid size-48 -translate-y-1/2 place-items-center border border-white/30 text-white transition-colors hover:border-white max-md:size-40";

  return (
    <LightboxContext value={open}>
      {children}
      <dialog
        ref={dialogRef}
        aria-label={label}
        data-lock-scroll
        onClose={close}
        className="fixed inset-0 m-0 size-full max-h-none max-w-none items-center justify-center border-0 bg-[rgba(0,0,0,0.92)] p-0 backdrop:bg-transparent open:flex"
      >
        {/* Clicking anywhere outside the controls closes the viewer, as in the original. */}
        <button
          type="button"
          aria-label="Close image viewer"
          onClick={close}
          className="absolute inset-0 cursor-zoom-out"
        />
        {current ? (
          <figure className="pointer-events-none relative grid justify-items-center gap-14">
            <Image
              key={current.src}
              src={current.src}
              width={current.width}
              height={current.height}
              alt={current.alt}
              sizes="90vw"
              className="h-auto max-h-[86vh] w-auto max-w-[90vw] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            />
            {showCaption ? (
              <figcaption className="font-sans text-[13px] text-white/80">
                {current.caption}
                {items.length > 1 ? (
                  <span className="ml-12 text-white/50">
                    {index + 1} / {items.length}
                  </span>
                ) : null}
              </figcaption>
            ) : null}
          </figure>
        ) : null}
        {items.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => step(-1)}
              className={cn(navButton, "left-26 max-md:left-12")}
            >
              <Chevron direction="left" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => step(1)}
              className={cn(navButton, "right-26 max-md:right-12")}
            >
              <Chevron direction="right" />
            </button>
          </>
        ) : null}
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="absolute top-22 right-26 z-1 size-48 border border-white/30 text-[22px] text-white max-md:top-12 max-md:right-12"
        >
          ×
        </button>
      </dialog>
    </LightboxContext>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden focusable={false}>
      <path
        d={direction === "left" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
      />
    </svg>
  );
}

type ZoomableImageProps = Omit<ComponentPropsWithoutRef<typeof Image>, "src" | "alt"> & {
  image: ImageSource;
  alt: string;
  /** Images sharing a group can be browsed with previous/next. */
  group?: string;
  caption?: string;
  buttonClassName?: string;
  /**
   * Custom image rendering inside the trigger (e.g. a `ParallaxImage` that is also zoomable). When
   * given, it replaces the default `Image`; the lightbox still opens `image`.
   */
  children?: ReactNode;
};

/** An image that opens the lightbox (`img[data-zoom]` in the original), operable by keyboard. */
export function ZoomableImage({
  image,
  alt,
  group,
  caption,
  buttonClassName,
  children,
  ...imageProps
}: ZoomableImageProps) {
  const open = use(LightboxContext);
  if (!open) throw new Error("ZoomableImage must be used inside <LightboxProvider>");

  return (
    <button
      type="button"
      aria-label={`Enlarge image: ${alt}`}
      onClick={(event) => open(event.currentTarget)}
      data-lightbox-group={group}
      data-lightbox-src={image.src}
      data-lightbox-width={image.width}
      data-lightbox-height={image.height}
      data-lightbox-alt={alt}
      data-lightbox-caption={caption}
      className={cn("block cursor-zoom-in", buttonClassName)}
    >
      {children ?? <Image src={image} alt={alt} {...imageProps} />}
    </button>
  );
}
