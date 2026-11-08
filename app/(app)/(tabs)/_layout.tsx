import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSession } from "../../../mobile/state/session";
import { usePrefs } from "../../../mobile/state/preferences";
import { colors as c } from "../../../mobile/theme/tokens";
export const unstable_settings = { initialRouteName: "home" };
export default function TabsLayout() {
  const { user } = useSession();
  const { text, ar } = usePrefs();
  const member = user?.role === "MEMBER";
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: {
          direction: ar ? "rtl" : "ltr",
          backgroundColor: c.bg,
          borderTopColor: c.line,
          paddingTop: 8,
          height: 82,
          paddingBottom: 20,
        },
        tabBarLabelStyle: { fontFamily: "CairoBold", fontSize: 10 },
        sceneStyle: { backgroundColor: c.bg },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: text("Today", "اليوم"),
          tabBarIcon: ({ color }) => (
            <Ionicons
              accessible={false}
              aria-hidden={true}
              name="grid-outline"
              size={22}
              color={typeof color === "string" ? color : c.muted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          title: member
            ? text("Training", "التمارين")
            : text("Clients", "العملاء"),
          tabBarIcon: ({ color }) => (
            <Ionicons
              accessible={false}
              aria-hidden={true}
              name={member ? "barbell-outline" : "people-outline"}
              size={23}
              color={typeof color === "string" ? color : c.muted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: member
            ? text("Progress", "التطور")
            : text("Workspace", "مساحة العمل"),
          tabBarIcon: ({ color }) => (
            <Ionicons
              accessible={false}
              aria-hidden={true}
              name={member ? "stats-chart-outline" : "apps-outline"}
              size={22}
              color={typeof color === "string" ? color : c.muted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: text("You", "حسابي"),
          tabBarIcon: ({ color }) => (
            <Ionicons
              accessible={false}
              aria-hidden={true}
              name="person-outline"
              size={22}
              color={typeof color === "string" ? color : c.muted}
            />
          ),
        }}
      />
    </Tabs>
  );
}
