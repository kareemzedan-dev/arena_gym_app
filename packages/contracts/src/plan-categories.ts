// Generated from the backend by npm run sync:contracts; see docs/contracts-source.json.
import { partialWithoutDefaults } from "../compat";
import { z } from 'zod';
import { id, name, pageResponse, PaginationQuery, queryBoolean, timestamp } from './common';
export const PlanCategoryRequest = z.object({ name, isActive: z.boolean().prefault(true) }).strict();
export type PlanCategoryRequest = z.infer<typeof PlanCategoryRequest>;
export const PlanCategoryUpdateRequest = partialWithoutDefaults(PlanCategoryRequest).strict();
export type PlanCategoryUpdateRequest = z.infer<typeof PlanCategoryUpdateRequest>;
export const PlanCategoryListQuery = PaginationQuery.extend({ isActive: queryBoolean.optional() }).strict();
export type PlanCategoryListQuery = z.infer<typeof PlanCategoryListQuery>;
export const PlanCategoryResponse = z.object({ id, name, isActive: z.boolean(), createdAt: timestamp, updatedAt: timestamp });
export type PlanCategoryResponse = z.infer<typeof PlanCategoryResponse>;
export const PlanCategoryListResponse = pageResponse(PlanCategoryResponse);
export type PlanCategoryListResponse = z.infer<typeof PlanCategoryListResponse>;
