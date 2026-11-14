import { test, expect, type Page } from "@playwright/test";
import {
  measurementFields,
  MembershipResponse,
  ClassResponse,
  AssignmentListResponse,
  MeasurementHistoryResponse,
} from "@arena/shared";
import { today, addDays } from "../mobile/api/format";

const stamp = "2026-11-10T10:00:00.000Z";
const day = today();
const timestamps = { createdAt: stamp, updatedAt: stamp };
const paged = (items: unknown[]) => ({
  items,
  total: items.length,
  page: 1,
  pageSize: 100,
});
const subscription = (id: number, upcoming = false) => ({
  id,
  memberId: 1,
  planId: id,
  planName: `Plan ${id}`,
  scope: "BUNDLE",
  invoiceId: null,
  startDate: upcoming ? addDays(day, 30) : day,
  endDate: addDays(day, 90),
  status: "ACTIVE",
  upcoming,
  ptSessionsTotal: 12,
  ptUsed: id,
  ptRemaining: 12 - id,
  priceAtSale: "50.000",
  discount: "0.000",
  notes: null,
  ...timestamps,
});
const membership = {
  current: [subscription(1), subscription(2)],
  upcoming: [subscription(3, true)],
  lastExpired: { ...subscription(4), status: "EXPIRED" },
  ptUsed: 3,
  ptRemaining: 21,
};
const gymClass = {
  id: 1,
  name: "Strength Club",
  coachId: 2,
  branchId: 1,
  coach: { id: 2, fullName: "Sara" },
  branch: { id: 1, name: "Arena" },
  planIds: [1],
  weekDays: [0, 1, 2, 3, 4, 5, 6],
  startDate: day,
  endDate: addDays(day, 90),
  startTime: "10:00",
  endTime: "11:00",
  capacity: 20,
  bookingEnabled: true,
  ...timestamps,
};
const workouts = [
  {
    id: 1,
    memberId: 1,
    workoutPlanId: 1,
    assignedById: 2,
    startDate: day,
    endDate: null,
    ...timestamps,
    workoutPlan: {
      id: 1,
      name: "Strength plan",
      createdById: 2,
      ...timestamps,
      items: [null, "0.00", "12.50"].map((weightKg, i) => ({
        id: i + 1,
        exerciseId: i + 1,
        sets: 3,
        reps: 12,
        weightKg,
        dayOfWeek: null,
        order: i,
        exercise: {
          id: i + 1,
          name: ["Bodyweight squat", "Push up", "Weighted press"][i],
          videoUrl: null,
          ...timestamps,
        },
      })),
    },
  },
];
const measurements = [72, 70, 69.5].map((weight, i) => ({
  id: i + 1,
  memberId: 1,
  measuredOn: addDays(day, i - 3),
  createdById: 2,
  ...timestamps,
  ...Object.fromEntries(
    measurementFields.map((key) => [
      key,
      key === "weight" ? weight.toFixed(2) : null,
    ]),
  ),
  diff: Object.fromEntries(
    measurementFields.map((key) => [
      key,
      key === "weight" && i ? "-0.50" : null,
    ]),
  ),
}));

// Validate fixtures during discovery too, so browser restrictions cannot conceal schema drift.
MembershipResponse.parse(membership);
ClassResponse.parse(gymClass);
AssignmentListResponse.parse(workouts);
MeasurementHistoryResponse.parse(measurements);

async function signIn(page: Page, ar = false) {
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
  await expect(page.getByTestId("home-memberships")).toBeVisible();
}

// Web auth is intentionally in memory. Navigate through the UI rather than reloading routes.
async function navigate(page: Page, destination: string) {
  const ar = await page.evaluate(
    () => localStorage.getItem("arena.language") === "ar",
  );
  if (!(await page.getByRole("tab").first().isVisible())) {
    await page
      .getByRole("button", { name: ar ? "رجوع" : "Back", exact: true })
      .click();
  }
  const root = ["home", "training", "progress", "account"].includes(destination)
    ? destination
    : destination === "nutrition"
      ? "training"
      : destination === "checkin"
        ? "home"
        : "account";
  const tabs: Record<string, [string, string]> = {
    home: ["Today", "اليوم"],
    training: ["Training", "التمارين"],
    progress: ["Progress", "التطور"],
    account: ["You", "حسابي"],
  };
  await page
    .getByRole("tab", { name: new RegExp(tabs[root][ar ? 1 : 0]) })
    .click();
  const links: Record<string, [string, string]> = {
    classes: ["Classes & bookings", "الحصص والحجوزات"],
    membership: ["My membership", "عضويتي"],
    nutrition: ["Your nutrition", "تغذيتك"],
    checkin: ["Check in with QR", "الدخول برمز QR"],
  };
  if (links[destination])
    await page
      .getByRole("button", {
        name: links[destination][ar ? 1 : 0],
        exact: true,
      })
      .click();
}

