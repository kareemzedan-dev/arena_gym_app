import React from "react";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useSession } from "../../mobile/state/session";
import { usePrefs } from "../../mobile/state/preferences";
import { resolveScreenAccess } from "../../mobile/state/screen-access";
import CheckIn from "../../mobile/screens/checkin";
import { Screen, Empty, Loading, Button } from "../../mobile/components/ui";
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
  const { user, ready } = useSession();
  const { text } = usePrefs();
  const router = useRouter();
  const access = resolveScreenAccess(
    screen,
    user?.role,
    !ready ? "restoring" : user ? "authenticated" : "anonymous",
    kind,
  );
  if (access === "loading")
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  if (access === "login") return <Redirect href="/login" />;
  if (access === "home") return <Redirect href="/(app)/(tabs)/home" />;
  const screens: Record<string, React.ReactNode> = {
    password: <Password />,
    notices: <Community kind="notices" />,
    messages: <Community kind="messages" />,
    classes: <Classes />,
    schedule: <Schedule />,
    invoices: <Invoices />,
    history: <History />,
    workout: <Workout />,
    measurements: <Measurements />,
    membership: <Membership />,
    coach: <Coach />,
    nutrition: <Nutrition />,
    checkin: <CheckIn />,
    client: <Client />,
    pos: <Pos />,
    invoice: <Invoice />,
    "invoice-edit": <InvoiceEdit />,
    reports: <Reports />,
    staff: <Catalog />,
    plans: <Catalog />,
    "plan-categories": <Catalog />,
    "workout-plans": <Catalog />,
    "nutrition-plans": <Catalog />,
    exercises: <Catalog />,
    attendance: <Editor />,
    editor: <Editor key={`${kind || ""}`} />,
  };
  const element = screens[screen];
  return (
    element || (
      <Screen back>
        <Empty
          title={text(
            "This page is not available for your account.",
            "الصفحة غير متاحة لحسابك.",
          )}
        />
        <Button
          title={text("Go home", "العودة إلى الرئيسية")}
          onPress={() => router.replace("/(app)/(tabs)/home")}
        />
      </Screen>
    )
  );
}
