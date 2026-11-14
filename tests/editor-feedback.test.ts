import { test } from "node:test";
import assert from "node:assert/strict";
import { Role, WorkoutRequest, WorkoutUpdateRequest } from "@arena/shared";
import {
  editorErrors,
  editorFields,
  validateEditor,
} from "../mobile/screens/editor-validation";
import {
  loadWorkoutItems,
  moveWorkoutItem,
  newWorkoutItem,
  removeWorkoutItem,
} from "../mobile/screens/workout-items";
import {
  canEditKind,
  resolveScreenAccess,
} from "../mobile/state/screen-access";
import { configs } from "../mobile/screens/editor-config";

const attendance = { memberId: 1, attendedOn: "2026-11-08", type: "GYM" };
test("attendance stays quiet before save and clears errors immediately when corrected", () => {
  for (const values of [
    {},
    { type: "GYM" },
    { ...attendance, memberId: null },
  ]) {
    assert.deepEqual(
      editorErrors(validateEditor("attendance", values), false),
      {},
    );
  }
  const invalid = validateEditor("attendance", {
    ...attendance,
    memberId: null,
  });
  assert.ok(editorErrors(invalid, true).memberId);
  assert.deepEqual(
    editorErrors(validateEditor("attendance", attendance), true),
    {},
  );
});
test("attendance requires member, explicit date, type, and only CLASS requires class", () => {
  for (const key of ["memberId", "attendedOn", "type"]) {
    for (const blank of [undefined, null, ""]) {
      assert.equal(
        validateEditor("attendance", { ...attendance, [key]: blank }).valid,
        false,
        key,
      );
    }
  }
  assert.equal(
    validateEditor("attendance", { ...attendance, attendedOn: "2026-02-31" })
      .valid,
    false,
  );
  for (const type of ["GYM", "PT"]) {
    const result = validateEditor("attendance", {
      ...attendance,
      type,
      classId: 12,
      subscriptionId: null,
    });
    assert.equal(result.valid, true);
    assert.deepEqual(result.data, { ...attendance, type });
    assert.ok(
      !editorFields("attendance", { type }).some((f) => f.key === "classId"),
    );
  }
  const values = { ...attendance, type: "CLASS" };
  assert.ok(
    editorFields("attendance", values).find((f) => f.key === "classId")
      ?.required,
  );
  assert.ok(validateEditor("attendance", values).errors.classId);
  assert.equal(
    validateEditor("attendance", { ...values, classId: 2 }).valid,
    true,
  );
  assert.deepEqual(
    editorErrors(validateEditor("attendance", { ...values, classId: 2 }), true),
    {},
  );
  assert.equal(
    validateEditor("attendance", { ...attendance, subscriptionId: 3 }).data
      .subscriptionId,
    3,
  );
});
test("shared validation clears root, nested and field errors across editor kinds", () => {
  assert.ok(
    Object.keys(
      validateEditor("measurements", { measuredOn: "2026-11-08" }).errors,
    ).includes(""),
  );
  assert.deepEqual(
    validateEditor("measurements", {
      measuredOn: "2026-11-08",
      weight: "80.25",
      memberId: 1,
    }).errors,
    {},
  );
  const assignment = {
    workoutPlanId: 1,
    startDate: "2026-11-08",
    endDate: "2026-11-07",
    memberId: 1,
  };
  assert.equal(validateEditor("assignments", assignment).valid, false);
  assert.deepEqual(
    validateEditor("assignments", { ...assignment, endDate: "" }).errors,
    {},
  );
  assert.deepEqual(
    validateEditor("exercises", { name: "Squat", videoUrl: "" }).errors,
    {},
  );
  assert.equal(
    validateEditor("exercises", { name: "Squat", videoUrl: "bad" }).valid,
    false,
  );
  assert.equal(
    validateEditor(
      "members",
      { fullName: "Mary", username: "mary", branchId: 1 },
      { editing: true },
    ).valid,
    true,
  );
});
test("workout rows add, reorder in both directions, remove and preserve values without mutation", () => {
  const first = {
    ...newWorkoutItem(0),
    exerciseId: 1,
    weightKg: "12.50",
    dayOfWeek: 0,
  };
  const second = { ...newWorkoutItem(1), exerciseId: 2, sets: 4 };
  const original = [first, second];
  const moved = moveWorkoutItem(original, 0, 1);
  assert.deepEqual(
    moved.map((i) => [i.exerciseId, i.order]),
    [
      [2, 0],
      [1, 1],
    ],
  );
  assert.deepEqual(moveWorkoutItem(moved, 1, -1), original);
  assert.deepEqual(moveWorkoutItem(original, 0, -1), original);
  assert.deepEqual(moveWorkoutItem(original, 1, 1), original);
  assert.equal(first.order, 0);
  assert.equal(moved[1].weightKg, "12.50");
  assert.equal(moved[1].dayOfWeek, 0);
  assert.deepEqual(removeWorkoutItem(moved, 0), [first]);
  assert.deepEqual(removeWorkoutItem([first], 0), []);
});
test("workout create and edit use strict API fields and saved ordering", () => {
  const rows = [
    {
      exerciseId: 2,
      sets: 4,
      reps: 8,
      weightKg: "20.00",
      dayOfWeek: 6,
      order: 9,
      id: 20,
      exercise: { name: "Squat" },
    },
    {
      exerciseId: 1,
      sets: 3,
      reps: 12,
      weightKg: null,
      dayOfWeek: null,
      order: 2,
      id: 10,
      exercise: { name: "Press" },
    },
  ];
  const items = loadWorkoutItems(rows);
  assert.deepEqual(
    items.map((i) => [i.exerciseId, i.order]),
    [
      [1, 0],
      [2, 1],
    ],
  );
  assert.ok(!("id" in items[0]) && !("exercise" in items[0]));
  const input = { name: "Strength", items };
  for (const editing of [false, true]) {
    const result = validateEditor("workout-plans", input, { editing });
    assert.equal(result.valid, true);
    assert.deepEqual(result.data, WorkoutRequest.parse(input));
  }
  assert.equal(configs["workout-plans"].update, WorkoutUpdateRequest);
  for (const extra of [
    { description: "No API support" },
    { notes: "No API support" },
  ]) {
    assert.equal(
      WorkoutRequest.safeParse({ ...input, ...extra }).success,
      false,
    );
  }
  for (const patch of [
    { sets: 0 },
    { reps: 1.5 },
    { exerciseId: null },
    { dayOfWeek: 7 },
    { weightKg: "1.234" },
    { rest: 30 },
    { notes: "unsupported" },
  ]) {
    assert.equal(
      validateEditor("workout-plans", {
        ...input,
        items: [{ ...items[0], ...patch }],
      }).valid,
      false,
    );
  }
  assert.equal(
    validateEditor("workout-plans", { name: "Strength", items: [] }).valid,
    false,
  );
  assert.equal(
    validateEditor("workout-plans", {
      name: "Strength",
      items: [newWorkoutItem(0)],
    }).valid,
    false,
  );
  assert.deepEqual(
    editorErrors(validateEditor("workout-plans", input), true),
    {},
  );
  assert.equal(
    validateEditor("workout-plans", {
      ...input,
      items: Array(201).fill(items[0]),
    }).valid,
    false,
  );
});
test("workout catalog and editor share admin/trainer permissions, including deep links", () => {
  for (const role of [...Role.options, "UNKNOWN"]) {
    const allowed = [
      "ADMINISTRATOR",
      "GYM_OWNER",
      "MANAGEMENT",
      "STAFF_MEMBER",
    ].includes(role);
    assert.equal(canEditKind(role, "workout-plans"), allowed);
    assert.equal(
      resolveScreenAccess("workout-plans", role, "authenticated"),
      allowed ? "allow" : "home",
    );
    assert.equal(
      resolveScreenAccess("editor", role, "authenticated", "workout-plans"),
      allowed ? "allow" : "home",
    );
  }
  assert.equal(canEditKind(undefined, "workout-plans"), false);
  assert.equal(
    resolveScreenAccess("editor", "STAFF_MEMBER", "restoring", "workout-plans"),
    "loading",
  );
});

test("shared validation follows optional staff fields and clears nested nutrition errors", () => {
  const staff = {
    username: "manager",
    password: "Password123",
    role: "MANAGEMENT",
    branchId: 1,
  };
  assert.equal(validateEditor("staff", staff).valid, true);
  assert.equal(
    validateEditor("staff", { ...staff, role: "STAFF_MEMBER" }).valid,
    false,
  );
  const nutrition = {
    name: "Fuel",
    memberId: 1,
    meals: [
      { name: "Breakfast", order: 0, items: [{ food: "", quantity: "60g" }] },
    ],
  };
  const invalid = validateEditor("nutrition-plans", nutrition);
  assert.ok(editorErrors(invalid, true)["meals.0.items.0.food"]);
  nutrition.meals[0].items[0].food = "Oats";
  assert.deepEqual(
    editorErrors(validateEditor("nutrition-plans", nutrition), true),
    {},
  );
});
