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

  test("ScrollToTop button has a transparent background", async ({ page }) => {
    // The transparent floating-chevron look is the intended design: the React
    // version's bg-primary token resolved to no CSS, i.e. transparent. Locks in
    // that design so a future "fix" does not paint a filled circle again.
    await page.goto("/long_form/");
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(500);

    const btn = page.locator('button[aria-label="Scroll to top"]');
    await expect(btn).toBeVisible({ timeout: 5000 });

    const bg = await btn.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(["rgba(0, 0, 0, 0)", "transparent"]).toContain(bg);
  });
});

test.describe("islands survive client-side navigation (ClientRouter)", () => {
  // Regression gate for the W2 ClientRouter bug: vanilla islands that attach
  // listeners at script top level go dead after an astro view-transition swap,
  // because the swap replaces the DOM but does not re-execute bundled scripts.
  // page.goto() does a full load and cannot catch this; only a real in-app
  // navigation exercises it.

  test("hamburger still works after a client-side navigation", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/long_form/");
    // In-app navigation via a content link triggers a view transition.
    await page.locator('a[href="/long_form/adam/"]').first().click();
    await page.waitForURL(/\/long_form\/adam\//);
    const hamburger = page.getByRole("button", {
      name: /open menu|close menu/i,
    });
    await expect(hamburger).toBeVisible();
    await expect(hamburger).toHaveAttribute("aria-expanded", "false");
    await hamburger.click();
    await expect(hamburger).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#nav-links")).toHaveClass(/open/);
  });

  test("theme toggle still works after a client-side navigation", async ({
    page,
  }) => {
    await page.goto("/long_form/");
    await page.locator('a[href="/long_form/adam/"]').first().click();
    await page.waitForURL(/\/long_form\/adam\//);
    const toggle = page.getByRole("button", {
      name: /switch to (light|dark) theme/i,
    });
    await expect(toggle).toBeVisible();
    const before = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    await toggle.click();
    await expect
      .poll(() =>
        page.evaluate(() =>
          document.documentElement.classList.contains("dark"),
        ),
      )
      .toBe(!before);
  });

  test("hero image is visible after a client-side navigation", async ({
    page,
  }) => {
    await page.goto("/long_form/");
    await page.locator('a[href="/long_form/adam/"]').first().click();
    await page.waitForURL(/\/long_form\/adam\//);
    // The hero <img> renders opacity-0; the island script adds opacity-100.
    // If the script never re-runs after the swap, the hero stays invisible.
    const hero = page
      .locator("img.opacity-0, img[class*='opacity-100']")
      .first();
    await expect
      .poll(async () => hero.evaluate((el) => getComputedStyle(el).opacity))
      .toBe("1");
  });
});
