import { z } from 'zod';
import { BranchQuery, BranchSummary, id, name, pageResponse, PaginationQuery, queryBoolean, Role, text, timestamp, UserIdentity } from './common';
export const StaffRole = Role.exclude(['MEMBER']);
export type StaffRole = z.infer<typeof StaffRole>;
const coachFields = z.object({
  fullName: name, availableForPt: z.boolean().default(true), specialty: name.nullable().optional(),
  yearsExperience: z.number().int().min(0).max(100).nullable().optional(), certifications: text.nullable().optional(),
  photoUrl: z.string().max(2048).refine(value => /^(?:\/[a-z0-9-]+)*\/files\/[a-f0-9-]+\.(jpg|png|webp)$/.test(value) || /^https?:\/\//.test(value), 'Expected an HTTP URL or uploaded photo path').nullable().optional(),
});
export const StaffRequest = UserIdentity.merge(coachFields.partial()).extend({ role: StaffRole, password: z.string().min(8).max(128) }).strict().superRefine((value, ctx) => {
  if (value.role === 'STAFF_MEMBER' && !value.fullName) ctx.addIssue({ code: 'custom', path: ['fullName'], message: 'Coaches require a full name' });
});
export type StaffRequest = z.infer<typeof StaffRequest>;
export const StaffUpdateRequest = UserIdentity.merge(coachFields.partial()).partial().extend({ role: StaffRole.optional(), isActive: z.boolean().optional() }).strict();
export type StaffUpdateRequest = z.infer<typeof StaffUpdateRequest>;
export const StaffListQuery = PaginationQuery.omit({ sort: true }).merge(BranchQuery).extend({
  role: StaffRole.optional(), isActive: queryBoolean.optional(), sort: z.enum(['username', '-username', 'createdAt', '-createdAt']).default('username'),
}).strict();
export type StaffListQuery = z.infer<typeof StaffListQuery>;
export const CoachProfileResponse = z.object({ fullName: z.string(), availableForPt: z.boolean(), specialty: z.string().nullable(), yearsExperience: z.number().int().nullable(), certifications: z.string().nullable(), photoUrl: z.string().nullable() });
export type CoachProfileResponse = z.infer<typeof CoachProfileResponse>;
export const StaffResponse = z.object({
  id, username: z.string(), mobile: z.string().nullable(), email: z.string().nullable(), role: StaffRole, isActive: z.boolean(),
  branchId: id.nullable(), branch: BranchSummary.nullable(), coachProfile: CoachProfileResponse.nullable(),
  lastLoginAt: timestamp.nullable(), createdAt: timestamp, updatedAt: timestamp,
});
export type StaffResponse = z.infer<typeof StaffResponse>;
export const StaffListResponse = pageResponse(StaffResponse);
export type StaffListResponse = z.infer<typeof StaffListResponse>;
export const CoachListQuery = BranchQuery.strict();
export type CoachListQuery = z.infer<typeof CoachListQuery>;
export const CoachResponse = z.object({ id, fullName: z.string(), availableForPt: z.boolean(), branch: BranchSummary.nullable() });
export type CoachResponse = z.infer<typeof CoachResponse>;
export const CoachListResponse = z.array(CoachResponse);
export type CoachListResponse = z.infer<typeof CoachListResponse>;
export const PhotoUploadRequest = z.object({ file: z.instanceof(Uint8Array).refine(value => value.byteLength <= 2 * 1024 * 1024, 'Image must be at most 2 MB').describe('JPEG, PNG or WebP image; at most 2 MB') }).strict();
export type PhotoUploadRequest = z.infer<typeof PhotoUploadRequest>;
export const PhotoUploadResponse = z.object({ photoUrl: z.string() });
export type PhotoUploadResponse = z.infer<typeof PhotoUploadResponse>;
