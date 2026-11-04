// Generated from the backend by npm run sync:contracts; see docs/contracts-source.json.
import { z } from "zod";
import { dateOnly, id, money, moneyResponse, name, pageResponse, PaginationQuery, text, timestamp, } from "./common";
import { PaymentMethod } from "./payments";
import { localTime } from "./training";
const times = <T extends {
    startTime: string;
    endTime: string;
}>(v: T) => v.endTime > v.startTime;
export const PtStatus = z.enum([
    "SCHEDULED",
    "COMPLETED",
    "NO_SHOW",
    "CANCELLED",
]);
export const PtAvailabilityRequest = z
    .object({
    coachId: id,
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: localTime,
    endTime: localTime,
    slotMinutes: z.number().int().min(15).max(240).prefault(60),
    isActive: z.boolean().prefault(true),
})
    .strict()
    .refine(times, {
    path: ["endTime"],
    message: "End time must follow start time",
});
export type PtAvailabilityRequest = z.infer<typeof PtAvailabilityRequest>;
export const PtBookingRequest = z
    .object({
    memberId: id,
    coachId: id,
    subscriptionId: id,
    sessionDate: dateOnly,
    startTime: localTime,
    endTime: localTime,
    notes: text.nullable().optional(),
})
    .strict()
    .refine(times, {
    path: ["endTime"],
    message: "End time must follow start time",
});
export type PtBookingRequest = z.infer<typeof PtBookingRequest>;
export const PtTransitionRequest = z
    .object({
    status: PtStatus.exclude(["SCHEDULED"]),
    debitNoShow: z.boolean().prefault(false),
    sessionNotes: text.nullable().optional(),
})
    .strict();
export type PtTransitionRequest = z.infer<typeof PtTransitionRequest>;
export const OperationsQuery = PaginationQuery.extend({
    sort: z
        .enum(["name", "-name", "createdAt", "-createdAt", "date", "-date"]).prefault("-createdAt"),
    classId: z.coerce.number().int().positive().optional(),
    branchId: z.coerce.number().int().positive().optional(),
    memberId: z.coerce.number().int().positive().optional(),
    coachId: z.coerce.number().int().positive().optional(),
    status: z.string().max(32).optional(),
    from: dateOnly.optional(),
    to: dateOnly.optional(),
})
    .strict()
    .refine((v) => !v.from || !v.to || v.from <= v.to, {
    path: ["to"],
    message: "End date must follow start date",
});
export type OperationsQuery = z.infer<typeof OperationsQuery>;
const identity = z.object({ id, name: z.string() });
export const PtBookingResponse = z.object({
    id,
    memberId: id,
    coachId: id,
    subscriptionId: id,
    branchId: id.nullable(),
    sessionDate: dateOnly,
    startTime: localTime,
    endTime: localTime,
    status: PtStatus,
    notes: z.string().nullable(),
    sessionNotes: z.string().nullable(),
    member: identity,
    coach: identity,
    planName: z.string(),
    sessionsRemaining: z.number().int(),
    createdAt: timestamp,
    updatedAt: timestamp,
});
export type PtBookingResponse = z.infer<typeof PtBookingResponse>;
export const PtBookingListResponse = pageResponse(PtBookingResponse);
export const PtAvailabilityResponse = z.object({
    id,
    coachId: id,
    dayOfWeek: z.number().int(),
    startTime: localTime,
    endTime: localTime,
    slotMinutes: z.number().int(),
    isActive: z.boolean(),
    coachName: z.string(),
    createdAt: timestamp,
    updatedAt: timestamp,
});
export const PtAvailabilityListResponse = pageResponse(PtAvailabilityResponse);
export const PtSlotQuery = z
    .object({ coachId: z.coerce.number().int().positive(), date: dateOnly })
    .strict();
export const PtSlotsResponse = z.array(z.object({ startTime: localTime, endTime: localTime }));
export const CouponRequest = z
    .object({
    code: z
        .string()
        .trim()
        .min(2)
        .max(60)
        .regex(/^[A-Za-z0-9_-]+$/)
        .transform((v) => v.toUpperCase()),
    name,
    discountType: z.enum(["FIXED", "PERCENT"]),
    value: money,
    startDate: dateOnly,
    endDate: dateOnly,
    memberId: id.nullable().prefault(null),
    planId: id.nullable().prefault(null),
    maxUses: z.number().int().positive().nullable().prefault(null),
    perMemberLimit: z.number().int().positive().nullable().prefault(null),
    isActive: z.boolean().prefault(true),
})
    .strict()
    .refine((v) => v.endDate >= v.startDate, {
    path: ["endDate"],
    message: "End date must follow start date",
})
    .refine((v) => Number(v.value) > 0 &&
    (v.discountType !== "PERCENT" || Number(v.value) <= 100), { path: ["value"], message: "Invalid discount" });