async function setup(
  page: Page,
  {
    ar = false,
    theme = "system",
    members = membership,
    counts = true,
  }: {
    ar?: boolean;
    theme?: string;
    members?: import("zod").z.output<typeof MembershipResponse>;
    counts?: boolean;
  } = {},
) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(
    ({ ar, theme }) => {
      localStorage.setItem("arena.intro.icons.v1", "1");
      localStorage.setItem("arena.language", ar ? "ar" : "en");
      if (!localStorage.getItem("arena.theme"))
        localStorage.setItem("arena.theme", theme);
    },
    { ar, theme },
  );
  let bookings: any[] = [];
  const requests: string[] = [];
  await page.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.hostname === "fixture.test")
      return route.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="280"><rect width="640" height="280" fill="#30afb5"/><circle cx="320" cy="140" r="90" fill="#f8f7f2"/></svg>',
      });
    if (
      request.resourceType() !== "fetch" ||
      url.origin === new URL(test.info().project.use.baseURL!).origin
    )
      return route.continue();
    requests.push(url.pathname);
    const path = url.pathname,
      method = request.method();
    let data: unknown;
    if (path === "/auth/login" || path === "/auth/refresh")
      data = { accessToken: "fixture-access", refreshToken: "fixture-refresh" };
    else if (path === "/users/me")
      data = {
        id: 1,
        username: "mary",
        fullName: "مريم أحمد",
        mobile: null,
        email: null,
        role: "MEMBER",
        isActive: true,
        branchId: 1,
        lastLoginAt: null,
      };
    else if (path === "/me/membership") data = members;
    else if (path === "/me/banners")
      data = [
        {
          id: 1,
          title: "Hidden banner title",
          subtitle: "Hidden subtitle",
          imageUrl: "https://fixture.test/banner.png",
          linkUrl: "https://fixture.test/offer",
          durationSeconds: "2",
        },
        {
          id: 2,
          title: "Second slide",
          subtitle: null,
          imageUrl: "https://fixture.test/banner2.png",
          linkUrl: "javascript:alert(1)",
          durationSeconds: 8,
        },
      ];
    else if (path === "/me/workouts") data = workouts;
    else if (path === "/me/measurements") data = measurements;
    else if (path === "/me/nutrition") data = [];
    else if (path === "/me/check-in-token")
      data = {
        token: "fixture-entry",
        expiresAt: new Date(Date.now() + 60000).toISOString(),
      };
    else if (path === "/classes")
      data = paged([gymClass, { ...gymClass, id: 2, name: "Full class" }]);
    else if (path === "/classes/schedule") {
      const date = url.searchParams.get("from")!;
      const bookedCount = bookings.filter(
        (b) => b.status !== "CANCELLED" && b.data.date === date,
      ).length;
      data = [gymClass, { ...gymClass, id: 2, name: "Full class" }].map(
        (item) => ({
          ...item,
          date,
          startsAt: `${date}T06:00:00.000Z`,
          endsAt: `${date}T07:00:00.000Z`,
          ...(counts
            ? {
                seatsLeft: item.id === 2 ? 0 : 19 - bookedCount,
                bookedCount: item.id === 2 ? 20 : 1 + bookedCount,
              }
            : {}),
        }),
      );
    } else if (path.startsWith("/operations/class-bookings")) {
      if (method === "POST") {
        const booking = {
          ...request.postDataJSON(),
          id: bookings.length + 1,
          memberId: 1,
          kind: "class-bookings",
          createdById: 1,
          ...timestamps,
        };
        bookings.push(booking);
        data = booking;
      } else if (method === "PATCH") {
        const id = Number(path.split("/").at(-1));
        bookings = bookings.map((b) =>
          b.id === id ? { ...b, ...request.postDataJSON() } : b,
        );
        data = bookings.find((b) => b.id === id);
      } else data = paged(bookings);
    } else
      return route.fulfill({
        status: 404,
        json: { code: "UNEXPECTED_FIXTURE", path },
      });
    return route.fulfill({ status: method === "POST" ? 201 : 200, json: data });
  });
  await page.goto("/login");
  await signIn(page, ar);
  await expect(
    page
      .getByTestId("home-memberships")
      .getByText(
        members.current.length
          ? "Plan 1"
          : members.lastExpired
            ? "Plan 4"
            : ar
              ? "رحلتك الجديدة تبدأ هنا"
              : "Your next chapter starts here",
        { exact: true },
      ),
  ).toBeVisible();
  return { errors, requests };
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const tables = page.locator('[role="table"]');
  for (const table of await tables.all())
    expect(await table.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
      true,
    );
}
async function shot(page: Page, name: string) {
  await noOverflow(page);
  await page.screenshot({ path: test.info().outputPath(`${name}.png`) });
}
test.use({ viewport: { width: 360, height: 640 } });
for (const ar of [false, true]) {
  test(`home membership order, banner links and no overlay text (${ar ? "ar" : "en"})`, async ({
    page,
  }) => {
    const { errors } = await setup(page, { ar });
    const section = page.getByTestId("home-memberships");
    for (const id of [1, 2, 3])
      await expect(
        section.getByText(`Plan ${id}`, { exact: true }),
      ).toBeVisible();
    await expect(section.getByText("Plan 4", { exact: true })).toHaveCount(0);
    await expect(
      section.getByText(ar ? "عرض الكل" : "View all", { exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByText(/Learn more|اعرف المزيد|اعرفي المزيد/),
    ).toHaveCount(0);
    await expect(
      page.getByText("Hidden banner title", { exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByText("Hidden subtitle", { exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", {
        name: ar ? "فتح رابط الإعلان" : "Open banner link",
      }),
    ).toHaveCount(1);
    const boxes = await Promise.all(
      [
        page.getByText(/(?:Hey,|أهلًا،) مريم/).first(),
        page.getByTestId("banner-carousel"),
        section,
        page.getByRole("button", {
          name: ar ? "الدخول برمز QR" : "Check in with QR",
          exact: true,
        }),
        page.getByText(ar ? "خطوتك اليوم" : "YOUR DAILY MOMENTUM", {
          exact: true,
        }),
      ].map((l) => l.boundingBox()),
    );
    for (let i = 1; i < boxes.length; i++)
      expect(boxes[i]!.y).toBeGreaterThan(boxes[i - 1]!.y);
    await noOverflow(page);
    expect(errors).toEqual([]);
  });
  test(`class tables book, refresh counts and cancel (${ar ? "ar" : "en"})`, async ({
    page,
  }) => {
    const { errors, requests } = await setup(page, { ar });
    await navigate(page, "classes");
    const table = page.getByTestId("classes-table");
    await expect(
      table.getByText(ar ? "19 مقعد فارغ" : "19 seats left", { exact: true }),
    ).toBeVisible();
    await expect(
      table.getByRole("button", { name: ar ? "مكتملة" : "Full", exact: true }),
    ).toBeDisabled();
    await table
      .getByRole("button", {
        name: ar ? "اختيار Strength Club" : "Select Strength Club",
        exact: true,
      })
      .click();
    await page
      .getByLabel(ar ? "تاريخ الحجز · YYYY-MM-DD" : "Book date · YYYY-MM-DD", {
        exact: true,
      })
      .fill(addDays(day, 1));
    await page
      .getByRole("button", { name: ar ? "متابعة" : "Continue", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: ar ? "تأكيد الحجز" : "Confirm booking",
        exact: true,
      })
      .click();
    await expect(
      table.getByText(ar ? "18 مقعد فارغ" : "18 seats left", { exact: true }),
    ).toBeVisible();
    const booked = page.getByTestId("bookings-table");
    await expect(
      booked.getByText("Strength Club", { exact: true }),
    ).toBeVisible();
    await expect(booked.getByText("10:00", { exact: true })).toBeVisible();
    await booked
      .getByRole("button", { name: ar ? "إلغاء" : "Cancel", exact: true })
      .click();
    await booked
      .getByRole("button", {
        name: ar ? "تأكيد الإلغاء" : "Confirm cancellation",
        exact: true,
      })
      .click();
    await expect(
      booked.getByText(ar ? "ملغاة" : "Cancelled", { exact: true }),
    ).toBeVisible();
    await expect(
      table.getByText(ar ? "19 مقعد فارغ" : "19 seats left", { exact: true }),
    ).toBeVisible();
    expect(
      requests.filter((p) => p === "/classes/schedule").length,
    ).toBeGreaterThan(2);
    await noOverflow(page);
    expect(errors).toEqual([]);
  });
}
test("missing occurrence counts use visible member bookings", async ({
  page,
}) => {
  await setup(page, { counts: false });
  await navigate(page, "classes");
  const row = page.getByTestId("classes-table").getByRole("rowgroup").first();
  await expect(row.getByText("20 seats left", { exact: true })).toBeVisible();
  await row.getByRole("button", { name: "Book", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Confirm booking", exact: true })
    .click();
  await expect(row.getByText("19 seats left", { exact: true })).toBeVisible();
});
test("theme preference persists and System follows device changes", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await setup(page);
  await navigate(page, "account");
  const system = page.getByRole("radio", { name: "System", exact: true });
  await expect(system).toHaveAttribute("aria-checked", "true");
  await page.getByRole("radio", { name: "Light", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("arena.theme")))
    .toBe("light");
  await page.reload();
  // Reload clears preview auth; the saved appearance must survive signing back in.
  await signIn(page);
  await navigate(page, "account");
  await expect(
    page.getByRole("radio", { name: "Light", exact: true }),
  ).toHaveAttribute("aria-checked", "true");
  await expect(page.getByText("Appearance", { exact: true })).toHaveCSS(
    "color",
    "rgb(18, 61, 57)",
  );
  await page.getByRole("radio", { name: "Dark", exact: true }).click();
  await expect(page.getByText("Appearance", { exact: true })).toHaveCSS(
    "color",
    "rgb(243, 245, 240)",
  );
  await system.click();
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.getByText("Appearance", { exact: true })).toHaveCSS(
    "color",
    "rgb(18, 61, 57)",
  );
});
for (const count of [0, 1])
  test(`home handles ${count} current memberships`, async ({ page }) => {
    await setup(page, {
      members: {
        ...membership,
        current: membership.current.slice(0, count),
        upcoming: [],
        lastExpired: count ? membership.lastExpired : null,
      },
    });
    const section = page.getByTestId("home-memberships");
    await expect(section.getByText(/^Plan /)).toHaveCount(count);
  });
test("last expired membership is a muted fallback", async ({ page }) => {
  await setup(page, { members: { ...membership, current: [], upcoming: [] } });
  await expect(
    page.getByTestId("home-memberships").getByText("Expired", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByTestId("home-memberships").getByText("Plan 4", { exact: true }),
  ).toHaveCSS("color", "rgb(80, 105, 99)");
});
for (const theme of ["light", "dark"])
  for (const ar of [false, true])
    test(`main screens at 360×640 ${theme} ${ar ? "ar" : "en"}`, async ({
      page,
    }) => {
      const { errors } = await setup(page, { ar, theme });
      await page.getByTestId("banner-carousel").scrollIntoViewIfNeeded();
      await shot(page, "home");
      await navigate(page, "training");
      await expect(
        page.getByText("Strength plan", { exact: true }),
      ).toBeVisible();
      await shot(page, "training");
      await page
        .getByRole("button", {
          name: ar ? "افتح التمرين" : "Open workout",
          exact: true,
        })
        .click();
      await expect(
        page.getByText("Bodyweight squat", { exact: true }),
      ).toBeVisible();
      await expect(page.getByTestId("exercise-weight")).toHaveCount(1);
      await expect(page.getByTestId("exercise-weight")).toContainText("12.50");
      await expect(page.getByText(/—\s*kg/)).toHaveCount(0);
      await shot(page, "workout");
      await navigate(page, "progress");
      await expect(page.getByTestId("measurement-chart")).toBeVisible();
      await page.getByTestId("chart-point-0").click();
      await expect(page.getByTestId("chart-value")).toContainText("72 kg");
      await shot(page, "progress");
      await navigate(page, "account");
      await expect(
        page.getByText(ar ? "مساحتك." : "Your space.", { exact: true }),
      ).toBeVisible();
      await shot(page, "account");
      await page
        .getByRole("radio", {
          name: ar
            ? theme === "light"
              ? "فاتح"
              : "داكن"
            : theme === "light"
              ? "Light"
              : "Dark",
          exact: true,
        })
        .scrollIntoViewIfNeeded();
      await shot(page, "appearance");
      await navigate(page, "classes");
      await expect(page.getByTestId("classes-table")).toBeVisible();
      await shot(page, "classes");
      await navigate(page, "membership");
      await expect(page.getByText("Plan 1", { exact: true }).locator("visible=true").first()).toBeVisible();
      await shot(page, "membership");
      await navigate(page, "nutrition");
      await expect(
        page.getByText(
          ar ? "خطتك قيد الإعداد" : "Good things are being prepared",
          { exact: true },
        ),
      ).toBeVisible();
      await shot(page, "nutrition");
      await navigate(page, "checkin");
      await expect(
        page.getByRole("img", {
          name: ar ? "رمز QR لدخول النادي" : "Gym entry QR code",
          exact: true,
        }),
      ).toBeVisible();
      await shot(page, "checkin");
      expect(errors).toEqual([]);
    });
