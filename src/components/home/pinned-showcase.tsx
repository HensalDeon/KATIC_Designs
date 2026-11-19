import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { canvasSizes } from "@/components/sections/section-media";
import { ButtonLink } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Lead } from "@/components/ui/text";
import { HOME_WORKS, type HomeWorksContent } from "@/content/home/works";
import { media } from "@/content/media";
import { getProjects, type Project, projectHref, projectLocationLine } from "@/content/projects";

import { ShowcaseStage } from "./pinned-showcase-stage";

export type PinnedShowcaseProps = {
  /** Section copy, tabs and the projects shown (default: the home page's). */
  readonly content?: HomeWorksContent;
  /** Section id (deep links); the original's is `home-works`. */
  readonly id?: string;
};

/** `sizes` of a card image: 568px on the canvas, 82vw in the scroller below 1100px. */
const CARD_SIZES = canvasSizes(568, "82vw", "82vw");

/**
 * Home "Selected Works" (`section.wk.pinsec#home-works`; original `SHOWS` engine and tab filter,
 * docs/analysis/01 E20–E21, docs/analysis/02 §1.4). Always a white section.
 *
 * - **≥1100px, motion allowed:** the section is `vh × (1 + (n − 1) × 0.6)` tall (canvas px, from
 *   `--svh`) and its stage sticks for the whole scroll. Progress `p` moves the cover-flow: card i
 *   sits at `d = i − p × (n − 1)` with `translate3d(d·640px, min(|d|,1)·16px, 0)
 *   scale(1 − min(|d|,1.5)·0.07)`, a black shade of opacity `min(|d|,1)` (rgba(0,0,0,.45)),
 *   z-index `20 − round(|d|·2)`, and the centred card (|d| < .5) gets a big shadow (.3s).
 * - **≥1100px, reduced motion:** a static 3-column grid, so every project is reachable (KI-L02).
 * - **≤1099px:** the original horizontal scroll-snap track (82vw × 380 cards), focusable and
 *   labelled for keyboard scrolling (KI-A08).
 * - **Tabs** are toggle buttons (`aria-pressed`, KI-A07) that filter by category, update the
 *   section height and the (visually hidden, live) "N projects" count, and jump back to the
 *   section start like the original. Categories come from the `Project` entity (KI-D01/KI-D02).
 * - **Reveal:** kicker, lead, button and tabs fade up and the title clips in (original `RV` list).
 *
 * Server component; the tabs and the scroll-driven track are the client island `ShowcaseStage`.
 */
export function PinnedShowcase({ content = HOME_WORKS, id = "home-works" }: PinnedShowcaseProps) {
  const projects = getProjects(content.projects);

  return (
    <ShowcaseStage
      id={id}
      filters={content.filters}
      filtersLabel="Filter projects by category"
      trackLabel={content.kicker}
      header={
        <div className="grid grid-cols-[546px_1fr_auto] items-center gap-40 max-lg:grid-cols-[minmax(0,1fr)] max-lg:gap-36">
          <div>
            <Reveal>
              <Kicker font="home">{content.kicker}</Kicker>
            </Reveal>
            <Reveal variant="clip" className="mt-22">
              <SectionTitle scale="home">
                {content.title.map((line, index) => (
                  <span key={line}>
                    {index > 0 ? <br /> : null}
                    {line}
                  </span>
                ))}
              </SectionTitle>
            </Reveal>
          </div>
          <Reveal>
            <Lead variant="home" className="max-w-440 text-fg">
              {content.lead}
            </Lead>
          </Reveal>
          <Reveal>
            <ButtonLink
              href={content.cta.href}
              variant="outline"
              font="home"
              icon={null}
              className="h-44 gap-14 border-[#ddd] bg-white px-26 text-ink-2 max-lg:flex"
            >
              {content.cta.label}
            </ButtonLink>
          </Reveal>
        </div>
      }
      cards={projects.map((project) => ({
        slug: project.slug,
        categories: project.categories,
        content: <ShowcaseCard project={project} linkLabel={content.cardLinkLabel} />,
      }))}
    />
  );
}

/** Card content (`.sc-card` children): cover, shade and caption. Positioned by `ShowcaseStage`. */
function ShowcaseCard({ project, linkLabel }: { project: Project; linkLabel: string }) {
  return (
    <>
      <Image
        src={media[project.cover].image}
        alt={project.coverAlt}
        sizes={CARD_SIZES}
        className="absolute inset-0 size-full object-cover"
      />
      {/* `.sc-shade`: darkens cards away from the centre (pinned cover-flow only). */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-2 bg-[rgba(0,0,0,.45)] opacity-0 lg:motion-safe:opacity-(--sh)"
      />
      <div className="absolute inset-x-22 bottom-22 z-3 text-white">
        <span className="inline-flex h-22 w-max max-w-full items-center rounded-[20px] border border-[rgba(255,255,255,.35)] bg-[rgba(0,0,0,.55)] px-12 font-display text-[10px] font-medium tracking-[0.2em] uppercase max-md:text-[11px]">
          {project.type}
        </span>
        <h3 className="mt-14 font-display text-[28px] leading-[1.1] font-medium uppercase max-md:text-[22px]">
          {project.name}
        </h3>
        <p className="mt-8 font-display text-[13px] text-mist">{projectLocationLine(project)}</p>
        <Link
          href={projectHref(project)}
          className="mt-12 inline-block font-display text-[11.5px] font-medium tracking-[0.14em] text-brand uppercase transition-colors hover:text-[#ffb08a]"
        >
          {linkLabel}
          <span className="sr-only">: {project.name}</span> <span aria-hidden>→</span>
        </Link>
      </div>
    </>
  );
}