export type CouponRequest = z.infer<typeof CouponRequest>;
export const CouponResponse = z.object(z.object(CouponRequest.shape).shape).extend({
    id,
    used: z.number().int(),
    createdAt: timestamp,
    updatedAt: timestamp,
})
    .strip();
export const CouponListResponse = pageResponse(CouponResponse);
export const CashEntryRequest = z
    .object({
    kind: z.enum(["INCOME", "EXPENSE"]),
    title: name,
    category: name,
    amount: money.refine((v) => Number(v) > 0, "Amount must be positive"),
    occurredOn: dateOnly,
    method: PaymentMethod,
    branchId: id.nullable().prefault(null),
    notes: text.nullable().optional(),
})
    .strict();
export type CashEntryRequest = z.infer<typeof CashEntryRequest>;
export const CashEntryResponse = CashEntryRequest.extend({
    id,
    amount: moneyResponse,
    createdAt: timestamp,
    updatedAt: timestamp,
}).strip();
export const CashEntryListResponse = pageResponse(CashEntryResponse);
export const ProfitResponse = z.object({
    collected: moneyResponse,
    otherIncome: moneyResponse,
    expenses: moneyResponse,
    netCash: z.string(),
    byCategory: z.array(z.object({ kind: z.string(), category: z.string(), amount: moneyResponse })),
});
export const StockAdjustmentRequest = z
    .object({
    productId: id,
    delta: z
        .number()
        .int()
        .min(-1000000)
        .max(1000000)
        .refine((v) => v !== 0),
    note: z.string().trim().min(1).max(2000),
})
    .strict();
