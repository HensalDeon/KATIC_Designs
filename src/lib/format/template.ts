/**
 * Copy with placeholders, so that copy built from a value ("Architecture articles") stays plain data
 * the CMS can edit: `"{category} articles"`. Placeholders are `{name}`; every one must be given.
 */
export type TemplateValues = Readonly<Record<string, string>>;

const PLACEHOLDER = /\{([a-zA-Z]+)\}/g;

/** The placeholder names of `template`, in order of appearance. */
export function templatePlaceholders(template: string): string[] {
  return [...template.matchAll(PLACEHOLDER)].map((match) => match[1] ?? "");
}

/** `template` with each `{name}` replaced by `values[name]`; throws on a missing value. */
export function fillTemplate(template: string, values: TemplateValues): string {
  return template.replace(PLACEHOLDER, (placeholder, name: string) => {
    const value = values[name];
    if (value === undefined) throw new Error(`No value for ${placeholder} in "${template}"`);
    return value;
  });
}
