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

/** Availability belongs to an occurrence, never to a different date of the same class. */
export function seatsLeft(
  capacity: number,
  classId: number,
  date: string,
  bookings: { status: string; data: Record<string, unknown> }[],
  occurrence?: { seatsLeft?: number; bookedCount?: number },
) {
  if (occurrence?.seatsLeft != null && Number.isFinite(occurrence.seatsLeft))
    return Math.max(0, Math.min(capacity, Math.floor(occurrence.seatsLeft)));
  const count =
    occurrence?.bookedCount ??
    bookings.filter(
      (b) =>
        b.status !== "CANCELLED" &&
        Number(b.data.classId) === classId &&
        b.data.date === date,
    ).length;
  return Math.max(0, capacity - Math.max(0, count));
}

export function nextClassDate(
  item: { startDate: string; endDate: string; weekDays: number[] },
  from: string,
) {
  const start = from > item.startDate ? from : item.startDate;
  for (let offset = 0; offset < 7; offset++) {
    const day = new Date(`${start}T12:00:00Z`);
    day.setUTCDate(day.getUTCDate() + offset);
    const date = day.toISOString().slice(0, 10);
    if (date > item.endDate) break;
    if (item.weekDays.includes(day.getUTCDay())) return date;
  }
  return start;
}
