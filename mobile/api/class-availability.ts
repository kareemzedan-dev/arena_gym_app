import { z } from "zod";
import { ClassOccurrence } from "@arena/shared";
const count = z
  .union([z.number(), z.string().trim().min(1)])
  .transform(Number)
  .pipe(z.number().int().nonnegative())
  .optional()
  .catch(undefined);
export const MobileScheduleResponse = z.array(
  ClassOccurrence.extend({ seatsLeft: count, bookedCount: count }),
);
