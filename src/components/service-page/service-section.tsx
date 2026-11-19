import type { BlockContext } from "@/components/blocks/block-section";
import type { BespokeSection } from "@/content/service-pages";
import type { Tone } from "@/lib/tone";

import { ArchIntro } from "./arch/arch-intro";
import { ArchProcess } from "./arch/arch-process";
import { ArchProjects } from "./arch/arch-projects";
import { ArchServices } from "./arch/arch-services";

type BespokeSectionViewProps = {
  readonly section: BespokeSection;
  readonly tone: Tone;
  readonly context: Required<Pick<BlockContext, "contactHref">>;
};

/**
 * Renders one of the service pages' page-specific blocks (architecture's `.ap`, `.sv`, `.pr`,
 * `.ap2`, docs/analysis/03 §1.15). The generic blocks of a service page render through
 * `BlockSection`; `ServicePage` passes this component as the `BlockStack`'s `renderBespoke`.
 *
 * The switch is exhaustive: adding a member to `BespokeSection` fails the build until it has a
 * case here.
 */
export function BespokeSectionView({ section, tone, context }: BespokeSectionViewProps) {
  switch (section.type) {
    case "archIntro":
      return <ArchIntro content={section} tone={tone} {...idProps(section)} data-parity="ap" />;
    case "archServices":
      return (
        <ArchServices
          content={section}
          tone={tone}
          {...idProps(section)}
          contactHref={context.contactHref}
        />
      );
    case "archProcess":
      return <ArchProcess content={section} tone={tone} {...idProps(section)} />;
    case "archProjects":
      return <ArchProjects content={section} tone={tone} {...idProps(section)} />;
    default:
      return assertNever(section);
  }
}

/** The section's own id, when the content gives one (the arch blocks default to the original's). */
function idProps({ id }: Pick<BespokeSection, "id">): { id?: string } {
  return id ? { id } : {};
}

function assertNever(value: never): never {
  throw new Error(`Unhandled service section: ${JSON.stringify(value)}`);
}
