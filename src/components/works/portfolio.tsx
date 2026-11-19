import { TitleLines } from "@/components/home/title-lines";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Section } from "@/components/ui/section";
import { getProjects } from "@/content/projects";
import { WORKS_LIST_ID, WORKS_PORTFOLIO, type WorksPortfolioContent } from "@/content/works";
import { cn } from "@/lib/cn";

import { PortfolioGrid } from "./portfolio-grid";
import { ProjectCard } from "./project-card";
import { WORKS_TITLE_CLASS } from "./works-title";

type PortfolioProps = {
  readonly content?: WorksPortfolioContent;
};

/**
 * The filterable portfolio (`#p-works section.sw#works-list`, markup 3724–3751, page `<style>`
 * 3638–3649). Authored dark, it renders white with black text (`data-fx="104"`, docs/analysis/04
 * §0), including the black kicker: the `.two` header (kicker and title left, paragraph right), the
 * eight filter buttons and the project cards.
 *
 * Server component: the header and every card are rendered here; `PortfolioGrid` is the client
 * island that filters (`?category=`), reflows and animates them. Keeps the original id, so
 * `/works#works-list` and the legacy `#works/works-list/<f>` links land on it.
 */
export function Portfolio({ content = WORKS_PORTFOLIO }: PortfolioProps) {
  const titleId = "works-list-title";
  const projects = getProjects(content.projects);
  return (
    <Section tone="light" id={WORKS_LIST_ID} aria-labelledby={titleId}>
      <Container size="wide">
        <div className="grid grid-cols-[660px_1fr] max-lg:grid-cols-[minmax(0,1fr)] max-lg:gap-36">
          <div>
            <Kicker className="text-black">{content.kicker}</Kicker>
            <SectionTitle id={titleId} className={cn("mt-44 text-black", WORKS_TITLE_CLASS)}>
              <TitleLines lines={content.title} />
            </SectionTitle>
          </div>
          <p className="mt-110 max-w-620 font-sans text-[13.5px] leading-[1.75] text-[#444]">
            {content.text}
          </p>
        </div>
        <PortfolioGrid
          filters={content.filters}
          filtersLabel={content.filtersLabel}
          listId={`${WORKS_LIST_ID}-grid`}
          cards={projects.map((project) => ({
            slug: project.slug,
            categories: project.categories,
            content: <ProjectCard project={project} linkLabel={content.cardLinkLabel} />,
          }))}
        />
      </Container>
    </Section>
  );
}
