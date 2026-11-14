// Generated from the backend by npm run sync:contracts; see docs/contracts-source.json.
import { partialWithoutDefaults } from "../compat";
import { z } from 'zod';
import { BranchQuery, id, name, pageResponse, PaginationQuery, queryBoolean, timestamp } from './common';
export const BranchRequest = z.object({ name, isActive: z.boolean().prefault(true) }).strict();
export type BranchRequest = z.infer<typeof BranchRequest>;
export const BranchUpdateRequest = partialWithoutDefaults(BranchRequest).strict();
export type BranchUpdateRequest = z.infer<typeof BranchUpdateRequest>;
export const BranchListQuery = PaginationQuery.merge(BranchQuery).extend({ isActive: queryBoolean.optional() }).strict();
export type BranchListQuery = z.infer<typeof BranchListQuery>;
export const BranchResponse = z.object({ id, name, isActive: z.boolean(), createdAt: timestamp, updatedAt: timestamp });
export type BranchResponse = z.infer<typeof BranchResponse>;
export const BranchListResponse = pageResponse(BranchResponse);
export type BranchListResponse = z.infer<typeof BranchListResponse>;
export const ActiveBranchesResponse = z.array(BranchResponse);
export type ActiveBranchesResponse = z.infer<typeof ActiveBranchesResponse>;
