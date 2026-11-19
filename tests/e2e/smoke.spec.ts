import { expect, test } from "@playwright/test";

/**
 * Pages that are linked from the shell but not built yet answer 404 to Next's route prefetches.
 * Those are expected during the migration; any other failed resource is a real error.
 */
const isRoutePrefetch = (url: string) => new URL(url).searchParams.has("_rsc");

test("home page renders without runtime errors", async ({ page }) => {
  const errors: string[] = [];
  const unexpected404s: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().startsWith("Failed to load resource")) {
      errors.push(message.text());
    }
  });
  page.on("response", (response) => {
    if (response.status() >= 400 && !isRoutePrefetch(response.url())) {
      unexpected404s.push(`${response.status()} ${response.url()}`);
    }
  });

  const response = await page.goto("/");
  await page.waitForLoadState("networkidle");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Katic Designs/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
  expect(unexpected404s).toEqual([]);
});
