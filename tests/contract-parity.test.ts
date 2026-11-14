import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as contracts from "@arena/shared";
import { z } from "zod";

// Captured from the backend's unchanged Zod 3 contracts before migration.
const fixtures = JSON.parse(
  readFileSync(
    new URL("./fixtures/contracts-v3.json", import.meta.url),
    "utf8",
  ),
);
test(`Zod 4 preserves the backend protocol across ${fixtures.length} captured request/response cases`, () => {
  for (const fixture of fixtures) {
    const schema = (contracts as Record<string, unknown>)[
      fixture.schema
    ] as z.ZodType;
    const result = schema.safeParse(fixture.input);
    assert.deepEqual(
      result.success
        ? { success: true, data: result.data }
        : { success: false },
      fixture.expected,
      `${fixture.schema}: ${JSON.stringify(fixture.input)}`,
    );
  }
});

test("partial updates never inject defaults into unrelated edits", () => {
  assert.deepEqual(contracts.PlanUpdateRequest.parse({ name: "Renamed" }), {
    name: "Renamed",
  });
  assert.deepEqual(contracts.StaffUpdateRequest.parse({ mobile: "123" }), {
    mobile: "123",
  });
  assert.deepEqual(
    contracts.ClassUpdateRequest.parse({ coachId: 1, capacity: 20 }),
    { coachId: 1, capacity: 20 },
  );
});

test("oversized constrained arrays fail before validating their elements", () => {
  let parsed = 0;
  const schema = z
    .array(
      z.unknown().transform((value) => {
        parsed++;
        return value;
      }),
    )
    .max(100);
  assert.equal(schema.safeParse(Array(101).fill("value")).success, false);
  assert.equal(parsed, 0);
});
