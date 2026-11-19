import { ServiceIcon, type ServiceIconName } from "@/components/icons/service-icon";
import { ZoomableImage } from "@/components/overlays/lightbox";
import { ContactLink } from "@/components/sections/contact-link";
import { ActionButton, type SectionAction } from "@/components/sections/section-action";
import { resolveImage, type SectionImage } from "@/components/sections/section-image";
import { canvasSizes } from "@/components/sections/section-media";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { ServiceOption } from "@/content/services";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/tone";

import { ARCH_HEADER_COPY, ArchHeader } from "./arch-header";

/** Content of the architecture services list (`#p-architecture section.sv`). Plain data. */
export type ArchServicesContent = {
  readonly kicker: string;
  readonly title: readonly string[];
  /** One row per service; the summary beside the title lists the same titles, "·"-joined. */
  readonly items: readonly { readonly icon: ServiceIconName; readonly title: string }[];
  /** Every row opens the page's enquiry form with this service preselected (`data-svc`). */
  readonly enquiryService: ServiceOption;
  /** Dark button under the list ("View Architecture Works"). */
  readonly cta: SectionAction;
  /** One wide photo over two tall ones. */
  readonly images: readonly [SectionImage, SectionImage, SectionImage];
};

type ArchServicesProps = {
  readonly content: ArchServicesContent;
  /** Black in the original (index 1 after the hero). */
  readonly tone?: Tone;
  /** `services-list` in the original (deep link `#architecture/services-list`). */
  readonly id?: string;
  /** No-JavaScript target of the rows: the page's contact section (`#architecture-contact`). */
  readonly contactHref?: string;
};

const PHOTO = "w-full object-cover";

/**
 * Architecture services (`#p-architecture section.sv#services-list`, stripped HTML lines
 * 3338–3358, page `<style>` 3259–3274): the two-column header with every service in one
 * "·"-joined line, then a 600px list of service rows (orange line icon, 20px title, ↗; 61px tall
 * with a hairline under each) and a dark "View Architecture Works" button, beside one wide and two
 * tall photos. Each row goes to the page's enquiry form with the service preselected
 * (`data-go="contact" data-svc`) and turns its title orange on hover. Every photo opens the
 * lightbox, one gallery per block (`data-zoom`). One column below 1100px; the tall photos are
 * 220px on phones.
 *
 * Fixes: the photos have descriptive alts (the original's are empty, KI-A13); the title scales
 * 58 → 46 → 34 (KI-N04); the section grows instead of being zoomed down by `fit()` (KI-L13).
 */
export function ArchServices({
  content,
  tone = "dark",
  id = "services-list",
  contactHref,
}: ArchServicesProps) {
  const titleId = `${id}-title`;
  const [wide, ...tall] = content.images;
  return (
    <Section tone={tone} id={id} aria-labelledby={titleId}>
      <Container>
        <ArchHeader kicker={content.kicker} title={content.title} titleId={titleId}>
          <p className={cn(ARCH_HEADER_COPY, "text-[14.5px] leading-[1.8]")}>
            {content.items.map((item) => item.title).join(" · ")}
          </p>
        </ArchHeader>

        <div className="mt-40 grid grid-cols-[600px_1fr] gap-64 max-lg:grid-cols-1 max-lg:gap-36">
          <div>
            <ul>
              {content.items.map((item) => (
                <li key={item.title}>
                  <ContactLink
                    service={content.enquiryService}
                    {...(contactHref ? { href: contactHref } : {})}
                    className="group grid h-61 grid-cols-[56px_1fr_20px] items-center border-b border-[rgba(0,0,0,0.14)] in-data-[tone=dark]:border-[rgba(255,255,255,0.2)]"
                  >
                    <span className="grid place-items-center text-brand">
                      <ServiceIcon name={item.icon} size={28} />
                    </span>
                    <span className="font-sans text-[20px] text-fg group-hover:text-brand">
                      {item.title}
                    </span>
                    <i
                      aria-hidden
                      className="font-display text-[11px] text-[#555] not-italic in-data-[tone=dark]:text-[#ddd]"
                    >
                      ↗
                    </i>
                  </ContactLink>
                </li>
              ))}
            </ul>
            <ActionButton
              action={content.cta}
              className={buttonVariants({
                variant: tone === "dark" ? "dark" : "outline",
                size: "section",
                className: "mt-88 px-22",
              })}
            />
          </div>

          <div className="grid grid-cols-2 content-start gap-18">
            <Photo image={wide} group={id} sizes={canvasSizes(604, "100vw")} wide />
            {tall.map((image) => (
              <Photo key={image.alt} image={image} group={id} sizes={canvasSizes(293, "50vw")} />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

type PhotoProps = {
  readonly image: SectionImage;
  readonly group: string;
  readonly sizes: string;
  readonly wide?: boolean;
};

/** A zoomable photo of the `.ims` grid: the wide one spans both columns. */
function Photo({ image, group, sizes, wide = false }: PhotoProps) {
  return (
    <ZoomableImage
      image={resolveImage(image.src)}
      alt={image.alt}
      group={group}
      sizes={sizes}
      buttonClassName={cn(wide && "col-span-2")}
      className={cn(PHOTO, wide ? "h-290" : "h-362 max-md:h-220")}
    />
  );
}
