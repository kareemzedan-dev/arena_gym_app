import React from "react";
import { View, Pressable } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  MembershipResponse,
  AssignmentListResponse,
  DashboardResponse,
  CoachScheduleResponse,
  MemberListResponse,
} from "@arena/shared";
import { useSession } from "../state/session";
import { usePrefs } from "../state/preferences";
import { useData, DataState } from "../components/data";
import {
  Screen,
  Text,
  Row,
  Icon,
  Card,
  Badge,
  Stat,
  Button,
  Section,
  ListRow,
  Empty,
} from "../components/ui";
import { colors as c } from "../theme/tokens";
import { dateLabel, today, addDays, money, canFinance } from "../api/format";
export default function Home() {
  const { user } = useSession();
  return user?.role === "MEMBER" ? <MemberHome /> : <TeamHome />;
}
function MemberHome() {
  const { user } = useSession();
  const { text, ar } = usePrefs();
  const router = useRouter();
  const membership = useData("/me/membership", MembershipResponse);
  const workouts = useData("/me/workouts", AssignmentListResponse);
  const current = membership.data?.current[0];
  const workout = workouts.data?.[0];
  return (
    <Screen
      onRefresh={() => {
        void membership.refetch();
        void workouts.refetch();
      }}
      refreshing={membership.isRefetching}
    >
      <Row style={{ justifyContent: "space-between" }}>
        <View>
          <Text muted size={11}>
            {text("A LITTLE STRONGER, EVERY DAY", "كل يوم أقوى شوية")}
          </Text>
          <Text size={28} bold>
            {text("Hey", "أهلًا")}, {user?.username} <Text size={22}>✦</Text>
          </Text>
        </View>
        <Pressable
          accessibilityLabel={text("Announcements", "الإعلانات")}
          accessibilityRole="button"
          onPress={() => router.push("/(app)/notices")}
          style={{ padding: 13, borderRadius: 20, backgroundColor: c.card }}
        >
          <Icon name="notifications-outline" color={c.text} />
        </Pressable>
      </Row>
      <View style={{ height: 310, borderRadius: 28, overflow: "hidden" }}>
        <Image
          source={require("../../assets/arena-training.png")}
          contentFit="cover"
          contentPosition="top"
          style={{ position: "absolute", inset: 0 }}
        />
        <LinearGradient
          colors={["transparent", "#101716ED"]}
          locations={[0, 1]}
          style={{ flex: 1, padding: 24, justifyContent: "flex-end", gap: 10 }}
        >
          <Badge>{text("YOUR DAILY MOMENTUM", "خطوتك النهارده")}</Badge>
          <Text size={30} bold style={{ lineHeight: 41 }}>
            {text("Make time\nfor stronger.", "خصص وقت\nلنسختك الأقوى.")}
          </Text>
          <Button
            title={
              workout
                ? text("View your workout", "شوف تمرينك")
                : text("Explore your training", "اكتشف تمارينك")
            }
            onPress={() =>
              router.push(
                workout
                  ? { pathname: "/(app)/workout", params: { id: workout.id } }
                  : "/(app)/(tabs)/training",
              )
            }
            icon="arrow-forward"
          />
        </LinearGradient>
      </View>
      <Section
        title={text("Your membership", "عضويتك")}
        action={text("View all", "عرض الكل")}
        onPress={() => router.push("/(app)/membership")}
      />
      <DataState query={membership}>
        {current ? (
          <Card style={{ backgroundColor: "#203B34", borderColor: "#31594B" }}>
            <Row style={{ justifyContent: "space-between" }}>
              <Text bold size={17}>
                {current.planName}
              </Text>
              <Icon name="sparkles-outline" color={c.lime} />
            </Row>
            <Text muted size={11}>
              {text("Valid until", "ساري حتى")} {dateLabel(current.endDate, ar)}
            </Text>
            <View style={{ height: 1, backgroundColor: "#395449" }} />
            <Row>
              <Stat
                value={membership.data?.ptRemaining ?? 0}
                label={text("PT sessions left", "جلسات التدريب المتبقية")}
              />
              <Stat
                value={membership.data?.ptUsed ?? 0}
                label={text("PT sessions used", "جلسات التدريب المستخدمة")}
              />
            </Row>
          </Card>
        ) : (
          <Empty
            title={text(
              "Your next chapter starts here",
              "رحلتك الجديدة تبدأ هنا",
            )}
            detail={text(
              "Reception can help activate your membership.",
              "الاستقبال يقدر يساعدك في تفعيل اشتراكك.",
            )}
          />
        )}
      </DataState>
      <Section
        title={text("A little care goes a long way", "اهتم بنفسك خطوة بخطوة")}
      />
      <ListRow
        icon="restaurant-outline"
        title={text("Fuel your progress", "غذّي تطورك")}
        subtitle={text("Your coach’s nutrition plan", "خطة التغذية من مدربك")}
        onPress={() => router.push("/(app)/nutrition")}
      />
      <ListRow
        icon="calendar-outline"
        title={text("Find your next class", "شوف حصتك الجاية")}
        subtitle={text("Your gym. Your community.", "جيمك ومجتمعك الرياضي.")}
        onPress={() => router.push("/(app)/classes")}
      />
    </Screen>
  );
}
function TeamHome() {
  const { user } = useSession();
  const { text } = usePrefs();
  const router = useRouter();
  const finance = canFinance(user?.role);
  const summary = useData("/dashboard/summary", DashboardResponse, finance);
  const schedule = useData(
    `/coaches/me/schedule?from=${today()}&to=${addDays(today(), 7)}`,
    CoachScheduleResponse,
    user?.role === "STAFF_MEMBER",
  );
  const clients = useData("/members?pageSize=1", MemberListResponse);
  return (
    <Screen
      title={text("Your arena, at a glance.", "أرينا في نظرة.")}
      subtitle={text("TEAM WORKSPACE", "مساحة الفريق")}
      onRefresh={() => {
        void (finance ? summary.refetch() : schedule.refetch());
        void clients.refetch();
      }}
    >
      <Card style={{ backgroundColor: "#203B34" }}>
        <Text accent bold>
          {text("WELCOME BACK", "أهلًا برجوعك")}
        </Text>
        <Text size={30} bold>
          {user?.username}
        </Text>
        <Text muted>
          {text(
            "Good coaching starts with a clear picture.",
            "المتابعة الجيدة تبدأ بصورة واضحة.",
          )}
        </Text>
      </Card>
      {finance ? (
        <DataState query={summary}>
          <Card>
            <Row>
              <Stat
                value={summary.data?.activeMembers ?? 0}
                label={text("Active members", "الأعضاء النشطون")}
              />
              <Stat
                value={summary.data?.attendanceToday ?? 0}
                label={text("Visits today", "حضور اليوم")}
              />
            </Row>
            <Text muted>
              {text("Collected this month", "المحصل هذا الشهر")}
            </Text>
            <Text bold size={30}>
              {money(summary.data?.revenueThisMonth)} <Text size={12}>OMR</Text>
            </Text>
          </Card>
        </DataState>
      ) : (
        <DataState query={schedule}>
          <Card>
            <Row>
              <Stat
                value={clients.data?.total ?? 0}
                label={text("Assigned clients", "عملاؤك")}
              />
              <Stat
                value={
                  (schedule.data?.classes.length ?? 0) +
                  (schedule.data?.ptBookings.length ?? 0)
                }
                label={text("Upcoming sessions", "الحصص القادمة")}
              />
            </Row>
          </Card>
        </DataState>
      )}
      <Section title={text("Make things happen", "ابدأ يومك")} />
      <ListRow
        icon="people-outline"
        title={text("Your clients", "عملاؤك")}
        onPress={() => router.push("/(app)/(tabs)/training")}
      />
      <ListRow
        icon="calendar-outline"
        title={text("Schedule", "جدول الحصص")}
        onPress={() => router.push("/(app)/schedule")}
      />
      {finance && (
        <ListRow
          icon="receipt-outline"
          title={text("Sales & payments", "المبيعات والمدفوعات")}
          onPress={() => router.push("/(app)/invoices")}
        />
      )}
      <ListRow
        icon="apps-outline"
        title={text("Open workspace", "افتح مساحة العمل")}
        onPress={() => router.push("/(app)/(tabs)/progress")}
      />
    </Screen>
  );
}
