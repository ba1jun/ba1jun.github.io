import { test, expect } from "@playwright/test";

// The list-card reading time must match the detail-page reading time for
// the same post (single source of truth: the remark plugin's readingTimeMs),
// displayed at the site's intentional second-level precision ("1m 23s") -
// never milliseconds, never rounded to "N min read".
test("list-card and detail-page reading times match for adam", async ({
  page,
}) => {
  // Navigate to the long_form list page
  await page.goto("/long_form/");

  // Find the adam post card and extract the reading time
  const adamCard = page.locator("article").filter({ hasText: "Adam" }).first();
  const listTime = (
    await adamCard.locator("p.font-inconsolata.text-sm").first().textContent()
  )?.trim();

  // Navigate to the adam detail page
  await page.goto("/long_form/adam/");

  // Extract the reading time from the detail page
  const detailTime = (
    await page.locator("p.prose.italic").first().textContent()
  )?.trim();

  // Same source of truth, same second-precision format on both surfaces
  expect(listTime).toBe(detailTime);
  expect(listTime).toMatch(/^(\d+m )?\d+s$/);
});

test("no page shows millisecond or rounded reading times", async ({ page }) => {
  await page.goto("/long_form/");
  const body = await page.locator("body").textContent();
  expect(body).not.toMatch(/\d+ms\b/);
  expect(body).not.toMatch(/\d+ min read/);
});
