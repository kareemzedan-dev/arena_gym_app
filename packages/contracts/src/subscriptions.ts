// Generated from the backend by npm run sync:contracts; see docs/contracts-source.json.
import { z } from "zod";
import { dateOnly, id, moneyResponse, text, timestamp } from "./common";
import { PlanScope } from "./plans";
export const SubscriptionStatus = z.enum([
    "ACTIVE",
    "EXPIRED",
    "FROZEN",
    "CANCELLED",
]);
export const SubscriptionUpdateRequest = z
    .object({
    startDate: dateOnly.optional(),
    endDate: dateOnly.optional(),
    status: SubscriptionStatus.exclude(["EXPIRED"]).optional(),
    notes: text.nullable().optional(),
})
    .strict();
export type SubscriptionUpdateRequest = z.infer<typeof SubscriptionUpdateRequest>;
export const PtAdjustmentRequest = z
    .object({
    delta: z
        .number()
        .int()
        .min(-2147483647)
        .max(2147483647)
        .refine((value) => value !== 0, "Delta must be non-zero"),
    note: text.trim().min(1),
})
    .strict();
export type PtAdjustmentRequest = z.infer<typeof PtAdjustmentRequest>;
export const SubscriptionResponse = z.object({
    id,
    ptEndDate: dateOnly.nullable().optional(),
    gymEndDate: dateOnly.nullable().optional(),
    memberId: id,
    planId: id,
    planName: z.string(),
    scope: PlanScope,
    invoiceId: id.nullable(),
    startDate: dateOnly,
    endDate: dateOnly,
    status: SubscriptionStatus,
    upcoming: z.boolean(),
    ptSessionsTotal: z.number().int(),
    ptUsed: z.number().int(),
    ptRemaining: z.number().int(),
    priceAtSale: moneyResponse,
    discount: moneyResponse,
    notes: z.string().nullable(),
    createdAt: timestamp,
    updatedAt: timestamp,
});
export type SubscriptionResponse = z.infer<typeof SubscriptionResponse>;
export const SubscriptionListResponse = z.array(SubscriptionResponse);
export const PtSummaryResponse = z.object({
    used: z.number().int(),
    remaining: z.number().int(),
});
export type SubscriptionStatus = z.infer<typeof SubscriptionStatus>;
export type SubscriptionListResponse = z.infer<typeof SubscriptionListResponse>;
export type PtSummaryResponse = z.infer<typeof PtSummaryResponse>;
