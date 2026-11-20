import { randomUUID } from "node:crypto";

import { expect, type Page, test } from "@playwright/test";

/**
 * The site against the mock Laravel API (Phase 11). Runs only when MOCK_LARAVEL_URL points at a
 * running `pnpm mock:laravel` that the server under test uses (LEADS_ENDPOINT, and for content
 * DATA_SOURCE=laravel + LARAVEL_API_URL):
 *
 *   MOCK_LARAVEL_URL=http://127.0.0.1:3651 E2E_BASE_URL=http://127.0.0.1:3621 \
 *     pnpm exec playwright test tests/e2e/laravel.spec.ts --project=desktop
 */
const mock = process.env["MOCK_LARAVEL_URL"];

type RecordedLead = { idempotencyKey: string | null; body: Record<string, unknown> };

const lead = {
  name: "Jane Doe",
  email: "jane@email.com",
  service: "Interior Design",
  source: { form: "popup", path: "/", title: "Home" },
};

/** A fresh client address per test, so the per-IP rate limit of /api/leads never interferes. */
const client = () => ({
  "x-forwarded-for": `10.0.${Math.floor(Math.random() * 250)}.${Date.now() % 250}`,
});

async function control(path: string, method: string, data?: unknown) {
  const response = await fetch(`${mock ?? ""}/__mock${path}`, {
    method,
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  expect(response.ok, `${method} /__mock${path}`).toBe(true);
  return (await response.json()) as unknown;
}

const receivedLeads = async () =>
  ((await control("/leads", "GET")) as { data: RecordedLead[] }).data;

test.describe("against the mock Laravel API", () => {
  test.skip(!mock, "set MOCK_LARAVEL_URL to run against pnpm mock:laravel");
  test.skip(({ isMobile }) => isMobile, "server behaviour: one project is enough");
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async () => {
    await control("/leads", "DELETE");
    await control("/override", "DELETE");
  });

  test.describe("POST /api/leads → LEADS_ENDPOINT", () => {
    test("delivers the lead with an idempotency key", async ({ request }) => {
      const response = await request.post("/api/leads", { data: lead, headers: client() });
      expect(response.status()).toBe(202);
      expect(await response.json()).toEqual({ ok: true, status: "sent" });

      const [received, ...rest] = await receivedLeads();
      expect(rest).toEqual([]);
      expect(received?.idempotencyKey).toMatch(/^[0-9a-f-]{36}$/);
      expect(received?.body).toMatchObject({
        ...lead,
        subject: "Project enquiry — Interior Design (Home)",
      });
      expect(received?.body).not.toHaveProperty("company_website");
      expect(Date.parse(String(received?.body["submittedAt"]))).not.toBeNaN();
    });

    test("maps Laravel failures to the visitor-facing statuses", async ({ request }) => {
      for (const [mode, status, body] of [
        [500, 502, { ok: false, status: "failed" }],
        [422, 502, { ok: false, status: "failed" }],
        [429, 429, { ok: false, status: "rate-limited" }],
      ] as const) {
        await control("/leads/mode", "PUT", { status: mode });
        const response = await request.post("/api/leads", { data: lead, headers: client() });
        expect(response.status(), `Laravel ${mode}`).toBe(status);
        expect(await response.json()).toEqual(body);
      }
      expect(await receivedLeads()).toEqual([]);
    });

    test("a failed delivery reaches /thank-you with the email fallback", async ({ page }) => {
      await control("/leads/mode", "PUT", { status: 500 });
      await page.setExtraHTTPHeaders(client());
      await sendPopupEnquiry(page);
      await expect(page).toHaveURL(/\/thank-you$/);
      await expect(page.getByTestId("lead-fallback")).toBeVisible();
    });

    test("a delivered enquiry reaches /thank-you without the fallback", async ({ page }) => {
      await page.setExtraHTTPHeaders(client());
      await sendPopupEnquiry(page);
      await expect(page).toHaveURL(/\/thank-you$/);
      await expect(page.getByTestId("lead-fallback")).toBeHidden();
      expect(await receivedLeads()).toHaveLength(1);
    });
  });
});

async function sendPopupEnquiry(page: Page) {
  await page.goto("/about");
  await page
    .locator(".zoom-root > header")
    .getByRole("button", { name: "Start a Project" })
    .click();
  const dialog = page.getByRole("dialog", { name: /Let’s build/ });
  await dialog.getByLabel("Full name").fill(`Jane ${randomUUID().slice(0, 4)}`);
  await dialog.getByLabel("Email").fill("jane@email.com");
  await dialog.getByLabel("Service needed").selectOption("Turnkey Projects");
  await dialog.getByRole("button", { name: "Send Enquiry" }).click();
}
