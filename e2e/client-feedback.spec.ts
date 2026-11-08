import { test, expect, type Page } from "@playwright/test";

const stamp = "2026-11-08T10:00:00.000Z";
const exercises = [1, 2].map((id) => ({
  id,
  name: id === 1 ? "Squat" : "Press",
  videoUrl: null,
  createdAt: stamp,
  updatedAt: stamp,
}));
const paged = (items: unknown[]) => ({
  items,
  total: items.length,
  page: 1,
  pageSize: 20,
});
async function setup(page: Page, role: string, ar = false) {
  const requests: { method: string; path: string; body: any }[] = [];
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  let plan: any;
  await page.addInitScript((ar) => {
    localStorage.setItem("arena.intro.icons.v1", "1");
    localStorage.setItem("arena.language", ar ? "ar" : "en");
  }, ar);
  await page.route("**/*", async (route) => {
    const req = route.request();
    if (
      req.resourceType() !== "fetch" ||
      new URL(req.url()).origin ===
        new URL(test.info().project.use.baseURL!).origin
    )
      return route.continue();
    const path = new URL(req.url()).pathname;
    const method = req.method();
    const body = req.postDataJSON();
    if (method !== "GET") requests.push({ method, path, body });
    let data: unknown;
    if (path === "/auth/login")
      data = { accessToken: "fixture-access", refreshToken: "fixture-refresh" };
    else if (path === "/users/me")
      data = {
        id: 1,
        username: "mary",
        fullName: "مريم أحمد",
        mobile: null,
        email: null,
        role,
        isActive: true,
        branchId: null,
        lastLoginAt: null,
      };
    else if (path === "/me/membership")
      data = {
        current: [],
        upcoming: [],
        lastExpired: null,
        ptUsed: 0,
        ptRemaining: 0,
      };
    else if (path === "/me/workouts") data = [];
    else if (path === "/me/banners")
      data = [
        {
          id: 1,
          title: "Welcome banner",
          subtitle: null,
          imageUrl: "https://fixture.test/banner.png",
          linkUrl: null,
        },
      ];
    else if (path === "/coaches/me/schedule")
      data = { classes: [], ptBookings: [] };
    else if (path === "/members")
      data = paged([
        {
          id: 1,
          fullName: "Mary",
          username: "mary",
          mobile: null,
          gender: null,
          branch: null,
          coach: null,
          status: "ACTIVE",
          currentSubscription: null,
        },
      ]);
    else if (path === "/classes")
      data = paged([{ id: 2, name: "Morning class" }]);
    else if (path === "/exercises") data = paged(exercises);
    else if (path.startsWith("/workout-plans")) {
      if (method === "DELETE") {
        plan = undefined;
        return route.fulfill({ status: 204 });
      }
      if (method === "POST" || method === "PATCH")
        plan = {
          id: 7,
          createdById: 1,
          createdAt: stamp,
          updatedAt: stamp,
          ...body,
          items: body.items.map((item: any, i: number) => ({
            ...item,
            id: i + 1,
            exercise: exercises.find((e) => e.id === item.exerciseId),
            weightKg:
              item.weightKg == null ? null : Number(item.weightKg).toFixed(2),
          })),
        };
      data =
        path === "/workout-plans" && method === "GET"
          ? paged(plan ? [plan] : [])
          : plan;
    } else
      return route.fulfill({
        status: 404,
        json: { code: "UNEXPECTED_FIXTURE_REQUEST", path },
      });
    return route.fulfill({ status: method === "POST" ? 201 : 200, json: data });
  });
  await page.route("https://fixture.test/banner.png", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="280"><rect width="640" height="280" fill="#203c36"/></svg>',
    }),
  );
  await page.goto("/login");
  await page
    .getByLabel(
      ar
        ? "اسم المستخدم أو البريد الإلكتروني أو الهاتف المحمول"
        : "Username, email or mobile",
      { exact: true },
    )
    .fill("mary");
  await page
    .getByLabel(ar ? "كلمة المرور" : "Password", { exact: true })
    .fill("FixturePassword1");
  await page
    .getByRole("button", { name: ar ? "تسجيل الدخول" : "Sign in", exact: true })
    .click();
  await expect(
    page.getByText(
      role === "MEMBER"
        ? ar
          ? "خطوتك اليوم"
          : "YOUR DAILY MOMENTUM"
        : "TEAM WORKSPACE",
      { exact: true },
    ),
  ).toBeVisible();
  return { requests, errors };
}

