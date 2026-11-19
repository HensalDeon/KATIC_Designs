import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { SERVICE_ICON_NAMES, ServiceIcon } from "@/components/icons/service-icon";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip, Tag } from "@/components/ui/chip";
import { Container } from "@/components/ui/container";
import { Accent, HeroTitle, SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Plant } from "@/components/ui/plant";
import { Section } from "@/components/ui/section";
import { Body, Lead } from "@/components/ui/text";
import { MoreLink, UnderlineLink } from "@/components/ui/text-link";
import type { Tone } from "@/lib/tone";

/**
 * Dev-only catalogue of the design-system primitives in both tones. Used for visual review and by
 * tests/e2e/design-system.spec.ts, which checks rendered styles against values measured on the
 * original site. Disabled in production unless ENABLE_STYLEGUIDE=1 (set in CI for the e2e run).
 */
const ENABLED = process.env.NODE_ENV !== "production" || process.env["ENABLE_STYLEGUIDE"] === "1";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const BUTTON_VARIANTS = [
  "light",
  "outline",
  "outline-clear",
  "dark",
  "outline-light",
  "outline-ink",
  "primary",
] as const;
const BUTTON_SIZES = ["base", "section", "hero", "sm", "xs"] as const;

export default function StyleguidePage() {
  if (!ENABLED) notFound();

  return (
    <main>
      <Section tone="dark" spacing="none" fullHeight={false} className="py-80">
        <Container data-testid="container">
          <Kicker>Design system</Kicker>
          <HeroTitle data-testid="hero-title" className="mt-22">
            Homes designed
            <br />
            around how you <Accent>actually live</Accent>
          </HeroTitle>
          <Lead variant="hero" data-testid="lead-hero" className="mt-24">
            From first sketch to final walkthrough, every primitive here mirrors the rendered
            original.
          </Lead>
        </Container>
      </Section>

      {(["light", "dark"] as const).map((tone) => (
        <Specimens key={tone} tone={tone} />
      ))}
    </main>
  );
}

function Specimens({ tone }: { tone: Tone }) {
  const id = (name: string) => `${name}-${tone}`;

  return (
    <Section tone={tone} fullHeight={false} className="isolate" data-testid={id("section")}>
      <Plant asset="plants/croton" corner="bottom-right" width={200} behind />
      <Container className="grid gap-56">
        <Group title={`Typography: ${tone}`}>
          <Kicker data-testid={id("kicker-sans")}>Kicker sans (inner pages)</Kicker>
          <Kicker font="display" data-testid={id("kicker-display")}>
            Kicker display
          </Kicker>
          <Kicker font="home" data-testid={id("kicker-home")}>
            Kicker home
          </Kicker>
          <Kicker marker="dot">Kicker with dot</Kicker>
          <SectionTitle data-testid={id("title-standard")}>Section title standard</SectionTitle>
          <SectionTitle scale="home" data-testid={id("title-home")}>
            Section title home
          </SectionTitle>
          <Lead data-testid={id("lead-section")}>
            Section lead. Every project begins with the same discipline: understand the site,
            harness natural light, and let the land speak first.
          </Lead>
          <Lead variant="home" data-testid={id("lead-home")}>
            Home lead. Founded in 2013 and headquartered in Kochi.
          </Lead>
          <Body data-testid={id("body-section")}>
            Section body copy. Material handling, detailing, finishing standards and quality checks
            at each stage.
          </Body>
          <Body variant="base" data-testid={id("body-base")}>
            Base body copy in the warm muted grey.
          </Body>
        </Group>

        <Group title="Buttons">
          {BUTTON_SIZES.map((size) => (
            <div key={size} className="flex flex-wrap items-center gap-16">
              {BUTTON_VARIANTS.map((variant) => (
                <Button
                  key={variant}
                  variant={variant}
                  size={size}
                  data-testid={id(`btn-${variant}-${size}`)}
                >
                  {variant}
                </Button>
              ))}
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-16">
            <ButtonLink
              href="/"
              font="home"
              size="base"
              variant="light"
              data-testid={id("btn-home")}
            >
              Start a project
            </ButtonLink>
            <ButtonLink href="/" font="home" variant="outline" icon="up-right">
              View all projects
            </ButtonLink>
            <Button variant="primary" icon={null}>
              No icon
            </Button>
            <Button variant="outline" disabled>
              Disabled
            </Button>
          </div>
        </Group>

        <Group title="Links and labels">
          <div className="flex flex-wrap items-center gap-24">
            <MoreLink href="/" data-testid={id("more-link")}>
              Explore service
            </MoreLink>
            <MoreLink href="/" font="home">
              Explore service
            </MoreLink>
            <UnderlineLink href="/" data-testid={id("underline-link")}>
              Read more
            </UnderlineLink>
            <Chip data-testid={id("chip")}>Residential</Chip>
            <Tag data-testid={id("tag")}>Architecture</Tag>
          </div>
        </Group>

        <Group title="Service icons">
          <ul className="grid grid-cols-9 gap-24 text-brand max-md:grid-cols-5">
            {SERVICE_ICON_NAMES.map((name) => (
              <li key={name} className="grid justify-items-center gap-8">
                <ServiceIcon name={name} />
                <span className="font-sans text-[10px] text-fg-muted">{name}</span>
              </li>
            ))}
          </ul>
        </Group>
      </Container>
    </Section>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid gap-20">
      <p className="border-b border-current/15 pb-8 font-sans text-[11px] tracking-[0.12em] text-fg-muted uppercase">
        {title}
      </p>
      {children}
    </div>
  );
}
