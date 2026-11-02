import { test, expect, mockSignals, finishQuiz, asGuest } from "./fixtures";

test.beforeEach(async ({ page }) => asGuest(page));

test.describe("Landing page", () => {
  test("introduces the app and its four topics", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/brush up before your next patrol/i);
    await expect(page.getByRole("heading", { name: "Four topics" })).toBeVisible();
    for (const [title, id] of [
      ["communication", "communication"],
      ["first aid & resus", "first-aid"],
      ["surf awareness", "surf-awareness"],
      ["patrol & safety", "patrol"],
    ]) {
      await expect(page.getByRole("link", { name: `Open ${title} →` })).toHaveAttribute("href", `/topics/${id}`);
    }
  });

  test("goes to today's practice", async ({ page }) => {
    await mockSignals(page);
    await page.goto("/");
    await page.getByRole("link", { name: "Try today's practice" }).click();
    await expect(page).toHaveURL("/test/daily");
  });
});

test.describe("Topics", () => {
  test("lists today's practice and the four topics", async ({ page }) => {
    await page.goto("/topics");
    await expect(page.getByRole("heading", { name: "Topics", level: 1 })).toBeVisible();
    await expect(page.locator('main a[href="/test/daily"]')).toBeVisible();
    for (const id of ["communication", "first-aid", "surf-awareness", "patrol"]) {
      await expect(page.locator(`main a[href="/topics/${id}"]`)).toBeVisible();
    }
  });

  test("a topic page has a quick quiz and a card per set", async ({ page }) => {
    await page.goto("/topics/communication");
    for (const n of [5, 10, 15]) {
      await expect(page.getByRole("link", { name: `${n} questions`, exact: true })).toHaveAttribute("href", `/test/communication/mixed?n=${n}`);
    }
    for (const set of ["Hand signals", "Prowords", "Phonetic alphabet", "Call signs", "Radio calls", "4 Ps"]) {
      await expect(page.getByText(set, { exact: true }).first()).toBeVisible();
    }
    await expect(page.getByRole("link", { name: "Spell it" })).toHaveAttribute("href", "/test/communication/phonetic-alphabet/spell");
    // Progress only shows when signed in
    await expect(page.getByText("Where you're up to")).toHaveCount(0);
  });

  test("a set's Learn page explains it and links to its quiz", async ({ page }) => {
    await page.goto("/learn/first-aid/drsabcd");
    await expect(page.getByRole("heading", { name: "DRSABCD", level: 1 })).toBeVisible();
    await expect(page.getByText("When you'll use it")).toBeVisible();
    await expect(page.getByText("Defibrillation", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Test yourself" })).toHaveAttribute("href", "/test/first-aid/drsabcd");
  });
});

test.describe("Quizzes", () => {
  test("a set quiz runs to the end and suggests the next set", async ({ page }) => {
    await page.goto("/test/surf-awareness/wave-words");
    await expect(page.getByText("Question 1 of 10")).toBeVisible();
    await finishQuiz(page);
    await expect(page.getByText(/^\d+ \/ 10$/)).toBeVisible();
    await expect(page.getByRole("link", { name: /Next set: Types of waves/ })).toBeVisible();
    await expect(page.locator("main .card").getByRole("link", { name: "Back to Surf awareness" })).toBeVisible();
  });

  test("a quick quiz has the number of questions asked for", async ({ page }) => {
    await page.goto("/test/patrol/mixed?n=5");
    await expect(page.getByRole("heading", { name: "Quick quiz" })).toBeVisible();
    await expect(page.getByText("Question 1 of 5")).toBeVisible();
  });

  test("acronym letter questions say which letter, e.g. 'the second D'", async ({ page }) => {
    // Answer a DRSABCD quiz until a letter question comes up
    await page.goto("/test/first-aid/drsabcd");
    await expect(page.getByText(/^Question \d+ of \d+$/)).toBeVisible();
    for (let i = 0; i < 10; i++) {
      const q = page.getByText(/^In DRSABCD, what does the /);
      if (await q.count()) {
        await expect(q).toHaveText(/what does the (first D|second D|R|S|A|B|C) stand for\?/);
        return;
      }
      await page.locator("main .card .space-y-2 > button").first().click();
      await page.getByRole("button", { name: /^(Next|See score)$/ }).click();
    }
    throw new Error("No letter question in the quiz");
  });

  test("today's practice starts", async ({ page }) => {
    await mockSignals(page);
    await page.goto("/test/daily");
    await expect(page.getByText(/^Question 1 of [45]$/)).toBeVisible();
  });
});

test.describe("Signals", () => {
  test("can start an Identify session without an account", async ({ page }) => {
    await mockSignals(page);
    await page.goto("/study/identify");
    await expect(page.getByText("Name the signal")).toBeVisible();
    await page.getByRole("button", { name: /^Start: \d+ signals$/ }).click();
    await expect(page.getByText("What's this signal?")).toBeVisible();
    await expect(page.getByText(/^Signal 1 of \d+$/)).toBeVisible();
  });
});

test.describe("Old links", () => {
  for (const [from, to] of <[string, string | RegExp][]>[
    ["/learn", "/topics"],
    ["/test", "/topics"],
    ["/test/communication", "/topics/communication"],
    ["/learn/acronyms/sample", "/learn/first-aid/sample"],
    ["/test/acronyms/sample?mode=match", /\/test\/first-aid\/sample\/match(\?.*)?$/],
    ["/test/radio/calls", "/test/communication/radio-calls/build-call"],
    ["/history", "/profile/history"],
  ]) {
    test(`${from} redirects to ${String(to)}`, async ({ page }) => {
      await page.goto(from);
      await expect(page).toHaveURL(to);
    });
  }
});

test.describe("Navigation", () => {
  test("guests see Topics, Today's practice and Sign In", async ({ page, isMobile }) => {
    await page.goto("/topics");
    if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
    for (const name of ["Topics", "Today's practice", "Sign In"]) {
      await expect(page.getByRole("navigation").getByRole("link", { name, exact: true }).filter({ visible: true }).first()).toBeVisible();
    }
  });

  test("the dashboard asks guests to sign in", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Sign In Required")).toBeVisible();
  });
});