export type StockAdjustmentRequest = z.infer<typeof StockAdjustmentRequest>;
export const StockMovementResponse = z.object({
    id,
    productId: id,
    invoiceId: id.nullable(),
    productName: z.string(),
    delta: z.number().int(),
    reason: z.string(),
    note: z.string().nullable(),
    createdAt: timestamp,
});
export const StockMovementListResponse = pageResponse(StockMovementResponse);
// Form descriptions and API validation share one definition. Values are checked
// by the API again; no arbitrary JSON or unrecognised fields are persisted.
export const OperationKind = z.enum([
    "class-bookings",
    "groups",
    "notices",
    "messages",
    "leads",
    "reservations",
    "places",
    "taxes",
    "virtual-classes",
    "workout-logs",
    "email-templates",
    "newsletters",
    "general-settings",
    "access-rules",
]);
export type OperationKind = z.infer<typeof OperationKind>;
export type OperationField = {
    key: string;
    label: string;
    type: "text" | "textarea" | "date" | "time" | "number" | "exercise" | "member" | "members" | "coach" | "class" | "branch" | "select" | "boolean" | "email" | "url";
    required?: boolean;
    options?: string[];
    min?: number;
    max?: number;
};
export const operationFields: Record<OperationKind, OperationField[]> = {
    "class-bookings": [
        { key: "classId", label: "class", type: "class", required: true },
        { key: "date", label: "date", type: "date", required: true },
        { key: "memberId", label: "member", type: "member" },
        { key: "guestName", label: "guestName", type: "text" },
        { key: "guestMobile", label: "mobile", type: "text" },
        { key: "guestEmail", label: "email", type: "email" },
        { key: "notes", label: "notes", type: "textarea" },
    ],
    groups: [
        { key: "description", label: "description", type: "textarea" },
        { key: "memberIds", label: "members", type: "members" },
    ],
    notices: [
        { key: "body", label: "messageBody", type: "textarea", required: true },
        {
            key: "audience",
            label: "audience",
            type: "select",
            options: ["ALL", "MEMBER", "STAFF_MEMBER", "MANAGEMENT"],
            required: true,
        },
        { key: "classId", label: "class", type: "class" },
        { key: "from", label: "from", type: "date", required: true },
        { key: "to", label: "to", type: "date", required: true },
    ],
    messages: [
        {
            key: "recipientIds",
            label: "recipients",
            type: "members",
            required: true,
        },
        { key: "body", label: "messageBody", type: "textarea", required: true },
    ],
    leads: [
        { key: "mobile", label: "mobile", type: "text", required: true },
        { key: "email", label: "email", type: "email" },
        { key: "source", label: "leadSource", type: "text" },
        { key: "followUpOn", label: "followUpOn", type: "date" },
        { key: "notes", label: "notes", type: "textarea" },
    ],
    reservations: [
        { key: "place", label: "place", type: "text", required: true },
        { key: "coachId", label: "coach", type: "coach", required: true },
        { key: "date", label: "date", type: "date", required: true },
        { key: "startTime", label: "startTime", type: "time", required: true },
        { key: "endTime", label: "endTime", type: "time", required: true },
        { key: "notes", label: "notes", type: "textarea" },
    ],
    places: [
        { key: "description", label: "description", type: "textarea" },
        {
            key: "capacity",
            label: "capacity",
            type: "number",
            required: true,
            min: 1,
            max: 10000,
        },
    ],
    taxes: [
        {
            key: "rate",
            label: "taxRate",
            type: "number",
            required: true,
            min: 0,
            max: 100,
        },
        { key: "description", label: "description", type: "textarea" },
    ],
    "virtual-classes": [
        { key: "classId", label: "class", type: "class", required: true },
        { key: "meetingUrl", label: "meetingUrl", type: "url", required: true },
        { key: "date", label: "date", type: "date", required: true },
        { key: "startTime", label: "startTime", type: "time", required: true },
        { key: "endTime", label: "endTime", type: "time", required: true },
        { key: "notes", label: "notes", type: "textarea" },
    ],
    "workout-logs": [
        { key: "memberId", label: "member", type: "member", required: true },
        { key: "date", label: "date", type: "date", required: true },
        {
            key: "exerciseId",
            label: "exercise",
            type: "exercise",
            required: true,
            min: 1,
            max: 2147483647,
        },
        {
            key: "sets",
            label: "sets",
            type: "number",
            required: true,
            min: 1,
            max: 1000,
        },
        {
            key: "reps",
            label: "reps",
            type: "number",
            required: true,
            min: 1,
            max: 10000,
        },
        { key: "weightKg", label: "weightKg", type: "number", min: 0, max: 9999 },
        { key: "notes", label: "notes", type: "textarea" },
    ],
    "email-templates": [
        {
            key: "event",
            label: "event",
            type: "select",
            options: [
                "WELCOME",
                "INVOICE",
                "RENEWAL",
                "EXPIRY",
                "RESERVATION",
                "NOTICE",
            ],
            required: true,
        },
        { key: "subject", label: "subject", type: "text", required: true },
        { key: "body", label: "messageBody", type: "textarea", required: true },
    ],
    newsletters: [
        {
            key: "recipientIds",
            label: "recipients",
            type: "members",
            required: true,
        },
        { key: "body", label: "messageBody", type: "textarea", required: true },
    ],
    "general-settings": [
        { key: "address", label: "address", type: "textarea" },
        { key: "mobile", label: "mobile", type: "text" },
        { key: "email", label: "email", type: "email" },
        { key: "invoiceFooter", label: "invoiceFooter", type: "textarea" },
    ],
    "access-rules": [
        {
            key: "role",
            label: "role",
            type: "select",
            options: [
                "GYM_OWNER",
                "MANAGEMENT",
                "ACCOUNTANT",
                "STAFF_MEMBER",
                "MEMBER",
            ],
            required: true,
        },
        {
            key: "resource",
            label: "resource",
            type: "select",
            options: [
                "members",
                "staff",
                "classes",
                "pt",
                "pos",
                "invoices",
                "payments",
                "attendance",
                "workout-plans",
                "nutrition-plans",
                "measurements",
                "reports",
                "operations",
                "finance-operations",
            ],
            required: true,
        },
        { key: "read", label: "allowRead", type: "boolean" },
        { key: "write", label: "allowWrite", type: "boolean" },
    ],
};
export function operationDataSchema(kind: OperationKind) {
    const fields: Record<string, z.ZodTypeAny> = {};
    for (const f of operationFields[kind]) {
        let schema: z.ZodTypeAny = f.type === "date"
            ? dateOnly
            : f.type === "time"
                ? localTime
                : ["member", "coach", "class", "exercise"].includes(f.type)
                    ? id
                    : f.type === "members"
                        ? z
                            .array(id)
                            .max(1000)
                            .refine((v) => new Set(v).size === v.length)
                        : f.type === "number"
                            ? z
                                .number()
                                .finite()
                                .min(f.min ?? 0)
                                .max(f.max ?? 1000000)
                            : f.type === "boolean"
                                ? z.boolean()
                                : f.type === "select"
                                    ? z.enum(f.options as [
                                        string,
                                        ...string[]
                                    ])
                                    : f.type === "email"
                                        ? z.string().email().max(254)
                                        : f.type === "url"
                                            ? z
                                                .string()
                                                .url()
                                                .max(2048)
                                                .refine((v) => /^https:\/\//.test(v))
                                            : z
                                                .string()
                                                .trim()
                                                .min(1)
                                                .max(f.type === "textarea" ? 16000 : 191);
        if (f.type === "number" && f.key !== "rate" && f.key !== "weightKg")
            schema = (schema as z.ZodNumber).int();
        if (f.type === "members" && f.required)
            schema = (schema as z.ZodArray<typeof id>).refine((v) => v.length > 0);
        fields[f.key] = f.required ? schema : schema.nullable().optional();
    }
    return z
        .object(fields)
        .strict()
        .superRefine((v, ctx) => {
        if (kind === "class-bookings" &&
            !v.memberId &&
            (!v.guestName || !v.guestMobile))
            ctx.addIssue({
                code: "custom",
                path: ["guestName"],
                message: "Choose a member or enter guest name and mobile",
            });
        if (v.from && v.to && v.to < v.from)
            ctx.addIssue({
                code: "custom",
                path: ["to"],
                message: "End date must follow start date",
            });
        if (v.startTime && v.endTime && v.endTime <= v.startTime)
            ctx.addIssue({
                code: "custom",
                path: ["endTime"],
                message: "End time must follow start time",
            });
    });
}
export const OperationRequest = z
    .object({
    title: name,
    status: z
        .enum([
        "ACTIVE",
        "INACTIVE",
        "DRAFT",
        "OPEN",
        "CONTACTED",
        "CONVERTED",
        "CLOSED",
        "CANCELLED",
        "SENT",
    ]).prefault("ACTIVE"),
    branchId: id.nullable().prefault(null),
    data: z.record(z.string(), z.unknown()),
})
    .strict();
export type OperationRequest = z.infer<typeof OperationRequest>;
export const OperationResponse = OperationRequest.extend({
    id,
    memberId: id.nullable(),
    references: z.record(z.string(), z.string()).optional(),
    kind: OperationKind,
    createdById: id,
    createdAt: timestamp,
    updatedAt: timestamp,
}).strip();
export type OperationResponse = z.infer<typeof OperationResponse>;
export const OperationListResponse = pageResponse(OperationResponse);
export const DirectoryPerson = z.object({
    id,
    name: z.string(),
    mobile: z.string().nullable(),
    role: z.string(),
});
export const DirectoryResponse = pageResponse(DirectoryPerson);
export const AuditResponse = z.object({
    id,
    actorId: id.nullable(),
    actorName: z.string(),
    action: z.string(),
    entity: z.string(),
    entityId: z.number().int(),
    before: z.unknown(),
    after: z.unknown(),
    createdAt: timestamp,
});
export const AuditListResponse = pageResponse(AuditResponse);
export const IntegrationStatusResponse = z.array(z.object({
    provider: z.enum(["EMAIL", "SMS", "WHATSAPP", "ZOOM"]),
    configured: z.boolean(),
    enabled: z.boolean(),
}));
export const OperationalReportKind = z.enum([
    "attendance",
    "pt-utilization",
    "product-sales",
    "daily-sales",
    "user-log",
]);
export const OperationalReportResponse = z.object({
    headers: z.array(z.string()),
    items: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.null()]))),
    total: z.number().int(),
    page: z.number().int(),
    pageSize: z.number().int(),
});
export const MemberImportResult = z.object({
    results: z.array(z.object({
        row: z.number().int(),
        id: id.optional(),
        error: z.enum(["CONFLICT", "INVALID_REFERENCE", "FAILED"]).optional(),
    })),
});
