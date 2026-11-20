import { LineBreaks } from "@/components/blocks/title-text";
import { ParallaxImage } from "@/components/motion/parallax-image";
import { CtaBand } from "@/components/sections/cta-band";
import { resolveImage } from "@/components/sections/section-image";
import type { ReviewsCtaContent } from "@/lib/schemas/reviews";

/**
 * "Ready to Create Your Own Space?" (`#p-reviews section.ctasec`, markup 4368–4376, page `<style>`
 * 4277–4284): the shared `CtaBand` reviews preset. Its photo (framed at 40% from the top) drifts
 * with the scroll like the original's `PX.reviews` entry (E25, `ParallaxImage`; static with reduced
 * motion). The button goes to Home's enquiry form, as the original's `data-go="contact"` does.
 */
export function ReviewsCta({ content }: { readonly content: ReviewsCtaContent }) {
  return (
    <CtaBand
      variant="reviews"
      data-parity="ctasec"
      image={resolveImage(content.image.src)}
      alt={content.image.alt}
      kicker={content.kicker}
      title={<LineBreaks lines={content.title} />}
      text={content.text}
      cta={content.cta}
      renderImage={() => (
        <ParallaxImage
          src={resolveImage(content.image.src)}
          alt={content.image.alt}
          sizes="100vw"
          frameClassName="size-full"
          className="object-[center_40%]"
        />
      )}
    />
  );
}
