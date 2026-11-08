import { z } from "zod";
import React, { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import {
  ClassListResponse,
  CoachScheduleResponse,
  CoachPtBookingListResponse,
  ScheduleResponse,
  OperationListResponse,
  OperationResponse,
  dateOnly,
} from "@arena/shared";
import { useSession } from "../state/session";
import { usePrefs } from "../state/preferences";
import { useData, useSave, DataState } from "../components/data";
import {
  Screen,
  Text,
  Card,
  Row,
  Button,
  Field,
  Badge,
  Empty,
  Section,
  Failure,
  ListRow,
} from "../components/ui";
import { mergeSchedule } from "../api/schedule";
import { today, addDays, dateLabel, timeLabel, canManage } from "../api/format";
export function Schedule() {
  const { user } = useSession();
  const { text, ar } = usePrefs();
  const [from, setFrom] = useState(today());
  const coach = user?.role === "STAFF_MEMBER";
  const valid = dateOnly.safeParse(from).success;
  const to = valid ? addDays(from, 6) : from;
  const q = useData(
    coach
      ? `/coaches/me/schedule?from=${from}&to=${to}`
      : `/classes/schedule?from=${from}&to=${to}`,
    coach ? CoachScheduleResponse : ScheduleResponse,
    valid,
  );
  const data = q.data;
  const classes = Array.isArray(data) ? data : data?.classes;
  const pt = useData(
    `/coaches/me/pt-bookings?from=${from}&to=${to}`,
    CoachPtBookingListResponse,
    valid && coach,
  );
  const entries = mergeSchedule(classes || [], coach ? pt.data || [] : []);
  return (
    <Screen
      back
      title={text("Make room for movement.", "وقت للحركة.")}
      subtitle={text("WEEKLY SCHEDULE", "الجدول الأسبوعي")}
      onRefresh={() => {
        void q.refetch();
        if (coach) void pt.refetch();
      }}
      refreshing={q.isRefetching || (coach && pt.isRefetching)}
    >
      <Field
        label={text("Week starts · YYYY-MM-DD", "بداية الأسبوع · YYYY-MM-DD")}
        value={from}
        onChangeText={setFrom}
      />
      {valid ? (
        <DataState query={q}>
          {coach && <DataState query={pt} />}
          {entries.map((entry) => {
            const s = entry.item;
            return (
              <Card
                key={`${entry.kind}-${s.id}-${s.startsAt}`}
                style={
                  entry.kind === "pt"
                    ? { borderColor: "#42D5C3", backgroundColor: "#203B34" }
                    : undefined
                }
              >
                <Badge>{dateLabel(s.startsAt, ar)}</Badge>
                {entry.kind === "pt" ? (
                  <>
                    <Text accent bold>
                      {text("Personal training", "تدريب شخصي")}
                    </Text>
                    <Text bold size={21}>
                      {entry.item.memberName}
                    </Text>
                  </>
                ) : (
                  <Text bold size={21}>
                    {entry.item.name}
                  </Text>
                )}
                <Text accent>
                  {timeLabel(s.startsAt, ar)} — {timeLabel(s.endsAt, ar)}
                </Text>
                <Text muted>
                  {entry.kind === "pt"
                    ? `${entry.item.coachName} · ${entry.item.status}`
                    : `${entry.item.coach?.fullName || ""} · ${entry.item.branch?.name || ""}`}
                </Text>
              </Card>
            );
          })}
          {!entries.length && (!coach || (!pt.isPending && !pt.error)) && (
            <Empty
              title={text(
                "A little room in your week",
                "لديك وقت متاح هذا الأسبوع",
              )}
              detail={text(
                "No sessions scheduled for this week.",
                "لا توجد حصص مسجلة لهذا الأسبوع.",
              )}
            />
          )}
        </DataState>
      ) : (
        <Text>
          {text("Enter a valid calendar date.", "أدخل تاريخًا صحيحًا.")}
        </Text>
      )}
    </Screen>
  );
}
export function Classes() {
  const { text, ar } = usePrefs();
  const { user } = useSession();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const q = useData(
    `/classes?pageSize=20&page=${page}&activeOn=${today()}`,
    ClassListResponse,
  );
  const member = user?.role === "MEMBER";
  const bookings = useData(
    "/operations/class-bookings?pageSize=100",
    OperationListResponse,
    member,
  );
  return (
    <Screen
      back
      title={text("Find your energy.", "اكتشفي طاقتك.")}
      subtitle={text("CLASSES", "الحصص")}
      onRefresh={() => {
        void q.refetch();
        void bookings.refetch();
      }}
      refreshing={q.isRefetching}
    >
      {canManage(user?.role) && (
        <Button
          title={text("Add class", "إضافة حصة")}
          onPress={() =>
            router.push({
              pathname: "/(app)/editor",
              params: { kind: "classes" },
            })
          }
        />
      )}
      <DataState query={q}>
        {q.data?.items.map((m) => (
          <ClassCard key={m.id} item={m} member={member} />
        ))}
        {!q.data?.items.length && (
          <Empty title={text("No classes available", "لا توجد حصص متاحة")} />
        )}
        <Row>
          {page > 1 && (
            <Button
              secondary
              title={text("Previous", "السابق")}
              onPress={() => setPage(page - 1)}
            />
          )}{" "}
          {q.data && page * 20 < q.data.total && (
            <Button
              secondary
              title={text("Next", "التالي")}
              onPress={() => setPage(page + 1)}
            />
          )}
        </Row>
      </DataState>
      {member && (
        <>
          <Section title={text("Your bookings", "حجوزاتك")} />
          <DataState query={bookings}>
            {bookings.data?.items.map((b) => (
              <Booking key={b.id} booking={b} />
            ))}
          </DataState>
        </>
      )}
    </Screen>
  );
}
function ClassCard({
  item,
  member,
}: {
  item: z.output<typeof ClassListResponse>["items"][number];
  member: boolean;
}) {
  const { text } = usePrefs();
  const { user } = useSession();
  const router = useRouter();
  const [date, setDate] = useState(today());
  const [confirm, setConfirm] = useState(false);
  const save = useSave(
    "/operations/class-bookings",
    OperationResponse,
    "POST",
    () => setConfirm(false),
  );
  const valid =
    dateOnly.safeParse(date).success &&
    date >= today() &&
    date >= item.startDate &&
    date <= item.endDate &&
    item.weekDays.includes(new Date(`${date}T12:00:00Z`).getUTCDay());
  return (
    <Card>
      <Badge>{item.coach?.fullName || text("Arena class", "حصة أرينا")}</Badge>
      <Text bold size={23}>
        {item.name}
      </Text>
      <Text accent>
        {item.startTime} — {item.endTime}
      </Text>
      <Text muted>
        {item.branch?.name} · {item.capacity} {text("places", "مكان")}
      </Text>
      <Text muted size={11}>
        {item.weekDays
          .map((d) =>
            text(
              ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d],
              [
                "الأحد",
                "الإثنين",
                "الثلاثاء",
                "الأربعاء",
                "الخميس",
                "الجمعة",
                "السبت",
              ][d],
            ),
          )
          .join(" · ")}
      </Text>
      {member && item.bookingEnabled && (
        <>
          <Field
            label={text("Book date · YYYY-MM-DD", "تاريخ الحجز · YYYY-MM-DD")}
            value={date}
            onChangeText={(v) => {
              setDate(v);
              setConfirm(false);
            }}
          />
          {!valid && (
            <Text size={11}>
              {text(
                "Choose a scheduled day within the class dates.",
                "اختر يومًا من أيام الحصة داخل فترة إتاحته.",
              )}
            </Text>
          )}
          {save.error && <Failure error={save.error} />}{" "}
          {save.isSuccess && (
            <Text accent>{text("Booking confirmed.", "تم تأكيد الحجز.")}</Text>
          )}
          <Button
            title={
              confirm
                ? text("Confirm booking", "تأكيد الحجز")
                : text("Book a place", "احجز مكانك")
            }
            disabled={!valid}
            busy={save.isPending}
            onPress={() =>
              confirm
                ? save.mutate({
                    title: item.name,
                    status: "ACTIVE",
                    branchId: item.branchId,
                    data: { classId: item.id, date, memberId: user!.id },
                  })
                : setConfirm(true)
            }
          />
        </>
      )}
      {canManage(user?.role) && (
        <Button
          secondary
          title={text("Edit class", "تعديل الحصة")}
          onPress={() =>
            router.push({
              pathname: "/(app)/editor",
              params: { kind: "classes", id: item.id },
            })
          }
        />
      )}
    </Card>
  );
}
function Booking({
  booking: b,
}: {
  booking: z.output<typeof OperationResponse>;
}) {
  const { text } = usePrefs();
  const [confirm, setConfirm] = useState(false);
  const save = useSave(
    `/operations/class-bookings/${b.id}`,
    OperationResponse,
    "PATCH",
  );
  return (
    <Card>
      <Text bold>{b.title}</Text>
      <Text muted>
        {String(b.data.date)} · {b.status}
      </Text>
      {b.status !== "CANCELLED" && (
        <Button
          secondary
          title={
            confirm
              ? text("Confirm cancellation", "تأكيد الإلغاء")
              : text("Cancel booking", "إلغاء الحجز")
          }
          busy={save.isPending}
          onPress={() =>
            confirm
              ? save.mutate({
                  title: b.title,
                  status: "CANCELLED",
                  branchId: b.branchId,
                  data: b.data,
                })
              : setConfirm(true)
          }
        />
      )}{" "}
      {save.error && <Failure error={save.error} />}
    </Card>
  );
}
