import type { Testimonial } from "@/lib/schemas/entities";

/**
 * The global testimonial pool of the service pages (`.kq`); each page shows three of them
 * (docs/analysis/03 §2.9). Copy is verbatim from the original.
 *
 * TODO(content): KI-C08. The original labels these "Representative copy — replace with approved
 * client testimonials." Replace them with approved quotes (and real names) from the client.
 */
export type { Testimonial };

export const TESTIMONIAL_IDS = [
  "arch",
  "home-kochi",
  "thrissur",
  "ernakulam",
  "kozhikode",
  "alappuzha",
] as const;
export type TestimonialId = (typeof TESTIMONIAL_IDS)[number];

export const TESTIMONIALS = {
  arch: {
    id: "arch",
    quote:
      "The architecture responds to the site in a way that feels natural. Light, privacy and movement were resolved with real sensitivity.",
    name: "Homeowner",
    meta: "New-Build Villa · Kottayam",
    avatar: "people/client-avatar-05",
  },
  "home-kochi": {
    id: "home-kochi",
    quote:
      "Katic understood what we wanted from the beginning and translated it into a home that feels completely our own.",
    name: "Homeowner",
    meta: "Residential Project · Kochi",
    avatar: "people/client-avatar-01",
  },
  thrissur: {
    id: "thrissur",
    quote:
      "From early planning through site execution, communication stayed clear and the level of care never changed.",
    name: "Property Owner",
    meta: "Turnkey Residence · Thrissur",
    avatar: "people/client-avatar-06",
  },
  ernakulam: {
    id: "ernakulam",
    quote:
      "The team brought order to a complex process. Every choice felt considered, and the final spaces work beautifully for our day-to-day life.",
    name: "Private Client",
    meta: "Interior Renovation · Ernakulam",
    avatar: "people/client-avatar-04",
  },
  kozhikode: {
    id: "kozhikode",
    quote:
      "They listened closely, challenged the brief where it mattered, and created a workplace that feels both confident and welcoming.",
    name: "Business Client",
    meta: "Commercial Interior · Kozhikode",
    avatar: "people/client-avatar-02",
  },
  alappuzha: {
    id: "alappuzha",
    quote:
      "Having one team coordinate design, materials and construction gave us confidence at every stage of the project.",
    name: "Private Client",
    meta: "Design & Build Project · Alappuzha",
    avatar: "people/client-avatar-03",
  },
} as const satisfies { readonly [I in TestimonialId]: Testimonial & { id: I } };

/** The testimonials for `ids`, in that order. */
export function testimonials(ids: readonly TestimonialId[]): Testimonial[] {
  return ids.map((id) => TESTIMONIALS[id]);
}
