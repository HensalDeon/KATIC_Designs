import { createHmac, randomUUID } from "node:crypto";

import { type APIRequestContext, expect, type Page, test } from "@playwright/test";

/**
 * The site against the mock Laravel API (Phase 11). Runs only when MOCK_LARAVEL_URL points at a
 * running `pnpm mock:laravel` that the server under test uses (LEADS_ENDPOINT, and for content
 * DATA_SOURCE=laravel + LARAVEL_API_URL):
 *
 *   MOCK_LARAVEL_URL=http://127.0.0.1:3651 E2E_BASE_URL=http://127.0.0.1:3621 \
 *     pnpm exec playwright test tests/e2e/laravel.spec.ts --project=desktop
 */
const mock = process.env["MOCK_LARAVEL_URL"];

// Both groups share the mock's state (leads, overrides): one worker, in order.
test.describe.configure({ mode: "serial" });

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

/**
 * Content from Laravel and on-demand revalidation: change the mock's data, call the signed webhook,
 * and the prerendered page shows the change (DATA_SOURCE=laravel servers only).
 *
 * These tests change a live page for a few seconds, which would race the other specs that check
 * the same page, so they only run on request (E2E_MUTATE_CONTENT=1), on their own:
 *
 *   E2E_MUTATE_CONTENT=1 DATA_SOURCE=laravel LARAVEL_API_TOKEN=… REVALIDATE_SECRET=… \
 *     MOCK_LARAVEL_URL=http://127.0.0.1:3651 E2E_BASE_URL=http://127.0.0.1:3621 \
 *     pnpm exec playwright test tests/e2e/laravel.spec.ts --project=desktop
 */
test.describe("content from the mock Laravel API", () => {
  const secret = process.env["REVALIDATE_SECRET"];
  const token = process.env["LARAVEL_API_TOKEN"] ?? "";
  const laravelMode = process.env["DATA_SOURCE"] === "laravel";
  const PAGE = "/services/interior";
  const RESOURCE = "/api/v1/services/interior";
  const UPLOAD = "uploads/e2e-hero";

  test.skip(
    !mock || !laravelMode || !secret || process.env["E2E_MUTATE_CONTENT"] !== "1",
    "needs E2E_MUTATE_CONTENT=1, MOCK_LARAVEL_URL, DATA_SOURCE=laravel, REVALIDATE_SECRET",
  );
  test.skip(({ isMobile }) => isMobile, "server behaviour: one project is enough");
  test.describe.configure({ mode: "serial" });

  async function api(path: string): Promise<unknown> {
    const response = await fetch(`${mock ?? ""}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok, path).toBe(true);
    return ((await response.json()) as { data: unknown }).data;
  }

  async function override(path: string, data: unknown) {
    const response = await fetch(`${mock ?? ""}/__mock/override?path=${encodeURIComponent(path)}`, {
      method: "PUT",
      body: JSON.stringify({ data }),
    });
    expect(response.ok).toBe(true);
  }

  async function revalidate(request: APIRequestContext, tags: string[], immediate: boolean) {
    const body = JSON.stringify({ tags, immediate });
    const timestamp = Math.floor(Date.now() / 1000);
    const digest = createHmac("sha256", secret ?? "")
      .update(`${timestamp}.${body}`)
      .digest("hex");
    const response = await request.post("/api/revalidate", {
      data: body,
      headers: {
        "content-type": "application/json",
        "x-katic-timestamp": String(timestamp),
        "x-katic-signature": `sha256=${digest}`,
      },
    });
    expect(response.status()).toBe(200);
  }

  /**
   * Back to the mock's own content, and wait until the page shows it: a background regeneration
   * started by a stale-while-revalidate call can still land after the first expiry.
   */
  async function restore(request: APIRequestContext) {
    await control("/override", "DELETE");
    const { hero } = (await api(RESOURCE)) as { hero: { lead: string } };
    await expect(async () => {
      await revalidate(request, ["service:interior", "media"], true);
      const html = await (await request.get(PAGE)).text();
      expect(html).toContain(hero.lead);
      expect(html).not.toMatch(/(Revalidated|Background) lead/);
    }).toPass({ timeout: 20_000 });
  }

  test.beforeEach(async ({ request }) => {
    await restore(request);
  });

  test.afterEach(async ({ request }) => {
    await restore(request);
  });

  test("a revalidate call refreshes the page with the changed content and a CMS upload", async ({
    page,
    request,
  }) => {
    const original = (await api(RESOURCE)) as { hero: { lead: string; image: { src: unknown } } };
    const lead = `Revalidated lead ${randomUUID()}`;
    await override(RESOURCE, {
      ...original,
      hero: { ...original.hero, lead, image: { ...original.hero.image, src: UPLOAD } },
    });
    const library = (await api("/api/v1/media")) as object[];
    await override("/api/v1/media", [
      ...library,
      {
        id: UPLOAD,
        url: `${mock ?? ""}/media/photos/kitchen-joinery.webp`,
        width: 1440,
        height: 1028,
      },
    ]);

    // Changing Laravel alone changes nothing: the page is prerendered and cached.
    await page.goto(PAGE);
    await expect(page.getByText(original.hero.lead).first()).toBeVisible();
    await expect(page.getByText(lead)).toHaveCount(0);

    // The prerendered page re-renders on the visit after the call (that visit may still get the
    // previous HTML), so poll a few visits.
    await revalidate(request, ["service:interior"], true);
    await expect(async () => {
      await page.goto(PAGE);
      await expect(page.getByText(lead)).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 15_000 });
    const upload = page.locator(
      `img[src*="${encodeURIComponent(`${mock ?? ""}/media/photos/kitchen-joinery.webp`)}"]`,
    );
    await expect(upload).toHaveCount(1);
    const image = await request.get((await upload.getAttribute("src")) ?? "");
    expect(image.status()).toBe(200);
    expect(image.headers()["content-type"]).toMatch(/^image\//);
  });

  test("the default (stale-while-revalidate) call refreshes on a following visit", async ({
    page,
    request,
  }) => {
    const original = (await api(RESOURCE)) as { hero: { lead: string } };
    const lead = `Background lead ${randomUUID()}`;
    await override(RESOURCE, { ...original, hero: { ...original.hero, lead } });
    await revalidate(request, ["service:interior"], false);
    await expect(async () => {
      await page.goto(PAGE);
      await expect(page.getByText(lead)).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 15_000 });
  });
});
