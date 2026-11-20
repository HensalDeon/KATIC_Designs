import { ServiceIcon } from "@/components/icons/service-icon";
import { ZoomableImage } from "@/components/overlays/lightbox";
import { phonePlantRoom, type PlantSpec } from "@/components/sections/content-section";
import { resolveImage } from "@/components/sections/section-image";
import { canvasSizes } from "@/components/sections/section-media";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Plant } from "@/components/ui/plant";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/cn";
import type { ReviewsStoryContent } from "@/lib/schemas/reviews";

import { ReviewsHeading, SplitHeader } from "./reviews-ui";

/** The potted plant on a chair at the bottom left (`img.plant.pot.pp.bl-c`, `--w:155px`). */
const PLANT: PlantSpec = {
  asset: "plants/potted-plant-on-chair",
  corner: "bottom-left",
  width: 155,
};

/** The four story photos browse as one lightbox gallery. */
const GALLERY = "reviews-story";

/**
 * "From brief to built" (`#p-reviews section.pp-host.bb`, markup 4336–4352, page `<style>`
 * 4258–4268): header row with the right-aligned project facts, then a 720px photo column (a large
 * photo over three thumbnails, all opening the lightbox as the original's `.bb img[data-zoom]`) and
 * the story column (29/1.38 quote, attribution, three icon rows, "View Project"). The plant sits
 * behind the content at the bottom left; on phones the section makes room for it (P6-04). One
 * column below 1100px; the quote is 22px on phones. Black.
 *
 * Fixes: each photo has its own descriptive alt instead of "From brief to built" ×4 (KI-A13); the
 * row titles are headings (h3) under the section title; the facts are 11px on phones (KI-A10).
 */
export function ReviewsStory({ content }: { readonly content: ReviewsStoryContent }) {
  const room = phonePlantRoom(PLANT);
  const [main, ...thumbs] = content.images;

  return (
    <Section
      tone="dark"
      data-parity="pp-host"
      className={cn("isolate", room.className)}
      style={room.style}
    >
      <Plant {...PLANT} behind />
      <Container>
        <SplitHeader
          align="start"
          aside={
            <p className="mt-42 text-right font-sans text-[9.5px] leading-[1.9] font-medium tracking-[0.2em] text-[#ddd] max-md:text-[11px]">
              {content.facts.map((fact) => (
                <span key={fact} className="block">
                  {fact}
                </span>
              ))}
            </p>
          }
        >
          <ReviewsHeading kicker={content.kicker} title={content.title} />
        </SplitHeader>

        <div className="mt-56 grid grid-cols-[720px_1fr] gap-44 max-lg:grid-cols-1 max-lg:gap-36">
          <div>
            <ZoomableImage
              image={resolveImage(main.src)}
              alt={main.alt}
              group={GALLERY}
              // On phones the 430px-tall box crops the 16:9 photo, so it is drawn ~765px wide.
              sizes={canvasSizes(720, "calc(100vw - 72px)", "765px")}
              className="h-330 w-full object-cover max-lg:h-430"
              buttonClassName="w-full"
            />
            <div className="mt-15 grid grid-cols-3 gap-16">
              {thumbs.map((image) => (
                <ZoomableImage
                  key={image.alt}
                  image={resolveImage(image.src)}
                  alt={image.alt}
                  group={GALLERY}
                  sizes={canvasSizes(230, "calc(33vw - 34px)", "calc(33vw - 24px)")}
                  className="h-215 w-full object-cover"
                  buttonClassName="w-full"
                />
              ))}
            </div>
          </div>

          <div>
            <figure>
              <blockquote className="font-sans text-[29px] leading-[1.38] max-md:text-[22px]">
                <p>{content.quote}</p>
              </blockquote>
              <figcaption className="mt-26 font-sans text-[11px] font-semibold text-[#ddd]">
                {content.attribution}
              </figcaption>
            </figure>
            <ul className="mt-22">
              {content.rows.map((row) => (
                <li
                  key={row.title}
                  className="grid grid-cols-[52px_1fr] border-t border-[#333] pt-22"
                >
                  <span className="grid place-items-center text-brand">
                    <ServiceIcon name={row.icon} />
                  </span>
                  <div className="font-sans">
                    {/* The original's inline `b` sits in a 27px line (the 16px Jost strut). */}
                    <h3 className="pb-1 text-[21.5px] font-normal">{row.title}</h3>
                    <p className="mt-10 text-[11.5px] leading-[1.8] text-[#ccc]">{row.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <ButtonLink
              href={content.cta.href}
              variant="primary"
              size="sm"
              icon="up-right"
              className="mt-22"
            >
              {content.cta.label}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
