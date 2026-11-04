// Generated from the backend by npm run sync:contracts; see docs/contracts-source.json.
import { z } from 'zod';
export const Role = z.enum(['ADMINISTRATOR', 'GYM_OWNER', 'MANAGEMENT', 'ACCOUNTANT', 'STAFF_MEMBER', 'MEMBER']);
export type Role = z.infer<typeof Role>;
export const ADMINS = ['ADMINISTRATOR', 'GYM_OWNER', 'MANAGEMENT'] as const satisfies readonly Role[];
export const FINANCE = [...ADMINS, 'ACCOUNTANT'] as const;
export const COACHES = ['STAFF_MEMBER'] as const;
export const MEMBER_READERS = [...FINANCE, ...COACHES] as const;
export const id = z.number().int().positive().max(2147483647);
export const IdParams = z.object({ id: z.coerce.number().int().positive().max(2147483647) }).strict();
export type IdParams = z.infer<typeof IdParams>;
export const name = z.string().trim().min(1).max(191);
export const text = z.string().max(65535);
export const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, 'Invalid calendar date');
export const timestamp = z.string().datetime();
// Validate the decimal text, without rounding or floating-point multiplication.
export const money = z.union([z.string(), z.number().finite()]).transform(String).refine(value => {
    if (!/^\d+(\.\d{1,3})?$/.test(value))
        return false;
    return (value.split('.')[0]!.replace(/^0+/, '') || '0').length <= 9;
}, 'Expected money between 0 and 999999999.999 with at most 3 decimal places');
export type Money = z.infer<typeof money>;
export const moneyResponse = z.string().regex(/^\d+\.\d{3}$/);
export const queryBoolean = z.enum(['true', 'false']).transform(value => value === 'true');
export const PaginationQuery = z.object({
    page: z.coerce.number().int().min(1).max(2147483647).prefault(1),
    pageSize: z.coerce.number().int().min(1).max(100).prefault(20),
    search: z.string().trim().max(191).optional(),
    sort: z.enum(['name', '-name', 'createdAt', '-createdAt']).prefault('name'),
}).strict();
export type PaginationQuery = z.infer<typeof PaginationQuery>;
export const BranchQuery = z.object({ branchId: z.coerce.number().int().positive().max(2147483647).optional() });
export const pageResponse = <T extends z.ZodTypeAny>(item: T) => z.object({
    items: z.array(item), total: z.number().int().nonnegative(), page: z.number().int().positive(), pageSize: z.number().int().min(1).max(100),
});
export const ActiveRequest = z.object({ isActive: z.boolean() }).strict();
export type ActiveRequest = z.infer<typeof ActiveRequest>;
export const ResetPasswordRequest = z.object({ password: z.string().min(8).max(128) }).strict();
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequest>;
export const EmptyRequest = z.object({}).strict().prefault({});
export type EmptyRequest = z.infer<typeof EmptyRequest>;
export const NoContentResponse = z.undefined();
export type NoContentResponse = z.infer<typeof NoContentResponse>;
export const ValidationErrorResponse = z.object({
    statusCode: z.literal(400), message: z.literal('Validation failed'),
    errors: z.array(z.object({ path: z.string(), message: z.string() })),
});
export type ValidationErrorResponse = z.infer<typeof ValidationErrorResponse>;
export const ConflictResponse = z.object({ statusCode: z.literal(409), code: z.enum(['CONFLICT', 'IN_USE']), fields: z.array(z.string()).optional() });
export type ConflictResponse = z.infer<typeof ConflictResponse>;
export const BranchSummary = z.object({ id, name });
export const UserIdentity = z.object({
    username: z.string().min(3).max(60).regex(/^[A-Za-z0-9._@-]+$/),
    mobile: z.string().trim().min(1).max(32).nullable().optional(),
    email: z.string().trim().email().max(254).nullable().optional(),
    branchId: id.nullable().optional(),
});
export const ApiFailureResponse = z.object({ code: z.string().optional() });
