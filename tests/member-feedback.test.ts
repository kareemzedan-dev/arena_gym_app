import { test } from "node:test";
import assert from "node:assert/strict";
import QRCode from "qrcode";
import {
  BannerListResponse,
  BannerResponse,
  CheckInTokenResponse,
  CoachPtBookingListResponse,
  CoachPtBookingResponse,
  Me,
  QrAttendanceRequest,
  QrAttendanceResponse,
  Role,
} from "@arena/shared";
import * as Attendance from "../packages/contracts/src/attendance";
import * as Operations from "../packages/contracts/src/operations";
import { resolveScreenAccess } from "../mobile/state/screen-access";
import { greetingName } from "../mobile/state/greeting";
import { checkInRefreshDelay, tokenToQrRects } from "../mobile/api/qr";
import { mergeSchedule } from "../mobile/api/schedule";
import { dateLabel, timeLabel } from "../mobile/api/format";
import { bannersForDisplay } from "../mobile/api/banners";

test("shared entry point exports the generated banner, check-in, QR attendance and PT schemas", () => {
  assert.equal(BannerResponse, Operations.BannerResponse);
  assert.equal(BannerListResponse, Operations.BannerListResponse);
  assert.equal(CheckInTokenResponse, Attendance.CheckInTokenResponse);
  assert.equal(QrAttendanceRequest, Attendance.QrAttendanceRequest);
  assert.equal(QrAttendanceResponse, Attendance.QrAttendanceResponse);
  assert.equal(CoachPtBookingResponse, Operations.CoachPtBookingResponse);
  assert.equal(
    CoachPtBookingListResponse,
    Operations.CoachPtBookingListResponse,
  );
});

test("restoration takes precedence over all route and role checks", () => {
  for (const screen of [
    undefined,
    "",
    "editor",
    "workout",
    "unknown",
    ["workout"],
  ]) {
    assert.equal(
      resolveScreenAccess(screen, undefined, "restoring", "exercises"),
      "loading",
    );
    assert.equal(
      resolveScreenAccess(screen, "MEMBER", "restoring", "exercises"),
      "loading",
    );
    assert.equal(resolveScreenAccess(screen, undefined, "anonymous"), "login");
  }
});

test("members keep assigned training and class booking, and cannot open any editor or dropped feature", () => {
  for (const screen of [
    "classes",
    "workout",
    "nutrition",
    "membership",
    "coach",
    "measurements",
    "history",
    "invoices",
    "password",
    "checkin",
  ]) {
    assert.equal(
      resolveScreenAccess(screen, "MEMBER", "authenticated"),
      "allow",
      screen,
    );
  }
  for (const kind of [
    "exercises",
    "workout-plans",
    "assignments",
    "workout-logs",
    "nutrition-plans",
    "measurements",
    "attendance",
    "members",
    undefined,
  ]) {
    assert.equal(
      resolveScreenAccess("editor", "MEMBER", "authenticated", kind),
      "home",
      kind,
    );
  }
  for (const screen of [
    "notices",
    "messages",
    "groups",
    "virtual-classes",
    "workout-logs",
    "exercises",
    "workout-plans",
    "schedule",
    "client",
    "pos",
  ]) {
    assert.equal(
      resolveScreenAccess(screen, "MEMBER", "authenticated"),
      "home",
      screen,
    );
  }
});

test("role restrictions survive deep links and unknown or missing parameters go home", () => {
  for (const role of Role.options) {
    for (const screen of [undefined, "", "bad-key", ["workout"]]) {
      assert.equal(resolveScreenAccess(screen, role, "authenticated"), "home");
    }
    if (role !== "MEMBER") {
      assert.equal(
        resolveScreenAccess("checkin", role, "authenticated"),
        "home",
      );
      assert.equal(
        resolveScreenAccess("messages", role, "authenticated"),
        "allow",
      );
      assert.equal(
        resolveScreenAccess("notices", role, "authenticated"),
        "allow",
      );
    }
  }
  for (const role of [
    "STAFF_MEMBER",
    "ADMINISTRATOR",
    "GYM_OWNER",
    "MANAGEMENT",
  ]) {
    for (const kind of [
      "exercises",
      "workout-plans",
      "assignments",
      "attendance",
    ]) {
      assert.equal(
        resolveScreenAccess("editor", role, "authenticated", kind),
        "allow",
      );
    }
    assert.equal(
      resolveScreenAccess("editor", role, "authenticated", "unknown-kind"),
      "home",
    );
  }
  assert.equal(
    resolveScreenAccess("editor", "STAFF_MEMBER", "authenticated", "staff"),
    "home",
  );
  assert.equal(
    resolveScreenAccess("editor", "ACCOUNTANT", "authenticated", "exercises"),
    "home",
  );
  assert.equal(
    resolveScreenAccess("editor", "GYM_OWNER", "authenticated", "staff"),
    "allow",
  );
  assert.equal(
    resolveScreenAccess("password", "unknown-role", "authenticated"),
    "home",
  );
});

