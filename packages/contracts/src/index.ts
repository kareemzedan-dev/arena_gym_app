// Generated from the backend by npm run sync:contracts; see docs/contracts-source.json.
import { z } from "zod";
import { Role } from "./common";
export * from "./common";
export * from "./branches";
export * from "./members";
export * from "./staff";
export * from "./plan-categories";
export * from "./plans";
export * from "./products";
export * from "./files";
export const LoginRequest = z
    .object({
    identifier: z.string().trim().min(1).max(191),
    // Preserve password bytes, including leading/trailing whitespace.
    password: z.string().min(1).max(4096),
})
    .strict();
export type LoginRequest = z.infer<typeof LoginRequest>;
export const RefreshRequest = z
    .object({ refreshToken: z.string().min(1).max(2048) })
    .strict();
export type RefreshRequest = z.infer<typeof RefreshRequest>;
export const TokenPair = z
    .object({ accessToken: z.string(), refreshToken: z.string() })
    .strict();
export type TokenPair = z.infer<typeof TokenPair>;
export const Me = z
    .object({
    id: z.number().int().positive(),
    username: z.string(),
    fullName: z.string().nullable(),
    mobile: z.string().nullable(),
    email: z.string().nullable(),
    role: Role,
    isActive: z.boolean(),
    branchId: z.number().int().positive().nullable(),
    lastLoginAt: z.string().datetime().nullable(),
})
    .strict();
export type Me = z.infer<typeof Me>;
export * from "./health";
export * from "./pos";
export * from "./invoices";
export * from "./payments";
export * from "./subscriptions";
export * from "./attendance";
export * from "./training";
export * from "./reports";
export * from "./self-service";
export const ChangePasswordRequest = z
    .object({
    currentPassword: z.string().min(1).max(4096),
    newPassword: z.string().min(8).max(128),
})
    .strict();
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequest>;
export * from "./sales-math";
export * from "./operations";
