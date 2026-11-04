import { z } from "zod";
import {
  BranchQuery,
  BranchSummary,
  dateOnly,
  id,
  moneyResponse,
  name,
  pageResponse,
  PaginationQuery,
  text,
  timestamp,
  UserIdentity,
} from "./common";
export const Gender = z.enum(["MALE", "FEMALE"]);
export type Gender = z.infer<typeof Gender>;
export const MemberStatus = z.enum(["ACTIVE", "INACTIVE"]);
export type MemberStatus = z.infer<typeof MemberStatus>;
const profile = z.object({
  fullName: name,
  gender: Gender.nullable().optional(),
  birthDate: dateOnly.nullable().optional(),
  address: text.nullable().optional(),
  healthNotes: text.nullable().optional(),
  notes: text.nullable().optional(),
  coachId: id.nullable().optional(),
});
export const MemberRequest = UserIdentity.merge(profile)
  .extend({ branchId: id, password: z.string().min(8).max(128) })
  .strict();
export type MemberRequest = z.infer<typeof MemberRequest>;
export const MemberUpdateRequest = MemberRequest.omit({ password: true })
  .partial()
  .extend({ isActive: z.boolean().optional() })
  .strict();
export type MemberUpdateRequest = z.infer<typeof MemberUpdateRequest>;
export const MemberListQuery = PaginationQuery.omit({ sort: true })
  .merge(BranchQuery)
  .extend({
    sort: z
      .enum(["fullName", "-fullName", "createdAt", "-createdAt"])
      .default("fullName"),
    coachId: z.coerce.number().int().positive().max(2_147_483_647).optional(),
    gender: Gender.optional(),
    status: MemberStatus.optional(),
  })
  .strict();
export type MemberListQuery = z.infer<typeof MemberListQuery>;
export const CurrentSubscriptionResponse = z.object({
  planName: z.string(),
  endDate: dateOnly,
});
export type CurrentSubscriptionResponse = z.infer<
  typeof CurrentSubscriptionResponse
>;
export const SubscriptionSummaryResponse = CurrentSubscriptionResponse.extend({
  id,
  planId: id,
  startDate: dateOnly,
  upcoming: z.boolean(),
  status: z.enum(["ACTIVE", "EXPIRED", "FROZEN", "CANCELLED"]),
  scope: z.enum(["GYM", "PT", "BUNDLE"]),
});
export type SubscriptionSummaryResponse = z.infer<
  typeof SubscriptionSummaryResponse
>;
export const MemberListItem = z.object({
  id,
  username: z.string(),
  fullName: z.string(),
  mobile: z.string().nullable(),
  gender: Gender.nullable(),
  branch: BranchSummary.nullable(),
  coach: z.object({ id, fullName: z.string() }).nullable(),
  status: MemberStatus,
  currentSubscription: CurrentSubscriptionResponse.nullable(),
});
export type MemberListItem = z.infer<typeof MemberListItem>;
export const MemberResponse = MemberListItem.extend({
  photoUrl: z.string().nullable().optional(),
  email: z.string().nullable(),
  role: z.literal("MEMBER"),
  isActive: z.boolean(),
  branchId: id.nullable(),
  coachId: id.nullable(),
  birthDate: dateOnly.nullable(),
  address: z.string().nullable(),
  healthNotes: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: timestamp,
  updatedAt: timestamp,
  lastLoginAt: timestamp.nullable(),
  currentSubscriptions: z.array(SubscriptionSummaryResponse),
  lastSubscription: SubscriptionSummaryResponse.nullable(),
  ptRemaining: z.number().int(),
  outstandingBalance: moneyResponse,
});
export type MemberResponse = z.infer<typeof MemberResponse>;
export const MemberListResponse = pageResponse(MemberListItem);
export type MemberListResponse = z.infer<typeof MemberListResponse>;
