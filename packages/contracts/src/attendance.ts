// Generated from the backend by npm run sync:contracts; see docs/contracts-source.json.
import { z } from 'zod';
import { BranchQuery, dateOnly, id, pageResponse, PaginationQuery, timestamp } from './common';
export const AttendanceType = z.enum(['GYM', 'PT', 'CLASS']);
export const AttendanceRequest = z.object({ memberId: id, attendedOn: dateOnly.optional(), type: AttendanceType, classId: id.optional(), subscriptionId: id.optional() }).strict().refine(value => value.type === 'CLASS' ? value.classId !== undefined : value.classId === undefined, 'classId is required only for CLASS attendance');
export type AttendanceRequest = z.infer<typeof AttendanceRequest>;
export const AttendanceListQuery = PaginationQuery.omit({ sort: true }).merge(BranchQuery).extend({ memberId: z.coerce.number().int().positive().max(2147483647).optional(), classId: z.coerce.number().int().positive().max(2147483647).optional(), type: AttendanceType.optional(), from: dateOnly.optional(), to: dateOnly.optional(), sort: z.enum(['attendedOn', '-attendedOn', 'createdAt', '-createdAt']).prefault('-attendedOn') }).strict();
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
export const CheckInTokenResponse = z.object({ token: z.string(), expiresAt: timestamp });
export type CheckInTokenResponse = z.infer<typeof CheckInTokenResponse>;
export const QrAttendanceRequest = z.object({ token: z.string().min(1).max(1024) }).strict();
export type QrAttendanceRequest = z.infer<typeof QrAttendanceRequest>;
export const QrAttendanceResponse = AttendanceResponse.extend({ memberName: z.string(), remainingSessions: z.number().int(), ptUnlimited: z.boolean().prefault(false) });
export type QrAttendanceResponse = z.infer<typeof QrAttendanceResponse>;
