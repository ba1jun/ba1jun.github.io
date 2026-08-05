import { test, expect } from "@playwright/test";

test.describe("Theme toggle", () => {
  test("dark mode toggle exists, is visible, and clicking flips dark class", async ({
    page,
  }) => {
    await page.goto("/");

    // Toggle must exist and be visible -- no conditional guard
    const toggle = page.getByRole("button", { name: /Switch to/ });
    await expect(toggle).toBeVisible({ timeout: 5000 });

    // Click to enable dark mode
    await toggle.click();

    // Poll until dark class is present on documentElement
    await expect
      .poll(() =>
        page.evaluate(() =>
          document.documentElement.classList.contains("dark"),
        ),
      )
      .toBe(true);

    // Toggle label should have changed
    await expect(toggle).toHaveAttribute("aria-label", /Switch to light/);

    // Click again to toggle back
    await toggle.click();

    await expect
      .poll(() =>
        page.evaluate(() =>
          document.documentElement.classList.contains("dark"),
        ),
      )
      .toBe(false);

    await expect(toggle).toHaveAttribute("aria-label", /Switch to dark/);
  });

  test("sun rays appear in dark mode, hidden in light mode", async ({
    page,
  }) => {
    // Regression gate: the rays' hidden state must live in the stylesheet, not
    // an inline style - inline opacity:0 beats the html.dark rule and the rays
    // never render.
    await page.goto("/");
    const rays = page.locator("#theme-toggle-rays");

    await expect
      .poll(() => rays.evaluate((el) => getComputedStyle(el).opacity))
      .toBe("0");

    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await expect
      .poll(() => rays.evaluate((el) => getComputedStyle(el).opacity))
      .toBe("1");
  });

  test("dark mode persists across navigation", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    });
    await page.goto("/muses/");
    await expect
      .poll(() =>
        page.evaluate(() =>
          document.documentElement.classList.contains("dark"),
        ),
      )
      .toBe(true);
  });
});
