// Generated from the backend by npm run sync:contracts; see docs/contracts-source.json.
import { partialWithoutDefaults } from "../compat";
import { z } from "zod";
import { id, money, moneyResponse, name, pageResponse, PaginationQuery, queryBoolean, text, timestamp, } from "./common";
import { PlanCategoryResponse } from "./plan-categories";
export const PlanScope = z.enum(["GYM", "PT", "BUNDLE"]);
export type PlanScope = z.infer<typeof PlanScope>;
const fields = z
    .object({
    signupFee: money.optional(),
    ptValidityDays: z.number().int().min(1).max(3650).nullable().optional(),
    gymAccessDays: z.number().int().min(1).max(3650).nullable().optional(),
    defaultCoachId: id.nullable().optional(),
    memberLimit: z.number().int().positive().nullable().optional(),
    classLimit: z.number().int().positive().nullable().optional(),
    taxIds: z.array(id).max(20).optional(),
    name,
    categoryId: id,
    price: money,
    durationDays: z.number().int().min(1).max(3650),
    scope: PlanScope,
    ptSessions: z.number().int().min(0).max(2147483647).optional(),
    ptUnlimited: z.boolean().prefault(false),
    gymSessionMinutes: z.number().int().min(15).max(240).nullable().optional(),
    ptSessionMinutes: z.number().int().min(15).max(240).nullable().optional(),
    description: text.nullable().optional(),
    isActive: z.boolean().prefault(true),
})
    .strict();
export const PlanRequest = fields
    .superRefine((value, ctx) => {
    if (value.scope !== "GYM" && !value.ptUnlimited && !(value.ptSessions && value.ptSessions >= 1)) {
        ctx.addIssue({
            code: "custom",
            path: ["ptSessions"],
            message: "PT and BUNDLE plans require at least one session",
        });
    }
})
    .transform((value) => ({
    ...value,
    ptSessions: value.scope === "GYM" || value.ptUnlimited ? 0 : value.ptSessions!,
    ptUnlimited: value.scope === "GYM" ? false : value.ptUnlimited,
}));
export type PlanRequest = z.infer<typeof PlanRequest>;
export const PlanUpdateRequest = partialWithoutDefaults(fields).strict();
export type PlanUpdateRequest = z.infer<typeof PlanUpdateRequest>;
export const PlanListQuery = PaginationQuery.extend({
    scope: PlanScope.optional(),
    categoryId: z.coerce.number().int().positive().max(2147483647).optional(),
    isActive: queryBoolean.optional(),
}).strict();
export type PlanListQuery = z.infer<typeof PlanListQuery>;
export const PlanResponse = z.object({
    photoUrl: z.string().nullable().optional(),
    signupFee: moneyResponse.optional(),
    ptValidityDays: z.number().int().nullable().optional(),
    gymAccessDays: z.number().int().nullable().optional(),
    defaultCoachId: id.nullable().optional(),
    memberLimit: z.number().int().nullable().optional(),
    classLimit: z.number().int().nullable().optional(),
    taxIds: z.array(id).nullable().optional(),
    id,
    name,
    categoryId: id,
    category: PlanCategoryResponse,
    price: moneyResponse,
    durationDays: z.number().int(),
    scope: PlanScope,
    ptSessions: z.number().int(),
    ptUnlimited: z.boolean().prefault(false),
    gymSessionMinutes: z.number().int().nullable().optional(),
    ptSessionMinutes: z.number().int().nullable().optional(),
    description: z.string().nullable(),
    isActive: z.boolean(),
    createdAt: timestamp,
    updatedAt: timestamp,
});
export type PlanResponse = z.infer<typeof PlanResponse>;
export const PlanListResponse = pageResponse(PlanResponse);
export type PlanListResponse = z.infer<typeof PlanListResponse>;
