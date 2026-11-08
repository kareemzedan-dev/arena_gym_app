import { canFinance, canManage, canTrain } from "../api/format";

export type SessionState = "restoring" | "anonymous" | "authenticated";
export type ScreenAccess = "loading" | "login" | "home" | "allow";

/** Restored/deep-linked routes must wait for identity before checking permissions. */
export function resolveScreenAccess(
  screen: unknown,
  role: string | undefined,
  sessionState: SessionState,
  kind?: unknown,
): ScreenAccess {
  if (sessionState === "restoring") return "loading";
  if (sessionState === "anonymous" || !role) return "login";
  const member = role === "MEMBER";
  const admin = canManage(role);
  const trainer = canTrain(role);
  const finance = canFinance(role);
  const staff = trainer || finance;
  if (!member && !staff) return "home";
  switch (screen) {
    case "password":
    case "history":
      return "allow";
    case "membership":
    case "coach":
    case "nutrition":
    case "checkin":
      return member ? "allow" : "home";
    case "classes":
    case "workout":
    case "measurements":
      return member || trainer ? "allow" : "home";
    case "notices":
    case "messages":
    case "schedule":
    case "client":
      return staff ? "allow" : "home";
    case "invoices":
      return member || finance ? "allow" : "home";
    case "invoice":
    case "pos":
    case "reports":
      return finance ? "allow" : "home";
    case "invoice-edit":
    case "staff":
    case "plans":
    case "plan-categories":
      return admin ? "allow" : "home";
    case "exercises":
    case "workout-plans":
    case "nutrition-plans":
    case "attendance":
      return trainer ? "allow" : "home";
    case "editor": {
      if (typeof kind !== "string") return "home";
      const trainingKinds = [
        "measurements",
        "assignments",
        "workout-plans",
        "nutrition-plans",
        "exercises",
        "attendance",
      ];
      const adminKinds = [
        "members",
        "staff",
        "plans",
        "plan-categories",
        "classes",
      ];
      return (trainer && trainingKinds.includes(kind)) ||
        (admin && adminKinds.includes(kind))
        ? "allow"
        : "home";
    }
    default:
      return "home";
  }
}
