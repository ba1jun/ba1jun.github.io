import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("header nav links are present", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav, header");
    await expect(nav.first()).toBeVisible();
    const homeLink = page.locator('a[href="/"]').first();
    await expect(homeLink).toBeVisible();
  });

  test("nav links navigate to correct pages", async ({ page }) => {
    // Open hamburger menu on mobile to expose nav links
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const hamburger = page.getByRole("button", { name: /menu/i });
    await expect(hamburger).toBeVisible();
    await hamburger.click();
    const journeysLink = page.locator('#nav-links a[href="/journeys/"]');
    await expect(journeysLink).toBeVisible({ timeout: 3000 });
    const researchLink = page.locator(
      '#nav-links a[href="https://ba1jun.github.io/research-page/"]',
    );
    await expect(researchLink).toBeVisible();
    await journeysLink.click();
    await expect(page).toHaveURL(/\/journeys/);
  });

  test("hamburger menu toggles on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const hamburger = page.getByRole("button", { name: /menu/i });
    await expect(hamburger).toBeVisible();

    // Initial state: collapsed
    await expect(hamburger).toHaveAttribute("aria-expanded", "false");
    await expect(hamburger).toHaveAttribute("aria-controls", "nav-links");
    const navLinks = page.locator("#nav-links");
    await expect(navLinks).toHaveClass(/collapsed/);

    // Click to open
    await hamburger.click();
    await expect(hamburger).toHaveAttribute("aria-expanded", "true");
    await expect(navLinks).toBeVisible({ timeout: 3000 });
    await expect(navLinks).toHaveClass(/open/);
    const inert = await navLinks.evaluate((el) => el.hasAttribute("inert"));
    expect(inert).toBe(false);

    // Escape to close
    await page.keyboard.press("Escape");
    await expect(hamburger).toHaveAttribute("aria-expanded", "false");
    await expect(navLinks).toHaveClass(/collapsed/);
    const inertAfter = await navLinks.evaluate((el) =>
      el.hasAttribute("inert"),
    );
    expect(inertAfter).toBe(true);
  });

  test("W22: menu role without keyboard nav (ARIA audit)", async ({ page }) => {
    await page.goto("/");
    const menuElement = page.locator('[role="menu"]');
    const count = await menuElement.count();
    if (count > 0) {
      const menuItems = page.locator('[role="menuitem"]');
      const itemCount = await menuItems.count();
      expect(itemCount).toBeGreaterThan(0);
    }
  });

  test("footer renders with social links", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    const externalLinks = footer.locator('a[target="_blank"]');
    const count = await externalLinks.count();
    for (let i = 0; i < count; i++) {
      const rel = await externalLinks.nth(i).getAttribute("rel");
      const href = await externalLinks.nth(i).getAttribute("href");
      if (rel !== null) {
        expect(rel, `External link ${href} missing noopener`).toContain(
          "noopener",
        );
      } else {
        expect
          .soft(rel, `External link ${href} has no rel attribute`)
          .toBeTruthy();
      }
    }
  });

  test("W31: footer RSS link href is not empty after JS", async ({ page }) => {
    await page.goto("/journeys/");
    await page.waitForTimeout(1000);
    const rssLink = page.locator("#rss-link");
    if ((await rssLink.count()) > 0) {
      const href = await rssLink.getAttribute("href");
      if (href !== null) {
        expect(href).not.toBe("");
      }
    }
  });
});
