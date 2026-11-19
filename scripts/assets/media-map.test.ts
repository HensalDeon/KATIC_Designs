import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { MEDIA_MAP, UNUSED_SOURCE_KEYS } from "./media-map";
import { toIdentifier, validateMediaMap } from "./validate-media-map";

describe("media map", () => {
  it("is valid", () => {
    expect(validateMediaMap(MEDIA_MAP, UNUSED_SOURCE_KEYS)).toEqual([]);
  });

  it("accounts for every asset of the original site (136 images)", () => {
    expect(MEDIA_MAP.length + UNUSED_SOURCE_KEYS.length).toBe(136);
  });

  it("is in sync with the generated manifest", () => {
    const manifest = readFileSync(path.join(process.cwd(), "src/content/media.ts"), "utf8");
    for (const entry of MEDIA_MAP) {
      expect(manifest, `missing ${entry.id} — run pnpm assets:sync`).toContain(
        `"@/assets/images/${entry.id}.webp"`,
      );
    }
    const generatedCount = manifest.match(/from "@\/assets\/images\//g)?.length ?? 0;
    expect(generatedCount).toBe(MEDIA_MAP.length);
  });
});

describe("validateMediaMap", () => {
  const base = { key: "abc", id: "photos/a-b", description: "A" } as const;

  it("flags duplicates, bad ids, empty descriptions and unused overlaps", () => {
    const problems = validateMediaMap(
      [base, { ...base }, { key: "x", id: "photos/Bad_Name", description: " " }],
      ["x"],
    );
    expect(problems).toEqual(
      expect.arrayContaining([
        "Duplicate source key: abc",
        "Duplicate id: photos/a-b",
        "Invalid id (expected <folder>/<kebab-case>): photos/Bad_Name",
        "Missing description: photos/Bad_Name",
        "Key is both mapped and marked unused: x",
      ]),
    );
  });

  it("checks coverage against the available originals", () => {
    expect(validateMediaMap([base], [], new Set(["abc", "zzz"]))).toEqual([
      "Original asset zzz is neither mapped nor listed as unused",
    ]);
  });
});

describe("toIdentifier", () => {
  it("camel-cases folder and name", () => {
    expect(toIdentifier("photos/brick-courtyard-house-dusk")).toBe("photosBrickCourtyardHouseDusk");
    expect(toIdentifier("people/team-member-01")).toBe("peopleTeamMember01");
  });
});
