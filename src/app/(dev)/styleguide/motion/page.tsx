import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CountUp } from "@/components/motion/count-up";
import { ParallaxImage } from "@/components/motion/parallax-image";
import { Reveal, type RevealVariant } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Section } from "@/components/ui/section";
import { media } from "@/content/media";

import { PinProbe } from "./pin-probe";

const ENABLED = process.env.NODE_ENV !== "production" || process.env["ENABLE_STYLEGUIDE"] === "1";

export const metadata: Metadata = {
  title: "Styleguide · Motion",
  robots: { index: false, follow: false },
};

const VARIANTS: readonly RevealVariant[] = ["fade-up", "clip", "left", "scale"];

/** Dev-only catalogue of the motion primitives; also the fixture for zoom-geometry e2e tests. */
export default function MotionStyleguidePage() {
  if (!ENABLED) notFound();

  return (
    <>
      <Section tone="dark" fullHeight={false} className="pt-160">
        <Container>
          <Kicker>Motion</Kicker>
          <SectionTitle className="mt-22">Reveal, count-up, parallax, pinning</SectionTitle>
        </Container>
      </Section>

      <PinProbe />

      <Section tone="light">
        <Container className="grid grid-cols-4 gap-24">
          {VARIANTS.map((variant, index) => (
            <Reveal key={variant} variant={variant} index={index}>
              <div
                data-testid={`reveal-${variant}`}
                className="grid h-200 place-items-center border border-line font-display text-[20px]"
              >
                {variant}
              </div>
            </Reveal>
          ))}
          <p className="col-span-full font-display text-[56px]">
            <CountUp to={200} />+
          </p>
        </Container>
      </Section>

      <Section tone="dark" spacing="none" fullHeight={false}>
        <ParallaxImage
          data-testid="parallax-image"
          src={media["photos/brick-courtyard-house-dusk-panorama"].image}
          alt={media["photos/brick-courtyard-house-dusk-panorama"].description}
          sizes="100vw"
          frameClassName="h-611"
        />
      </Section>

      <Section tone="light">
        <Container>
          <SectionTitle>End of page</SectionTitle>
        </Container>
      </Section>
    </>
  );
}
