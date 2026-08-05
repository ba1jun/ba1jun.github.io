import { test, expect } from "@playwright/test";

test.describe("ScrollToTop", () => {
  test("button is absent before scrolling, appears after scrolling down, and scrolls to top on click", async ({
    page,
  }) => {
    // Use a page with long content so scrolling is meaningful
    await page.goto("/long_form/");

    // ScrollToTop is a client:idle React island -- wait for hydration
    await page.waitForTimeout(2000);

    // Button should not be visible initially (scrollY is near 0)
    const btn = page.locator('button[aria-label="Scroll to top"]');
    await expect(btn).not.toBeVisible();

    // Scroll down past the 300px threshold
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(500); // let requestAnimationFrame fire

    // Button should appear after scrolling past 300px
    await expect(btn).toBeVisible({ timeout: 5000 });

    // Click it and verify scrollY returns near the top
    await btn.click();
    await page.waitForTimeout(700); // smooth scroll takes time
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(50);
  });

  test.fail(
    "ScrollToTop button has a non-transparent background-color",
    async ({ page }) => {
      // Documents current bug: bg-primary on the ScrollToTop button
      // resolves to no CSS, so the computed background is transparent.
      // The button uses class bg-primary which should produce a visible
      // background when the fill is wired up to a CSS variable.
      await page.goto("/long_form/");

      // Wait for client:idle island hydration
      await page.waitForTimeout(2000);

      // Scroll down to make the button appear
      await page.evaluate(() => window.scrollTo(0, 800));
      await page.waitForTimeout(500);

      const btn = page.locator('button[aria-label="Scroll to top"]');
      await expect(btn).toBeVisible({ timeout: 5000 });

      const bg = await btn.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          color: style.backgroundColor,
          opacity: style.opacity,
        };
      });

      // The button should have a non-transparent, non-translucent background
      const isTransparent =
        bg.color === "rgba(0, 0, 0, 0)" || bg.color === "transparent";
      expect(isTransparent, `computed backgroundColor was ${bg.color}`).toBe(
        false,
      );
    },
  );
});
