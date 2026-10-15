import { test, expect } from "@playwright/test";

const repositoryStars: Record<string, number> = {
  "bigai-nlco/belief-context-graph": 222,
  "bigai-nlco/Native-Parallel-Reasoner": 112,
  "humanlaya/OneMillion-Bench": 54,
  "bigai-nlco/RouterLens": 29,
  "bigai-nlco/TongSearch-QR": 44,
};

test.describe("Academic site migration", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("https://api.github.com/repos/**", async (route) => {
      const repository = new URL(route.request().url()).pathname.replace(
        "/repos/",
        "",
      );
      const stars = repositoryStars[repository];
      if (stars === undefined)
        throw new Error(`Unexpected repository: ${repository}`);
      await route.fulfill({ json: { stargazers_count: stars } });
    });
  });

  for (const path of [
    "/research",
    "/research/",
    "/research-page",
    "/research-page/",
  ]) {
    test(`${path} serves academic content directly`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveURL(new RegExp(`${path.replace(/\/$/, "")}/?$`));
      await expect(page).toHaveTitle("Jun Bai's Homepage");
      await expect(page.locator('meta[http-equiv="refresh"]')).toHaveCount(0);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(
        "Jun Bai",
      );
      await expect(
        page.getByRole("heading", { name: "Selected publications" }),
      ).toBeVisible();
      await expect(page.locator(".publication")).toHaveCount(8);
      expect(
        await page
          .locator(".publication")
          .evaluateAll((items) => items.map((item) => item.id)),
      ).toEqual([
        "paper-2026-bcg",
        "paper-2026-onemillionbench",
        "paper-2026-circuitlens",
        "paper-2025-npr",
        "paper-2025-routerlens",
        "paper-2025-tongsearch",
        "paper-2024-airtran",
        "paper-2023-survey",
      ]);
      await expect(page.locator("[data-github-stars]")).toHaveCount(5);
      for (const [repository, stars] of Object.entries(repositoryStars)) {
        await expect(
          page.locator(`[data-github-stars="${repository}"]`),
        ).toHaveAccessibleName(`GitHub stars: ${stars}`);
      }
      await expect(page.locator(".news-item")).toHaveCount(5);
      await expect(page.locator("#paper-2026-xetrieval")).toHaveCount(0);
      await expect(page.locator("#paper-2026-bcg")).toBeVisible();
      await expect(page.locator(".news-item").first()).toContainText(
        "Sep 29, 2026",
      );
      await expect(page.locator(".news-item").first()).toContainText(
        "Belief Context Graph (BCG) has been accepted by the NeurIPS 2026 Workshop on Resource-Aware Agentic AI.",
      );
      await expect(
        page.locator(".news-item").filter({ hasText: "OneMillion-Bench" }),
      ).toContainText("Sep 24, 2026");
      await expect(
        page.locator(".news-item").filter({ hasText: "OneMillion-Bench" }),
      ).toContainText(
        "OneMillion-Bench has been accepted by NeurIPS 2026 (Evaluations and Datasets Track).",
      );
      await expect(
        page.locator(".news-item").filter({ hasText: "CircuitLens" }),
      ).toContainText("Aug 20, 2026");
      await expect(
        page.locator(".news-item").filter({ hasText: "CircuitLens" }),
      ).toContainText("CircuitLens has been accepted by EMNLP 2026 Findings.");
      await expect(
        page.locator(".news-item").filter({ hasText: "We released" }),
      ).toHaveCount(0);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        "https://ba1jun.github.io/research/",
      );
      await expect(
        page.locator('#nav-links a[href="/research/"]'),
      ).toHaveAttribute("aria-current", "page");
      await expect(
        page.getByRole("link", { name: "Google Scholar" }),
      ).toHaveAttribute(
        "href",
        "https://scholar.google.com/citations?user=D4WEfiEAAAAJ",
      );
    });
  }

  test("complete publication list preserves papers and contribution markers", async ({
    page,
  }) => {
    await page.goto("/research/");
    await page.getByRole("link", { name: "All publications" }).click();
    await expect(page).toHaveURL(/\/research\/publications\/$/);
    await expect(page.locator(".publication")).toHaveCount(23);
    await expect(page.locator("[data-github-stars]")).toHaveCount(5);
    const bcg = page.locator("#paper-2026-bcg");
    await expect(bcg.getByRole("heading").getByRole("link")).toHaveAttribute(
      "href",
      "https://github.com/bigai-nlco/belief-context-graph",
    );
    await expect(bcg.getByRole("link", { name: /^Paper:/ })).toHaveCount(0);
    await expect(bcg).toContainText(
      "NeurIPS Workshop on Resource-Aware Agentic AI",
    );
    await expect(page.locator("#paper-2026-circuitlens")).toContainText(
      "EMNLP Findings",
    );
    await expect(
      page
        .locator("#paper-2026-circuitlens")
        .getByRole("link", { name: /^Paper:/ }),
    ).toHaveAttribute("href", "https://arxiv.org/abs/2609.07183");
    await expect(page.locator("#paper-2026-onemillionbench")).toContainText(
      "NeurIPS",
    );
    await expect(page.locator("#paper-2026-onemillionbench")).toContainText(
      "Evaluations and Datasets Track",
    );
    await expect(page.getByRole("heading", { level: 2 })).toHaveText([
      "2026",
      "2025",
      "2024",
      "2023",
      "2022",
      "2021",
    ]);
    await expect(page.locator("#paper-2026-xetrieval")).toContainText(
      "* equal contribution",
    );
    await expect(page.locator("#paper-2025-logipe")).toContainText(
      "# corresponding author",
    );
    await expect(page.locator("#paper-2025-routerlens")).toContainText(
      "Top 2%",
    );
    await expect(page.locator("#paper-2023-pit")).toContainText("Oral");
    await expect(
      page
        .locator("#paper-2026-xetrieval")
        .getByRole("link", { name: /^Code:/ }),
    ).toHaveAttribute("href", "https://github.com/Hihiczx/Xetrieval");
  });

  test("legacy publication addresses remain usable", async ({ page }) => {
    await page.goto("/research-page/publications/");
    await expect(page.locator(".publication")).toHaveCount(23);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://ba1jun.github.io/research/publications/",
    );
    await page.goto("/research-page/publications.html");
    await expect(page).toHaveURL(/\/research\/publications\/$/);
    await expect(page.locator(".publication")).toHaveCount(23);
  });

  test("mobile academic pages fit without horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    for (const path of ["/research/", "/research/publications/"]) {
      await page.goto(path);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(375);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("theme and navigation continue to work across academic pages", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#theme-toggle-btn").click();
    const dark = await page
      .locator("html")
      .evaluate((el) => el.classList.contains("dark"));
    await page.getByRole("link", { name: "Research", exact: true }).click();
    await expect(page.locator("html")).toHaveClass(
      dark ? /dark/ : /^(?!.*dark)/,
    );
    await page.getByRole("link", { name: "All publications" }).click();
    await expect(page.locator("html")).toHaveClass(
      dark ? /dark/ : /^(?!.*dark)/,
    );
    await page.locator('header a[aria-label="Home"]').click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Jun Bai",
    );
  });

  test("academic content remains accessible without JavaScript", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const page = await context.newPage();
      await page.goto("/research-page/");
      await expect(
        page.getByRole("heading", { name: "About me" }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "GitHub stars: 222", exact: true }),
      ).toBeVisible();
      await page.getByRole("link", { name: "All publications" }).click();
      await expect(page.locator(".publication")).toHaveCount(23);
    } finally {
      await context.close();
    }
  });

  test("GitHub stars update and reuse cached counts across navigation", async ({
    page,
  }) => {
    let requests = 0;
    await page.route(
      "https://api.github.com/repos/bigai-nlco/belief-context-graph",
      async (route) => {
        requests += 1;
        await route.fulfill({ json: { stargazers_count: 1234 } });
      },
    );
    await page.goto("/research/");
    await expect(
      page.getByRole("link", { name: "GitHub stars: 1,234", exact: true }),
    ).toHaveAttribute(
      "href",
      "https://github.com/bigai-nlco/belief-context-graph/stargazers",
    );
    await page.getByRole("link", { name: "All publications" }).click();
    await expect(
      page.getByRole("link", { name: "GitHub stars: 1,234", exact: true }),
    ).toBeVisible();
    await page.goto("/research-page/");
    await expect(
      page.getByRole("link", { name: "GitHub stars: 1,234", exact: true }),
    ).toBeVisible();
    expect(requests).toBe(1);
  });

  test("GitHub rate limits preserve the verified star count", async ({
    page,
  }) => {
    await page.route(
      "https://api.github.com/repos/bigai-nlco/belief-context-graph",
      async (route) => {
        await route.fulfill({
          status: 403,
          json: { message: "API rate limit exceeded" },
        });
      },
    );
    const response = page.waitForResponse(
      "https://api.github.com/repos/bigai-nlco/belief-context-graph",
    );
    await page.goto("/research/");
    await response;
    await expect(
      page.getByRole("link", { name: "GitHub stars: 222", exact: true }),
    ).toBeVisible();
    await expect(
      page.locator("#paper-2026-bcg").getByRole("link", { name: /^Code:/ }),
    ).toBeVisible();
  });
});
