import React, { useState } from "react";
import { View, Linking } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AssignmentListResponse,
  ActiveNutritionResponse,
  MemberListResponse,
  MemberResponse,
} from "@arena/shared";
import { usePrefs } from "../state/preferences";
import { useSession } from "../state/session";
import { useData, DataState } from "../components/data";
import {
  Screen,
  Text,
  Card,
  Row,
  Section,
  Icon,
  Button,
  Chips,
  Empty,
  Field,
  ListRow,
  Badge,
} from "../components/ui";
import { dateLabel, canManage, safeHttpUrl } from "../api/format";
import { colors as c } from "../theme/tokens";
export default function Training() {
  const { user } = useSession();
  return user?.role === "MEMBER" ? <MemberTraining /> : <Clients />;
}
function MemberTraining() {
  const { text, ar } = usePrefs();
  const router = useRouter();
  const q = useData("/me/workouts", AssignmentListResponse);
  return (
    <Screen
      title={text("Built for you.", "مصمم ليك.")}
      subtitle={text("YOUR TRAINING", "تمارينك")}
      onRefresh={() => void q.refetch()}
      refreshing={q.isRefetching}
    >
      <Text muted>
        {text(
          "A clear plan. A stronger you. Let’s get to work.",
          "خطة واضحة، ونسخة أقوى منك. يلا نبدأ.",
        )}
      </Text>
      <ListRow
        icon="restaurant-outline"
        title={text("Your nutrition", "تغذيتك")}
        subtitle={text(
          "The other half of your training",
          "الجزء المكمل لتمرينك",
        )}
        onPress={() => router.push("/(app)/nutrition")}
      />
      <Section title={text("Workout plans", "خطط التمرين")} />
      <DataState query={q}>
        {q.data?.map((a, i) => (
          <Card key={a.id} delay={i * 30}>
            <Row style={{ justifyContent: "space-between" }}>
              <Badge>{text("COACH ASSIGNED", "من مدربك")}</Badge>
              <Icon name="barbell-outline" />
            </Row>
            <Text bold size={24}>
              {a.workoutPlan.name}
            </Text>
            <Text muted size={12}>
              {a.workoutPlan.items.length} {text("exercises", "تمارين")}
              {a.startDate ? ` · ${dateLabel(a.startDate, ar)}` : ""}
            </Text>
            <Button
              secondary
              title={text("Open workout", "افتح التمرين")}
              onPress={() =>
                router.push({
                  pathname: "/(app)/workout",
                  params: { id: a.id },
                })
              }
              icon="arrow-forward"
            />
          </Card>
        ))}
        {!q.data?.length && (
          <Empty
            title={text("Your plan is on its way", "خطتك لسه بتتجهز")}
            detail={text(
              "Your assigned workouts will appear here.",
              "تمارينك هتظهر هنا بعد ما مدربك يضيفها.",
            )}
            icon="barbell-outline"
          />
        )}
      </DataState>
    </Screen>
  );
}
export function Workout() {
  const { id, memberId } = useLocalSearchParams<{
    id: string;
    memberId?: string;
  }>();
  const { text, ar } = usePrefs();
  const q = useData(
    memberId ? `/members/${memberId}/workouts` : "/me/workouts",
    AssignmentListResponse,
  );
  const a = q.data?.find((x) => x.id === Number(id));
  const [day, setDay] = useState("all");
  const days = [
    text("Sun", "الأحد"),
    text("Mon", "الإثنين"),
    text("Tue", "الثلاثاء"),
    text("Wed", "الأربعاء"),
    text("Thu", "الخميس"),
    text("Fri", "الجمعة"),
    text("Sat", "السبت"),
  ];
  return (
    <Screen
      back
      title={a?.workoutPlan.name || text("Your workout", "تمرينك")}
      subtitle={text("FOLLOW YOUR PLAN", "اتبع خطتك")}
    >
      <DataState query={q}>
        {a && (
          <>
            <Card style={{ backgroundColor: "#203B34" }}>
              <Text bold size={22}>
                {text("One set at a time.", "مجموعة وراء مجموعة.")}
              </Text>
              <Text muted>
                {text(
                  "Follow your coach’s sets, repetitions and weights.",
                  "اتبع المجموعات والتكرارات والأوزان المحددة من مدربك.",
                )}
              </Text>
              {a.endDate && (
                <Text size={11}>
                  {text("Until", "حتى")} {dateLabel(a.endDate, ar)}
                </Text>
              )}
            </Card>
            <Chips
              value={day}
              onChange={setDay}
              options={[
                { value: "all", label: text("All days", "كل الأيام") },
                ...days.map((label, i) => ({ label, value: String(i) })),
              ]}
            />
            {a.workoutPlan.items
              .filter(
                (i) =>
                  day === "all" ||
                  i.dayOfWeek === null ||
                  String(i.dayOfWeek) === day,
              )
              .sort((a, b) => a.order - b.order)
              .map((item, i) => (
                <Card key={item.id}>
                  <Row>
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        backgroundColor: c.raised,
                        borderRadius: 13,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text accent bold>
                        {String(i + 1).padStart(2, "0")}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text bold size={17}>
                        {item.exercise.name}
                      </Text>
                      <Text muted size={11}>
                        {item.dayOfWeek == null
                          ? text("Any day", "كل الأيام")
                          : days[item.dayOfWeek]}
                      </Text>
                    </View>
                  </Row>
                  <Row style={{ justifyContent: "space-between" }}>
                    <Text size={18} bold>
                      {item.sets}{" "}
                      <Text size={12} muted>
                        {text("sets", "مجموعات")}
                      </Text>
                    </Text>
                    <Text size={18} bold>
                      {item.reps}{" "}
                      <Text size={12} muted>
                        {text("reps", "تكرارات")}
                      </Text>
                    </Text>
                    <Text size={18} bold>
                      {item.weightKg ?? "—"}{" "}
                      <Text size={12} muted>
                        kg
                      </Text>
                    </Text>
                  </Row>
                  {item.exercise.videoUrl &&
                    safeHttpUrl(item.exercise.videoUrl) && (
                      <Button
                        title={text("Watch technique", "شاهد طريقة التمرين")}
                        icon="play-circle-outline"
                        secondary
                        onPress={() =>
                          void Linking.openURL(
                            safeHttpUrl(item.exercise.videoUrl!)!,
                          )
                        }
                      />
                    )}
                </Card>
              ))}
          </>
        )}
        {q.data && !a && (
          <Empty title={text("Workout not available", "التمرين غير متاح")} />
        )}
      </DataState>
    </Screen>
  );
}
export function Nutrition() {
  const { text, ar } = usePrefs();
  const q = useData("/me/nutrition", ActiveNutritionResponse);
  return (
    <Screen
      back
      title={text("Fuel your day.", "غذّي يومك.")}
      subtitle={text("NUTRITION", "التغذية")}
      onRefresh={() => void q.refetch()}
      refreshing={q.isRefetching}
    >
      <Text muted>
        {text(
          "Balanced meals, thoughtfully planned by your coach.",
          "وجبات متوازنة، مدربك مجهزها ليك بعناية.",
        )}
      </Text>
      <DataState query={q}>
        {q.data?.map((plan) => (
          <View key={plan.id} style={{ gap: 16 }}>
            <Section title={plan.name} />
            {plan.endDate && (
              <Text muted size={11}>
                {text("Until", "حتى")} {dateLabel(plan.endDate, ar)}
              </Text>
            )}
            {[...plan.meals]
              .sort((a, b) => a.order - b.order)
              .map((meal) => (
                <Card key={meal.id}>
                  <Row style={{ justifyContent: "space-between" }}>
                    <Row>
                      <Icon name="restaurant-outline" />
                      <Text size={20} bold>
                        {meal.name}
                      </Text>
                    </Row>
                    <Badge>{meal.time || text("Flexible", "وقت مرن")}</Badge>
                  </Row>
                  {meal.items.map((food) => (
                    <Row
                      key={food.id}
                      style={{ justifyContent: "space-between" }}
                    >
                      <Text style={{ flex: 1 }}>{food.food}</Text>
                      <Text muted>{food.quantity}</Text>
                    </Row>
                  ))}
                  {meal.notes && (
                    <Text muted size={12}>
                      {meal.notes}
                    </Text>
                  )}
                </Card>
              ))}
          </View>
        ))}
        {!q.data?.length && (
          <Empty
            title={text("Good things are being prepared", "خطتك بتتجهز")}
            detail={text(
              "Your coach’s meal plan will appear here.",
              "خطة التغذية هتظهر هنا لما مدربك يضيفها.",
            )}
            icon="restaurant-outline"
          />
        )}
      </DataState>
    </Screen>
  );
}
export function Clients() {
  const { text } = usePrefs();
  const { user } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const q = useData(
    `/members?pageSize=20&page=${page}&search=${encodeURIComponent(search)}`,
    MemberListResponse,
  );
  return (
    <Screen
      title={text("People first.", "الناس أولًا.")}
      subtitle={text("YOUR CLIENTS", "عملاؤك")}
      onRefresh={() => void q.refetch()}
      refreshing={q.isRefetching}
    >
      <Field
        label={text("Find a client", "ابحث عن عميل")}
        placeholder={text("Name or username", "الاسم أو اسم المستخدم")}
        value={search}
        onChangeText={(v) => {
          setSearch(v);
          setPage(1);
        }}
      />
      {canManage(user?.role) && (
        <Button
          title={text("Add member", "إضافة عضو")}
          icon="add"
          onPress={() =>
            router.push({
              pathname: "/(app)/editor",
              params: { kind: "members" },
            })
          }
        />
      )}
      <DataState query={q}>
        {q.data?.items.map((m) => (
          <ListRow
            key={m.id}
            icon="person-outline"
            title={m.fullName}
            subtitle={`${m.username} · ${m.branch?.name || ""}`}
            onPress={() =>
              router.push({ pathname: "/(app)/client", params: { id: m.id } })
            }
            trailing={
              <Badge good={m.status === "ACTIVE"}>
                {m.status === "ACTIVE"
                  ? text("Active", "نشط")
                  : text("Inactive", "غير نشط")}
              </Badge>
            }
          />
        ))}
        {!q.data?.items.length && (
          <Empty title={text("No clients found", "لا يوجد عملاء")} />
        )}
        <Row>
          {page > 1 && (
            <Button
              secondary
              title={text("Previous", "السابق")}
              onPress={() => setPage(page - 1)}
            />
          )}
          {q.data && page * 20 < q.data.total && (
            <Button
              secondary
              title={text("Next", "التالي")}
              onPress={() => setPage(page + 1)}
            />
          )}
        </Row>
      </DataState>
    </Screen>
  );
}
