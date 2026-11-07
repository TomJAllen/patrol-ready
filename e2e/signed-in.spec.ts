import { test, expect, signIn } from "./fixtures";

test.describe("Signed in", () => {
  test.beforeEach(async ({ page }) => signIn(page));

  test("the dashboard shows today's practice and the four topics", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /G'day, Test/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Start today's practice" })).toHaveAttribute("href", "/test/daily");
    await expect(page.getByRole("heading", { name: "Your topics" })).toBeVisible();
    for (const id of ["communication", "first-aid", "surf-awareness", "patrol"]) {
      await expect(page.locator(`main a[href="/topics/${id}"]`)).toBeVisible();
    }
  });

  test("the profile has badges, and tabs for history and account", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Badges" })).toBeVisible();
    await expect(page.getByText("First splash")).toBeVisible();
    await page.getByRole("navigation", { name: "Profile" }).getByRole("link", { name: "History" }).click();
    await expect(page).toHaveURL("/profile/history");
    await page.getByRole("navigation", { name: "Profile" }).getByRole("link", { name: "Account" }).click();
    await expect(page).toHaveURL("/profile/account");
  });

  test("a topic page shows where you're up to", async ({ page }) => {
    await page.route("**/api/stats**", (route) =>
      route.fulfill({
        json: {
          overall: { totalAttempts: 0 },
          practiceTimes: [],
          drillResults: [{ drill: "set_quiz", item: "prowords", score: 10, total: 10, mistakes: 0, at: "2026-11-01T00:00:00Z" }],
        },
      })
    );
    await page.route("**/api/drill-results**", (route) =>
      route.fulfill({ json: [{ drill: "set_quiz", item: "prowords", score: 10, total: 10, mistakes: 0, at: "2026-11-01T00:00:00Z" }] })
    );
    await page.goto("/topics/communication");
    await expect(page.getByRole("heading", { name: "Where you're up to" })).toBeVisible();
    const row = page.getByRole("row", { name: /Prowords/ });
    await expect(row).toContainText("Passed");
    await expect(row).toContainText("100%");
    await expect(row).toContainText("1 Nov 2026");
  });
});
