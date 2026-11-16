import React, { useState } from "react";
import { Linking, View } from "react-native";
import { FitnessArt } from "../components/fitness-art";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  MembershipResponse,
  MyCoachResponse,
  AttendanceListResponse,
  MemberResponse,
  AssignmentListResponse,
  NutritionListResponse,
} from "@arena/shared";
import { usePrefs } from "../state/preferences";
import { useSession } from "../state/session";
import { useData, DataState } from "../components/data";
import {
  Screen,
  Text,
  Card,
  Row,
  Button,
  ListRow,
  Section,
  Badge,
  Stat,
  Empty,
  Field,
} from "../components/ui";
import { dateLabel, canManage, canTrain } from "../api/format";
export function Membership() {
  const { text, ar } = usePrefs();
  const router = useRouter();
  const q = useData("/me/membership", MembershipResponse);
  const limitedPt = (q.data?.current ?? []).filter(
    (subscription) =>
      subscription.scope !== "GYM" &&
      subscription.status === "ACTIVE" &&
      !subscription.ptUnlimited,
  );
  return (
    <Screen
      back
      title={text("Your all-access story.", "رحلة عضويتك.")}
      subtitle={text("MEMBERSHIP", "العضوية")}
      onRefresh={() => void q.refetch()}
      refreshing={q.isRefetching}
    >
      <Button
        title={text("Check in with QR", "الدخول برمز QR")}
        icon="qr-code-outline"
        onPress={() => router.push("/(app)/checkin")}
      />
      <DataState query={q}>
        {limitedPt.length > 0 && (
          <Card>
            <Row>
              <Stat
                value={limitedPt.reduce((n, s) => n + s.ptUsed, 0)}
                label={text("PT sessions used", "جلسات مستخدمة")}
              />
              <Stat
                value={limitedPt.reduce((n, s) => n + s.ptRemaining, 0)}
                label={text("PT sessions left", "جلسات متبقية")}
              />
            </Row>
          </Card>
        )}
        {[
          ...(q.data?.current || []),
          ...(q.data?.upcoming || []),
          ...(q.data?.lastExpired ? [q.data.lastExpired] : []),
        ].map((m) => (
          <Card key={m.id}>
            <Row style={{ justifyContent: "space-between" }}>
              <Text bold size={22} style={{ flex: 1 }}>
                {m.planName}
              </Text>
              <Badge good={m.status === "ACTIVE"}>
                {m.upcoming
                  ? text("Upcoming", "قادم")
                  : m.status === "ACTIVE"
                    ? text("Active", "نشط")
                    : text("Expired", "منتهي")}
              </Badge>
            </Row>
            <Text muted>{m.scope}</Text>
            <Text>
              {dateLabel(m.startDate, ar)} — {dateLabel(m.endDate, ar)}
            </Text>
            {m.scope !== "PT" && !m.gymUnlimited && (
              <Text accent>
                {m.gymRemaining} / {m.gymVisitsTotal}{" "}
                {text("gym visits remaining", "زيارات جيم متبقية")}
              </Text>
            )}
            {m.scope !== "GYM" && !m.ptUnlimited && (
              <Text accent>
                {m.ptRemaining} / {m.ptSessionsTotal}{" "}
                {text("PT sessions remaining", "جلسات تدريب متبقية")}
              </Text>
            )}
          </Card>
        ))}
        {!q.data?.current.length &&
          !q.data?.upcoming.length &&
          !q.data?.lastExpired && (
            <Empty
              title={text("No membership yet", "لا يوجد اشتراك بعد")}
              detail={text(
                "Your gym reception can help you get started.",
                "تواصل مع استقبال النادي لبدء اشتراكك.",
              )}
            />
          )}
      </DataState>
    </Screen>
  );
}
export function Coach() {
  const { text } = usePrefs();
  const q = useData("/me/coach", MyCoachResponse);
  const m = q.data;
  return (
    <Screen
      back
      title={text("In your corner.", "معك في رحلتك.")}
      subtitle={text("YOUR COACH", "مدربتك")}
    >
      <DataState query={q}>
        {m ? (
          <Card>
            <FitnessArt icon="fitness-outline" size={210} />
            <Badge>{text("YOUR COACH", "مدربتك")}</Badge>
            <Text size={30} bold>
              {m.fullName}
            </Text>
            <Text accent>{m.specialty}</Text>
            {m.yearsExperience != null && (
              <Text muted>
                {m.yearsExperience} {text("years of experience", "سنوات خبرة")}
              </Text>
            )}
            {m.certifications && <Text>{m.certifications}</Text>}
            {m.mobile && (
              <Button
                secondary
                title={text("Call coach", "تواصلي مع مدربتك")}
                onPress={() =>
                  void Linking.openURL(
                    `tel:${m.mobile?.replace(/[^+\d]/g, "")}`,
                  )
                }
              />
            )}
          </Card>
        ) : (
          <Empty
            title={text("Your coach will be here", "ستظهر مدربتك هنا")}
            detail={text(
              "Reception will connect you with your coach.",
              "سيربط الاستقبال حسابك بمدربتك.",
            )}
          />
        )}
      </DataState>
    </Screen>
  );
}
export function History() {
  const { text, ar } = usePrefs();
  const { user } = useSession();
  const { memberId } = useLocalSearchParams<{ memberId?: string }>();
  const [page, setPage] = useState(1);
  const q = useData(
    `${user?.role === "MEMBER" ? "/me/attendance" : `/attendance${memberId ? `?memberId=${memberId}&` : "?"}`}${user?.role === "MEMBER" ? "?" : ""}page=${page}&pageSize=20`,
    AttendanceListResponse,
  );
  return (
    <Screen
      back
      title={text("Showing up counts.", "كل حضور يصنع فرقًا.")}
      subtitle={text("ATTENDANCE", "الحضور")}
    >
      <DataState query={q}>
        {q.data?.items.map((a) => (
          <ListRow
            key={a.id}
            title={dateLabel(a.attendedOn, ar)}
            subtitle={a.gymClass?.name || a.subscription?.planName || a.type}
            icon="checkmark-circle-outline"
          />
        ))}
        {!q.data?.items.length && (
          <Empty
            title={text("Your visits will appear here", "ستظهر زياراتك هنا")}
          />
        )}
        <Row>
          {page > 1 && (
            <Button
              secondary
              title={text("Previous", "السابق")}
              onPress={() => setPage(page - 1)}
            />
          )}{" "}
          {!!q.data && page * 20 < q.data.total && (
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
export function Client() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { text, ar } = usePrefs();
  const { user } = useSession();
  const router = useRouter();
  const q = useData(`/members/${id}`, MemberResponse);
  const w = useData(
    `/members/${id}/workouts`,
    AssignmentListResponse,
    canTrain(user?.role),
  );
  const n = useData(
    `/nutrition-plans?memberId=${id}&pageSize=100`,
    NutritionListResponse,
    canTrain(user?.role),
  );
  const editor = (kind: string) =>
    router.push({
      pathname: "/(app)/editor",
      params: { kind, memberId: id, ...(kind === "members" ? { id } : {}) },
    });
  return (
    <Screen
      back
      title={q.data?.fullName || text("Client", "العميل")}
      subtitle={text("CLIENT PROFILE", "ملف العميل")}
    >
      <DataState query={q}>
        {q.data && (
          <>
            <Card>
              <Badge good={q.data.status === "ACTIVE"}>
                {q.data.status === "ACTIVE"
                  ? text("Active", "نشط")
                  : text("Inactive", "غير نشط")}
              </Badge>
              <Text muted>{q.data.mobile || q.data.username}</Text>
              <Text>
                {q.data.branch?.name} ·{" "}
                {q.data.coach?.fullName ||
                  text("No coach assigned", "بدون مدرب")}
              </Text>
              <Row>
                <Stat
                  value={q.data.ptRemaining}
                  label={text("PT sessions left", "جلسات متبقية")}
                />
                <Stat
                  value={q.data.outstandingBalance}
                  label={text("Balance · OMR", "المتبقي · ر.ع.")}
                />
              </Row>
              {q.data.healthNotes && (
                <Text>
                  {text("Health notes: ", "ملاحظات صحية: ")}
                  {q.data.healthNotes}
                </Text>
              )}
            </Card>
            {canManage(user?.role) && (
              <Button
                secondary
                title={text("Edit client", "تعديل العميل")}
                onPress={() => editor("members")}
              />
            )}
            <ListRow
              title={text("Attendance history", "سجل الحضور")}
              onPress={() =>
                router.push({
                  pathname: "/(app)/history",
                  params: { memberId: id },
                })
              }
            />
            {canTrain(user?.role) && (
              <>
                <ListRow
                  title={text("Measurements & progress", "القياسات والتطور")}
                  onPress={() =>
                    router.push({
                      pathname: "/(app)/measurements",
                      params: { memberId: id },
                    })
                  }
                />
                <Button
                  title={text("Assign workout", "إسناد خطة تمرين")}
                  onPress={() => editor("assignments")}
                />
                <Button
                  secondary
                  title={text("Create nutrition plan", "إضافة خطة تغذية")}
                  onPress={() => editor("nutrition-plans")}
                />
                <Section title={text("Assigned workouts", "خطط التمارين")} />
                <DataState query={w}>
                  {w.data?.map((a) => (
                    <ListRow
                      key={a.id}
                      title={a.workoutPlan.name}
                      onPress={() =>
                        router.push({
                          pathname: "/(app)/workout",
                          params: { id: a.id, memberId: id },
                        })
                      }
                    />
                  ))}
                </DataState>
                <Section title={text("Nutrition plans", "خطط التغذية")} />
                <DataState query={n}>
                  {n.data?.items.map((p) => (
                    <ListRow
                      key={p.id}
                      title={p.name}
                      onPress={() =>
                        router.push({
                          pathname: "/(app)/editor",
                          params: {
                            kind: "nutrition-plans",
                            id: p.id,
                            memberId: id,
                          },
                        })
                      }
                    />
                  ))}
                </DataState>
              </>
            )}
          </>
        )}
      </DataState>
    </Screen>
  );
}
