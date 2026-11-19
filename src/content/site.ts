/**
 * Site-wide settings. Will come from Laravel (`GET /settings`) in Phase 11.
 *
 * PLACEHOLDERS: phone, WhatsApp, address and social URLs are the original site's placeholders
 * (KI-C01, KI-C02, KI-C03). Replace them here once the client confirms the real values.
 */
export type SocialNetwork = "instagram" | "facebook" | "linkedin" | "x";

export type SiteSettings = {
  readonly name: string;
  readonly email: string;
  readonly phone: { readonly display: string; readonly href: `tel:${string}` };
  readonly whatsapp: { readonly number: string };
  readonly address: { readonly lines: readonly string[]; readonly mapsUrl: string };
  readonly socials: readonly {
    readonly network: SocialNetwork;
    readonly label: string;
    readonly url: string;
  }[];
  readonly credit: { readonly label: string; readonly url: string };
};

export const SITE = {
  name: "Katic Designs",
  email: "hello@katicdesigns.com",
  phone: { display: "+1 (000) 000-0000", href: "tel:+10000000000" },
  whatsapp: { number: "10000000000" },
  address: {
    lines: ["Katic Designs Studio", "14 Ridgeline Road", "Countryside District", "400001"],
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Katic+Designs+Kochi",
  },
  socials: [
    { network: "instagram", label: "Instagram", url: "https://www.instagram.com/" },
    { network: "facebook", label: "Facebook", url: "https://www.facebook.com/" },
    { network: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/" },
    { network: "x", label: "X", url: "https://x.com/" },
  ],
  credit: { label: "crafted@ateliergroupcompany", url: "https://ateliergroupcompany.com/" },
} as const satisfies SiteSettings;

/** `https://wa.me/<number>` with an optional pre-filled message. */
export function whatsappUrl(text?: string): string {
  const base = `https://wa.me/${SITE.whatsapp.number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
