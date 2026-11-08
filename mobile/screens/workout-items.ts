import type { WorkoutRequest } from "@arena/shared";

export type WorkoutItemDraft = {
  exerciseId?: number | null;
  sets: number | null;
  reps: number | null;
  weightKg: string | null;
  dayOfWeek: number | null;
  order: number;
};

export function newWorkoutItem(order: number): WorkoutItemDraft {
  return {
    exerciseId: null,
    sets: 3,
    reps: 12,
    weightKg: null,
    dayOfWeek: null,
    order,
  };
}
export function orderWorkoutItems<T extends { order: number }>(
  items: T[],
): T[] {
  return items.map((item, order) => ({ ...item, order }));
}
export function moveWorkoutItem<T extends { order: number }>(
  items: T[],
  index: number,
  delta: -1 | 1,
): T[] {
  const next = [...items];
  const target = index + delta;
  if (index < 0 || index >= next.length || target < 0 || target >= next.length)
    return next;
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return orderWorkoutItems(next);
}
export function removeWorkoutItem<T extends { order: number }>(
  items: T[],
  index: number,
): T[] {
  return orderWorkoutItems(items.filter((_, i) => i !== index));
}
/** Strip response-only IDs/exercise objects and display in the saved order. */
export function loadWorkoutItems(
  items: WorkoutRequest["items"],
): WorkoutItemDraft[] {
  return orderWorkoutItems(
    [...items]
      .sort((a, b) => a.order - b.order)
      .map(({ exerciseId, sets, reps, weightKg, dayOfWeek, order }) => ({
        exerciseId,
        sets,
        reps,
        weightKg: weightKg ?? null,
        dayOfWeek: dayOfWeek ?? null,
        order,
      })),
  );
}
