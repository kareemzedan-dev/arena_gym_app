import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PlanRequest,
  CheckoutRequest,
  InvoiceUpdateRequest,
  MeasurementRequest,
  WorkoutRequest,
  NutritionRequest,
  operationDataSchema,
} from "@arena/shared";
import {
  addDays,
  money,
  canManage,
  canFinance,
  canTrain,
  safeHttpUrl,
} from "../mobile/api/format";
test("gym uses duration only, PT and bundles require positive sessions", () => {
  const base = {
    name: "Annual",
    categoryId: 1,
    price: "25.000",
    durationDays: 30,
  };
  assert.equal(
    PlanRequest.parse({ ...base, scope: "GYM", ptSessions: 8 }).ptSessions,
    0,
  );
  assert.equal(
    PlanRequest.safeParse({ ...base, scope: "PT", ptSessions: 0 }).success,
    false,
  );
  assert.equal(
    PlanRequest.safeParse({ ...base, scope: "BUNDLE", ptSessions: 8 }).success,
    true,
  );
});
test("money stays decimal text and supports all three OMR decimal places", () => {
  assert.equal(money("123456.007"), "123,456.007");
  assert.equal(
    CheckoutRequest.safeParse({
      memberId: 1,
      items: [{ type: "PLAN", planId: 1 }],
      payment: { amount: "0.001", method: "CASH" },
    }).success,
    true,
  );
});
test("calendar date arithmetic is timezone independent across month and year boundaries", () => {
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2028-02-28", 1), "2028-02-29");
});
test("payment corrections require a concurrency stamp and reason", () => {
  assert.equal(InvoiceUpdateRequest.safeParse({ payments: [] }).success, false);
  assert.equal(
    InvoiceUpdateRequest.safeParse({
      payments: [],
      correctionReason: "Duplicate payment",
      expectedUpdatedAt: "2026-11-04T10:00:00.000Z",
    }).success,
    true,
  );
});
test("role matrix matches backend ADMINS, FINANCE and COACHES", () => {
  assert.ok(canManage("MANAGEMENT"));
  assert.ok(canFinance("ACCOUNTANT"));
  assert.ok(!canTrain("ACCOUNTANT"));
  assert.ok(canTrain("STAFF_MEMBER"));
  assert.ok(!canManage("STAFF_MEMBER"));
  assert.ok(!canFinance("MEMBER"));
});
test("measurements require values; blank and impossible date rejected", () => {
  assert.equal(
    MeasurementRequest.safeParse({ measuredOn: "2026-11-04" }).success,
    false,
  );
  assert.equal(
    MeasurementRequest.safeParse({ measuredOn: "2026-02-31", weight: "80" })
      .success,
    false,
  );
  assert.equal(
    MeasurementRequest.safeParse({ measuredOn: "2026-11-04", weight: "80.25" })
      .success,
    true,
  );
});
test("workouts and meals validate nested payloads, not arbitrary JSON", () => {
  assert.equal(
    WorkoutRequest.safeParse({
      name: "Strength",
      items: [{ exerciseId: 1, sets: 3, reps: 12, order: 0 }],
    }).success,
    true,
  );
  assert.equal(
    NutritionRequest.safeParse({
      name: "Fuel",
      memberId: 1,
      meals: [
        {
          name: "Breakfast",
          order: 0,
          items: [{ food: "Oats", quantity: "60g" }],
        },
      ],
    }).success,
    true,
  );
});
test("booking dates and messaging recipients are validated", () => {
  assert.equal(
    operationDataSchema("messages").safeParse({ body: "Hi", recipientIds: [] })
      .success,
    false,
  );
  assert.equal(
    operationDataSchema("class-bookings").safeParse({
      classId: 1,
      date: "2026-11-04",
      memberId: 1,
    }).success,
    true,
  );
});
test("external media links allow only http(s)", () => {
  assert.equal(safeHttpUrl("javascript:alert(1)"), null);
  assert.equal(safeHttpUrl("file:///private"), null);
  assert.equal(
    safeHttpUrl("https://example.com/video"),
    "https://example.com/video",
  );
});
