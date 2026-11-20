import type { SiteContact } from "@/lib/schemas/site";

export type ContactChannel = "email" | "phone" | "whatsapp";

export type ContactChannelEntry = {
  readonly term: string;
  readonly href: string;
  readonly text: string;
  /** Opens in a new tab (WhatsApp). */
  readonly external: boolean;
};

/** `https://wa.me/<number>` with an optional pre-filled message. */
export function whatsappUrl(site: Pick<SiteContact, "whatsapp">, text?: string): string {
  const base = `https://wa.me/${site.whatsapp.number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Label, link and text of each contact channel listed by the contact sections (`.ci`). */
export function contactChannels(
  site: Pick<SiteContact, "email" | "phone" | "whatsapp">,
): Readonly<Record<ContactChannel, ContactChannelEntry>> {
  return {
    email: { term: "Email", href: `mailto:${site.email}`, text: site.email, external: false },
    phone: { term: "Phone", href: site.phone.href, text: site.phone.display, external: false },
    whatsapp: {
      term: "WhatsApp",
      href: whatsappUrl(site),
      text: "Chat with our team",
      external: true,
    },
  };
}
