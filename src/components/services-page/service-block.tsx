import { cva } from "class-variance-authority";

import { ServiceIcon } from "@/components/icons/service-icon";
import { ParallaxImage } from "@/components/motion/parallax-image";
import { ZoomableImage } from "@/components/overlays/lightbox";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { media } from "@/content/media";
import { RELATED_SERVICES } from "@/content/related-services";
import { type LabelledPhoto, type ServiceBlockContent, serviceName } from "@/content/services-page";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import type { Tone } from "@/lib/tone";

type Palette = {
  readonly header: string;
  readonly title: string;
  readonly text: string;
  /** The button renders dark (black, light text, dark hairline) instead of the white outline. */
  readonly darkCta: boolean;
};

/**
 * Colours per rendered tone and palette, as the original renders them. `high` is its `.blk.d`
 * palette: stronger text, a 30% hairline under the header and the button in the opposite tone.
 */
const PALETTES: Record<`${Tone}-${ServiceBlockContent["contrast"]}`, Palette> = {
  "light-standard": {
    header: "border-[#e2ded6] text-[#555]",
    title: "text-ink",
    text: "text-[#555]",
    darkCta: false,
  },
  "dark-standard": {
    header: "border-[#1d2129] text-[#aaa]",
    title: "text-[#f4f4f4]",
    text: "text-[#aaa]",
    darkCta: true,
  },
  "light-high": {
    header: "border-[rgba(0,0,0,0.3)] text-[#767676]",
    title: "text-black",
    text: "text-[#333]",
    darkCta: true,
  },
  "dark-high": {
    header: "border-[rgba(255,255,255,0.3)] text-[#777]",
    title: "text-white",
    text: "text-[#ccc]",
    darkCta: false,
  },
};

/**
 * `.btn.ol` as the original renders it on black blocks. Its hover (a #111 border) is invisible on
 * black, so the border stays as is.
 */
const DARK_CTA = "border-[#30343c] bg-black text-mist hover:border-[#30343c]";

/**
 * Image column padding. On the canvas the photos of a right-hand column stop at the 86px gutter,
 * or further in where the fixed contact rail (70px of real screen from the edge) reaches past it,
 * instead of running under the rail (KI-L18).
 */
const imagesVariants = cva(
  "grid grid-rows-[245px_204px] gap-16 px-16 py-52 max-md:grid-rows-[220px_120px] max-md:px-0 max-md:py-24 max-xs:grid-rows-[220px_248px]",
  {
    variants: {
      reverse: { false: "lg:pr-[max(86px,calc(80px/var(--z)))]", true: "" },
    },
  },
);

type ServiceBlockProps = {
  readonly block: ServiceBlockContent;
  /** Inner parallax on the main photo (`#svc-architecture .big img`, E25). */
  readonly parallax?: boolean;
};

/**
 * One service on the Services overview (`#p-services section.blk#svc-<slug>`): a text column
 * (icon and tagline header, the service name, its one-line description and an "Explore …" button
 * to the service page) beside an image column (a main photo over four thumbnails, each with a small
 * caption chip). Full-bleed and one screen tall on the canvas (560px text column, or 576px with the
 * images on the left for `reverse`); one column with the text first below 1100px.
 *
 * Every photo opens the lightbox, one gallery per block (`data-zoom` in the original); thumbnails
 * zoom slightly on hover. Fixes: the text column sits on the 86px gutter (the original starts at
 * 70px) and the images stay clear of the contact rail (KI-L18); the title steps down to 34/1.1 on
 * phones (KI-L17); on narrow phones the thumbnails form a 2×2 grid so their captions fit (KI-L09).
 */
export function ServiceBlock({ block, parallax = false }: ServiceBlockProps) {
  const { tone, reverse } = block;
  const colours = PALETTES[`${tone}-${block.contrast}`];
  const name = serviceName(block.slug);
  const group = `svc-${block.slug}`;
  const titleId = `${group}-title`;

  return (
    <Section
      tone={tone}
      id={group}
      aria-labelledby={titleId}
      spacing="none"
      fullHeight={false}
      className={cn(
        "grid max-lg:grid-cols-[minmax(0,1fr)] lg:min-h-(--svh) lg:pt-104 lg:pb-36",
        reverse ? "grid-cols-[1fr_576px]" : "grid-cols-[560px_1fr]",
      )}
    >
      <div
        className={cn(
          "flex flex-col pt-52 pr-64 pl-86 max-lg:order-0 max-lg:px-36 max-lg:pt-48",
          reverse && "order-2",
        )}
      >
        <p
          className={cn(
            "flex justify-between border-b-2 pb-24 font-sans text-[9.5px] font-medium tracking-[0.2em] max-md:text-[11px]",
            colours.header,
          )}
        >
          <span className="grid size-30 place-items-center text-brand">
            <ServiceIcon name={block.icon} size={30} />
          </span>
          {block.tagline}
        </p>
        <h2
          id={titleId}
          className={cn(
            "mt-22 font-display text-[46px] font-medium tracking-[-0.005em] max-md:text-[34px] max-md:leading-[1.1]",
            colours.title,
          )}
        >
          {name}
        </h2>
        <p className={cn("mt-20 max-w-400 font-sans text-[16px] leading-[1.65]", colours.text)}>
          {RELATED_SERVICES[block.slug].text}
        </p>
        <ButtonLink
          href={routes.service(block.slug)}
          variant="outline"
          size="section"
          icon="up-right"
          className={cn(
            colours.darkCta && DARK_CTA,
            "mt-auto mb-76 self-start px-22 max-lg:mt-28 max-lg:mb-0",
          )}
        >
          {block.ctaLabel}
        </ButtonLink>
      </div>

      <div className={imagesVariants({ reverse })}>
        <Photo
          photo={block.image}
          group={group}
          parallax={parallax}
          sizes="(max-width: 1099px) 100vw, 60vw"
          imageClassName="object-[center_30%]"
        />
        <div className="grid grid-cols-4 gap-16 max-md:gap-8 max-xs:grid-cols-2">
          {block.thumbnails.map((thumbnail) => (
            <Photo
              key={thumbnail.src}
              photo={thumbnail}
              group={group}
              sizes="(max-width: 420px) 50vw, (max-width: 1099px) 25vw, 15vw"
              className="group"
              imageClassName="transition-transform duration-600 group-hover:scale-[1.06]"
            />
          ))}
        </div>
      </div>
    </Section>
  );
}

type PhotoProps = {
  readonly photo: LabelledPhoto;
  readonly group: string;
  readonly sizes: string;
  readonly parallax?: boolean;
  readonly className?: string;
  readonly imageClassName?: string;
};

/** A cropped, zoomable photo with its caption chip (`.big` / `.th > div`, `.lab`). */
function Photo({ photo, group, sizes, parallax = false, className, imageClassName }: PhotoProps) {
  const image = media[photo.src].image;
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <ZoomableImage
        image={image}
        alt={photo.alt}
        group={group}
        caption={photo.label}
        sizes={sizes}
        buttonClassName="size-full"
        className={cn("size-full object-cover", imageClassName)}
      >
        {parallax ? (
          <ParallaxImage
            src={image}
            alt={photo.alt}
            sizes={sizes}
            frameClassName="size-full"
            className={imageClassName}
          />
        ) : undefined}
      </ZoomableImage>
      <span className="pointer-events-none absolute right-10 bottom-10 bg-[rgba(10,10,10,0.82)] px-10 py-6 font-sans text-[8.5px] font-medium tracking-[0.2em] text-white max-md:text-[11px]">
        {photo.label}
      </span>
    </div>
  );
}
