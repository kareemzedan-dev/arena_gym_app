// Generated from the backend by npm run sync:contracts; see docs/contracts-source.json.
import { money } from './common';
import type { InvoiceLineRequest } from './invoices';
// OMR has three fractional digits. Integer baisa keeps browser previews exact.
export function toBaisa(value: string): bigint {
    const parsed = money.parse(value);
    const [whole, fraction = ''] = parsed.split('.');
    return BigInt(whole!) * 1000n + BigInt(fraction.padEnd(3, '0'));
}
export function fromBaisa(value: bigint): string {
    const sign = value < 0n ? '-' : '';
    const absolute = value < 0n ? -value : value;
    return `${sign}${absolute / 1000n}.${String(absolute % 1000n).padStart(3, '0')}`;
}
export function cartTotals(lines: Pick<InvoiceLineRequest, 'quantity' | 'unitPrice'>[], discount = '0', tax = '0') {
    const maximum = 999999999999n;
    const amounts = lines.map(line => {
        if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 2147483647)
            throw new Error('INVALID_TOTAL');
        const amount = toBaisa(line.unitPrice) * BigInt(line.quantity);
        if (amount > maximum)
            throw new Error('INVALID_TOTAL');
        return amount;
    });
    const subtotal = amounts.reduce((sum, amount) => sum + amount, 0n);
    const total = subtotal - toBaisa(discount) + toBaisa(tax);
    if (total < 0n || total > maximum)
        throw new Error('INVALID_TOTAL');
    return { subtotal: fromBaisa(subtotal), total: fromBaisa(total), lineTotals: amounts.map(fromBaisa) };
}
export function paymentAmountError(amount: string, maximum: string, allowZero = true): 'invalidAmount' | 'overpayment' | undefined {
    if (!money.safeParse(amount).success || !money.safeParse(maximum).success)
        return 'invalidAmount';
    if (!allowZero && toBaisa(amount) === 0n)
        return 'invalidAmount';
    return toBaisa(amount) > toBaisa(maximum) ? 'overpayment' : undefined;
}
