import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PinnedShowcase } from "@/components/home/pinned-showcase";
import { PinnedStages } from "@/components/home/pinned-stages";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Section } from "@/components/ui/section";

/**
 * Dev-only preview of the two pinned home sections in home order and tones (Selected Works on
 * white, Seven stages on black) between one-screen spacers. Fixture for tests/e2e/home-h2.spec.ts.
 * Disabled in production unless ENABLE_STYLEGUIDE=1.
 */
const ENABLED = process.env.NODE_ENV !== "production" || process.env["ENABLE_STYLEGUIDE"] === "1";

export const metadata: Metadata = {
  title: "Styleguide · Home pinned sections",
  robots: { index: false, follow: false },
};

export default function HomePinnedPreviewPage() {
  if (!ENABLED) notFound();

  return (
    <>
      <Section tone="dark" spacing="home" data-testid="spacer-before">
        <Container>
          <Kicker font="home">Preview</Kicker>
          <SectionTitle scale="home" className="mt-22">
            Pinned home sections
          </SectionTitle>
        </Container>
      </Section>
      <PinnedShowcase />
      <PinnedStages />
      <Section tone="light" spacing="home" data-testid="spacer-after">
        <Container>
          <SectionTitle scale="home">End of preview</SectionTitle>
        </Container>
      </Section>
    </>
  );
}
