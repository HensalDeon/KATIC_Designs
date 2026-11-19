"use client";

import "./services-explorer.css";

import Image from "next/image";
import Link from "next/link";
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useId,
  useRef,
  useState,
} from "react";

import { ArrowIcon } from "@/components/icons/arrow-icon";
import { canvasSizes } from "@/components/sections/section-media";
import { StartProjectTrigger } from "@/components/shell/start-project-trigger";
import { AutoplayToggle } from "@/components/ui/autoplay-toggle";
import type { ExplorerContent, ExplorerGroup, ExplorerService } from "@/content/home/explorer";
import { media } from "@/content/media";
import { useAutoplay } from "@/hooks/use-autoplay";
import { cn } from "@/lib/cn";
import { wrapIndex } from "@/lib/motion";
import { routes } from "@/lib/routes";

/** E27: one service every 6s while ≥30% of the section is visible. */
export const EXPLORER_INTERVAL_MS = 6000;
export const EXPLORER_VISIBLE_THRESHOLD = 0.3;

const GROUPS: readonly ExplorerGroup[] = ["Design", "Construction"];

type ServicesExplorerBodyProps = {
  readonly content: ExplorerContent;
  /** Kicker, title and lead (server-rendered). */
  readonly header: ReactNode;
};

/** Square bullet (`.sq`). */
function Square({ className }: { className?: string }) {
  return <span data-part="sq" aria-hidden className={cn("size-10 flex-none", className)} />;
}

const linkClass =
  "group/link flex w-max cursor-pointer items-center gap-12 border-b border-white pb-8 text-[13px] font-medium tracking-[0.12em] text-white uppercase transition-[color,border-color] duration-250 hover:border-brand hover:text-brand";
const linkSquareClass = "bg-white transition-colors duration-250 group-hover/link:bg-brand";

/**
 * Interactive part of `ServicesExplorer`: the grouped tab list on the left, the cross-fading
 * photos, progress bar and captions on the right.
 *
 * Semantics (KI-A06): each group is a `tablist` labelled by its heading; the seven tabs form one
 * roving-tabindex widget (arrow keys, Home and End move across both groups and select). Captions
 * are `tabpanel`s; hidden ones are `inert`. Hovering a tab selects it on the canvas (>860px, mouse),
 * as in the original. Auto-advance pauses on hover, focus, hidden tab and the pause control
 * (KI-A01), and never runs under reduced motion.
 */
