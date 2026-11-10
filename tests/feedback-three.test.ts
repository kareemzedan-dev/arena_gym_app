import { test } from "node:test";
import assert from "node:assert/strict";
import type { SubscriptionResponse } from "@arena/shared";
import { themes, resolveTheme } from "../mobile/theme/tokens";
import {
  bannerDuration,
  MobileBannerListResponse,
} from "../mobile/api/banners";
import { membershipsForDisplay } from "../mobile/api/memberships";
import { seatsLeft, nextClassDate } from "../mobile/api/schedule";
import { MobileScheduleResponse } from "../mobile/api/class-availability";
import { chartScale, chartX } from "../mobile/screens/chart-scale";

const luminance = (hex: string) => {
  const rgb = hex
    .slice(1)
    .match(/../g)!
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
};
const contrast = (a: string, b: string) => {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
test("both themes have complete tokens and AA text/primary contrast", () => {
  assert.deepEqual(
    Object.keys(themes.light).sort(),
    Object.keys(themes.dark).sort(),
  );
  for (const c of Object.values(themes)) {
    for (const value of Object.values(c))
      assert.ok(value === "transparent" || /^#[0-9a-f]{6}$/i.test(value));
    for (const foreground of [c.text, c.muted, c.accent])
      for (const background of [c.bg, c.card, c.raised, c.highlight])
        assert.ok(
          contrast(foreground, background) >= 4.5,
          `${foreground} on ${background}`,
        );
    assert.ok(contrast(c.ink, c.primary) >= 4.5);
    assert.ok(contrast(c.lime, c.successBg) >= 4.5);
    assert.ok(contrast(c.red, c.dangerBg) >= 4.5);
  }
  assert.equal(resolveTheme("system", "dark"), "dark");
  assert.equal(resolveTheme("system", null), "light");
  assert.equal(resolveTheme("light", "dark"), "light");
  assert.equal(resolveTheme("dark", "light"), "dark");
});
const banner = {
  id: 1,
  title: "Banner",
  subtitle: null,
  imageUrl: "https://example.com/banner.png",
  linkUrl: null,
};
test("banner duration is lenient, defaults safely, and survives contract parsing", () => {
  for (const durationSeconds of [
    undefined,
    null,
    "",
    " ",
    "abc",
    0,
    -1,
    Infinity,
    {},
    true,
    86401,
  ])
    assert.equal(bannerDuration({ durationSeconds }), 5);
  for (const [input, expected] of [
    [2, 2],
    [" 7.5 ", 7.5],
    [60, 60],
  ] as const) {
    assert.equal(bannerDuration({ durationSeconds: input }), expected);
    assert.equal(
      MobileBannerListResponse.parse([{ ...banner, durationSeconds: input }])[0]
        .durationSeconds,
      expected,
    );
  }
  assert.equal(MobileBannerListResponse.parse([banner])[0].durationSeconds, 5);
  assert.equal(
    MobileBannerListResponse.safeParse([{ ...banner, id: "1" }]).success,
    false,
  );
});
test("membership selection handles zero, current, upcoming, duplicates, and expired fallback", () => {
  const subscription = (
    id: number,
    status: SubscriptionResponse["status"] = "ACTIVE",
  ) => ({ id, status }) as SubscriptionResponse;
  const data = {
    current: [],
    upcoming: [],
    lastExpired: null,
    ptRemaining: 0,
    ptUsed: 0,
  };
  assert.deepEqual(membershipsForDisplay(), []);
  assert.deepEqual(membershipsForDisplay(data), []);
  assert.deepEqual(
    membershipsForDisplay({ ...data, current: [subscription(1)] }).map(
      (s) => s.id,
    ),
    [1],
  );
  assert.deepEqual(
    membershipsForDisplay({
      ...data,
      current: [subscription(1), subscription(2)],
      upcoming: [subscription(2), subscription(3)],
      lastExpired: subscription(4, "EXPIRED"),
    }).map((s) => s.id),
    [1, 2, 3],
  );
  assert.deepEqual(
    membershipsForDisplay({
      ...data,
      current: [subscription(1, "CANCELLED")],
      lastExpired: subscription(4, "EXPIRED"),
    }).map((s) => s.id),
    [4],
  );
  assert.deepEqual(
    membershipsForDisplay({
      ...data,
      upcoming: [subscription(3)],
      lastExpired: subscription(4, "EXPIRED"),
    }).map((s) => s.id),
    [3, 4],
  );
});
test("seats prefer occurrence values and fallback counts only the selected class/date excluding cancellations", () => {
  const bookings = [
    { status: "ACTIVE", data: { classId: 1, date: "2026-11-10" } },
    { status: "CANCELLED", data: { classId: 1, date: "2026-11-10" } },
    { status: "ACTIVE", data: { classId: 2, date: "2026-11-10" } },
    { status: "ACTIVE", data: { classId: 1, date: "2026-11-11" } },
  ];
  assert.equal(seatsLeft(20, 1, "2026-11-10", bookings), 19);
  assert.equal(
    seatsLeft(20, 1, "2026-11-10", bookings, { bookedCount: 12 }),
    8,
  );
  assert.equal(
    seatsLeft(20, 1, "2026-11-10", bookings, { seatsLeft: 0, bookedCount: 12 }),
    0,
  );
  assert.equal(seatsLeft(20, 1, "2026-11-10", [], { bookedCount: 50 }), 0);
  assert.equal(seatsLeft(20, 1, "2026-11-10", [], { seatsLeft: 30 }), 20);
  const count = MobileScheduleResponse.element.shape.seatsLeft;
  assert.equal(count.parse("19"), 19);
  for (const value of [null, undefined, "invalid", -1, 1.5])
    assert.equal(count.parse(value), undefined);
  assert.equal(
    nextClassDate(
      { startDate: "2026-11-01", endDate: "2026-12-01", weekDays: [3] },
      "2026-11-10",
    ),
    "2026-11-11",
  );
});
test("chart scaling has padded domains and stable ticks for empty, single, flat and two-point data", () => {
  for (const values of [
    [],
    [0],
    [70],
    [70, 70],
    [69.5, 70],
    [0.01, 0.02],
    [20, 90],
    [NaN, 2, Infinity],
  ]) {
    const scale = chartScale(values);
    assert.ok(Number.isFinite(scale.min) && Number.isFinite(scale.max));
    assert.ok(scale.max > scale.min);
    assert.ok(scale.ticks.length >= 2 && scale.ticks.length <= 8);
    for (const value of values.filter(Number.isFinite)) {
      assert.ok(scale.min < value);
      assert.ok(scale.max > value);
      assert.ok(scale.fraction(value) > 0 && scale.fraction(value) < 1);
    }
    for (let i = 1; i < scale.ticks.length; i++)
      assert.ok(
        Math.abs(scale.ticks[i] - scale.ticks[i - 1] - scale.step) < 1e-8,
      );
  }
  assert.equal(chartX(0, 1, false, 20, 280), 150);
  assert.equal(chartX(0, 1, true, 20, 280), 150);
  assert.equal(chartX(0, 2, false, 20, 280), 20);
  assert.equal(chartX(0, 2, true, 20, 280), 280);
});
