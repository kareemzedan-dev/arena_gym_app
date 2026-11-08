import type { z } from "zod";
import type { CoachPtBookingResponse, ScheduleResponse } from "@arena/shared";

export function mergeSchedule(
  classes: z.output<typeof ScheduleResponse>,
  bookings: CoachPtBookingResponse[],
) {
  return [
    ...classes.map((item) => ({
      kind: "class" as const,
      item,
      startsAt: item.startsAt,
    })),
    ...bookings.map((item) => ({
      kind: "pt" as const,
      item,
      startsAt: item.startsAt,
    })),
  ].sort(
    (a, b) =>
      Date.parse(a.startsAt) - Date.parse(b.startsAt) || a.item.id - b.item.id,
  );
}
