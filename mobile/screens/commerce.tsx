import React, { useState, useEffect } from "react";
import { View, Linking } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { z } from "zod";
import {
  PosCatalogResponse,
  PosQuoteResponse,
  CheckoutRequest,
  InvoiceListResponse,
  InvoiceResponse,
  InvoiceUpdateRequest,
  InvoiceShareResponse,
  PaymentRequest,
  ProfitReportResponse,
  RevenueResponse,
  SubscriptionSalesResponse,
  OutstandingResponse,
  MembersReportResponse,
  dateOnly,
} from "@arena/shared";
import { api } from "../api";
import { ApiError } from "../api/client";
import { money, today, dateLabel, canManage, safeHttpUrl } from "../api/format";
import { usePrefs } from "../state/preferences";
import { useSession } from "../state/session";
import { useData, useSave, DataState } from "../components/data";
import {
  Screen,
  Text,
  Card,
  Row,
  Field,
  Button,
  Chips,
  Failure,
  Stat,
  ListRow,
  Empty,
  Section,
  Badge,
} from "../components/ui";
import { Picker } from "../components/picker";
import { useTheme } from "../theme/use-theme";
export function Pos() {
  const c = useTheme();
  const { text } = usePrefs();
  const router = useRouter();
  const [member, setMember] = useState<number | null>(null);
  const [scope, setScope] = useState("GYM");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [start, setStart] = useState(today());
  const [discount, setDiscount] = useState("0");
  const [tax, setTax] = useState("0");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [confirmed, setConfirmed] = useState(false);
  const q = useData(
    `/pos/catalog?scope=${scope}&search=${encodeURIComponent(search)}`,
    PosCatalogResponse,
  );
  const input = {
    memberId: member,
    items: selected.map((planId) => ({
      type: "PLAN" as const,
      planId,
      startDate: start,
    })),
    discount,
    tax,
  };
  const valid = CheckoutRequest.safeParse(input);
  const quote = useDataQuote(valid.success ? valid.data : null);
  const save = useSave("/pos/checkout", InvoiceResponse, "POST", (d) =>
    router.replace({ pathname: "/(app)/invoice", params: { id: d.id } }),
  );
  const uncertain = save.error instanceof ApiError && save.error.status === 0;
  return (
    <Screen
      back
      title={text("A new beginning.", "بداية جديدة.")}
      subtitle={text("NEW SALE", "عملية بيع جديدة")}
    >
      <Picker
        label={text("Member", "العضو")}
        endpoint="/members"
        value={member}
        onChange={(v) => {
          setMember(v as number | null);
          setConfirmed(false);
        }}
      />
      <Chips
        value={scope}
        onChange={setScope}
        options={[
          { value: "GYM", label: text("Gym", "النادي") },
          { value: "PT", label: text("Personal training", "تدريب شخصي") },
          { value: "BUNDLE", label: text("Bundle", "باقة") },
        ]}
      />
      <Field
        label={text("Find a plan", "ابحث عن اشتراك")}
        value={search}
        onChangeText={setSearch}
      />
      <DataState query={q}>
        {q.data?.categories
          .flatMap((c) => c.plans)
          .map((p) => (
            <ListRow
              key={p.id}
              title={p.name}
              subtitle={`${money(p.price)} OMR · ${p.durationDays} ${text("days", "يوم")}`}
              icon={
                selected.includes(p.id) ? "checkmark-circle" : "ellipse-outline"
              }
              onPress={() => {
                setSelected(
                  selected.includes(p.id)
                    ? selected.filter((id) => id !== p.id)
                    : [...selected, p.id],
                );
                setConfirmed(false);
              }}
            />
          ))}
      </DataState>
      {selected.length > 0 && (
        <Card>
          <Text bold>
            {selected.length} {text("plans selected", "اشتراكات مختارة")}
          </Text>
          <Button
            secondary
            title={text("Clear cart", "تفريغ السلة")}
            onPress={() => {
              setSelected([]);
              setConfirmed(false);
            }}
          />
        </Card>
      )}
      <Field
        label={text("Starts · YYYY-MM-DD", "البداية · YYYY-MM-DD")}
        value={start}
        onChangeText={(v) => {
          setStart(v);
          setConfirmed(false);
        }}
      />
      <Field
        label={text("Discount · OMR", "الخصم · ر.ع.")}
        value={discount}
        onChangeText={(v) => {
          setDiscount(v);
          setConfirmed(false);
        }}
        keyboardType="decimal-pad"
      />
      <Field
        label={text("Tax · OMR", "الضريبة · ر.ع.")}
        value={tax}
        onChangeText={(v) => {
          setTax(v);
          setConfirmed(false);
        }}
        keyboardType="decimal-pad"
      />
      {valid.success && (
        <DataState query={quote}>
          <Card>
            <Text muted>{text("Total from checkout", "إجمالي العملية")}</Text>
            <Text size={32} bold>
              {money(quote.data?.total)} <Text size={13}>OMR</Text>
            </Text>
          </Card>
        </DataState>
      )}
      <Field
        label={text(
          "Collected now · OMR (blank = unpaid)",
          "المحصل الآن · ر.ع. (فارغ = غير مدفوع)",
        )}
        value={amount}
        onChangeText={(v) => {
          setAmount(v);
          setConfirmed(false);
        }}
        keyboardType="decimal-pad"
      />
      <Chips
        value={method}
        onChange={(v) => {
          setMethod(v);
          setConfirmed(false);
        }}
        options={[
          { value: "CASH", label: text("Cash", "نقدًا") },
          { value: "CARD", label: text("Card", "بطاقة") },
          { value: "BANK_TRANSFER", label: text("Transfer", "تحويل") },
        ]}
      />
      {confirmed && (
        <Text>
          {text(
            "Confirm the member, selected plans and amount collected before completing this sale.",
            "راجع العضو والاشتراكات والمبلغ المحصل قبل إتمام البيع.",
          )}
        </Text>
      )}
      {save.error && <Failure error={save.error} />}{" "}
      {uncertain && (
        <Text style={{ color: c.red }}>
          {text(
            "The response was lost. Check invoices before making another sale to avoid a duplicate.",
            "الرد لم يصل. راجع الفواتير قبل أي عملية جديدة لتجنب تكرار البيع.",
          )}
        </Text>
      )}
      <Button
        title={
          confirmed
            ? text("Complete sale", "إتمام البيع")
            : text("Review sale", "مراجعة البيع")
        }
        busy={save.isPending}
        disabled={
          !valid.success ||
          !quote.data ||
          !!quote.error ||
          quote.isFetching ||
          uncertain ||
          (!!amount && !PaymentRequest.safeParse({ amount, method }).success)
        }
        onPress={() => {
          if (!confirmed) {
            setConfirmed(true);
            return;
          }
          const parsed = CheckoutRequest.safeParse({
            ...input,
            ...(amount ? { payment: { amount, method } } : {}),
          });
          if (parsed.success) save.mutate(parsed.data);
        }}
      />
    </Screen>
  );
}
import { useQuery } from "@tanstack/react-query";
function useDataQuote(input: unknown) {
  return useQuery({
    queryKey: ["api", "quote", input],
    queryFn: () =>
      api.request("/pos/quote", PosQuoteResponse, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    enabled: !!input,
    retry: false,
  });
}
export function Invoices() {
  const { user } = useSession();
  const { text, ar } = usePrefs();
  const router = useRouter();
  const member = user?.role === "MEMBER";
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const valid =
    (!from || dateOnly.safeParse(from).success) &&
    (!to || dateOnly.safeParse(to).success) &&
    (!from || !to || from <= to);
  const q = useData(
    `${member ? "/me/invoices" : "/invoices"}?pageSize=20&page=${page}&search=${encodeURIComponent(search)}${status ? `&status=${status}` : ""}${from ? `&from=${from}` : ""}${to ? `&to=${to}` : ""}`,
    InvoiceListResponse,
    valid,
  );
  return (
    <Screen
      back
      title={text("Every detail, clear.", "كل التفاصيل واضحة.")}
      subtitle={text("INVOICES & PAYMENTS", "الفواتير والمدفوعات")}
      onRefresh={() => void q.refetch()}
      refreshing={q.isRefetching}
    >
      <Field
        label={text("Search invoices", "ابحث في الفواتير")}
        value={search}
        onChangeText={(v) => {
          setSearch(v);
          setPage(1);
        }}
      />
      <Chips
        value={status}
        onChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        options={[
          { value: "", label: text("All", "الكل") },
          ...["PAID", "PARTIAL", "UNPAID", "VOID"].map((value, i) => ({
            value,
            label: text(
              ["Paid", "Partial", "Unpaid", "Void"][i],
              ["مدفوع", "جزئي", "غير مدفوع", "ملغي"][i],
            ),
          })),
        ]}
      />
      <Field
        label={text(
          "From · YYYY-MM-DD (optional)",
          "من · YYYY-MM-DD (اختياري)",
        )}
        value={from}
        onChangeText={setFrom}
      />
      <Field
        label={text("To · YYYY-MM-DD (optional)", "إلى · YYYY-MM-DD (اختياري)")}
        value={to}
        onChangeText={setTo}
      />
      {!valid ? (
        <Text>{text("Enter a valid date range.", "أدخل فترة صحيحة.")}</Text>
      ) : (
        <DataState query={q}>
          {q.data?.items.map((i) => (
            <Card key={i.id}>
              <Row style={{ justifyContent: "space-between" }}>
                <Text bold size={19}>
                  {i.number}
                </Text>
                <Badge good={i.status === "PAID"}>{i.status}</Badge>
              </Row>
              <Text muted size={11}>
                {i.member.fullName} · {dateLabel(i.issuedAt, ar)}
              </Text>
              <Row>
                <Stat
                  value={money(i.total)}
                  label={text("Total · OMR", "الإجمالي · ر.ع.")}
                />
                <Stat
                  value={money(i.due)}
                  label={text("Due · OMR", "المتبقي · ر.ع.")}
                />
              </Row>
              <Text muted size={12}>
                {text("Paid", "المدفوع")}: {money(i.paid)} OMR ·{" "}
                {i.lastPaymentMethod || "—"}
              </Text>
              {!member && (
                <Button
                  secondary
                  title={text("Invoice details", "تفاصيل الفاتورة")}
                  onPress={() =>
                    router.push({
                      pathname: "/(app)/invoice",
                      params: { id: i.id },
                    })
                  }
                />
              )}
            </Card>
          ))}
          {!q.data?.items.length && (
            <Empty title={text("No invoices found", "لا توجد فواتير")} />
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
      )}
    </Screen>
  );
}
export function Invoice() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { text, ar } = usePrefs();
  const { user } = useSession();
  const router = useRouter();
  const q = useData(`/invoices/${id}`, InvoiceResponse);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [confirm, setConfirm] = useState(false);
  const save = useSave(
    `/invoices/${id}/payments`,
    InvoiceResponse,
    "POST",
    () => {
      setAmount("");
      setConfirm(false);
    },
  );
  const share = useSave(`/invoices/${id}/share`, InvoiceShareResponse, "POST");
  const i = q.data;
  const valid = PaymentRequest.safeParse({ amount, method });
  return (
    <Screen
      back
      title={i?.number || text("Invoice", "الفاتورة")}
      onRefresh={() => void q.refetch()}
      refreshing={q.isRefetching}
    >
      <DataState query={q}>
        {i && (
          <>
            <Card>
              <Badge good={i.status === "PAID"}>{i.status}</Badge>
              <Text bold size={22}>
                {i.member.fullName}
              </Text>
              <Text muted>
                {dateLabel(i.issuedAt, ar)} · {i.branch?.name}
              </Text>
              {i.lines.map((l) => (
                <Row key={l.id} style={{ justifyContent: "space-between" }}>
                  <Text style={{ flex: 1 }}>
                    {l.quantity} × {l.description}
                  </Text>
                  <Text>{money(l.lineTotal)}</Text>
                </Row>
              ))}
              <Text muted>
                {text("Discount", "الخصم")}: {money(i.discount)} ·{" "}
                {text("Tax", "الضريبة")}: {money(i.tax)}
              </Text>
              <Text bold size={30}>
                {money(i.total)} OMR
              </Text>
              <Row>
                <Stat value={money(i.paid)} label={text("Paid", "المدفوع")} />
                <Stat value={money(i.due)} label={text("Due", "المتبقي")} />
              </Row>
              {i.notes && <Text muted>{i.notes}</Text>}
            </Card>
            <Section title={text("Payments", "المدفوعات")} />
            {i.payments.map((p) => (
              <ListRow
                key={p.id}
                title={`${money(p.amount)} OMR · ${p.method}`}
                subtitle={dateLabel(p.paidAt, ar)}
              />
            ))}
            {Number(i.due) > 0 && i.status !== "VOID" && (
              <Card>
                <Text bold>{text("Collect payment", "تحصيل دفعة")}</Text>
                <Field
                  label={text("Amount · OMR", "المبلغ · ر.ع.")}
                  value={amount}
                  onChangeText={(v) => {
                    setAmount(v);
                    setConfirm(false);
                  }}
                  keyboardType="decimal-pad"
                />
                <Chips
                  value={method}
                  onChange={(v) => {
                    setMethod(v);
                    setConfirm(false);
                  }}
                  options={[
                    { value: "CASH", label: text("Cash", "نقدًا") },
                    { value: "CARD", label: text("Card", "بطاقة") },
                    {
                      value: "BANK_TRANSFER",
                      label: text("Transfer", "تحويل"),
                    },
                  ]}
                />
                {save.error && <Failure error={save.error} />}
                <Button
                  title={
                    confirm
                      ? text("Confirm payment", "تأكيد الدفعة")
                      : text("Review payment", "مراجعة الدفعة")
                  }
                  disabled={
                    !valid.success ||
                    Number(amount) <= 0 ||
                    Number(amount) > Number(i.due) ||
                    (save.error instanceof ApiError && save.error.status === 0)
                  }
                  busy={save.isPending}
                  onPress={() => {
                    if (!confirm) setConfirm(true);
                    else if (valid.success) save.mutate(valid.data);
                  }}
                />
              </Card>
            )}
            {canManage(user?.role) && (
              <Button
                secondary
                title={text("Edit invoice", "تعديل الفاتورة")}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/invoice-edit",
                    params: { id },
                  })
                }
              />
            )}
            <Button
              secondary
              title={text(
                "Prepare invoice sharing link",
                "تجهيز رابط مشاركة الفاتورة",
              )}
              busy={share.isPending}
              onPress={() => share.mutate({})}
            />
            {share.error && <Failure error={share.error} />}{" "}
            {share.data && (
              <>
                <Button
                  secondary
                  title={text("Open invoice PDF", "فتح الفاتورة PDF")}
                  onPress={() => {
                    const url = safeHttpUrl(share.data!.url);
                    if (url) void Linking.openURL(url);
                  }}
                />
                {share.data.whatsappUrl && (
                  <Button
                    secondary
                    title={text("Share with WhatsApp", "مشاركة عبر واتساب")}
                    onPress={() => {
                      const url = safeHttpUrl(share.data!.whatsappUrl!);
                      if (url) void Linking.openURL(url);
                    }}
                  />
                )}
              </>
            )}
          </>
        )}
      </DataState>
    </Screen>
  );
}
export function InvoiceEdit() {
  const c = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { text } = usePrefs();
  const router = useRouter();
  const q = useData(`/invoices/${id}`, InvoiceResponse);
  const [v, setV] = useState<z.input<typeof InvoiceUpdateRequest> | null>(null);
  const [error, setError] = useState("");
  const [correct, setCorrect] = useState(false);
  useEffect(() => {
    if (q.data) {
      const i = q.data;
      setV({
        number: i.number,
        memberId: i.memberId,
        branchId: i.branchId,
        issuedAt: i.issuedAt,
        discount: i.discount,
        tax: i.tax,
        notes: i.notes,
        expectedUpdatedAt: i.updatedAt,
        lines: i.lines.map(
          ({ description, planId, productId, quantity, unitPrice }) => ({
            description,
            planId,
            productId,
            quantity,
            unitPrice,
          }),
        ),
        payments: i.payments.map(({ id, amount, method, paidAt, note }) => ({
          id,
          amount,
          method,
          paidAt,
          note,
        })),
      });
    }
  }, [q.data]);
  const save = useSave(`/invoices/${id}`, InvoiceResponse, "PATCH", () =>
    router.back(),
  );
  function set(key: string, value: unknown) {
    setV((old) => ({ ...old, [key]: value }));
  }
  return (
    <Screen back title={text("Correct the record.", "تصحيح الفاتورة.")}>
      <DataState query={q}>
        {v && (
          <>
            <Field
              label={text("Invoice number", "رقم الفاتورة")}
              value={v.number}
              onChangeText={(s) => set("number", s)}
            />
            <Picker
              label={text("Member", "العضو")}
              endpoint="/members"
              value={v.memberId}
              onChange={(s) => set("memberId", s)}
            />
            <Picker
              label={text("Branch", "الفرع")}
              endpoint="/branches/active"
              value={v.branchId}
              onChange={(s) => set("branchId", s)}
            />
            <Field
              label={text(
                "Issued at · UTC ISO timestamp",
                "تاريخ الإصدار · UTC ISO",
              )}
              value={v.issuedAt}
              onChangeText={(s) => set("issuedAt", s)}
            />
            <Section title={text("Invoice lines", "بنود الفاتورة")} />
            {v.lines?.map((l, index) => (
              <Card key={index}>
                {[
                  ["description", "Description", "الوصف"],
                  ["quantity", "Quantity", "الكمية"],
                  ["unitPrice", "Unit price · OMR", "سعر الوحدة · ر.ع."],
                ].map(([key, en, ar]) => (
                  <Field
                    key={key}
                    label={text(en, ar)}
                    value={String(l[key as keyof typeof l] ?? "")}
                    onChangeText={(s) =>
                      set(
                        "lines",
                        v.lines?.map((row, n) =>
                          n === index
                            ? {
                                ...row,
                                [key]: key === "quantity" ? Number(s) : s,
                              }
                            : row,
                        ),
                      )
                    }
                  />
                ))}
                <Button
                  secondary
                  title={text("Remove line", "حذف البند")}
                  onPress={() =>
                    set(
                      "lines",
                      v.lines?.filter((_, n) => n !== index),
                    )
                  }
                />
              </Card>
            ))}
            <Button
              secondary
              title={text("Add line", "إضافة بند")}
              onPress={() =>
                set("lines", [
                  ...(v.lines || []),
                  { description: "", quantity: 1, unitPrice: "0" },
                ])
              }
            />
            {[
              ["discount", "Discount · OMR", "الخصم · ر.ع."],
              ["tax", "Tax · OMR", "الضريبة · ر.ع."],
              ["notes", "Notes", "ملاحظات"],
            ].map(([key, en, ar]) => (
              <Field
                key={key}
                label={text(en, ar)}
                value={String(v[key as keyof typeof v] ?? "")}
                onChangeText={(s) => set(key, s)}
              />
            ))}
            <Button
              secondary
              title={
                correct
                  ? text(
                      "Keep original payments",
                      "الاحتفاظ بالمدفوعات الأصلية",
                    )
                  : text("Correct recorded payments", "تصحيح المدفوعات المسجلة")
              }
              onPress={() => setCorrect(!correct)}
            />
            {correct && (
              <>
                <Text muted size={12}>
                  {text(
                    "These are record corrections, not bank refunds. Retain every payment that should remain.",
                    "هذه تصحيحات للسجلات وليست عمليات استرداد بنكية. احتفظ بكل دفعة صحيحة.",
                  )}
                </Text>
                <Field
                  label={text("Correction reason", "سبب التصحيح")}
                  value={v.correctionReason || ""}
                  onChangeText={(s) => set("correctionReason", s)}
                />
                {v.payments?.map((p, index) => (
                  <Card key={index}>
                    <Field
                      label={text("Amount · OMR", "المبلغ · ر.ع.")}
                      value={String(p.amount)}
                      onChangeText={(amount) =>
                        set(
                          "payments",
                          v.payments?.map((row, n) =>
                            n === index ? { ...row, amount } : row,
                          ),
                        )
                      }
                    />
                    <Field
                      label={text(
                        "Payment date · UTC ISO",
                        "تاريخ الدفع · UTC ISO",
                      )}
                      value={p.paidAt}
                      onChangeText={(paidAt) =>
                        set(
                          "payments",
                          v.payments?.map((row, n) =>
                            n === index ? { ...row, paidAt } : row,
                          ),
                        )
                      }
                    />
                    <Chips
                      value={p.method}
                      onChange={(method) =>
                        set(
                          "payments",
                          v.payments?.map((row, n) =>
                            n === index ? { ...row, method } : row,
                          ),
                        )
                      }
                      options={["CASH", "CARD", "BANK_TRANSFER", "LEGACY"].map(
                        (value) => ({ value, label: value }),
                      )}
                    />
                    <Field
                      label={text("Payment note", "ملاحظة الدفعة")}
                      value={p.note || ""}
                      onChangeText={(note) =>
                        set(
                          "payments",
                          v.payments?.map((row, n) =>
                            n === index ? { ...row, note } : row,
                          ),
                        )
                      }
                    />
                    <Button
                      secondary
                      title={text("Remove payment", "حذف الدفعة")}
                      onPress={() =>
                        set(
                          "payments",
                          v.payments?.filter((_, n) => n !== index),
                        )
                      }
                    />
                  </Card>
                ))}
                <Button
                  secondary
                  title={text("Add payment record", "إضافة سجل دفعة")}
                  onPress={() =>
                    set("payments", [
                      ...(v.payments || []),
                      {
                        amount: "",
                        method: "CASH",
                        paidAt: new Date().toISOString(),
                      },
                    ])
                  }
                />
              </>
            )}
            {error && <Text style={{ color: c.red }}>{error}</Text>}
            {save.error && (
              <Failure error={save.error} retry={() => void q.refetch()} />
            )}
            <Button
              title={text("Save corrections", "حفظ التصحيحات")}
              busy={save.isPending}
              onPress={() => {
                const body = { ...v };
                if (!correct) {
                  delete body.payments;
                  delete body.correctionReason;
                }
                const parsed = InvoiceUpdateRequest.safeParse(body);
                if (!parsed.success) {
                  setError(
                    parsed.error.issues
                      .map((i) => `${i.path.join(".")}: ${i.message}`)
                      .join("\n"),
                  );
                  return;
                }
                setError("");
                save.mutate(parsed.data);
              }}
            />
          </>
        )}
      </DataState>
    </Screen>
  );
}
export function Reports() {
  const { text } = usePrefs();
  const [from, setFrom] = useState(today().slice(0, 8) + "01");
  const [to, setTo] = useState(today());
  const [branch, setBranch] = useState<number | null>(null);
  const [granularity, setGranularity] = useState("day");
  const [kind, setKind] = useState("profit");
  const [page, setPage] = useState(1);
  const schemas = {
    profit: ProfitReportResponse,
    revenue: RevenueResponse,
    subscriptions: SubscriptionSalesResponse,
    outstanding: OutstandingResponse,
    members: MembersReportResponse,
  };
  const valid =
    dateOnly.safeParse(from).success &&
    dateOnly.safeParse(to).success &&
    from <= to;
  const q = useData(
    `/reports/${kind}?from=${from}&to=${to}${["profit", "revenue"].includes(kind) ? `&granularity=${granularity}` : ""}${["outstanding", "members"].includes(kind) ? `&page=${page}&pageSize=20` : ""}${branch ? `&branchId=${branch}` : ""}`,
    schemas[kind as keyof typeof schemas],
    valid,
  );
  const d = q.data as any;
  return (
    <Screen
      back
      title={text("A clearer perspective.", "صورة أوضح.")}
      subtitle={text("REPORTS", "التقارير")}
    >
      <Chips
        value={kind}
        onChange={(v) => {
          setKind(v);
          setPage(1);
        }}
        options={Object.keys(schemas).map((value, i) => ({
          value,
          label: text(
            ["Profit", "Revenue", "Memberships", "Balances", "Members"][i],
            ["الأرباح", "الإيرادات", "الاشتراكات", "المتبقي", "الأعضاء"][i],
          ),
        }))}
      />
      <Field
        label={text("From · YYYY-MM-DD", "من · YYYY-MM-DD")}
        value={from}
        onChangeText={setFrom}
      />
      <Field
        label={text("To · YYYY-MM-DD", "إلى · YYYY-MM-DD")}
        value={to}
        onChangeText={setTo}
      />
      <Picker
        label={text("Branch · all if empty", "الفرع · الكل إذا فارغ")}
        endpoint="/branches/active"
        value={branch}
        onChange={(v) => setBranch(v as number | null)}
      />
      {["profit", "revenue"].includes(kind) && (
        <Chips
          value={granularity}
          onChange={setGranularity}
          options={[
            { value: "day", label: text("Daily", "يومي") },
            { value: "month", label: text("Monthly", "شهري") },
            { value: "year", label: text("Yearly", "سنوي") },
          ]}
        />
      )}{" "}
      {valid ? (
        <DataState query={q}>
          {d && (
            <>
              <Card>
                {[
                  ["profit", "Net profit", "صافي الربح"],
                  ["netSales", "Net sales", "صافي المبيعات"],
                  ["otherIncome", "Other income", "إيرادات أخرى"],
                  ["expenses", "Expenses", "المصروفات"],
                  ["collected", "Collected payments", "المدفوعات المحصلة"],
                  ["revenue", "Collected revenue", "الإيرادات المحصلة"],
                  ["sales", "Invoiced sales", "المبيعات المفوترة"],
                  ["grandTotal", "Total due", "إجمالي المتبقي"],
                  ["invoicedAmount", "Invoiced amount", "المبلغ المفوتر"],
                ]
                  .filter(([key]) => d[key] != null)
                  .map(([key, en, ar]) => (
                    <Row key={key} style={{ justifyContent: "space-between" }}>
                      <Text muted>{text(en, ar)}</Text>
                      <Text bold>{money(d[key])} OMR</Text>
                    </Row>
                  ))}
                {kind === "members" && (
                  <Text muted>
                    {text(
                      "Current membership state as of",
                      "حالة العضويات الحالية في",
                    )}{" "}
                    {d.asOf}
                  </Text>
                )}
                {kind === "profit" && (
                  <Text muted size={11}>
                    {text(
                      "Invoice-date net sales + other income − recorded expenses. Collections are reported separately.",
                      "صافي المبيعات بتاريخ الفاتورة + الإيرادات الأخرى − المصروفات المسجلة. التحصيلات معروضة منفصلة.",
                    )}
                  </Text>
                )}
              </Card>
              {d.buckets?.map((b: any, i: number) => (
                <ListRow
                  key={i}
                  title={b.period}
                  subtitle={`${money(b.profit ?? b.amount)} OMR${b.method ? ` · ${b.method}` : ""}`}
                />
              ))}
              {d.byScope?.map((b: any) => (
                <ListRow
                  key={b.key}
                  title={b.name}
                  subtitle={`${b.count} · ${money(b.invoicedAmount)} OMR`}
                />
              ))}
              {d.byCategory?.map((b: any) => (
                <ListRow
                  key={b.key}
                  title={b.name}
                  subtitle={`${b.count} · ${money(b.invoicedAmount)} OMR`}
                />
              ))}
              {d.items?.map((b: any) => (
                <ListRow
                  key={b.memberId}
                  title={b.fullName}
                  subtitle={`${money(b.totalDue)} OMR · ${b.invoicesCount}`}
                />
              ))}
              {d.byBranch?.map((b: any, i: number) => (
                <Card key={i}>
                  <Text bold>
                    {b.branchName || text("No branch", "بدون فرع")}
                  </Text>
                  <Row>
                    <Stat value={b.active} label={text("Active", "نشط")} />
                    <Stat
                      value={b.inactive}
                      label={text("Inactive", "غير نشط")}
                    />
                  </Row>
                </Card>
              ))}
              {d.expiring7?.items?.map((b: any) => (
                <ListRow
                  key={b.id}
                  title={b.fullName}
                  subtitle={`${b.planName} · ${b.endDate}`}
                />
              ))}
              {(d.total > 20 || page > 1) && (
                <Row>
                  {page > 1 && (
                    <Button
                      secondary
                      title={text("Previous", "السابق")}
                      onPress={() => setPage(page - 1)}
                    />
                  )}{" "}
                  {page * 20 < d.total && (
                    <Button
                      secondary
                      title={text("Next", "التالي")}
                      onPress={() => setPage(page + 1)}
                    />
                  )}
                </Row>
              )}
            </>
          )}
        </DataState>
      ) : (
        <Text>{text("Enter a valid date range.", "أدخل فترة صحيحة.")}</Text>
      )}
    </Screen>
  );
}
