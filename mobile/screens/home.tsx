import React from "react";
import { View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { BannerCarousel } from "../components/banner-carousel";
import { greetingName } from "../state/greeting";
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
  Stat,
  Button,
  Section,
  ListRow,
  Empty,
} from "../components/ui";
import { colors as c } from "../theme/tokens";
import {
  dateLabel,
  today,
  addDays,
  money,
  canFinance,
  canTrain,
} from "../api/format";
export default function Home() {
  const { user } = useSession();
  return user?.role === "MEMBER" ? <MemberHome /> : <TeamHome />;
}
function MemberHome() {
  const { user } = useSession();
  const { text, ar } = usePrefs();
  const router = useRouter();
  const client = useQueryClient();
  const name = greetingName(user);
  const membership = useData("/me/membership", MembershipResponse);
  const workouts = useData("/me/workouts", AssignmentListResponse);
  const current = membership.data?.current[0];
  const workout = workouts.data?.[0];
  return (
    <Screen
      compact
      onRefresh={() => {
        void membership.refetch();
        void workouts.refetch();
        void client.invalidateQueries({ queryKey: ["api", "/me/banners"] });
      }}
      refreshing={membership.isRefetching}
    >
      <Row style={{ justifyContent: "space-between" }}>
        <View style={{ flex: 1 }}>
          <Text size={24} bold numberOfLines={1} adjustsFontSizeToFit>
            {text("Hey", "أهلًا")}
            {name ? `${ar ? "،" : ","} ${name}` : ""} <Text size={18}>✦</Text>
          </Text>
          <Text muted size={12}>
            {text("A LITTLE STRONGER, EVERY DAY", "أقوى قليلًا كل يوم")}
          </Text>
        </View>
      </Row>
      <BannerCarousel />
      <Button
        title={text("Check in with QR", "الدخول برمز QR")}
        icon="qr-code-outline"
        onPress={() => router.push("/(app)/checkin")}
      />
      <View style={{ borderRadius: 24, overflow: "hidden" }}>
        <LinearGradient
          colors={["#203C36", c.card]}
          style={{ padding: 16, gap: 8 }}
        >
          <Text accent bold size={12}>
            {text("YOUR DAILY MOMENTUM", "خطوتك اليوم")}
          </Text>
          <Text size={22} bold style={{ lineHeight: 32 }}>
            {text("Make time for stronger.", "خصصي وقتًا لنسختك الأقوى.")}
          </Text>
          <Button
            title={
              workout
                ? text("View your workout", "استعرضي تمرينك")
                : text("Explore your training", "اكتشفي تمارينك")
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
        compact
        title={text("Your membership", "عضويتك")}
        action={text("View all", "عرض الكل")}
        onPress={() => router.push("/(app)/membership")}
      />
      <DataState query={membership}>
        {current ? (
          <Card
            style={{
              padding: 16,
              gap: 10,
              backgroundColor: "#203B34",
              borderColor: "#31594B",
            }}
          >
            <Row style={{ justifyContent: "space-between" }}>
              <Text bold size={15} style={{ flex: 1 }}>
                {current.planName}
              </Text>
              <Icon name="sparkles-outline" color={c.lime} />
            </Row>
            <Text muted size={12}>
              {text("Valid until", "ساري حتى")} {dateLabel(current.endDate, ar)}
            </Text>
            <View style={{ height: 1, backgroundColor: "#395449" }} />
            <Row>
              <Stat
                compact
                value={membership.data?.ptRemaining ?? 0}
                label={text("PT sessions left", "جلسات التدريب المتبقية")}
              />
              <Stat
                compact
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
              "يمكن للاستقبال مساعدتك في تفعيل اشتراكك.",
            )}
          />
        )}
      </DataState>
      <Section
        compact
        title={text("A little care goes a long way", "اهتمي بنفسك خطوة بخطوة")}
      />
      <ListRow
        compact
        icon="restaurant-outline"
        title={text("Fuel your progress", "غذّي تطورك")}
        subtitle={text("Your coach’s nutrition plan", "خطة التغذية من مدربتك")}
        onPress={() => router.push("/(app)/nutrition")}
      />
      <ListRow
        compact
        icon="calendar-outline"
        title={text("Find your next class", "استعرضي حصتك القادمة")}
        subtitle={text("Your gym. Your community.", "ناديك ومجتمعك الرياضي.")}
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
      compact
      title={text("Your arena, at a glance.", "أرينا في نظرة.")}
      subtitle={text("TEAM WORKSPACE", "مساحة الفريق")}
      onRefresh={() => {
        void (finance ? summary.refetch() : schedule.refetch());
        void clients.refetch();
      }}
    >
      <Card style={{ padding: 16, gap: 10, backgroundColor: "#203B34" }}>
        <Text accent bold>
          {text("WELCOME BACK", "مرحبًا بعودتك")}
        </Text>
        <Text size={24} bold>
          {greetingName(user) || text("Hey", "أهلًا")}
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
          <Card style={{ padding: 16, gap: 10 }}>
            <Row>
              <Stat
                compact
                value={summary.data?.activeMembers ?? 0}
                label={text("Active members", "الأعضاء النشطون")}
              />
              <Stat
                compact
                value={summary.data?.attendanceToday ?? 0}
                label={text("Visits today", "حضور اليوم")}
              />
            </Row>
            <Text muted>
              {text("Collected this month", "المحصل هذا الشهر")}
            </Text>
            <Text bold size={24}>
              {money(summary.data?.revenueThisMonth)} <Text size={12}>OMR</Text>
            </Text>
          </Card>
        </DataState>
      ) : (
        <DataState query={schedule}>
          <Card style={{ padding: 16, gap: 10 }}>
            <Row>
              <Stat
                compact
                value={clients.data?.total ?? 0}
                label={text("Assigned clients", "عملاؤك")}
              />
              <Stat
                compact
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
      <Section compact title={text("Make things happen", "ابدأ يومك")} />
      <ListRow
        compact
        icon="people-outline"
        title={text("Your clients", "عملاؤك")}
        onPress={() => router.push("/(app)/(tabs)/training")}
      />
      <ListRow
        compact
        icon="calendar-outline"
        title={text("Schedule", "جدول الحصص")}
        onPress={() => router.push("/(app)/schedule")}
      />
      {finance && (
        <ListRow
          compact
          icon="receipt-outline"
          title={text("Sales & payments", "المبيعات والمدفوعات")}
          onPress={() => router.push("/(app)/invoices")}
        />
      )}
      {canTrain(user?.role) && (
        <ListRow
          compact
          icon="barbell-outline"
          title={text("Workout plans", "خطط التمرين")}
          onPress={() => router.push("/(app)/workout-plans")}
        />
      )}
      <ListRow
        compact
        icon="apps-outline"
        title={text("Open workspace", "افتح مساحة العمل")}
        onPress={() => router.push("/(app)/(tabs)/progress")}
      />
    </Screen>
  );
}
