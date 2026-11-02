import { expect, type Page } from "@playwright/test";
import { SIGNAL_INDEX } from "../src/content/signalIndex";

export { test, expect } from "@playwright/test";

// The 14 signals as /api/signals returns them, so tests don't need a database
export const SIGNALS = SIGNAL_INDEX.map((s, i) => ({
  id: `sig${String(i).padStart(2, "0")}`,
  name: s.name,
  description: `What "${s.name}" means.`,
  imageUrl: s.imageUrl,
  videoUrl: null,
  category: s.category,
  poseHint: null,
}));

export async function mockSignals(page: Page) {
  await page.route("**/api/signals", (route) => route.fulfill({ json: SIGNALS }));
}

// A guest: no session. (Without a database the real session check is slow.)
export async function asGuest(page: Page) {
  await page.route("**/api/auth/session**", (route) => route.fulfill({ json: {} }));
}

// Signed in as a test user with no history
export async function signIn(page: Page) {
  await page.route("**/api/auth/session**", (route) =>
    route.fulfill({
      json: {
        user: { id: "u1", name: "Test User", email: "test@example.com", role: "user", termsVersion: "2026-10-19" },
        expires: "2099-01-01T00:00:00Z",
      },
    })
  );
  await page.route("**/api/stats**", (route) =>
    route.fulfill({ json: { overall: { totalAttempts: 0 }, signalStats: [], recentResults: {}, practiceTimes: [], drillResults: [] } })
  );
  await page.route("**/api/drill-results**", (route) =>
    route.request().method() === "GET" ? route.fulfill({ json: [] }) : route.fulfill({ json: { ok: true } })
  );
}

// Answers every question in a multiple-choice quiz (always the first option)
export async function finishQuiz(page: Page) {
  const progress = page.getByText(/^Question \d+ of \d+$/);
  await expect(progress).toBeVisible();
  for (;;) {
    await page.locator("main .card .space-y-2 > button").first().click();
    const next = page.getByRole("button", { name: /^(Next|See score)$/ });
    const last = (await next.textContent())?.includes("See score");
    await next.click();
    if (last) return;
  }
}
