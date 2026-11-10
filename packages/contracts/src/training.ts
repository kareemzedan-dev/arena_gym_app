// Generated from the backend by npm run sync:contracts; see docs/contracts-source.json.
import { partialWithoutDefaults } from "../compat";
import { z } from "zod";
import { BranchQuery, BranchSummary, dateOnly, id, name, pageResponse, PaginationQuery, text, timestamp, } from "./common";
export const localTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
export const weekday = z.number().int().min(0).max(6);
export const decimal2 = z
    .union([z.string(), z.number().finite()])
    .transform(String)
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v) &&
    (v.split(".")[0]!.replace(/^0+/, "") || "0").length <= 4, "Expected 0–9999.99 with at most 2 decimal places");
export const decimal2Response = z.string().regex(/^\d+\.\d{2}$/);
export const queryId = z.coerce.number().int().positive().max(2147483647);
export const validRange = (v: {
    startDate?: string | null;
    endDate?: string | null;
}) => !v.startDate || !v.endDate || v.endDate >= v.startDate;
const classFields = z
    .object({
    bookingEnabled: z.boolean().prefault(true),
    name,
    coachId: id,
    branchId: id,
    planIds: z
        .array(id)
        .min(1)
        .max(100)
        .refine((v) => new Set(v).size === v.length, "Duplicate plans"),
    weekDays: z
        .array(weekday)
        .min(1)
        .max(7)
        .refine((v) => new Set(v).size === v.length, "Duplicate weekdays"),
    startTime: localTime,
    endTime: localTime,
    capacity: z.number().int().min(1).max(2147483647),
    startDate: dateOnly,
    endDate: dateOnly,
})
    .strict();
const validClass = (v: {
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
}) => validRange(v) && (!v.startTime || !v.endTime || v.endTime > v.startTime);
export const ClassRequest = classFields.refine(validClass, "Invalid class date/time range");
export type ClassRequest = z.infer<typeof ClassRequest>;
// A coach is required on every update, including repair of a legacy unassigned class.
export const ClassUpdateRequest = partialWithoutDefaults(classFields).extend({ coachId: id })
    .strict()
    .refine(validClass, "Invalid class date/time range");
export type ClassUpdateRequest = z.infer<typeof ClassUpdateRequest>;
export const ClassListQuery = PaginationQuery.merge(BranchQuery)
    .extend({
    coachId: queryId.optional(),
    planId: queryId.optional(),
    activeOn: dateOnly.optional(),
})
    .strict();
