import { LineBreaks } from "@/components/blocks/title-text";
import { ParallaxImage } from "@/components/motion/parallax-image";
import { CtaBand } from "@/components/sections/cta-band";
import { resolveImage } from "@/components/sections/section-image";
import type { ProjectCtaContent } from "@/content/project-details";
import { routes } from "@/lib/routes";

/**
 * Home's enquiry form (`#start`): the project page has no contact section, so the original's
 * `data-go="contact"` takes the visitor to home's form, as `ContactLink` does on other pages.
 */
const HOME_CONTACT_HREF = `${routes.home}#start`;

/**
 * Closing call to action (`#p-project section.ctasec`, original lines 3966–3974): the shared
 * `CtaBand` project preset, with the background photo drifting as the band crosses the viewport
 * (`ParallaxImage`, the original's `PX.project` entry, E25). Wrapped so the parity tool can match
 * the original's unnamed `.ctasec` block.
 */
export function ProjectCta({ content }: { readonly content: ProjectCtaContent }) {
  return (
    <div data-parity="ctasec">
      <CtaBand
        variant="project"
        image={resolveImage(content.image.src)}
        alt={content.image.alt}
        kicker={content.kicker}
        title={<LineBreaks lines={content.title} />}
        text={content.text}
        cta={{ label: content.label, href: HOME_CONTACT_HREF }}
        renderImage={() => (
          <ParallaxImage
            src={resolveImage(content.image.src)}
            alt={content.image.alt}
            fill
            sizes="100vw"
            frameClassName="size-full"
          />
        )}
      />
    </div>
  );
}
