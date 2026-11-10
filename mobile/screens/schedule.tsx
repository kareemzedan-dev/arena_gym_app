import { useTheme } from "../theme/use-theme";
import { z } from "zod";
import React, { useState } from "react";
import { View, Pressable } from "react-native";
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
import { MobileScheduleResponse } from "../api/class-availability";
import { mergeSchedule, seatsLeft, nextClassDate } from "../api/schedule";
import { today, addDays, dateLabel, timeLabel, canManage } from "../api/format";
export function Schedule() {
  const c = useTheme();
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
                    ? { borderColor: c.accent, backgroundColor: c.highlight }
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
      compact
      title={text("Find your energy.", "اكتشف طاقتك.")}
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
        <View
          role="table"
          accessibilityLabel={text("Available classes", "الحصص المتاحة")}
          testID="classes-table"
        >
          <TableHeader
            labels={[
              text("Class / Coach", "الحصة / المدرب"),
              text("Day / Time", "اليوم / الوقت"),
              text("Seats", "المقاعد"),
              text("Action", "الإجراء"),
            ]}
          />
          {q.data?.items.map((m) => (
            <ClassRow
              key={m.id}
              item={m}
              member={member}
              bookings={bookings.data?.items || []}
            />
          ))}
        </View>
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
          <Section title={text("My bookings", "حجوزاتي")} />
          <DataState query={bookings}>
            <View
              role="table"
              accessibilityLabel={text("My bookings", "حجوزاتي")}
              testID="bookings-table"
            >
              <TableHeader
                labels={[
                  text("Class", "الحصة"),
                  text("Date / Time", "التاريخ / الوقت"),
                  text("Status", "الحالة"),
                  text("Action", "الإجراء"),
                ]}
              />
              {bookings.data?.items.map((b) => (
                <Booking
                  key={b.id}
                  booking={b}
                  item={q.data?.items.find(
                    (item) => item.id === Number(b.data.classId),
                  )}
                />
              ))}
            </View>
            {!bookings.data?.items.length && (
              <Text muted>{text("No bookings yet", "لا توجد حجوزات بعد")}</Text>
            )}
          </DataState>
        </>
      )}
    </Screen>
  );
}

