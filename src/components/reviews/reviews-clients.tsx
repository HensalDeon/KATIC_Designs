import { Testimonials } from "@/components/sections/testimonials";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getRefs } from "@/lib/data";
import type { ReviewsClientsContent } from "@/lib/schemas/reviews";

import { ReviewsHeading } from "./reviews-ui";

/**
 * "What our clients say" (`#p-reviews section.cl`, markup 4309–4323, page `<style>` 4236–4246):
 * the `.two` header (heading in a 646px column, the 13.5/1.9 paragraph beside it), six testimonial
 * cards from the shared pool (3 columns; 2 below 1100px; 1 on phones), then the placeholder note
 * and "View Our Work". Black.
 *
 * Fixes: decorative quote marks are hidden from assistive tech (KI-A16, `Testimonials`); the kicker
 * is brand orange on black (KI-A11; the original prints the light-section orange); meta lines are
 * 11px on phones (KI-A10).
 */
export async function ReviewsClients({ content }: { readonly content: ReviewsClientsContent }) {
  const refs = await getRefs();
  return (
    <Section tone="dark" data-parity="cl">
      <Container>
        <div className="grid grid-cols-[646px_1fr] max-lg:grid-cols-1 max-lg:gap-36">
          <div>
            <ReviewsHeading kicker={content.kicker} title={content.title} />
          </div>
          <p className="font-sans text-[13.5px] leading-[1.9] text-[#ccc]">{content.text}</p>
        </div>
        <Testimonials
          variant="reviews"
          items={refs.testimonials(content.testimonials)}
          className="mt-58"
        />
        <div className="mt-50 flex items-center justify-between">
          <p className="font-sans text-[11px] text-[#ccc]">{content.note}</p>
          <ButtonLink href={content.cta.href} variant="dark" size="sm" icon="up-right">
            {content.cta.label}
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
