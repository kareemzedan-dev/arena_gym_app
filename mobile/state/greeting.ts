import type { Me } from "@arena/shared";

/** Never use an email address as a personal greeting, even in a malformed name. */
export function greetingName(user?: Pick<Me, "fullName" | "username"> | null) {
  const name = user?.fullName?.trim();
  if (name && !name.includes("@")) return name.split(/\s+/)[0];
  const username = user?.username?.trim();
  return username && !username.includes("@") ? username : "";
}
