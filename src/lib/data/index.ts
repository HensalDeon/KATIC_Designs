/**
 * The data layer (D6, docs/DATA_LAYER.md): cached, tagged reads of the content repository. Server
 * only; route files fetch their page resource here and pass it down as props.
 */
export * from "./accessors";
export { getTrailLabels } from "./labels";
export { type ContentRefs, getRefs } from "./refs";
export type * from "./repository";
export { tags } from "./tags";
