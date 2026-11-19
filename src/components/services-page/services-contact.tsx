import { Fragment } from "react";

import { EnquiryForm } from "@/components/sections/enquiry-form";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SERVICES_CONTACT, type ServicesContactContent } from "@/content/services-page";
import { SITE } from "@/content/site";

type ServicesContactProps = {
  readonly content?: ServicesContactContent;
};

/**
 * Contact section of the Services overview (`#p-services > .contact#services-contact`, the
 * original's CONTACT template without a FAQ): black. Intro, email and phone on the left; the inline
 * `EnquiryForm` on the right (640px on the canvas), with the template's roomier field sizes (46px
 * fields, 108px details, 20/18 gaps). Two equal columns below 1100px, one on phones.
 *
 * `[data-contact-section]` makes it the target of "go to contact" (`useContactScroll`).
 */
export function ServicesContact({ content = SERVICES_CONTACT }: ServicesContactProps) {
  const channels = [
    { term: "Email", href: `mailto:${SITE.email}`, text: SITE.email },
    { term: "Phone", href: SITE.phone.href, text: SITE.phone.display },
  ] as const;

  return (
    <Section tone="dark" id="services-contact" data-contact-section="">
      <Container className="grid grid-cols-[minmax(0,1fr)_640px] gap-40 max-lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] max-md:grid-cols-[minmax(0,1fr)]">
        <div>
          <p className="flex items-center gap-10 font-display text-[12px] text-[#ddd] before:size-5 before:flex-none before:rounded-full before:bg-brand before:content-['']">
            {content.kicker}
          </p>
          <h2 className="mt-22 mb-28 font-display text-[54px] leading-none font-bold tracking-[0.005em] text-white max-md:text-[38px]">
            {content.headingLines.map((line, index) => (
              <Fragment key={line}>
                {index > 0 ? <br /> : null}
                {line}
              </Fragment>
            ))}
          </h2>
          <p className="max-w-430 font-display text-[15px] leading-[1.85] text-[rgba(255,255,255,0.82)]">
            {content.lead}
          </p>
          <dl className="mt-66 font-display text-[12px] text-[#ccc]">
            {channels.map((channel) => (
              <Fragment key={channel.term}>
                <dt>{channel.term}</dt>
                <dd className="mt-2 mb-18 text-[15px] font-medium text-white">
                  <a
                    href={channel.href}
                    className="transition-colors duration-200 hover:text-brand"
                  >
                    {channel.text}
                  </a>
                </dd>
              </Fragment>
            ))}
          </dl>
        </div>
        <EnquiryForm
          service={{ mode: "select" }}
          className="mt-0 gap-x-18 gap-y-20 max-lg:mt-0 [&_input]:h-46 [&_label]:mb-9 [&_select]:h-46 [&_textarea]:h-108"
        />
      </Container>
    </Section>
  );
}
