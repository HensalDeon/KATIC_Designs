import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContactFaq, FaqSection } from "@/components/sections/contact-faq";
import { ContactButton } from "@/components/sections/contact-link";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Section } from "@/components/ui/section";
import { Lead } from "@/components/ui/text";

import { FACTORY_CONTACT, INTERIOR_CONTACT, TURNKEY_CONTACT, TURNKEY_FAQ } from "./fixtures";

/**
 * Dev-only catalogue of the contact + FAQ sections (Phase 3, group C). Used for visual review and
 * by tests/e2e/sections-c.spec.ts. Same gating as /styleguide.
 */
const ENABLED = process.env.NODE_ENV !== "production" || process.env["ENABLE_STYLEGUIDE"] === "1";

export const metadata: Metadata = {
  title: "Styleguide: contact and FAQ",
  robots: { index: false, follow: false },
};

export default function SectionsCStyleguidePage() {
  if (!ENABLED) notFound();

  return (
    <>
      {/* Dark lead-in, so the first combo is light as on Interior (preceded by testimonials). */}
      <Section tone="dark" fullHeight={false} className="pt-160">
        <Container>
          <Kicker>Sections C</Kicker>
          <SectionTitle className="mt-22">Contact and FAQ</SectionTitle>
          <Lead className="mt-20">
            Interior’s light combo, Turnkey’s dark combo with the standalone FAQ section, and
            Factory’s hidden-service form.
          </Lead>
          <ContactButton
            service="Turnkey Projects"
            data-testid="contact-button"
            className={buttonVariants({ variant: "primary", className: "mt-28" })}
          >
            Start a Turnkey project
          </ContactButton>
        </Container>
      </Section>

      <div data-testid="combo-interior">
        <ContactFaq {...INTERIOR_CONTACT} />
      </div>
      <div data-testid="combo-turnkey">
        <ContactFaq {...TURNKEY_CONTACT} />
      </div>
      <div data-testid="faq-section">
        <FaqSection faq={TURNKEY_FAQ} id="turnkey-faq" />
      </div>
      <div data-testid="combo-factory">
        <ContactFaq {...FACTORY_CONTACT} />
      </div>
    </>
  );
}
