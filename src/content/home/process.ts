import type { ServiceIconName } from "@/components/icons/service-icon";
import type { StageIndex } from "@/lib/art";

/**
 * Home "Seven stages" (`section.stg#home-process`, docs/analysis/02 §1.5). Copy is verbatim from
 * the original home page, which words some stages slightly differently from the shared master
 * process (`src/content/process-stages.ts`: "Interiors" instead of "Completion", serial commas),
 * so it is kept here rather than referenced from there.
 */

export type HomeStage = {
  readonly title: string;
  readonly text: string;
  readonly icon: ServiceIconName;
  /** Isometric drawing (`data-stage-art`): the house builds up from 0 (site) to 6 (finished). */
  readonly art: StageIndex;
};

export type HomeProcessContent = {
  readonly kicker: string;
  /** Title lines (the original breaks "Seven Stages,<br>One Continuous Build"). */
  readonly title: readonly string[];
  readonly stages: readonly HomeStage[];
};

export const HOME_PROCESS = {
  kicker: "How A Landmark Gets Made",
  title: ["Seven Stages,", "One Continuous Build"],
  stages: [
    {
      title: "Discovery",
      text: "Site visit, brief, constraints, and budget — the questions that shape everything after.",
      icon: "search",
      art: 0,
    },
    {
      title: "Concept",
      text: "First massing studies and spatial ideas, tested against light, view, and site logic.",
      icon: "compass",
      art: 1,
    },
    {
      title: "Design",
      text: "Detailed drawings, material decisions, and a fully resolved architectural language.",
      icon: "compass",
      art: 2,
    },
    {
      title: "Engineering",
      text: "Structural and services design, engineered so the building stands as drawn.",
      icon: "crane",
      art: 3,
    },
    {
      title: "Construction",
      text: "On-site execution supervised by our own team, built exactly to the drawing.",
      icon: "crane",
      art: 4,
    },
    {
      title: "Interiors",
      text: "Spatial planning, finishes, joinery and lighting that complete the architecture.",
      icon: "sofa",
      art: 5,
    },
    {
      title: "Handover",
      text: "A guided walkthrough, documentation and keys to a space ready to live in.",
      icon: "key",
      art: 6,
    },
  ],
} as const satisfies HomeProcessContent;
