import React, { useState } from "react";
import { View } from "react-native";
import { MeasurementChart } from "../components/measurement-chart";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MeasurementHistoryResponse, measurementFields } from "@arena/shared";
import { usePrefs } from "../state/preferences";
import { useSession } from "../state/session";
import { useData, DataState } from "../components/data";
import {
  Screen,
  Text,
  Card,
  Row,
  Stat,
  Section,
  ListRow,
  Empty,
  Chips,
  Badge,
  Button,
} from "../components/ui";
import { dateLabel, canManage, canFinance, canTrain } from "../api/format";
export const measurementNames: Record<string, [string, string]> = {
  weight: ["Weight", "الوزن"],
  height: ["Height", "الطول"],
  bodyFatPct: ["Body fat", "نسبة الدهون"],
  muscleMass: ["Muscle mass", "الكتلة العضلية"],
  chest: ["Chest", "الصدر"],
  waist: ["Waist", "الوسط"],
  hips: ["Hips", "الأرداف"],
  arm: ["Arm", "الذراع"],
  thigh: ["Thigh", "الفخذ"],
  calf: ["Calf", "ربلة الساق"],
  glutes: ["Glutes", "المؤخرة"],
  leg: ["Leg", "الساق"],
};
export default function Progress() {
  const { user } = useSession();
  return user?.role === "MEMBER" ? <Measurements /> : <Workspace />;
}
export function Measurements() {
  const { memberId } = useLocalSearchParams<{ memberId?: string }>();
  const { text, ar } = usePrefs();
  const { user } = useSession();
  const router = useRouter();
  const q = useData(
    memberId ? `/members/${memberId}/measurements` : "/me/measurements",
    MeasurementHistoryResponse,
  );
  const [metric, setMetric] =
    useState<(typeof measurementFields)[number]>("weight");
  const rows = [...(q.data || [])].sort(
    (a, b) =>
      b.measuredOn.localeCompare(a.measuredOn) ||
      b.createdAt.localeCompare(a.createdAt) ||
      b.id - a.id,
  );
  const recent = rows.find((r) => r[metric] !== null);
  const points = rows
    .filter((r) => r[metric] !== null)
    .slice(0, 10)
    .reverse();
  const unit =
    metric === "weight" || metric === "muscleMass"
      ? "kg"
      : metric === "bodyFatPct"
        ? "%"
        : "cm";
  return (
    <Screen
      back={!!memberId}
      title={text("Small steps. Real progress.", "خطوات صغيرة. تطور حقيقي.")}
      subtitle={text("YOUR PROGRESS", "تطورك")}
      onRefresh={() => void q.refetch()}
      refreshing={q.isRefetching}
    >
      {memberId && canTrain(user?.role) && (
        <Button
          title={text("Add measurement", "إضافة قياس")}
          onPress={() =>
            router.push({
              pathname: "/(app)/editor",
              params: { kind: "measurements", memberId },
            })
          }
        />
      )}
      <Chips
        value={metric}
        onChange={(v) => setMetric(v as typeof metric)}
        options={measurementFields.map((k) => ({
          value: k,
          label: text(...measurementNames[k]),
        }))}
      />
      <DataState query={q}>
        {recent ? (
          <>
            <Card>
              <Text muted>{text(...measurementNames[metric])}</Text>
              <Row>
                <Stat
                  value={recent[metric] ?? "—"}
                  label={dateLabel(recent.measuredOn, ar)}
                  unit={unit}
                />
                {recent.diff[metric] != null && (
                  <View>
                    <Text accent bold size={19}>
                      {Number(recent.diff[metric]) > 0 ? "+" : ""}
                      {recent.diff[metric]} {unit}
                    </Text>
                    <Text muted size={10}>
                      {text("vs. previous entry", "مقارنة بالقياس السابق")}
                    </Text>
                  </View>
                )}
              </Row>
              <MeasurementChart
                key={metric}
                unit={unit}
                points={points.map((p) => ({
                  date: p.measuredOn,
                  value: Number(p[metric]),
                }))}
              />
            </Card>
            <Section title={text("Your history", "سجل قياساتك")} />
            {rows.map((r) => (
              <Card key={r.id}>
                <Text bold>{dateLabel(r.measuredOn, ar)}</Text>
                <View
                  style={{
                    flexDirection: ar ? "row-reverse" : "row",
                    flexWrap: "wrap",
                    gap: 18,
                  }}
                >
                  {measurementFields
                    .filter((k) => r[k] !== null)
                    .map((k) => (
                      <View key={k} style={{ minWidth: "42%" }}>
                        <Text muted size={11}>
                          {text(...measurementNames[k])}
                        </Text>
                        <Text bold>
                          {r[k]}{" "}
                          <Text size={10} muted>
                            {k === "weight" || k === "muscleMass"
                              ? "kg"
                              : k === "bodyFatPct"
                                ? "%"
                                : "cm"}
                          </Text>
                        </Text>
                        {r.diff[k] !== null && (
                          <Text muted size={10}>
                            {Number(r.diff[k]) > 0 ? "+" : ""}
                            {r.diff[k]} {text("vs. previous", "عن السابق")}
                          </Text>
                        )}
                      </View>
                    ))}
                </View>
              </Card>
            ))}
          </>
        ) : (
          <Empty
            title={text(
              "Progress starts with a first step",
              "التطور يبدأ بالخطوة الأولى",
            )}
            detail={text(
              "Ask your coach to record your first measurements.",
              "اطلب من مدربك تسجيل قياساتك الأولى.",
            )}
            icon="stats-chart-outline"
          />
        )}
      </DataState>
    </Screen>
  );
}
export function Workspace() {
  const { text } = usePrefs();
  const { user } = useSession();
  const router = useRouter();
  const role = user?.role;
  const links: [string, string, string, boolean][] = [
    ["schedule", "Schedule", "جدول الحصص", true],
    ["classes", "Classes", "الحصص", canTrain(role)],
    ["attendance", "Take attendance", "تسجيل الحضور", canTrain(role)],
    ["workout-plans", "Workout plans", "خطط التمرين", canTrain(role)],
    ["exercises", "Exercise library", "التمارين", canTrain(role)],
    ["nutrition-plans", "Nutrition plans", "خطط التغذية", canTrain(role)],
    ["staff", "Coaches & team", "المدربون والفريق", canManage(role)],
    [
      "plan-categories",
      "Plan categories",
      "تصنيفات الاشتراكات",
      canManage(role),
    ],
    ["plans", "Membership plans", "خطط الاشتراكات", canManage(role)],
    ["pos", "New sale", "عملية بيع جديدة", canFinance(role)],
    [
      "invoices",
      "Invoices & payments",
      "الفواتير والمدفوعات",
      canFinance(role),
    ],
    ["reports", "Performance reports", "تقارير الأداء", canFinance(role)],
    ["notices", "Announcements", "الإعلانات", true],
    ["messages", "Messages", "الرسائل", true],
  ];
  return (
    <Screen
      title={text("Everything in its place.", "كل شيء في مكانه.")}
      subtitle={text("WORKSPACE", "مساحة العمل")}
    >
      <Text muted>
        {text(
          "The tools you need, wherever your day takes you.",
          "أدواتك معك أينما كنت.",
        )}
      </Text>
      {links
        .filter((x) => x[3])
        .map(([path, en, ar]) => (
          <ListRow
            key={path}
            title={text(en, ar)}
            icon="arrow-forward-circle-outline"
            onPress={() => router.push(`/(app)/${path}` as never)}
          />
        ))}
    </Screen>
  );
}