test.use({ viewport: { width: 360, height: 640 } });
for (const ar of [false, true]) {
  test(`home order and compact layout at 360×640 (${ar ? "Arabic" : "English"})`, async ({
    page,
  }) => {
    const { errors } = await setup(page, "MEMBER", ar);
    const greeting = page.getByText(/(?:Hey,|أهلًا،) مريم/).first();
    const banner = page.getByText("Welcome banner", { exact: true });
    const qr = page.getByRole("button", {
      name: ar ? "الدخول برمز QR" : "Check in with QR",
      exact: true,
    });
    const hero = page.getByText(ar ? "خطوتك اليوم" : "YOUR DAILY MOMENTUM", {
      exact: true,
    });
    const boxes = await Promise.all(
      [greeting, banner, qr, hero].map((l) => l.boundingBox()),
    );
    for (let i = 1; i < boxes.length; i++)
      expect(boxes[i]!.y).toBeGreaterThan(boxes[i - 1]!.y);
    expect(boxes[2]!.x).toBe(16);
    expect(boxes[2]!.width).toBe(328);
    await expect(page.getByTestId("fitness-art")).toHaveCount(0);
    expect(
      await greeting.evaluate((el) => getComputedStyle(el).textAlign),
    ).toBe(ar ? "right" : "left");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("attendance only reports errors after save and recovers on class/type changes", async ({
  page,
}) => {
  await setup(page, "STAFF_MEMBER");
  await page.getByRole("tab", { name: /Workspace/ }).click();
  await page
    .getByRole("button", { name: "Take attendance", exact: true })
    .click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page.getByRole("radio", { name: "CLASS", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page
    .getByRole("button", { name: "Select…", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Mary", exact: true }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByRole("button", { name: "Select…", exact: true }).click();
  await page
    .getByRole("button", { name: "Morning class", exact: true })
    .click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page.getByRole("radio", { name: "GYM", exact: true }).click();
  await expect(page.getByText("Class *", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("trainer creates, reorders, edits and deletes a plan through the catalog", async ({
  page,
}) => {
  const { requests, errors } = await setup(page, "STAFF_MEMBER");
  await page
    .getByRole("button", { name: "Workout plans", exact: true })
    .click();
  await page.getByRole("button", { name: "Create new", exact: true }).click();
  await page.getByLabel("Plan name *", { exact: true }).fill("Strength");
  for (const name of ["Squat", "Press"]) {
    await page
      .getByRole("button", { name: "Add exercise", exact: true })
      .click();
    await page.getByRole("button", { name: "Select…", exact: true }).click();
    const picker = page.getByRole("dialog");
    await expect(picker).toBeVisible();
    await picker.getByRole("button", { name, exact: true }).click();
    // Wait for the closing animation to remove this picker's option list.
    await expect(picker).toHaveCount(0);
  }
  await page.getByLabel("Weight · kg", { exact: true }).first().fill("12.50");
  await page
    .getByRole("radio", { name: "Sunday", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Move down", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Create new", exact: true }),
  ).toBeVisible();
  const created = requests.find(
    (r) => r.method === "POST" && r.path === "/workout-plans",
  )!;
  expect(created.body).toEqual({
    name: "Strength",
    items: [
      {
        exerciseId: 2,
        sets: 3,
        reps: 12,
        weightKg: null,
        dayOfWeek: null,
        order: 0,
      },
      {
        exerciseId: 1,
        sets: 3,
        reps: 12,
        weightKg: "12.50",
        dayOfWeek: 0,
        order: 1,
      },
    ],
  });
  await page.getByRole("button", { name: "Strength", exact: true }).click();
  await expect(
    page.getByLabel("Weight · kg", { exact: true }).nth(1),
  ).toHaveValue("12.50");
  await page
    .getByRole("button", { name: "Remove exercise", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Create new", exact: true }),
  ).toBeVisible();
  expect(
    requests.find((r) => r.method === "PATCH" && r.path === "/workout-plans/7")!
      .body.items,
  ).toEqual([{ ...created.body.items[1], order: 0 }]);
  await page.getByRole("button", { name: "Strength", exact: true }).click();
  await page
    .getByRole("button", { name: "Delete record", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm deletion", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Create new", exact: true }),
  ).toBeVisible();
  expect(
    requests.some(
      (r) => r.method === "DELETE" && r.path === "/workout-plans/7",
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
