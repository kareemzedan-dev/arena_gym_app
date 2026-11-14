import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
// Capture with the source backend dependencies installed, before changing its validators.
const S = await import(
  pathToFileURL(
    resolve(process.argv[2] || "../arena-gym", "packages/shared/src/index.ts"),
  ).href
);
import { writeFileSync, mkdirSync } from "node:fs";
const cases: { schema: string; input: unknown }[] = [];
const add = (schema: string, ...inputs: unknown[]) =>
  inputs.forEach((input) => cases.push({ schema, input }));
for (const [name, schema] of Object.entries(S))
  if (
    name.endsWith("UpdateRequest") &&
    typeof (schema as any)?.safeParse === "function"
  )
    add(name, {}, { isActive: false }, { name: "  Changed  " });
add(
  "PlanRequest",
  { name: "Gym", categoryId: 1, price: 25, durationDays: 30, scope: "GYM" },
  {
    name: "PT",
    categoryId: 1,
    price: "0.001",
    durationDays: 30,
    scope: "PT",
    ptSessions: 12,
  },
  {
    name: "PT",
    categoryId: 1,
    price: "1.000",
    durationDays: 30,
    scope: "PT",
    ptSessions: 0,
  },
);
add(
  "StaffRequest",
  {
    username: "coach",
    password: "password",
    role: "STAFF_MEMBER",
    fullName: "Coach",
  },
  { username: "admin", password: "password", role: "ADMINISTRATOR" },
  { username: "coach", password: "password", role: "STAFF_MEMBER" },
);
add(
  "MemberRequest",
  {
    username: "member",
    password: "password",
    branchId: 1,
    fullName: "Member",
    email: "member+gym@example.com",
  },
  {
    username: "member",
    password: "password",
    branchId: 1,
    fullName: "Member",
    email: "bad@",
  },
);
add("PaginationQuery", {}, { page: "2", pageSize: "100" }, { pageSize: 101 });
add(
  "CheckoutRequest",
  {
    memberId: 1,
    items: [{ type: "PLAN", planId: 1 }],
    payment: { amount: "0.001", method: "CASH" },
  },
  { memberId: 1, items: [] },
);
add(
  "InvoiceUpdateRequest",
  { payments: [] },
  {
    payments: [],
    expectedUpdatedAt: "2026-11-04T10:00:00.000Z",
    correctionReason: "Duplicate payment",
  },
);
add("ClassRequest", {
  name: "Class",
  coachId: 1,
  branchId: 1,
  weekDays: [1],
  planIds: [1],
  startDate: "2026-11-04",
  endDate: "2026-12-04",
  startTime: "10:00",
  endTime: "11:00",
  capacity: 10,
});
add("ClassUpdateRequest", { coachId: 1, capacity: 20 });
const coupon = {
  code: "save",
  name: "Save",
  discountType: "PERCENT",
  value: "10",
  startDate: "2026-11-04",
  endDate: "2026-12-04",
};
add(
  "CouponRequest",
  coupon,
  { ...coupon, value: "101" },
  { ...coupon, endDate: "2026-01-01" },
);
add("CouponResponse", {
  ...coupon,
  value: "101",
  id: 1,
  used: 0,
  createdAt: "2026-11-04T10:00:00.000Z",
  updatedAt: "2026-11-04T10:00:00.000Z",
});
add("OperationResponse", {
  id: 1,
  kind: "notices",
  title: "Notice",
  data: { body: "Hello" },
  createdAt: "2026-11-04T10:00:00.000Z",
  updatedAt: "2026-11-04T10:00:00.000Z",
});
add("WorkoutRequest", {
  name: "Strength",
  items: [{ exerciseId: 1, sets: 3, reps: 12, order: 0 }],
});
add("NutritionRequest", {
  name: "Fuel",
  memberId: 1,
  meals: [
    { name: "Breakfast", order: 0, items: [{ food: "Oats", quantity: "60g" }] },
  ],
});
add(
  "MeasurementRequest",
  { measuredOn: "2026-11-04", weight: "80.25" },
  { measuredOn: "2026-02-31", weight: "80.25" },
  { measuredOn: "2026-11-04" },
);
add(
  "LoginRequest",
  { identifier: " user ", password: " pass " },
  { identifier: "user", password: "" },
);
for (const name of ["money", "dateOnly", "timestamp", "id"])
  add(
    name,
    null,
    "",
    0,
    -1,
    "2028-02-29",
    "2026-02-29",
    "2026-11-04T10:00:00Z",
    "0.001",
    "999999999.999",
    "1000000000.000",
    2147483648,
  );
const fixtures = cases.map(({ schema, input }) => {
  const result = (S as any)[schema].safeParse(input);
  return {
    schema,
    input,
    expected: result.success
      ? { success: true, data: result.data }
      : { success: false },
  };
});
mkdirSync("tests/fixtures", { recursive: true });
writeFileSync(
  "tests/fixtures/contracts-v3.json",
  JSON.stringify(fixtures, null, 2) + "\n",
);
console.log(`${fixtures.length} protocol fixtures captured from backend Zod 3`);
