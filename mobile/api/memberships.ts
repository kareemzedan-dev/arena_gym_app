import type { z } from "zod";
import type { MembershipResponse } from "@arena/shared";
export function membershipsForDisplay(
  data?: z.output<typeof MembershipResponse>,
) {
  if (!data) return [];
  const current = data.current.filter(
    (s) => s.status !== "EXPIRED" && s.status !== "CANCELLED",
  );
  const upcoming = data.upcoming.filter(
    (s) => s.status !== "EXPIRED" && s.status !== "CANCELLED",
  );
  const selected = [
    ...current,
    ...upcoming,
    ...(!current.length && data.lastExpired ? [data.lastExpired] : []),
  ];
  return selected.filter(
    (s, index) => selected.findIndex((other) => other.id === s.id) === index,
  );
}
