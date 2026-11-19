import type { ServiceIconName } from "@/components/icons/service-icon";

/**
 * The "master process": eight stages whose copy the original reuses verbatim on the interior,
 * turnkey and renovation pages (docs/analysis/03 §1.6, §2). Pages reference stages by id, so the
 * text lives in one place. Will come from Laravel (`ProcessStage` resource) in Phase 11.
 *
 * Icons are the original's: Concept and Design share the compass, Engineering and Construction
 * the crane (KI-D03 tracks giving them distinct icons).
 */
export const PROCESS_STAGE_IDS = [
  "discovery",
  "concept",
  "design",
  "engineering",
  "construction",
  "completion",
  "handover",
  "aftercare",
] as const;
export type ProcessStageId = (typeof PROCESS_STAGE_IDS)[number];

export type ProcessStage = {
  readonly id: ProcessStageId;
  readonly title: string;
  readonly text: string;
  readonly icon: ServiceIconName;
};

export const PROCESS_STAGES = {
  discovery: {
    id: "discovery",
    title: "Discovery",
    text: "Site visit, brief, constraints and budget — the questions that shape everything after.",
    icon: "search",
  },
  concept: {
    id: "concept",
    title: "Concept",
    text: "First massing studies and spatial ideas, tested against light, view and site logic.",
    icon: "compass",
  },
  design: {
    id: "design",
    title: "Design",
    text: "Detailed drawings, material decisions and a fully resolved design language.",
    icon: "compass",
  },
  engineering: {
    id: "engineering",
    title: "Engineering",
    text: "Structural and services design, engineered so the building stands as drawn.",
    icon: "crane",
  },
  construction: {
    id: "construction",
    title: "Construction",
    text: "On-site execution supervised by our own team, built exactly to the drawing.",
    icon: "crane",
  },
  completion: {
    id: "completion",
    title: "Completion",
    text: "Finishes, fit-out, snagging and quality checks until every detail is right.",
    icon: "check-circle",
  },
  handover: {
    id: "handover",
    title: "Handover",
    text: "A guided walkthrough, documentation and keys to a space ready to live in.",
    icon: "key",
  },
  aftercare: {
    id: "aftercare",
    title: "Aftercare",
    text: "Ongoing support, maintenance and care long after the project is complete.",
    icon: "shield",
  },
} as const satisfies Record<ProcessStageId, ProcessStage>;
