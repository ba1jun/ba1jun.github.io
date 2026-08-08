import { test, expect } from "@playwright/test";

test.describe("Styling canaries", () => {
  test("prose max-width overridden to 1280px by max-w-7xl", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto("/long_form/adam/");
    const wrapper = page.locator("div.max-w-7xl").first();
    await expect(wrapper).toBeVisible();
    const box = await wrapper.boundingBox();
    expect(box).not.toBeNull();
    // at 1600px viewport, the wrapper should be constrained to 1280px
    expect(box!.width).toBeLessThanOrEqual(1281);
  });

  test("custom sm breakpoint is 800px not 640px", async ({ page }) => {
    await page.goto("/long_form/");
    // sm:flex-row: below 800px it's column, above 800px it's row
    const probe = page
      .locator('xpath=//*[contains(@class,"sm:flex-row")]')
      .first();
    await expect(probe).toBeVisible({ timeout: 10000 });

    // Below 800px: flex-direction should be column
    await page.setViewportSize({ width: 799, height: 900 });
    await page.waitForTimeout(200);
    expect(
      await probe.evaluate((el) => getComputedStyle(el).flexDirection),
    ).toBe("column");

    // Above 800px: flex-direction should be row
    await page.setViewportSize({ width: 801, height: 900 });
    await page.waitForTimeout(200);
    expect(
      await probe.evaluate((el) => getComputedStyle(el).flexDirection),
    ).toBe("row");
  });

  test("font-overpass-mono resolves to Overpass Mono on /", async ({
    page,
  }) => {
    await page.goto("/");
    const el = page.locator(".font-overpass-mono").first();
    await expect(el).toBeVisible();
    const fontFamily = await el.evaluate((e) => getComputedStyle(e).fontFamily);
    expect(fontFamily).toContain("Overpass Mono");
  });

  test("font-inconsolata resolves to Inconsolata on /long_form/adam/", async ({
    page,
  }) => {
    await page.goto("/long_form/adam/");
    const el = page.locator(".font-inconsolata").first();
    await expect(el).toBeVisible();
    const fontFamily = await el.evaluate((e) => getComputedStyle(e).fontFamily);
    expect(fontFamily).toContain("Inconsolata");
  });

  test("prose-no-quotes suppresses blockquote ::before content", async ({
    page,
  }) => {
    // prose-no-quotes is applied on /long_form/adam/.
    // If no blockquote exists, skip gracefully (spec says "skip if no blockquote").
    await page.goto("/long_form/adam/");
    const blockquote = page.locator("blockquote");
    const count = await blockquote.count();
    if (count === 0) {
      test.skip(true, "no blockquote on this page");
      return;
    }
    // Tailwind Typography adds quote marks via p:first-of-type::before inside blockquotes.
    // prose-no-quotes should suppress them, so the ::before pseudo-element on the first
    // p inside the blockquote should have content: none.
    const beforeContent = await blockquote
      .first()
      .locator("p")
      .first()
      .evaluate((el) => getComputedStyle(el, "::before").content);
    expect(beforeContent).toBe("none");
  });

  test(".dark class sets html background to rgb(34,33,37)", async ({
    page,
  }) => {
    await page.goto("/");
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.waitForTimeout(100);
    const bg = await page.evaluate(
      () => getComputedStyle(document.documentElement).backgroundColor,
    );
    expect(bg).toBe("rgb(34, 33, 37)");
  });
});