export function ServicesExplorerBody({ content, header }: ServicesExplorerBodyProps) {
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [index, setIndex] = useState(0);
  const { services } = content;
  const count = services.length;

  const autoplay = useAutoplay({
    ref: rootRef,
    threshold: EXPLORER_VISIBLE_THRESHOLD,
    interval: EXPLORER_INTERVAL_MS,
    index,
    onAdvance: () => setIndex((current) => wrapIndex(current, 1, count)),
  });

  const tabId = (i: number) => `${baseId}-tab-${String(i)}`;
  const panelId = (i: number) => `${baseId}-panel-${String(i)}`;
  const groupId = (group: ExplorerGroup) => `${baseId}-group-${group}`;

  function focusTab(next: number) {
    setIndex(next);
    tabRefs.current[next]?.focus();
  }

  function onTabKeyDown(event: KeyboardEvent, i: number) {
    const keys: Record<string, number> = {
      ArrowDown: wrapIndex(i, 1, count),
      ArrowRight: wrapIndex(i, 1, count),
      ArrowUp: wrapIndex(i, -1, count),
      ArrowLeft: wrapIndex(i, -1, count),
      Home: 0,
      End: count - 1,
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    focusTab(next);
  }

  function onTabPointerEnter(event: PointerEvent, i: number) {
    if (event.pointerType === "mouse" && window.matchMedia("(min-width: 861px)").matches) {
      setIndex(i);
    }
  }

  const running = autoplay.phase === "running";

  return (
    <div
      ref={rootRef}
      data-part="grid"
      {...autoplay.rootProps}
      className="grid max-md:mx-auto max-md:w-[calc(100%-40px)] max-md:grid-cols-1 md:h-full md:grid-cols-[506px_minmax(0,1fr)]"
    >
      <div
        data-part="left"
        className="flex flex-col md:border-r md:border-[#262626] md:pt-104 md:pr-48 md:pb-40 md:pl-86"
      >
        {header}
        {GROUPS.map((group, groupIndex) => {
          const members = services
            .map((service, i) => ({ service, i }))
            .filter(({ service }) => service.group === group);
          return (
            <div key={group} data-part="group" className={groupIndex === 0 ? "mt-24" : "mt-20"}>
              <p
                data-part="group-head"
                className="flex items-baseline justify-between border-b border-white pb-10"
              >
                <b
                  id={groupId(group)}
                  className="text-[11px] font-medium tracking-[0.22em] text-brand uppercase"
                >
                  {group}
                </b>
                <em className="text-[11.5px] tracking-[0.04em] text-[#8a8a8a] not-italic">
                  {String(members.length).padStart(2, "0")} services
                </em>
              </p>
              <div
                role="tablist"
                aria-labelledby={groupId(group)}
                aria-orientation="vertical"
                data-part="list"
              >
                {members.map(({ service, i }) => (
                  <button
                    key={service.slug}
                    ref={(element) => {
                      tabRefs.current[i] = element;
                    }}
                    type="button"
                    role="tab"
                    id={tabId(i)}
                    aria-selected={i === index}
                    aria-controls={panelId(i)}
                    tabIndex={i === index ? 0 : -1}
                    onClick={() => setIndex(i)}
                    onFocus={() => setIndex(i)}
                    onKeyDown={(event) => onTabKeyDown(event, i)}
                    onPointerEnter={(event) => onTabPointerEnter(event, i)}
                    className="group/tab flex h-44 w-full cursor-pointer items-center gap-14 border-b border-[#222] text-left text-[13px] font-medium tracking-[0.08em] text-[#8f8f8f] uppercase transition-colors duration-250 hover:text-white aria-selected:text-white max-md:h-52 max-md:text-[14px]"
                  >
                    <Square className="bg-[#444] transition-[background-color,transform] duration-250 group-aria-selected/tab:bg-brand" />
                    <span className="flex-1">{service.name}</span>
                    <ArrowIcon className="flex-none [transform:translateX(-6px)] text-brand opacity-0 transition-all duration-300 group-aria-selected/tab:[transform:none] group-aria-selected/tab:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        <Link href={routes.services} data-part="all" className={cn(linkClass, "mt-auto pt-20")}>
          <Square className={linkSquareClass} />
          {content.allLabel}
        </Link>
      </div>

      <div data-part="right" className="relative max-md:mt-30 md:h-full">
        <div
          data-part="media"
          className="overflow-hidden bg-[#111] max-md:relative max-md:aspect-[4/3] md:absolute md:inset-0 md:after:pointer-events-none md:after:absolute md:after:inset-0 md:after:z-1 md:after:bg-[linear-gradient(0deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.45)_28%,rgba(0,0,0,0)_55%)] md:after:content-['']"
        >
          {services.map((service, i) => (
            <Image
              key={service.slug}
              src={media[service.image].image}
              alt={service.name}
              aria-hidden={i !== index}
              fill
              sizes={canvasSizes(934, "calc(100vw - 506px)", "calc(100vw - 40px)")}
              data-active={i === index || undefined}
              className="[transform:scale(1.05)] object-cover opacity-0 [transition:opacity_0.9s_ease,transform_1.6s_var(--ease-out-k)] data-active:[transform:none] data-active:opacity-100"
            />
          ))}
          <i
            data-part="bar"
            aria-hidden
            className="absolute inset-x-0 bottom-0 z-3 h-3 bg-[rgba(255,255,255,0.35)] max-md:z-2"
          >
            <b
              key={`${String(index)}-${String(autoplay.cycle)}`}
              className="home-svx-bar"
              data-run={running || undefined}
              style={{ "--interval": `${String(EXPLORER_INTERVAL_MS)}ms` } as CSSProperties}
            />
          </i>
          <AutoplayToggle
            paused={autoplay.paused}
            onToggle={autoplay.togglePaused}
            subject="services slideshow"
            className="absolute right-40 bottom-48 z-3 border-[rgba(255,255,255,0.5)] text-white hover:border-white hover:bg-white hover:text-black max-lg:right-24 max-md:right-12 max-md:bottom-15"
          />
        </div>

        <div
          data-part="caps"
          className="grid max-md:mt-26 md:absolute md:right-104 md:bottom-48 md:left-56 md:z-2 lg:h-150"
        >
          {services.map((service, i) => (
            <Caption
              key={service.slug}
              service={service}
              content={content}
              active={i === index}
              id={panelId(i)}
              labelledBy={tabId(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Caption({
  service,
  content,
  active,
  id,
  labelledBy,
}: {
  service: ExplorerService;
  content: ExplorerContent;
  active: boolean;
  id: string;
  labelledBy: string;
}) {
  return (
    <div
      role="tabpanel"
      id={id}
      aria-labelledby={labelledBy}
      inert={!active}
      data-active={active || undefined}
      className="pointer-events-none grid [transform:translateY(10px)] grid-cols-[1.2fr_1fr] gap-36 opacity-0 [grid-area:1/1] [transition:opacity_0.45s_ease,transform_0.55s_var(--ease-out-k)] data-active:pointer-events-auto data-active:[transform:none] data-active:opacity-100 data-active:delay-150 max-lg:grid-cols-1 max-lg:gap-16"
    >
      <div>
        <span
          data-part="ct"
          className="mb-8 inline-block text-[10.5px] font-medium tracking-[0.2em] text-brand uppercase"
        >
          {service.group}
        </span>
        <h3 className="text-[32px] leading-[1.1] font-medium tracking-[-0.005em] text-white max-md:text-[28px]">
          {service.name}
        </h3>
        <p className="mt-10 text-[14px] leading-[1.6] text-[#ddd] max-md:text-[#bbb]">
          {service.description}
        </p>
      </div>
      <div>
        <ul className="grid grid-cols-2 gap-x-20 gap-y-8">
          {service.highlights.map((item) => (
            <li
              key={item}
              className="flex items-center gap-10 border-b border-[rgba(255,255,255,0.2)] pb-8 text-[13px] text-white before:size-5 before:flex-none before:bg-brand before:content-[''] max-md:border-[#262626]"
            >
              {item}
            </li>
          ))}
        </ul>
        <div data-part="actions" className="mt-22 flex gap-28 max-md:flex-wrap max-md:gap-18">
          <Link href={routes.service(service.slug)} className={linkClass}>
            <Square className={linkSquareClass} />
            {content.viewLabel}
          </Link>
          <StartProjectTrigger service={service.name} className={linkClass}>
            <Square className={linkSquareClass} />
            {content.quoteLabel}
          </StartProjectTrigger>
        </div>
      </div>
    </div>
  );
}
