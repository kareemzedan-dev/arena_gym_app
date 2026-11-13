import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  MembershipResponse,
  PtBookingListResponse,
  PtBookingResponse,
  PtSlotsResponse,
  dateOnly,
} from "@arena/shared";
import { api } from "../api";
import { activePtMemberships } from "../api/memberships";
import { today, dateLabel } from "../api/format";
import { useData, DataState } from "../components/data";
import { Screen, Text, Card, Button, Field, Chips, Section, Empty, Failure } from "../components/ui";
import { usePrefs } from "../state/preferences";

const coachesResponse = z.array(z.object({ id: z.number().int().positive(), name: z.string() }));

export default function PtBooking() {
  const { text, ar } = usePrefs();
  const client = useQueryClient();
  const [subscriptionId, setSubscriptionId] = useState(0);
  const [coachId, setCoachId] = useState(0);
  const [date, setDate] = useState(today());
  const [slot, setSlot] = useState("");
  const memberships = useData("/me/membership", MembershipResponse);
  const coaches = useData("/me/pt/coaches", coachesResponse);
  const bookings = useData("/me/pt/bookings?pageSize=100&sort=date", PtBookingListResponse);
  const validDate = dateOnly.safeParse(date).success && date >= today();
  const slots = useData(
    `/me/pt/slots?coachId=${coachId}&date=${date}`,
    PtSlotsResponse,
    coachId > 0 && validDate,
  );
  const eligible = activePtMemberships(memberships.data, date).filter(
    subscription => subscription.startDate <= date && subscription.endDate >= date &&
      (subscription.ptUnlimited || subscription.ptRemaining >
        (bookings.data?.items.filter(booking => booking.subscriptionId === subscription.id && booking.status === "SCHEDULED").length ?? 0)),
  );
  const selectedSubscription = eligible.find(subscription => subscription.id === subscriptionId);
  const selectedSlot = slots.data?.find(item => item.startTime === slot);
  const create = useMutation({
    mutationFn: () => api.request("/me/pt/bookings", PtBookingResponse, {
      method: "POST",
      body: JSON.stringify({
        subscriptionId,
        coachId,
        sessionDate: date,
        startTime: selectedSlot?.startTime,
        endTime: selectedSlot?.endTime,
      }),
    }),
    onSuccess: () => {
      setSlot("");
      void client.invalidateQueries({ queryKey: ["api"] });
    },
  });
  const cancel = useMutation({
    mutationFn: (id: number) => api.request(`/me/pt/bookings/${id}/cancel`, PtBookingResponse, { method: "PATCH" }),
    onSuccess: () => void client.invalidateQueries({ queryKey: ["api"] }),
  });
  return (
    <Screen
      back
      title={text("Personal training", "التدريب الشخصي")}
      subtitle={text("BOOK A SESSION", "احجزي جلسة")}
      onRefresh={() => {
        void memberships.refetch();
        void coaches.refetch();
        void bookings.refetch();
        if (coachId && validDate) void slots.refetch();
      }}
      refreshing={memberships.isRefetching || bookings.isRefetching}
    >
      <DataState query={memberships}>
        {!eligible.length ? (
          <Empty
            title={text("No PT sessions available", "لا توجد جلسات تدريب شخصي متاحة")}
            detail={text("An active personal training plan with available sessions is required.", "يلزم اشتراك تدريب شخصي سارٍ وله جلسات متاحة.")}
          />
        ) : (
          <>
            <Section title={text("Choose your plan", "اختاري الباقة")} />
            <Chips
              value={String(subscriptionId)}
              onChange={value => { setSubscriptionId(Number(value)); setSlot(""); }}
              options={eligible.map(subscription => ({ value: String(subscription.id), label: subscription.planName }))}
            />
            {selectedSubscription && !selectedSubscription.ptUnlimited && (
              <Text muted>{text(`${selectedSubscription.ptRemaining} sessions remaining`, `${selectedSubscription.ptRemaining} جلسة متبقية`)}</Text>
            )}
            <Section title={text("Choose a trainer", "اختاري المدربة")} />
            <DataState query={coaches}>
              {coaches.data?.length ? (
                <Chips
                  value={String(coachId)}
                  onChange={value => { setCoachId(Number(value)); setSlot(""); }}
                  options={coaches.data.map(coach => ({ value: String(coach.id), label: coach.name }))}
                />
              ) : <Text muted>{text("No trainer is available for your branch.", "لا توجد مدربة متاحة في فرعك.")}</Text>}
            </DataState>
            <Field label={text("Session date · YYYY-MM-DD", "تاريخ الجلسة · YYYY-MM-DD")} value={date} onChangeText={value => { setDate(value); setSlot(""); }} />
            {!validDate && <Text accessibilityRole="alert">{text("Choose today or a future date.", "اختاري اليوم أو تاريخًا قادمًا.")}</Text>}
            {coachId > 0 && validDate && (
              <>
                <Section title={text("Available times", "المواعيد المتاحة")} />
                <DataState query={slots}>
                  {slots.data?.length ? (
                    <Chips
                      value={slot}
                      onChange={setSlot}
                      options={slots.data.map(item => ({ value: item.startTime, label: `${item.startTime}–${item.endTime}` }))}
                    />
                  ) : <Text muted>{text("No times available on this date.", "لا توجد مواعيد متاحة في هذا اليوم.")}</Text>}
                </DataState>
              </>
            )}
            {create.error && <Failure error={create.error} retry={() => create.reset()} />}
            <Button
              title={text("Book personal training", "احجزي التدريب الشخصي")}
              disabled={!selectedSubscription || !coachId || !selectedSlot || !validDate || bookings.isPending}
              busy={create.isPending}
              onPress={() => create.mutate()}
            />
          </>
        )}
      </DataState>
      <Section title={text("My PT bookings", "حجوزات التدريب الشخصي")} />
      <DataState query={bookings}>
        {bookings.data?.items.map(booking => (
          <Card key={booking.id}>
            <Text bold>{booking.coach.name} · {booking.planName}</Text>
            <Text>{dateLabel(booking.sessionDate, ar)} · {booking.startTime}–{booking.endTime}</Text>
            <Text muted>{booking.status === "SCHEDULED" ? text("Scheduled", "محجوزة") : booking.status === "CANCELLED" ? text("Cancelled", "ملغاة") : booking.status}</Text>
            {booking.status === "SCHEDULED" && booking.sessionDate >= today() && (
              <Button
                secondary
                title={text("Cancel booking", "إلغاء الحجز")}
                busy={cancel.isPending}
                onPress={() => cancel.mutate(booking.id)}
              />
            )}
          </Card>
        ))}
        {!bookings.data?.items.length && <Text muted>{text("No bookings yet", "لا توجد حجوزات بعد")}</Text>}
      </DataState>
      {cancel.error && <Failure error={cancel.error} retry={() => cancel.reset()} />}
    </Screen>
  );
}
