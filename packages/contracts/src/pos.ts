import { z } from "zod";
import { dateOnly, id, money, moneyResponse, text } from "./common";
import { PaymentRequest } from "./payments";
import { PlanResponse, PlanScope } from "./plans";
import { ProductResponse } from "./products";
import { PlanCategoryResponse } from "./plan-categories";
export const CheckoutRequest = z
  .object({
    memberId: id,
    includeSignupFees: z.boolean().optional(),
    couponCode: z.string().trim().min(2).max(60).optional(),
    taxIds: z.array(id).max(20).optional(),
    items: z
      .array(
        z.union([
          z
            .object({
              type: z.literal("PLAN"),
              planId: id,
              startDate: dateOnly.optional(),
            })
            .strict(),
          z
            .object({
              type: z.literal("PRODUCT"),
              productId: id,
              quantity: z.number().int().positive().max(2_147_483_647),
            })
            .strict(),
        ]),
      )
      .min(1)
      .max(100),
    discount: money.optional(),
    tax: money.optional(),
    payment: PaymentRequest.omit({ paidAt: true }).optional(),
    notes: text.nullable().optional(),
  })
  .strict();
export type CheckoutRequest = z.infer<typeof CheckoutRequest>;
export const PosCatalogQuery = z
  .object({
    scope: PlanScope.optional(),
    categoryId: z.coerce
      .number()
      .int()
      .positive()
      .max(2_147_483_647)
      .optional(),
    search: z.string().trim().max(191).optional(),
  })
  .strict();
export type PosCatalogQuery = z.infer<typeof PosCatalogQuery>;
export const PosCatalogResponse = z.object({
  categories: z.array(
    PlanCategoryResponse.extend({ plans: z.array(PlanResponse) }),
  ),
  products: z.array(ProductResponse),
});
export type PosCatalogResponse = z.infer<typeof PosCatalogResponse>;

export const PosQuoteResponse = z.object({
  subtotal: moneyResponse,
  discount: moneyResponse,
  tax: moneyResponse,
  total: moneyResponse,
});