test("greetings use the first full name and never expose email addresses", () => {
  assert.equal(
    greetingName({ fullName: "  مريم  أحمد ", username: "m@gmail.com" }),
    "مريم",
  );
  assert.equal(
    greetingName({ fullName: "Mary\tSmith", username: "other" }),
    "Mary",
  );
  assert.equal(greetingName({ fullName: " ", username: "  mary  " }), "mary");
  assert.equal(greetingName({ fullName: null, username: "m@gmail.com" }), "");
  assert.equal(greetingName({ fullName: null, username: "mary" }), "mary");
  assert.equal(
    greetingName({ fullName: "m@gmail.com Name", username: "m@gmail.com" }),
    "",
  );
  assert.equal(greetingName(null), "");
  assert.equal(greetingName(), "");
});

test("users/me requires fullName and accepts either a string or null", () => {
  const me = {
    id: 1,
    username: "m@gmail.com",
    mobile: null,
    email: "m@gmail.com",
    role: "MEMBER",
    isActive: true,
    branchId: null,
    lastLoginAt: null,
  };
  assert.equal(
    Me.parse({ ...me, fullName: "مريم أحمد" }).fullName,
    "مريم أحمد",
  );
  assert.equal(Me.safeParse(me).success, false);
  assert.equal(Me.safeParse({ ...me, fullName: undefined }).success, false);
  assert.equal(Me.safeParse({ ...me, fullName: 1 }).success, false);
  assert.equal(Me.parse({ ...me, fullName: null }).fullName, null);
});

test("banner contracts accept absolute URLs; display filters image and link schemes to HTTP(S)", () => {
  const banner = {
    id: 1,
    title: "عرض خاص",
    subtitle: null,
    imageUrl: "https://cdn.example.com/banner.jpg",
    linkUrl: null,
  };
  assert.deepEqual(BannerListResponse.parse([banner]), [banner]);
  assert.deepEqual(BannerListResponse.parse([]), []);
  assert.equal(
    BannerResponse.safeParse({
      ...banner,
      subtitle: "Join us",
      linkUrl: "http://example.com/offer",
    }).success,
    true,
  );
  assert.deepEqual(bannersForDisplay([banner]), [banner]);
  for (const imageUrl of ["/banner.jpg", "not-a-url"]) {
    assert.equal(
      BannerResponse.safeParse({ ...banner, imageUrl }).success,
      false,
    );
  }
  for (const imageUrl of ["file:///tmp/photo", "javascript:alert(1)"]) {
    const parsed = BannerResponse.parse({ ...banner, imageUrl });
    assert.deepEqual(bannersForDisplay([parsed, banner]), [banner]);
  }
  for (const linkUrl of ["javascript:alert(1)", "mailto:a@example.com"]) {
    const parsed = BannerResponse.parse({ ...banner, linkUrl });
    assert.deepEqual(bannersForDisplay([parsed]), [banner]);
  }
  assert.equal(
    BannerResponse.safeParse({ ...banner, linkUrl: "/offer" }).success,
    false,
  );
  const linked = { ...banner, linkUrl: "http://example.com/offer" };
  assert.deepEqual(bannersForDisplay([BannerResponse.parse(linked)]), [linked]);
  assert.equal(BannerResponse.safeParse({ ...banner, id: "1" }).success, false);
  assert.equal(
    BannerListResponse.safeParse({ items: [banner] }).success,
    false,
  );
  assert.equal(
    BannerResponse.safeParse({ ...banner, subtitle: undefined }).success,
    false,
  );
});

