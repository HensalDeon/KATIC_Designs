/**
 * Content types of the project detail pages (`/works/[slug]`, original `#p-project`). They are the
 * `z.infer` of the API schemas in `src/lib/schemas/project-details.ts`, which documents the page
 * anatomy; re-exported here for the content modules of this folder.
 *
 * Only runtime-free type imports are allowed in this folder: `projects.ts` imports the registry.
 */
export type * from "@/lib/schemas/project-details";
