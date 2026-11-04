import { z } from 'zod';
import { BranchQuery, dateOnly, id, pageResponse, PaginationQuery, timestamp } from './common';
export const AttendanceType = z.enum(['GYM', 'PT', 'CLASS']);
export const AttendanceRequest = z.object({ memberId: id, attendedOn: dateOnly.optional(), type: AttendanceType, classId: id.optional(), subscriptionId: id.optional() }).strict().refine(value => value.type === 'CLASS' ? value.classId !== undefined : value.classId === undefined, 'classId is required only for CLASS attendance');
export type AttendanceRequest = z.infer<typeof AttendanceRequest>;
export const AttendanceListQuery = PaginationQuery.omit({ sort: true }).merge(BranchQuery).extend({ memberId: z.coerce.number().int().positive().max(2_147_483_647).optional(), classId: z.coerce.number().int().positive().max(2_147_483_647).optional(), type: AttendanceType.optional(), from: dateOnly.optional(), to: dateOnly.optional(), sort: z.enum(['attendedOn', '-attendedOn', 'createdAt', '-createdAt']).default('-attendedOn') }).strict();
export type AttendanceListQuery = z.infer<typeof AttendanceListQuery>;
export const AttendanceResponse = z.object({ id, memberId: id, subscriptionId: id.nullable(), classId: id.nullable(), attendedOn: dateOnly, takenById: id, type: AttendanceType, createdAt: timestamp, updatedAt: timestamp });
export const AttendanceListItem = AttendanceResponse.extend({
  member: z.object({ id, fullName: z.string(), username: z.string() }).optional(),
  gymClass: z.object({ id, name: z.string() }).nullable().optional(),
  subscription: z.object({ id, planName: z.string() }).nullable().optional(),
});
export type AttendanceListItem = z.infer<typeof AttendanceListItem>;
export const AttendanceListResponse = pageResponse(AttendanceListItem);
export type AttendanceType = z.infer<typeof AttendanceType>;
export type AttendanceResponse = z.infer<typeof AttendanceResponse>;
export type AttendanceListResponse = z.infer<typeof AttendanceListResponse>;
