import { MEDIA_FOLDERS, type MediaMapEntry } from "./media-map";

const ID_PATTERN = new RegExp(`^(${MEDIA_FOLDERS.join("|")})/[a-z0-9]+(?:-[a-z0-9]+)*$`);

/**
 * Pure validation of the media map. Returns a list of human-readable problems (empty = valid).
 * When `availableKeys` is given (local runs with `reference/` present) it also checks coverage
 * against the original asset set.
 */
export function validateMediaMap(
  map: readonly MediaMapEntry[],
  unusedKeys: readonly string[],
  availableKeys?: ReadonlySet<string>,
): string[] {
  const problems: string[] = [];
  const seenKeys = new Set<string>();
  const seenIds = new Set<string>();

  for (const entry of map) {
    if (seenKeys.has(entry.key)) problems.push(`Duplicate source key: ${entry.key}`);
    if (seenIds.has(entry.id)) problems.push(`Duplicate id: ${entry.id}`);
    seenKeys.add(entry.key);
    seenIds.add(entry.id);

    if (!ID_PATTERN.test(entry.id))
      problems.push(`Invalid id (expected <folder>/<kebab-case>): ${entry.id}`);
    if (entry.description.trim() === "") problems.push(`Missing description: ${entry.id}`);
    if (unusedKeys.includes(entry.key))
      problems.push(`Key is both mapped and marked unused: ${entry.key}`);
    if (availableKeys && !availableKeys.has(entry.key)) {
      problems.push(`Source asset not found for key ${entry.key} (${entry.id})`);
    }
  }

  if (availableKeys) {
    for (const key of availableKeys) {
      if (!seenKeys.has(key) && !unusedKeys.includes(key)) {
        problems.push(`Original asset ${key} is neither mapped nor listed as unused`);
      }
    }
  }

  return problems;
}

/** `photos/brick-courtyard-house-dusk` -> `photosBrickCourtyardHouseDusk` */
export function toIdentifier(id: string): string {
  return id
    .split(/[/-]/)
    .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join("");
}
