/** Padded, rounded domains with a stable tick step, including constant and single-point series. */
export function chartScale(input: number[]) {
  const values = input.filter(Number.isFinite);
  const low = values.length ? Math.min(...values) : 0;
  const high = values.length ? Math.max(...values) : 1;
  const padding = Math.max((high - low) * 0.15, Math.abs(high) * 0.01, 0.1);
  const rough = (high - low + padding * 2) / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const fraction = rough / magnitude;
  const step =
    (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10) *
    magnitude;
  const min = Math.floor((low - padding) / step) * step;
  const max = Math.ceil((high + padding) / step) * step;
  const ticks = Array.from(
    { length: Math.round((max - min) / step) + 1 },
    (_, i) => Number((min + i * step).toPrecision(12)),
  );
  return {
    min,
    max,
    ticks,
    step,
    fraction: (value: number) => (value - min) / (max - min),
  };
}
export function chartX(
  index: number,
  count: number,
  rtl: boolean,
  left: number,
  right: number,
) {
  const fraction = count <= 1 ? 0.5 : index / (count - 1);
  return left + (rtl ? 1 - fraction : fraction) * (right - left);
}
