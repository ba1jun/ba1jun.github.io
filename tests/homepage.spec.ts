import { test, expect } from "@playwright/test";

test.describe("Personal homepage", () => {
  test("introduces Jun Bai with a portrait and working entry links", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Jun Bai",
    );
    const portrait = page.getByRole("img", {
      name: "Jun Bai outdoors on a grassy hillside",
    });
    await expect(portrait).toBeVisible();
    await expect
      .poll(() =>
        portrait.evaluate((img: HTMLImageElement) => img.naturalWidth),
      )
      .toBeGreaterThan(0);
    await expect(
      page.getByRole("link", { name: "Research", exact: true }),
    ).toHaveAttribute("href", "/research/");
    await expect(
      page.getByRole("link", { name: "Photography", exact: true }),
    ).toHaveAttribute("href", "/photography/");
    await expect(
      page.getByRole("link", { name: "GitHub", exact: true }),
    ).toHaveAttribute("href", "https://github.com/ba1jun");
    const personalLinks = page.getByRole("navigation", {
      name: "Personal links",
    });
    await expect(personalLinks.getByRole("link")).toHaveText([
      "Google Scholar",
      "GitHub",
      "X",
      "LinkedIn",
      "Email",
    ]);
    await expect(
      personalLinks.getByRole("link", { name: "Email" }),
    ).toHaveAttribute("href", "mailto:baijun@bigai.ai");
  });

  test("photography entry opens the existing album collection", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Photography", exact: true }).click();
    await expect(page).toHaveURL(/\/photography\//);
    await expect(page).toHaveTitle("Jun Bai's Homepage");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Photography",
    );
    const album = page
      .locator('main article a[href="/journeys/saigon-phu-quoc/"]')
      .first();
    await expect(album).toBeVisible();
    await album.click();
    await expect(page).toHaveURL(/\/journeys\/saigon-phu-quoc\//);
  });

  test("old journeys index remains available", async ({ page }) => {
    const response = await page.goto("/journeys/");
    expect(response?.status()).toBe(200);
    await expect(page.locator("main article").first()).toBeVisible();
    await expect(
      page.locator('#nav-links a[href="/photography/"]'),
    ).toHaveAttribute("aria-current", "page");
  });

  test("research entry opens the academic page in this site", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Research", exact: true }).click();
    await expect(page).toHaveURL(/\/research\/$/);
    await expect(page).toHaveTitle("Jun Bai's Homepage");
    await expect(page.getByRole("heading", { name: "About me" })).toBeVisible();
  });

  test("mobile homepage fits its portrait and links in one screen", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const widths = await page.evaluate(() => ({
      content: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));
    expect(widths.content).toBeLessThanOrEqual(widths.viewport);
    await expect(
      page.getByRole("img", { name: "Jun Bai outdoors on a grassy hillside" }),
    ).toBeInViewport();
    await expect(
      page.getByRole("link", { name: "Research", exact: true }),
    ).toBeInViewport();
    await expect(
      page.getByRole("link", { name: "Photography", exact: true }),
    ).toBeInViewport();
  });

  test("homepage entry links work without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    try {
      await page.goto("/");
      await expect(page.getByRole("heading", { level: 1 })).toContainText(
        "Jun Bai",
      );
      await page
        .getByRole("link", { name: "Photography", exact: true })
        .click();
      await expect(page.locator("main article").first()).toBeVisible();
    } finally {
      await context.close();
    }
  });
});
