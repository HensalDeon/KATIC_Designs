import type { ArchIntroContent } from "@/components/service-page/arch/arch-intro";
import type { ArchProcessContent } from "@/components/service-page/arch/arch-process";
import type { ArchProjectsContent } from "@/components/service-page/arch/arch-projects";
import type { ArchServicesContent } from "@/components/service-page/arch/arch-services";
import { routes } from "@/lib/routes";

/**
 * Content of the four blocks only the Architecture page has (`#p-architecture` `.ap`, `.sv`,
 * `.pr`, `.ap2`; reference/original/katic-designs-final.stripped.html 3327–3383, docs/analysis/03
 * §1.15). Copy verbatim from the original; alts are descriptive (KI-A13).
 */

/** Deep-link ids kept from the original (`#architecture/process`, `#architecture/process-tl`). */
export const ARCH_PROCESS_ID = "process";
export const ARCH_STEPS_ID = "process-tl";

/** `.ap`: introduction and two figures beside a site photo. */
export const ARCH_INTRO = {
  kicker: "Introduction",
  title: ["Architecture", "That Responds"],
  lead: "We study the site, climate, surroundings, lifestyle and requirements before developing an architectural direction that belongs to the place.",
  cta: { kind: "link", label: "Our Process", href: `#${ARCH_PROCESS_ID}` },
  stats: [
    // TODO(content): KI-C10 the site gives the practice's age as "EST. 2013", "11 yrs" and "11+ years" elsewhere.
    { value: "12+", label: "YEARS DESIGNING" },
    { value: "2", label: "REGIONS SERVED" },
  ],
  image: {
    src: "photos/architect-site-drawings",
    alt: "Architect reviewing drawings on a forested site",
  },
  caption: { label: "SITE, CLIMATE AND CONTEXT", place: "Kochi, Kerala" },
} as const satisfies ArchIntroContent;

/** `.sv#services-list`: the nine architecture services and three photos. */
export const ARCH_SERVICES = {
  kicker: "What we deliver",
  title: ["Our Architecture", "Services"],
  items: [
    { icon: "house", title: "Residential Architecture" },
    { icon: "house", title: "Villa Design" },
    { icon: "office", title: "Commercial Architecture" },
    { icon: "tools", title: "Renovation" },
    { icon: "compass", title: "Concept Design" },
    { icon: "target", title: "Detailed Design" },
    { icon: "eye", title: "3D Visualisation" },
    // KI-D03: the original reuses the Concept Design compass for Working Drawings.
    { icon: "compass", title: "Working Drawings" },
    { icon: "crane", title: "Execution Coordination" },
  ],
  enquiryService: "Architectural Design",
  cta: {
    kind: "link",
    label: "View Architecture Works",
    href: routes.worksCategory("architecture"),
  },
  images: [
    {
      src: "photos/pavilion-fins-facade",
      alt: "Pavilion building with vertical fins and a garden",
    },
    { src: "photos/architect-sketching-plans", alt: "Architect sketching plans beside a model" },
    { src: "photos/laterite-wall-timber-door", alt: "Laterite stone wall beside a timber door" },
  ],
} as const satisfies ArchServicesContent;

/** `.pr#process`: process header, two photos and the five steps (`#process-tl`). */
export const ARCH_PROCESS = {
  kicker: "Our design process",
  title: ["From Site to", "Structure"],
  // TODO(content): KI-C07 designer-brief copy shown verbatim by the original.
  lead: "Explain how Katic takes an architectural project from first brief to built space.",
  cta: { kind: "link", label: "See Our Process", href: `#${ARCH_STEPS_ID}` },
  images: [
    { src: "photos/massing-model", alt: "White massing model on a dark background" },
    {
      src: "photos/house-under-construction",
      alt: "House under construction in a forest clearing",
    },
  ],
  steps: [
    { icon: "search", title: "Understand", text: "Site, brief & ambition." },
    { icon: "compass", title: "Concept", text: "Ideas, massing & climate." },
    { icon: "house", title: "Develop", text: "Space, material & systems." },
    { icon: "badge-check", title: "Document", text: "Details, drawings & approvals." },
    { icon: "crane", title: "Execute", text: "Coordination, quality & delivery." },
  ],
  stepsId: ARCH_STEPS_ID,
} as const satisfies ArchProcessContent;

/** `.ap2#arch-projects`: one featured project and four more. */
export const ARCH_PROJECTS = {
  kicker: "Featured projects",
  title: ["Architecture", "Projects"],
  // TODO(content): KI-C07 designer-brief copy shown verbatim by the original.
  lead: "Selected architecture projects with location, type and a short description. Each opens its project page.",
  featured: {
    project: "the-courtyard-house",
    // TODO(content): KI-D01 About places the Courtyard House in Thrissur, the project page in
    // Kakkanad, Kochi, and each page shows a different house; the client confirms the facts.
    meta: "Kochi, Kerala · Residential Architecture",
    text: "A family home shaped around a shaded central court, filtered light and cross-ventilation.",
    image: {
      src: "photos/brick-courtyard-house-dusk",
      alt: "Brick courtyard house lit at dusk around a planted courtyard",
    },
  },
  grid: [
    {
      project: "palm-ridge-villa",
      meta: "Kakkanad, Kerala · Villa Design",
      text: "A layered villa that opens to the landscape while protecting privacy from the street.",
    },
    {
      project: "nila-workspace",
      meta: "Dubai, UAE · Commercial Architecture",
      text: "A precise workplace composed around daylight, flexible teams and a calm material palette.",
    },
    {
      project: "house-of-monsoon",
      meta: "Thrissur, Kerala · Residential Architecture",
      text: "Deep eaves, breezeways and planted thresholds turn the monsoon into part of daily life.",
    },
    {
      project: "the-old-mill-renewal",
      meta: "Aluva, Kerala · Renovation",
      text: "An adaptive reuse project retaining the original shell while introducing a new public life.",
    },
  ],
} as const satisfies ArchProjectsContent;
