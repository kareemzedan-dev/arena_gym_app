// Generated from the backend by npm run sync:contracts; see docs/contracts-source.json.
import { partialWithoutDefaults } from "../compat";
import { z } from "zod";
import { id, money, moneyResponse, name, pageResponse, PaginationQuery, queryBoolean, timestamp, dateOnly, text, } from "./common";
export const ProductRequest = z
    .object({
    description: text.nullable().optional(),
    category: name.nullable().optional(),
    manufacturer: name.nullable().optional(),
    manufactureDate: dateOnly.nullable().optional(),
    specification: text.nullable().optional(),
    name,
    price: money,
    sku: z.string().trim().min(1).max(64).nullable().optional(),
    trackStock: z.boolean().prefault(false),
    isActive: z.boolean().prefault(true),
})
    .strict();
export type ProductRequest = z.infer<typeof ProductRequest>;
export const ProductUpdateRequest = partialWithoutDefaults(ProductRequest).strict();
export type ProductUpdateRequest = z.infer<typeof ProductUpdateRequest>;
export const ProductListQuery = PaginationQuery.extend({
    isActive: queryBoolean.optional(),
}).strict();
export type ProductListQuery = z.infer<typeof ProductListQuery>;
export const ProductResponse = z.object({
    photoUrl: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    manufacturer: z.string().nullable().optional(),
    manufactureDate: dateOnly.nullable().optional(),
    specification: z.string().nullable().optional(),
    id,
    name,
    price: moneyResponse,
    sku: z.string().nullable(),
    trackStock: z.boolean(),
    stock: z.number().int(),
    isActive: z.boolean(),
    createdAt: timestamp,
    updatedAt: timestamp,
});
export type ProductResponse = z.infer<typeof ProductResponse>;
export const ProductListResponse = pageResponse(ProductResponse);
export type ProductListResponse = z.infer<typeof ProductListResponse>;
