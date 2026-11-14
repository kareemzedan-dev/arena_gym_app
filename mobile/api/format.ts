export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Muscat",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export function addDays(day: string, count: number) {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + count);
  return d.toISOString().slice(0, 10);
}
export function dateLabel(value: string, ar = false) {
  return new Intl.DateTimeFormat(ar ? "ar-OM" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Muscat",
  }).format(new Date(value.length === 10 ? `${value}T12:00:00Z` : value));
}
export function timeLabel(value: string, ar = false) {
  return new Intl.DateTimeFormat(ar ? "ar-OM" : "en-GB", {
    timeZone: "Asia/Muscat", hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(value));
}
export function money(value: string | undefined) {
  const [whole, fraction = ""] = (value || "0").split(".");
  return `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${fraction.padEnd(3, "0").slice(0, 3)}`;
}
export function canManage(role?: string) {
  return (
    role === "ADMINISTRATOR" || role === "GYM_OWNER" || role === "MANAGEMENT"
  );
}
export function canFinance(role?: string) {
  return canManage(role) || role === "ACCOUNTANT" || role === "MANAGEMENT";
}
export function canTrain(role?: string) {
  return canManage(role) || role === "STAFF_MEMBER";
}
export function safeHttpUrl(value: string) {
  try {
    const u = new URL(value);
    return ["https:", "http:"].includes(u.protocol) ? u.href : null;
  } catch {
    return null;
  }
}
