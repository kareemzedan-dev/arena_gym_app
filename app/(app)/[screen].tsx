import React from "react";
import { useLocalSearchParams } from "expo-router";
import { useSession } from "../../mobile/state/session";
import { usePrefs } from "../../mobile/state/preferences";
import { canManage, canFinance, canTrain } from "../../mobile/api/format";
import { Screen, Empty } from "../../mobile/components/ui";
import { Workout, Nutrition } from "../../mobile/screens/training";
import {
  Membership,
  Coach,
  History,
  Client,
} from "../../mobile/screens/member-details";
import { Measurements } from "../../mobile/screens/progress";
import { Password } from "../../mobile/screens/account";
import Editor from "../../mobile/screens/editor";
import Catalog from "../../mobile/screens/catalog";
import { Classes, Schedule } from "../../mobile/screens/schedule";
import { Community } from "../../mobile/screens/community";
import {
  Pos,
  Invoices,
  Invoice,
  InvoiceEdit,
  Reports,
} from "../../mobile/screens/commerce";
export default function Detail() {
  const { screen, kind } = useLocalSearchParams<{
    screen: string;
    kind?: string;
  }>();
  const { user } = useSession();
  const { text } = usePrefs();
  const role = user?.role;
  const member = role === "MEMBER";
  const admin = canManage(role);
  const trainer = canTrain(role);
  const finance = canFinance(role);
  let element: React.ReactNode = null;
  if (screen === "password") element = <Password />;
  if (["notices", "messages"].includes(screen))
    element = <Community kind={screen as "notices" | "messages"} />;
  if (screen === "classes" && (member || trainer)) element = <Classes />;
  if (screen === "schedule" && !member) element = <Schedule />;
  if (screen === "invoices" && (member || finance)) element = <Invoices />;
  if (screen === "history") element = <History />;
  if (screen === "workout" && (member || trainer)) element = <Workout />;
  if (screen === "measurements" && (member || trainer))
    element = <Measurements />;
  if (screen === "membership" && member) element = <Membership />;
  if (screen === "coach" && member) element = <Coach />;
  if (screen === "nutrition" && member) element = <Nutrition />;
  if (screen === "client" && !member) element = <Client />;
  if (screen === "pos" && finance) element = <Pos />;
  if (screen === "invoice" && finance) element = <Invoice />;
  if (screen === "invoice-edit" && admin) element = <InvoiceEdit />;
  if (screen === "reports" && finance) element = <Reports />;
  if (["staff", "plans", "plan-categories"].includes(screen) && admin)
    element = <Catalog />;
  if (
    ["workout-plans", "nutrition-plans", "exercises"].includes(screen) &&
    trainer
  )
    element = <Catalog />;
  if (screen === "attendance" && trainer) element = <Editor />;
  if (
    screen === "editor" &&
    (admin ||
      (trainer &&
        [
          "measurements",
          "assignments",
          "workout-plans",
          "nutrition-plans",
          "exercises",
          "attendance",
        ].includes(kind || "")))
  )
    element = <Editor />;
  return (
    element || (
      <Screen back>
        <Empty
          title={text(
            "This page is not available for your account.",
            "الصفحة غير متاحة لحسابك.",
          )}
        />
      </Screen>
    )
  );
}