export type ClassListQuery = z.infer<typeof ClassListQuery>;
export const ScheduleQuery = BranchQuery.extend({
    from: dateOnly,
    to: dateOnly,
    coachId: queryId.optional(),
    planId: queryId.optional(),
}).strict();
export type ScheduleQuery = z.infer<typeof ScheduleQuery>;
export const ClassResponse = classFields
    .omit({ coachId: true, branchId: true })
    .extend({
    id,
    capacity: z.number().int(),
    bookedCount: z.number().int().nonnegative().optional(),
    seatsLeft: z.number().int().nonnegative().optional(),
    nextOccurrenceDate: dateOnly.nullable().optional(),
    planIds: z.array(id),
    weekDays: z.array(weekday),
    coachId: id.nullable(),
    branchId: id.nullable(),
    coach: z.object({ id, fullName: z.string() }).nullable(),
    branch: BranchSummary.nullable(),
    createdAt: timestamp,
    updatedAt: timestamp,
});
export const ClassListResponse = pageResponse(ClassResponse);
export const ClassOccurrence = ClassResponse.extend({
    date: dateOnly,
    startsAt: timestamp,
    endsAt: timestamp,
});
export const ScheduleResponse = z.array(ClassOccurrence);
export const CoachScheduleResponse = z.object({
    classes: ScheduleResponse,
    ptBookings: z.array(z.object({
        id,
        memberId: id,
        coachId: id,
        sessionDate: dateOnly,
        startTime: localTime,
        endTime: localTime,
        status: z.string(),
        memberName: z.string(),
    })),
});
export const ExerciseRequest = z
    .object({
    name,
    videoUrl: z
        .string()
        .url()
        .max(2048)
        .refine((v) => /^https?:\/\//.test(v), "Expected HTTP(S) URL")
        .nullable()
        .optional(),
})
    .strict();
export type ExerciseRequest = z.infer<typeof ExerciseRequest>;
export const ExerciseUpdateRequest = partialWithoutDefaults(ExerciseRequest).strict();
export type ExerciseUpdateRequest = z.infer<typeof ExerciseUpdateRequest>;
export const ExerciseResponse = z.object({
    id,
    name,
    videoUrl: z.string().nullable(),
    createdAt: timestamp,
    updatedAt: timestamp,
});
export const ExerciseListResponse = pageResponse(ExerciseResponse);
export const WorkoutItemRequest = z
    .object({
    exerciseId: id,
    sets: z.number().int().min(1).max(2147483647),
    reps: z.number().int().min(1).max(2147483647),
    weightKg: decimal2.nullable().optional(),
    dayOfWeek: weekday.nullable().optional(),
    order: z.number().int().min(0).max(2147483647),
})
    .strict();
export const WorkoutRequest = z
    .object({ name, items: z.array(WorkoutItemRequest).min(1).max(200) })
    .strict();
export type WorkoutRequest = z.infer<typeof WorkoutRequest>;
export const WorkoutUpdateRequest = partialWithoutDefaults(WorkoutRequest).strict();
export type WorkoutUpdateRequest = z.infer<typeof WorkoutUpdateRequest>;
export const WorkoutResponse = z.object({
    id,
    name,
    createdById: id,
    createdAt: timestamp,
    updatedAt: timestamp,
    items: z.array(WorkoutItemRequest.extend({
        id,
        weightKg: decimal2Response.nullable(),
        dayOfWeek: weekday.nullable(),
        exercise: ExerciseResponse,
    })),
});
export const WorkoutListResponse = pageResponse(WorkoutResponse);
export const AssignmentRequest = z
    .object({
    workoutPlanId: id,
    startDate: dateOnly,
    endDate: dateOnly.nullable().optional(),
})
    .strict()
    .refine(validRange, "Invalid date range");
export type AssignmentRequest = z.infer<typeof AssignmentRequest>;
export const AssignmentResponse = z.object({
    id,
    memberId: id,
    workoutPlanId: id,
    assignedById: id,
    startDate: dateOnly.nullable(),
    endDate: dateOnly.nullable(),
    createdAt: timestamp,
    updatedAt: timestamp,
    workoutPlan: WorkoutResponse,
});
export const AssignmentListResponse = z.array(AssignmentResponse);
export const MealRequest = z
    .object({
    name,
    time: localTime.nullable().optional(),
    dayOfWeek: weekday.nullable().optional(),
    notes: text.nullable().optional(),
    order: z.number().int().min(0).max(2147483647),
    items: z
        .array(z.object({ food: name, quantity: name }).strict())
        .min(1)
        .max(100),
})
    .strict();
const nutritionFields = z
    .object({
    name,
    memberId: id,
    startDate: dateOnly.nullable().optional(),
    endDate: dateOnly.nullable().optional(),
    meals: z.array(MealRequest).min(1).max(100),
})
    .strict();
export const NutritionRequest = nutritionFields.refine(validRange, "Invalid date range");
export type NutritionRequest = z.infer<typeof NutritionRequest>;
export const NutritionUpdateRequest = partialWithoutDefaults(nutritionFields).strict()
    .refine(validRange, "Invalid date range");
export type NutritionUpdateRequest = z.infer<typeof NutritionUpdateRequest>;
export const NutritionListQuery = PaginationQuery.extend({
    memberId: queryId.optional(),
}).strict();
export type NutritionListQuery = z.infer<typeof NutritionListQuery>;
export const NutritionResponse = nutritionFields.extend({
    id,
    createdById: id,
    startDate: dateOnly.nullable(),
    endDate: dateOnly.nullable(),
    createdAt: timestamp,
    updatedAt: timestamp,
    meals: z.array(MealRequest.extend({
        id,
        time: z.string().nullable(),
        dayOfWeek: weekday.nullable(),
        notes: z.string().nullable(),
        items: z.array(z.object({ id, food: z.string(), quantity: z.string() })),
    })),
});
export const NutritionListResponse = pageResponse(NutritionResponse);
export const ActiveNutritionResponse = z.array(NutritionResponse);
export const measurementFields = [
    "weight",
    "height",
    "bodyFatPct",
    "muscleMass",
    "chest",
    "waist",
    "hips",
    "arm",
    "thigh",
    "calf",
    "glutes",
    "leg",
] as const;
const measurements = z.object({
    weight: decimal2.nullable().optional(),
    height: decimal2.nullable().optional(),
    bodyFatPct: decimal2.nullable().optional(),
    muscleMass: decimal2.nullable().optional(),
    chest: decimal2.nullable().optional(),
    waist: decimal2.nullable().optional(),
    hips: decimal2.nullable().optional(),
    arm: decimal2.nullable().optional(),
    thigh: decimal2.nullable().optional(),
    calf: decimal2.nullable().optional(),
    glutes: decimal2.nullable().optional(),
    leg: decimal2.nullable().optional(),
});
const measurementInput = measurements.extend({ measuredOn: dateOnly }).strict();
export const MeasurementRequest = measurementInput.refine((v) => measurementFields.some((k) => v[k] != null), "At least one measurement is required");
export type MeasurementRequest = z.infer<typeof MeasurementRequest>;
export const MeasurementUpdateRequest = partialWithoutDefaults(measurementInput).strict();
export type MeasurementUpdateRequest = z.infer<typeof MeasurementUpdateRequest>;
const values = z.object(Object.fromEntries(measurementFields.map((k) => [k, decimal2Response.nullable()])) as Record<(typeof measurementFields)[number], z.ZodNullable<typeof decimal2Response>>);
const diffValues = z.object(Object.fromEntries(measurementFields.map((k) => [
    k,
    z
        .string()
        .regex(/^-?\d+\.\d{2}$/)
        .nullable(),
])) as Record<(typeof measurementFields)[number], z.ZodNullable<z.ZodString>>);
export const MeasurementResponse = values.extend({
    id,
    memberId: id,
    measuredOn: dateOnly,
    createdById: id,
    createdAt: timestamp,
    updatedAt: timestamp,
});
export const MeasurementHistoryResponse = z.array(MeasurementResponse.extend({ diff: diffValues }));
export const ClassAttendanceSummaryResponse = z.object({
    date: dateOnly,
    count: z.number().int().nonnegative(),
    capacity: z.number().int(),
});