const columnWidths = [1.5, 1.25, 0.9, 0.85];
function TableHeader({ labels }: { labels: string[] }) {
  const c = useTheme();
  return (
    <View role="row">
      <Row
        style={{
          gap: 6,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderColor: c.line,
        }}
      >
        {labels.map((label, i) => (
          <View
            role="columnheader"
            key={label}
            style={{ flex: columnWidths[i], minWidth: 0 }}
          >
            <Text size={10} muted bold>
              {label}
            </Text>
          </View>
        ))}
      </Row>
    </View>
  );
}
function TableCells({ children }: { children: React.ReactNode[] }) {
  const c = useTheme();
  return (
    <Row
      style={{
        gap: 6,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: c.line,
        alignItems: "center",
      }}
    >
      {children.map((child, i) => (
        <View
          role="cell"
          key={i}
          style={{ flex: columnWidths[i], minWidth: 0 }}
        >
          {child}
        </View>
      ))}
    </Row>
  );
}
function TableAction({
  title,
  onPress,
  disabled = false,
}: {
  title: string;
  onPress(): void;
  disabled?: boolean;
}) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{
        minHeight: 44,
        justifyContent: "center",
        borderRadius: 10,
        paddingHorizontal: 3,
        backgroundColor: disabled ? c.raised : c.primary,
      }}
    >
      <Text
        bold
        size={10}
        style={{ color: disabled ? c.muted : c.ink, textAlign: "center" }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
function ClassRow({
  item,
  member,
  bookings,
}: {
  item: z.output<typeof ClassListResponse>["items"][number];
  member: boolean;
  bookings: z.output<typeof OperationResponse>[];
}) {
  const { text, ar } = usePrefs();
  const { user } = useSession();
  const router = useRouter();
  const [date, setDate] = useState(() => nextClassDate(item, today()));
  const [selected, setSelected] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const valid =
    dateOnly.safeParse(date).success &&
    date >= today() &&
    date >= item.startDate &&
    date <= item.endDate &&
    item.weekDays.includes(new Date(`${date}T12:00:00Z`).getUTCDay());
  const availability = useData(
    `/classes/schedule?from=${date}&to=${date}`,
    MobileScheduleResponse,
    valid,
  );
  const occurrence = availability.data?.find(
    (o) => o.id === item.id && o.date === date,
  );
  const remaining = seatsLeft(
    item.capacity,
    item.id,
    date,
    bookings,
    occurrence,
  );
  const alreadyBooked = bookings.some(
    (b) =>
      b.status !== "CANCELLED" &&
      Number(b.data.classId) === item.id &&
      b.data.date === date,
  );
  const save = useSave(
    "/operations/class-bookings",
    OperationResponse,
    "POST",
    () => {
      setConfirm(false);
      setSelected(false);
    },
  );
  const choose = () => {
    setSelected(true);
    setConfirm(false);
  };
  const disabled = !item.bookingEnabled || remaining === 0 || alreadyBooked;
  return (
    <View role="rowgroup">
      <View role="row">
        <TableCells>
          {[
            <Pressable
              onPress={choose}
              accessibilityRole="button"
              accessibilityLabel={text(
                `Select ${item.name}`,
                `اختيار ${item.name}`,
              )}
              style={{ minHeight: 44, justifyContent: "center" }}
            >
              <Text bold size={12}>
                {item.name}
              </Text>
              <Text muted size={10}>
                {item.coach?.fullName || "—"}
              </Text>
            </Pressable>,
            <Pressable onPress={choose}>
              <Text size={10}>{dateLabel(date, ar)}</Text>
              <Text muted size={10}>
                {item.startTime}–{item.endTime}
              </Text>
            </Pressable>,
            <Text size={10} muted>
              {remaining === 0
                ? text("Full", "مكتملة")
                : text(`${remaining} seats left`, `${remaining} مقعد فارغ`)}
            </Text>,
            member ? (
              <TableAction
                title={
                  alreadyBooked
                    ? text("Booked", "محجوزة")
                    : remaining === 0
                      ? text("Full", "مكتملة")
                      : text("Book", "احجز")
                }
                disabled={disabled}
                onPress={choose}
              />
            ) : canManage(user?.role) ? (
              <TableAction
                title={text("Edit", "تعديل")}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/editor",
                    params: { kind: "classes", id: item.id },
                  })
                }
              />
            ) : null,
          ]}
        </TableCells>
      </View>
      {member && selected && (
        <Card style={{ padding: 12, marginVertical: 8, gap: 10 }}>
          <Text bold>{item.name}</Text>
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
                "اختر يومًا من أيام الحصة ضمن فترة إتاحتها.",
              )}
            </Text>
          )}
          {valid && (
            <Text muted size={12}>
              {remaining === 0
                ? text("Full", "مكتملة")
                : text(`${remaining} seats left`, `${remaining} مقعد فارغ`)}
            </Text>
          )}
          <Button
            title={
              confirm
                ? text("Confirm booking", "تأكيد الحجز")
                : text("Continue", "متابعة")
            }
            disabled={!valid || disabled || availability.isFetching}
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
          <Button
            secondary
            title={text("Close", "إغلاق")}
            onPress={() => setSelected(false)}
          />
          {save.error && <Failure error={save.error} />}
        </Card>
      )}
      {save.isSuccess && (
        <Text accent size={12}>
          {text("Booking confirmed.", "تم تأكيد الحجز.")}
        </Text>
      )}
    </View>
  );
}
function Booking({
  booking: b,
  item,
}: {
  booking: z.output<typeof OperationResponse>;
  item?: z.output<typeof ClassListResponse>["items"][number];
}) {
  const { text, ar } = usePrefs();
  const parsedDate = dateOnly.safeParse(b.data.date);
  const bookingDate = parsedDate.success ? parsedDate.data : undefined;
  // A booking may refer to a class outside the current catalogue page or date range.
  const schedule = useData(
    `/classes/schedule?from=${bookingDate}&to=${bookingDate}`,
    MobileScheduleResponse,
    !!bookingDate && !item,
  );
  const bookedClass =
    item ??
    schedule.data?.find(
      (occurrence) => occurrence.id === Number(b.data.classId),
    );
  const [confirm, setConfirm] = useState(false);
  const save = useSave(
    `/operations/class-bookings/${b.id}`,
    OperationResponse,
    "PATCH",
    () => setConfirm(false),
  );
  const statuses: Record<string, [string, string]> = {
    ACTIVE: ["Confirmed", "مؤكدة"],
    CANCELLED: ["Cancelled", "ملغاة"],
    PENDING: ["Pending", "قيد الانتظار"],
    CLOSED: ["Completed", "مكتملة"],
    DRAFT: ["Draft", "مسودة"],
    SENT: ["Sent", "مرسلة"],
  };
  return (
    <View role="row">
      <TableCells>
        {[
          <Text size={12} bold>
            {b.title}
          </Text>,
          <View>
            <Text size={10}>
              {bookingDate ? dateLabel(bookingDate, ar) : "—"}
            </Text>
            <Text muted size={10}>
              {bookedClass?.startTime || "—"}
            </Text>
          </View>,
          <Text size={10} muted>
            {statuses[b.status] ? text(...statuses[b.status]) : b.status}
          </Text>,
          b.status !== "CANCELLED" ? (
            <TableAction
              title={
                confirm
                  ? text("Confirm cancellation", "تأكيد الإلغاء")
                  : text("Cancel", "إلغاء")
              }
              disabled={save.isPending}
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
          ) : null,
        ]}
      </TableCells>
      {save.error && <Failure error={save.error} />}
    </View>
  );
}
