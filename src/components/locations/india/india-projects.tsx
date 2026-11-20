import { LineBreaks } from "@/components/blocks/title-text";
import { Card, cardGridSizes, cardMoreLabel } from "@/components/sections/card-grid";
import { ContentSection } from "@/components/sections/content-section";
import { getRefs } from "@/lib/data";
import type { IndiaProjectsBlock } from "@/lib/schemas/locations";
import type { Tone } from "@/lib/tone";

import { IndiaProjectFilter } from "./india-project-filter";

type IndiaProjectsProps = {
  readonly block: IndiaProjectsBlock;
  readonly tone: Tone;
};

/**
 * "Selected work in India" (`#p-india section.ks#india-projects`, markup 4080): the `.kh` header,
 * the location filter (`.kcats`, 36px under the header) and the three-column project cards 60px
 * below it. Every card is rendered here on the server, from the project by slug with its card's
 * own meta line; `IndiaProjectFilter` is the client island that filters (`?area=`), reflows and
 * animates them. Keeps the original id, so `/locations/india#india-projects` and the legacy
 * `#india/india-projects/<f>` links land on it.
 */
export async function IndiaProjects({ block, tone }: IndiaProjectsProps) {
  const refs = await getRefs();
  const sizes = cardGridSizes(3);
  const moreLabel = cardMoreLabel("project");
  return (
    <ContentSection
      tone={tone}
      id={block.id}
      header={{
        kicker: block.header.kicker,
        title: <LineBreaks lines={block.header.title} />,
        ...(block.header.lead ? { lead: block.header.lead } : {}),
      }}
      bodyClassName="mt-36"
    >
      <IndiaProjectFilter
        filters={block.filters}
        filtersLabel={block.filtersLabel}
        listId={`${block.id}-grid`}
        cards={block.items.map(({ project: slug, meta, area }) => {
          const project = refs.project(slug);
          return {
            slug,
            area,
            content: (
              <Card
                item={{
                  href: refs.projectHref(project),
                  image: project.cover,
                  alt: project.coverAlt,
                  title: project.name,
                  meta,
                }}
                columns={3}
                sizes={sizes}
                moreLabel={moreLabel}
              />
            ),
          };
        })}
      />
    </ContentSection>
  );
}