test("QR rectangles exactly preserve the M-level matrix with a four-module quiet zone", () => {
  for (const token of ["entry-token", "رمز-دخول-مريم", "a".repeat(1024)]) {
    const qr = tokenToQrRects(token);
    const { modules } = QRCode.create(token, { errorCorrectionLevel: "M" });
    assert.equal(qr.size, modules.size + 8);
    const pixels = Array.from({ length: qr.size }, () =>
      Array(qr.size).fill(false),
    );
    for (const rect of qr.rects) {
      assert.equal(rect.height, 1);
      assert.ok(rect.width > 0);
      assert.ok(
        rect.x >= 4 &&
          rect.y >= 4 &&
          rect.x + rect.width <= qr.size - 4 &&
          rect.y < qr.size - 4,
      );
      for (let x = rect.x; x < rect.x + rect.width; x++) {
        assert.equal(pixels[rect.y][x], false, "rectangles must not overlap");
        pixels[rect.y][x] = true;
      }
    }
    for (let y = 0; y < qr.size; y++) {
      for (let x = 0; x < qr.size; x++) {
        const inside = x >= 4 && x < qr.size - 4 && y >= 4 && y < qr.size - 4;
        assert.equal(
          pixels[y][x],
          inside ? !!modules.get(y - 4, x - 4) : false,
        );
      }
    }
    assert.deepEqual(tokenToQrRects(token), qr);
  }
  assert.throws(() => tokenToQrRects(""));
  assert.throws(() => tokenToQrRects("a".repeat(10000)));
});

test("check-in accepts a string token and UTC expiry; empty tokens cannot render or be scanned", () => {
  const response = {
    token: "opaque-token",
    expiresAt: "2026-11-07T10:01:00.000Z",
  };
  assert.deepEqual(CheckInTokenResponse.parse(response), response);
  assert.equal(
    CheckInTokenResponse.safeParse({ ...response, token: "" }).success,
    true,
  );
  assert.equal(
    CheckInTokenResponse.safeParse({ expiresAt: response.expiresAt }).success,
    false,
  );
  assert.equal(
    QrAttendanceRequest.safeParse({ token: response.token }).success,
    true,
  );
  assert.equal(QrAttendanceRequest.safeParse({ token: "" }).success, false);
  assert.throws(() =>
    tokenToQrRects(
      CheckInTokenResponse.parse({ ...response, token: "" }).token,
    ),
  );
  assert.equal(
    CheckInTokenResponse.safeParse({ ...response, expiresAt: "2026-11-07" })
      .success,
    false,
  );
  const now = Date.parse("2026-11-07T10:00:00.000Z");
  assert.equal(checkInRefreshDelay(response.expiresAt, now), 50000);
  assert.equal(checkInRefreshDelay(response.expiresAt, now + 59000), 1000);
  assert.equal(checkInRefreshDelay(response.expiresAt, now + 90000), 1000);
});

test("PT bookings merge into the class timeline and display in Muscat across UTC midnight", () => {
  const booking = CoachPtBookingResponse.parse({
    id: 4,
    memberId: 2,
    memberName: "مريم",
    coachId: 3,
    coachName: "Coach",
    startsAt: "2026-11-07T21:00:00Z",
    endsAt: "2026-11-07T22:00:00Z",
    status: "SCHEDULED",
    notes: null,
  });
  const later = { ...booking, id: 5, startsAt: "2026-11-08T08:00:00Z" };
  const classes = [{ id: 1, startsAt: "2026-11-08T07:00:00Z" }] as Parameters<
    typeof mergeSchedule
  >[0];
  assert.deepEqual(
    mergeSchedule(classes, [later, booking]).map((entry) => [
      entry.kind,
      entry.item.id,
    ]),
    [
      ["pt", 4],
      ["class", 1],
      ["pt", 5],
    ],
  );
  assert.deepEqual(mergeSchedule([], []), []);
  assert.match(dateLabel(booking.startsAt), /8 Nov 2026/);
  assert.equal(timeLabel(booking.startsAt), "01:00");
  assert.equal(
    CoachPtBookingResponse.safeParse({ ...booking, startsAt: "2026-11-07" })
      .success,
    false,
  );
  assert.equal(
    CoachPtBookingResponse.safeParse({ ...booking, status: "UNKNOWN" }).success,
    false,
  );
});
