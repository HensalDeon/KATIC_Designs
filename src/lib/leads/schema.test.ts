import { describe, expect, it } from "vitest";

import { formDataToLead, leadFieldErrors, leadSchema } from "./schema";

const source = { form: "popup", path: "/services/turnkey", title: "Turnkey Projects" } as const;

function errorsOf(candidate: unknown) {
  const result = leadSchema.safeParse(candidate);
  if (result.success) throw new Error("expected validation to fail");
  return leadFieldErrors(result.error);
}

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("leadSchema", () => {
  it("accepts a minimal valid enquiry and drops empty optional fields", () => {
    const candidate = formDataToLead(
      form({ name: " Jane Doe ", email: "jane@email.com", service: "Turnkey Projects", phone: "" }),
      source,
    );
    const result = leadSchema.safeParse(candidate);
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({ name: "Jane Doe", phone: undefined });
  });

  it("reports one clear message per invalid field", () => {
    const errors = errorsOf(
      formDataToLead(form({ name: "", email: "not-an-email", service: "" }), source),
    );
    expect(errors).toEqual({
      name: "Please enter your full name.",
      email: "Please enter a valid email address.",
      service: "Please choose a service.",
    });
  });

  it("asks for an email when it is missing", () => {
    const errors = errorsOf(
      formDataToLead(form({ name: "Jane", email: "", service: "Interior Design" }), source),
    );
    expect(errors.email).toBe("Please enter your email address.");
  });

  it("rejects values outside the offered options", () => {
    const result = leadSchema.safeParse(
      formDataToLead(
        form({ name: "Jane", email: "j@e.co", service: "Interior Design", budget: "Free" }),
        source,
      ),
    );
    expect(result.success).toBe(false);
  });
});
