import { test, expect } from "@playwright/test";

// Section 3.1 of the streamline-stack plan: the list-card reading time
// should match the detail-page reading time for the same post.
// Currently they differ (list says "27s 300ms", detail says "17s 100ms"
// for the adam post), so this test documents the inconsistency.
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

  // These should be the same - section 3.1 reading-time consistency
  expect(listTime).toBe(detailTime);
});
