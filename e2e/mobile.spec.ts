import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
const fixtures = () =>
  JSON.parse(readFileSync(".review/fixtures.json", "utf8"));
const base = "https://test-api.arenagym-om.com";
async function connect(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route(base + "/**", async (route) => {
    const response = await route.fetch({
      url: route.request().url().replace(base, "http://127.0.0.1:3105"),
    });
    await route.fulfill({ response });
  });
  return errors;
}
async function login(page: Page, role: string) {
  await page.addInitScript(() => {
    localStorage.setItem("arena.intro.icons.v1", "1");
    localStorage.setItem("arena.language", "en");
  });
  await page.goto("/login");
  await page
    .getByLabel("Username, email or mobile", { exact: true })
    .fill(`review-${role}`);
  await page.getByLabel("Password", { exact: true }).fill("ArenaReview#2026");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByText(
      role === "member" ? "YOUR DAILY MOMENTUM" : "TEAM WORKSPACE",
      { exact: true },
    ),
  ).toBeVisible();
}
async function back(page: Page) {
  await page.getByRole("button", { name: "Back", exact: true }).click();
}
async function tab(page: Page, name: string) {
  await page.getByRole("tab", { name: new RegExp(name) }).click();
}
async function shot(page: Page, name: string) {
  await page.screenshot({ path: `docs/screenshots/${name}.png` });
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
test("onboarding is usable in Arabic, English and compact mobile sizes", async ({
  page,
}) => {
  const errors = await connect(page);
  await page.addInitScript(() => localStorage.setItem("arena.intro", "1"));
  await page.goto("/");
  await expect(
    page.getByText("Your next chapter.\nStronger.", { exact: true }),
  ).toBeVisible();
  await shot(page, "01-onboarding-en");
  await page.getByRole("button", { name: "العربية", exact: true }).click();
  await expect(
    page.getByText("بدايتك الجديدة.\nأقوى.", { exact: true }),
  ).toBeVisible();
  await shot(page, "01-onboarding-ar");
  await noOverflow(page);
  await page.setViewportSize({ width: 360, height: 740 });
  await page.getByRole("button", { name: "يلا نكمل", exact: true }).click();
  await page.getByRole("button", { name: "يلا نكمل", exact: true }).click();
  await page.getByRole("button", { name: "ابدئي رحلتك", exact: true }).click();
  await expect(page.getByText("سعداء برجوعك.", { exact: true })).toBeVisible();
  await shot(page, "02-login-ar");
  await noOverflow(page);
  expect(await page.locator("img").count()).toBe(0);
  expect(errors).toEqual([]);
});
test("password visibility stays inside its field in both directions without changing the password", async ({
  page,
}) => {
  const errors = await connect(page);
  await page.goto("/login");
  const value = "  Secret #2026  ";
  for (const ar of [false, true]) {
    if (ar)
      await page.getByRole("button", { name: "العربية", exact: true }).click();
    const input = page.getByLabel(ar ? "كلمة المرور" : "Password", {
      exact: true,
    });
    await input.fill(value);
    const show = page.getByRole("button", {
      name: ar ? "إظهار كلمة المرور" : "Show password",
      exact: true,
    });
    await show.scrollIntoViewIfNeeded();
    const fieldBox = (await input.boundingBox())!;
    const buttonBox = (await show.boundingBox())!;
    expect(buttonBox.width).toBeGreaterThanOrEqual(44);
    expect(buttonBox.height).toBeGreaterThanOrEqual(44);
    expect(buttonBox.y).toBeGreaterThanOrEqual(fieldBox.y - 1);
    expect(buttonBox.y + buttonBox.height).toBeLessThanOrEqual(
      fieldBox.y + fieldBox.height + 1,
    );
    expect(
      Math.abs(
        buttonBox.x -
          (ar ? fieldBox.x : fieldBox.x + fieldBox.width - buttonBox.width),
      ),
    ).toBeLessThan(2);
    await expect(input).toHaveJSProperty("type", "password");
    await show.click();
    await expect(input).toHaveJSProperty("type", "text");
    await expect(input).toHaveValue(value);
    await page
      .getByRole("button", {
        name: ar ? "إخفاء كلمة المرور" : "Hide password",
        exact: true,
      })
      .click();
    await expect(input).toHaveJSProperty("type", "password");
    await expect(input).toHaveValue(value);
    await page.setViewportSize({ width: 360, height: 640 });
    await page
      .getByRole("button", {
        name: ar ? "تسجيل الدخول" : "Sign in",
        exact: true,
      })
      .scrollIntoViewIfNeeded();
    await noOverflow(page);
  }
  await shot(page, "02-password-ar");
  expect(errors).toEqual([]);
});

for (const motion of ["reduce", "no-preference"] as const) {
  test(`large icon intro settles without looping with motion=${motion}`, async ({
    page,
  }) => {
    const errors = await connect(page);
    await page.emulateMedia({ reducedMotion: motion });
    await page.goto("/");
    const art = page.getByTestId("fitness-art");
    await expect(art).toBeVisible();
    expect((await art.boundingBox())!.width).toBeGreaterThanOrEqual(300);
    await expect
      .poll(() =>
        art.evaluate((el) => getComputedStyle(el.firstElementChild!).opacity),
      )
      .toBe("1");
    const settled = await art.screenshot();
    // Deliberate stability interval: catch accidental perpetual animation.
    await page.waitForTimeout(350);
    expect(await art.screenshot()).toEqual(settled);
    expect(await page.locator("img").count()).toBe(0);
    await page
      .getByRole("button", { name: "Let’s keep moving", exact: true })
      .click();
    await expect(
      page.getByText("A plan. A coach.\nYour pace.", { exact: true }),
    ).toBeVisible();
    await noOverflow(page);
    expect(errors).toEqual([]);
  });
}
test("member uses live membership, workouts, meals, progress, classes, invoices and language switching", async ({
  page,
}) => {
  const errors = await connect(page);
  await login(page, "member");
  await expect(
    page.getByText("Arena Signature · 90 days", { exact: true }),
  ).toBeVisible();
  await shot(page, "03-home-en");
  await noOverflow(page);
  await tab(page, "Training");
  await expect(
    page.getByText("Full body · Build your foundation", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open workout", exact: true }).click();
  await expect(
    page.getByText("Dumbbell bench press", { exact: true }),
  ).toBeVisible();
  await shot(page, "04-workout-en");
  await back(page);
  await page.getByRole("button", { name: /Your nutrition/ }).click();
  await expect(
    page.getByText("Oats with yogurt", { exact: true }),
  ).toBeVisible();
  await shot(page, "05-nutrition-en");
  await back(page);
  await tab(page, "Progress");
  await expect(page.getByText("80.60", { exact: true }).first()).toBeVisible();
  await shot(page, "06-progress-en");
  await tab(page, "You");
  await page
    .getByRole("button", { name: "My membership", exact: true })
    .click();
  await expect(
    page.getByText("11 / 12 PT sessions remaining", { exact: true }),
  ).toBeVisible();
  await back(page);
  await page.getByRole("button", { name: "My coach", exact: true }).click();
  await expect(
    page.getByText("Sara Al Balushi", { exact: true }),
  ).toBeVisible();
  await back(page);
  await page
    .getByRole("button", { name: "Classes & bookings", exact: true })
    .click();
  await expect(page.getByText("Strength Club", { exact: true })).toBeVisible();
  const day = new Date(fixtures().day + "T12:00:00Z");
  day.setUTCDate(day.getUTCDate() + 1);
  await page
    .getByLabel("Book date · YYYY-MM-DD", { exact: true })
    .fill(day.toISOString().slice(0, 10));
  await page.getByRole("button", { name: "Book a place", exact: true }).click();
  await page
    .getByRole("button", { name: "Confirm booking", exact: true })
    .click();
  await expect(
    page.getByText("Booking confirmed.", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Cancel booking", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Confirm cancellation", exact: true })
    .click();
  await expect(page.getByText(/CANCELLED/)).toBeVisible();
  await back(page);
  await page.getByRole("button", { name: "My invoices", exact: true }).click();
  await expect(page.getByText("PARTIAL", { exact: true })).toBeVisible();
  await back(page);
  await page.getByRole("button", { name: "Language", exact: true }).click();
  await tab(page, "اليوم");
  await expect(page.getByText("خطوتك النهارده", { exact: true })).toBeVisible();
  await shot(page, "03-home-ar");
  await noOverflow(page);
  await tab(page, "حسابي");
  await page.getByRole("button", { name: "تسجيل الخروج", exact: true }).click();
  await page.getByRole("button", { name: "تسجيل الخروج", exact: true }).click();
  await expect(page.getByText("سعداء برجوعك.", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
test("coach sees assigned clients, adds measurements and opens real schedule", async ({
  page,
}) => {
  const errors = await connect(page);
  await login(page, "coach");
  await tab(page, "Clients");
  await page.getByRole("button", { name: /Aisha Al Salmi/ }).click();
  await expect(page.getByText("CLIENT PROFILE", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Aisha Al Salmi", { exact: true }).last(),
  ).toBeVisible();
  await shot(page, "07-coach-client");
  await page
    .getByRole("button", { name: "Measurements & progress", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add measurement", exact: true })
    .click();
  await page.getByLabel("Weight", { exact: true }).fill("80.20");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByText("80.20", { exact: true }).first()).toBeVisible();
  await back(page);
  await back(page);
  await tab(page, "Workspace");
  await page.getByRole("button", { name: "Schedule", exact: true }).click();
  await expect(
    page.getByText("Strength Club", { exact: true }).first(),
  ).toBeVisible();
  await shot(page, "08-coach-schedule");
  expect(errors).toEqual([]);
});
test("admin creates plans with scope-aware fields and collects an invoice payment", async ({
  page,
}) => {
  const errors = await connect(page);
  await login(page, "admin");
  await tab(page, "Workspace");
  await page
    .getByRole("button", { name: "Membership plans", exact: true })
    .click();
  await page.getByRole("button", { name: "Create new", exact: true }).click();
  await expect(page.getByLabel("PT sessions", { exact: true })).toHaveCount(0);
  await expect(
    page.getByLabel("PT validity · days", { exact: true }),
  ).toHaveCount(0);
  await page.getByRole("radio", { name: "BUNDLE", exact: true }).click();
  await expect(
    page.getByLabel("PT validity · days", { exact: true }),
  ).toBeVisible();
  await page.getByRole("radio", { name: "PT", exact: true }).click();
  await expect(
    page.getByLabel("Gym validity · days", { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByLabel("PT sessions", { exact: true })).toBeVisible();
  await page.getByLabel("Name *", { exact: true }).fill("Review PT 8 sessions");
  await page.getByRole("button", { name: "Select…", exact: true }).click();
  await page.getByRole("button", { name: /Arena Signature/ }).click();
  await page.getByLabel("Price · OMR *", { exact: true }).fill("35.000");
  await page.getByLabel("PT sessions", { exact: true }).fill("8");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /Review PT 8 sessions/ }),
  ).toBeVisible();
  await back(page);
  await page
    .getByRole("button", { name: "Invoices & payments", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Invoice details", exact: true })
    .first()
    .click();
  await page.getByLabel("Amount · OMR", { exact: true }).fill("25.000");
  await page
    .getByRole("button", { name: "Review payment", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm payment", exact: true })
    .click();
  await expect(page.getByText("PAID", { exact: true }).last()).toBeVisible();
  await shot(page, "09-invoice-paid");
  await back(page);
  await back(page);
  await page
    .getByRole("button", { name: "Performance reports", exact: true })
    .click();
  await expect(page.getByText("Net profit", { exact: true })).toBeVisible();
  await shot(page, "10-admin-report");
  await noOverflow(page);
  await back(page);
  await page.getByRole("button", { name: "New sale", exact: true }).click();
  await page.getByRole("button", { name: "Select…", exact: true }).click();
  await page
    .getByRole("button", { name: "Aisha Al Salmi", exact: true })
    .click();
  await page
    .getByRole("radio", { name: "Personal training", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Review PT 8 sessions", exact: true })
    .click();
  await page
    .getByLabel("Collected now · OMR (blank = unpaid)", { exact: true })
    .fill("10.000");
  await page.getByRole("button", { name: "Review sale", exact: true }).click();
  await page
    .getByRole("button", { name: "Complete sale", exact: true })
    .click();
  await expect(page.getByText("PARTIAL", { exact: true }).last()).toBeVisible();
  await expect(page.getByText("25.000", { exact: true }).last()).toBeVisible();
  await page.getByRole("button", { name: "Edit invoice", exact: true }).click();
  await page
    .getByLabel("Notes", { exact: true })
    .fill("Reviewed from the mobile app");
  await page
    .getByRole("button", { name: "Save corrections", exact: true })
    .click();
  await expect(
    page.getByText("Reviewed from the mobile app", { exact: true }),
  ).toBeVisible();
  await shot(page, "11-pos-invoice");
  await back(page);
  await page
    .getByRole("button", { name: "Plan categories", exact: true })
    .click();
  await page.getByRole("button", { name: "Create new", exact: true }).click();
  await page
    .getByLabel("Name *", { exact: true })
    .fill("Temporary review category");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page
    .getByRole("button", { name: "Temporary review category", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Delete record", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm deletion", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Temporary review category",
      exact: true,
    }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});
