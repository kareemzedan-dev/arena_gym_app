import { z } from 'zod';
import { BranchQuery, dateOnly, id, moneyResponse, pageResponse, PaginationQuery } from './common';
export const ReportQuery = BranchQuery.extend({ from: dateOnly, to: dateOnly, format: z.enum(['json', 'csv']).default('json') }).strict();
export type ReportQuery = z.infer<typeof ReportQuery>;
export const RevenueQuery = ReportQuery.extend({ granularity: z.enum(['day', 'month', 'year']).default('day') }).strict();
export type RevenueQuery = z.infer<typeof RevenueQuery>;
const signedMoney = z.string().regex(/^-?\d+\.\d{3}$/);
export const ProfitBucket = z.object({ period: z.string(), netSales: signedMoney, otherIncome: signedMoney, expenses: signedMoney, profit: signedMoney, collected: signedMoney });
export const ProfitReportResponse = z.object({
  basis: z.literal('INVOICE_DATE'), netSales: signedMoney, salesTax: signedMoney,
  invoicedTotal: signedMoney, otherIncome: signedMoney, expenses: signedMoney,
  totalIncome: signedMoney, profit: signedMoney, collected: signedMoney,
  buckets: z.array(ProfitBucket),
});
export const PagedReportQuery = ReportQuery.merge(PaginationQuery.pick({ page: true, pageSize: true })).strict();
export type PagedReportQuery = z.infer<typeof PagedReportQuery>;
export const RevenueBucket = z.object({ period: z.string(), method: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'LEGACY']), amount: moneyResponse, count: z.number().int().nonnegative() });
export const RevenueResponse = z.object({ revenueLabel: z.literal('Collected payments'), salesLabel: z.literal('Invoiced sales (excluding VOID)'), buckets: z.array(RevenueBucket), byMethod: z.array(RevenueBucket.omit({ period: true })), revenue: moneyResponse, sales: moneyResponse });
export const SubscriptionSalesBucket = z.object({ key: z.string(), name: z.string(), count: z.number().int().nonnegative(), invoicedAmount: moneyResponse });
export const SubscriptionSalesResponse = z.object({ amountLabel: z.literal('Gross invoiced plan lines before invoice discount/tax (excluding VOID)'), byScope: z.array(SubscriptionSalesBucket), byCategory: z.array(SubscriptionSalesBucket), count: z.number().int().nonnegative(), invoicedAmount: moneyResponse });
export const OutstandingItem = z.object({ memberId: id, fullName: z.string(), mobile: z.string().nullable(), invoicesCount: z.number().int().nonnegative(), totalDue: moneyResponse, oldestUnpaidDate: dateOnly });
export const OutstandingResponse = pageResponse(OutstandingItem).extend({ grandTotal: moneyResponse });
export const ExpiringItem = z.object({ id, memberId: id, fullName: z.string(), planName: z.string(), endDate: dateOnly });
export const MembersReportResponse = z.object({ asOf: dateOnly, byBranch: z.array(z.object({ branchId: id.nullable(), branchName: z.string().nullable(), active: z.number().int().nonnegative(), inactive: z.number().int().nonnegative() })), expiring7: pageResponse(ExpiringItem), expiring30: pageResponse(ExpiringItem) });
export const DashboardResponse = z.object({ activeMembers: z.number().int().nonnegative(), newMembersThisMonth: z.number().int().nonnegative(), revenueToday: moneyResponse, revenueThisMonth: moneyResponse, outstandingTotal: moneyResponse, subscriptionsExpiring7: z.number().int().nonnegative(), attendanceToday: z.number().int().nonnegative(), classesToday: z.number().int().nonnegative() });
export const CsvResponse = z.instanceof(Uint8Array);
