import { z } from 'zod';
import { BranchQuery, BranchSummary, dateOnly, id, money, moneyResponse, pageResponse, PaginationQuery, text, timestamp } from './common';
import { PaymentResponse } from './payments';
import { SubscriptionResponse } from './subscriptions';
export const InvoiceStatus = z.enum(['PAID', 'PARTIAL', 'UNPAID', 'VOID']);
export const InvoiceLineRequest = z.object({ description: text.trim().min(1), planId: id.nullable().optional(), productId: id.nullable().optional(), quantity: z.number().int().positive().max(2_147_483_647), unitPrice: money }).strict().refine(value => !(value.planId && value.productId), 'A line can reference a plan or a product');
export type InvoiceLineRequest = z.infer<typeof InvoiceLineRequest>;
export const InvoicePaymentCorrection = z.object({
  id: id.optional(), amount: money.refine(value => Number(value) > 0, 'Payment must be positive'),
  method: PaymentResponse.shape.method, paidAt: timestamp, note: text.nullable().optional(),
}).strict();
export const InvoiceUpdateRequest = z.object({
  number: z.string().trim().min(1).max(191).refine(value => [...value].every(char => char.charCodeAt(0) >= 32 && char.charCodeAt(0) !== 127), 'Invalid invoice number').optional(),
  memberId: id.optional(), branchId: id.nullable().optional(), issuedAt: timestamp.optional(),
  notes: text.nullable().optional(), discount: money.optional(), tax: money.optional(),
  lines: z.array(InvoiceLineRequest).min(1).max(100).optional(),
  payments: z.array(InvoicePaymentCorrection).max(500).optional(),
  correctionReason: z.string().trim().min(3).max(1000).optional(),
  expectedUpdatedAt: timestamp.optional(),
}).strict().superRefine((value, ctx) => {
  if (value.payments !== undefined && !value.correctionReason)
    ctx.addIssue({ code: 'custom', path: ['correctionReason'], message: 'Explain the payment correction' });
  if (value.payments !== undefined && !value.expectedUpdatedAt)
    ctx.addIssue({ code: 'custom', path: ['expectedUpdatedAt'], message: 'Reload the invoice before correcting payments' });
  const ids = value.payments?.flatMap(payment => payment.id ? [payment.id] : []) ?? [];
  if (new Set(ids).size !== ids.length)
    ctx.addIssue({ code: 'custom', path: ['payments'], message: 'Duplicate payment reference' });
});
export type InvoiceUpdateRequest = z.infer<typeof InvoiceUpdateRequest>;
export const InvoiceListQuery = PaginationQuery.omit({ sort: true }).merge(BranchQuery).extend({ memberId: z.coerce.number().int().positive().max(2_147_483_647).optional(), status: InvoiceStatus.optional(), from: dateOnly.optional(), to: dateOnly.optional(), sort: z.enum(['issuedAt', '-issuedAt', 'number', '-number', 'total', '-total']).default('-issuedAt') }).strict();
export type InvoiceListQuery = z.infer<typeof InvoiceListQuery>;
export const InvoiceListItem = z.object({ id, number: z.string(), memberId: id, member: z.object({ id, fullName: z.string() }), branchId: id.nullable(), total: moneyResponse, paid: moneyResponse, due: z.string().regex(/^-?\d+\.\d{3}$/), status: InvoiceStatus, issuedAt: timestamp, lastPaymentMethod: PaymentResponse.shape.method.nullable() });
export const InvoiceLineResponse = z.object({ id, description: z.string(), planId: id.nullable(), productId: id.nullable(), quantity: z.number().int(), unitPrice: moneyResponse, lineTotal: moneyResponse });
export const InvoiceResponse = InvoiceListItem.extend({ member: InvoiceListItem.shape.member.extend({ mobile: z.string().nullable() }), branch: BranchSummary.nullable(), discount: moneyResponse, tax: moneyResponse, notes: z.string().nullable(), lines: z.array(InvoiceLineResponse), payments: z.array(PaymentResponse), subscriptions: z.array(SubscriptionResponse), createdAt: timestamp, updatedAt: timestamp });
export type InvoiceResponse = z.infer<typeof InvoiceResponse>;
export const InvoiceListResponse = pageResponse(InvoiceListItem);
export const InvoiceShareResponse = z.object({ url: z.string().url(), whatsappUrl: z.string().url().nullable() });
export const InvoiceTokenParams = z.object({ token: z.string().min(1).max(512) }).strict();
export type InvoiceTokenParams = z.infer<typeof InvoiceTokenParams>;
export const InvoicePdfResponse = z.instanceof(Uint8Array);
export type InvoiceStatus = z.infer<typeof InvoiceStatus>;
export type InvoiceListItem = z.infer<typeof InvoiceListItem>;
export type InvoiceLineResponse = z.infer<typeof InvoiceLineResponse>;
export type InvoiceListResponse = z.infer<typeof InvoiceListResponse>;
export type InvoiceShareResponse = z.infer<typeof InvoiceShareResponse>;
export type InvoicePdfResponse = z.infer<typeof InvoicePdfResponse>;
