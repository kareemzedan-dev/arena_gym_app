import React, { useEffect, useState } from "react";
import { Switch, View, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { z } from "zod";
import { configs, type FormField } from "./editor-config";
import {
  editorFields,
  editorErrors,
  validateEditor,
} from "./editor-validation";
import {
  loadWorkoutItems,
  moveWorkoutItem,
  removeWorkoutItem,
  newWorkoutItem,
  type WorkoutItemDraft,
} from "./workout-items";
import { usePrefs } from "../state/preferences";
import { useData, useSave, DataState } from "../components/data";
import {
  Screen,
  Text,
  Button,
  Field,
  Row,
  Card,
  Chips,
  Failure,
  Empty,
  Section,
} from "../components/ui";
import { Picker } from "../components/picker";
import { today } from "../api/format";
import { measurementNames } from "./progress";
import { colors as c } from "../theme/tokens";
type Values = Record<string, any>;
export function FormInput({
  f,
  value,
  onChange,
}: {
  f: FormField;
  value: unknown;
  onChange(v: unknown): void;
}) {
  const { text } = usePrefs();
  const label = text(f.en, f.ar) + (f.required ? " *" : "");
  if (f.endpoint)
    return (
      <Picker
        label={label}
        endpoint={f.endpoint}
        value={value as number | number[] | null}
        multiple={f.type === "multi"}
        onChange={onChange}
      />
    );
  if (f.type === "boolean")
    return (
      <Row style={{ justifyContent: "space-between" }}>
        <Text>{label}</Text>
        <Switch
          accessibilityLabel={label}
          value={!!value}
          onValueChange={onChange}
          trackColor={{ true: c.accent }}
        />
      </Row>
    );
  if (f.type === "select")
    return (
      <View style={{ gap: 6 }}>
        <Text muted size={12}>
          {label}
        </Text>
        <Chips
          value={String(value || "")}
          onChange={onChange}
          options={(f.options || []).map((o) => ({ value: o, label: o }))}
        />
      </View>
    );
  if (f.type === "multi")
    return (
      <View style={{ gap: 8 }}>
        <Text>{label}</Text>
        <Row style={{ flexWrap: "wrap" }}>
          {f.options?.map((o) => (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{
                checked: ((value as number[]) || []).includes(Number(o)),
              }}
              key={o}
              onPress={() => {
                const a = (value as number[]) || [];
                onChange(
                  a.includes(Number(o))
                    ? a.filter((x) => x !== Number(o))
                    : [...a, Number(o)],
                );
              }}
              style={{
                padding: 16,
                borderRadius: 16,
                backgroundColor: ((value as number[]) || []).includes(Number(o))
                  ? c.accent
                  : c.card,
              }}
            >
              <Text
                style={{
                  color: ((value as number[]) || []).includes(Number(o))
                    ? c.ink
                    : c.text,
                }}
              >
                {o}
              </Text>
            </Pressable>
          ))}
        </Row>
      </View>
    );
  return (
    <Field
      label={label}
      value={value == null ? "" : String(value)}
      onChangeText={(v) =>
        onChange(f.type === "number" ? (v === "" ? null : Number(v)) : v)
      }
      keyboardType={
        f.type === "number" || f.type === "decimal" ? "decimal-pad" : "default"
      }
      secureTextEntry={f.type === "password"}
      multiline={f.type === "textarea"}
      autoCapitalize={f.type === "password" ? "none" : "sentences"}
      placeholder={
        f.type === "date"
          ? "YYYY-MM-DD"
          : f.type === "time"
            ? "HH:mm"
            : undefined
      }
    />
  );
}
export default function Editor() {
  const params = useLocalSearchParams<{
    kind?: string;
    screen?: string;
    id?: string;
    memberId?: string;
  }>();
  const { id, memberId } = params;
  const kind =
    params.kind || (params.screen === "attendance" ? "attendance" : "");
  const config = configs[kind];
  const { text } = usePrefs();
  const router = useRouter();
  const [values, setValues] = useState<Values>({
    ...config?.defaults,
    ...(memberId ? { memberId: Number(memberId) } : {}),
    ...(kind === "measurements" ? { measuredOn: today() } : {}),
    ...(kind === "attendance" ? { attendedOn: today() } : {}),
    ...(kind === "assignments" ? { startDate: today() } : {}),
  });
  const [attempted, setAttempted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const q = useData(
    `/${kind}/${id}`,
    config?.response || z.unknown(),
    !!id && !!config,
  );
  useEffect(() => {
    if (q.data) {
      const data = q.data as Values;
      const v: Values = { ...config.defaults };
      for (const f of config.fields) {
        if (f.key === "password") continue;
        v[f.key] = data[f.key] ?? data.coachProfile?.[f.key] ?? null;
      }
      if (kind === "plans") {
        v.durationDays =
          (data.scope === "GYM"
            ? data.gymAccessDays
            : data.scope === "PT"
              ? data.ptValidityDays
              : null) ?? data.durationDays;
      }
      if (kind === "workout-plans") v.items = loadWorkoutItems(data.items);
      if (kind === "nutrition-plans")
        v.meals = data.meals.map((m: Values) => ({
          name: m.name,
          time: m.time,
          notes: m.notes,
          dayOfWeek: m.dayOfWeek,
          order: m.order,
          items: m.items.map((i: Values) => ({
            food: i.food,
            quantity: i.quantity,
          })),
        }));
      setValues(v);
      setAttempted(false);
    }
  }, [q.data, kind, config]);
  const path =
    kind === "measurements"
      ? `/members/${memberId}/measurements`
      : kind === "assignments"
        ? `/members/${memberId}/workouts`
        : `/${kind}${id ? `/${id}` : ""}`;
  const save = useSave(
    path,
    config?.response || z.unknown(),
    id ? "PATCH" : "POST",
    () => router.back(),
  );
  const remove = useSave(path, z.null(), "DELETE", () => router.back());
  if (!config)
    return (
      <Screen back>
        <Empty title={text("This form is not available", "النموذج غير متاح")} />
      </Screen>
    );
  const context = { editing: !!id, memberId };
  const validation = validateEditor(kind, values, context);
  const errors = editorErrors(validation, attempted);
  function change(key: string, v: unknown) {
    setValues((old) => ({ ...old, [key]: v }));
    if (save.isError) save.reset();
  }
  function submit() {
    setAttempted(true);
    if (validation.valid) save.mutate(validation.data);
  }
  const fields = editorFields(kind, values, context);
  return (
    <Screen
      back
      title={`${text(id ? "Edit" : "New", id ? "تعديل" : "إضافة")} ${text(config.en, config.ar)}`}
    >
      <Text muted size={12}>
        {text("Fields marked * are required.", "الحقول بعلامة * مطلوبة.")}
      </Text>
      {id && (q.isPending || q.error) ? (
        <DataState query={q} />
      ) : (
        <>
          {fields.map((f) => (
            <View key={f.key} style={{ gap: 4 }}>
              <FormInput
                f={
                  kind === "measurements" && measurementNames[f.key]
                    ? {
                        ...f,
                        en: measurementNames[f.key][0],
                        ar: measurementNames[f.key][1],
                      }
                    : f
                }
                value={values[f.key]}
                onChange={(v) => change(f.key, v)}
              />
              {errors[f.key] && (
                <Text size={12} style={{ color: c.red }}>
                  {errors[f.key] === "Required"
                    ? text("This field is required.", "هذا الحقل مطلوب.")
                    : errors[f.key]}
                </Text>
              )}
            </View>
          ))}
          {kind === "workout-plans" && (
            <WorkoutFields
              items={values.items || []}
              onChange={(v) => change("items", v)}
            />
          )}{" "}
          {kind === "nutrition-plans" && (
            <MealFields
              meals={values.meals || []}
              onChange={(v) => change("meals", v)}
            />
          )}{" "}
          {Object.keys(errors).length > 0 && (
            <Card>
              <Text style={{ color: c.red }} accessibilityRole="alert">
                {text(
                  "Please review the highlighted fields.",
                  "راجع الحقول المحددة.",
                )}
              </Text>
              {Object.entries(errors)
                .filter(([key]) => !fields.some((f) => f.key === key))
                .map(([key, message]) => (
                  <Text key={key} size={12} style={{ color: c.red }}>
                    {key}: {message}
                  </Text>
                ))}
            </Card>
          )}
          {save.error && <Failure error={save.error} />}
          <Button
            title={text("Save changes", "حفظ التغييرات")}
            onPress={submit}
            busy={save.isPending}
          />
          {id &&
            [
              "plan-categories",
              "plans",
              "classes",
              "exercises",
              "workout-plans",
              "nutrition-plans",
            ].includes(kind) && (
              <Card>
                {confirmDelete && (
                  <Text>
                    {text(
                      "Delete this record? Records in use cannot be deleted.",
                      "حذف السجل؟ لا يمكن حذف السجلات المرتبطة ببيانات مستخدمة.",
                    )}
                  </Text>
                )}
                {remove.error && <Failure error={remove.error} />}
                <Button
                  secondary
                  title={
                    confirmDelete
                      ? text("Confirm deletion", "تأكيد الحذف")
                      : text("Delete record", "حذف السجل")
                  }
                  busy={remove.isPending}
                  onPress={() =>
                    confirmDelete ? remove.mutate({}) : setConfirmDelete(true)
                  }
                />
                {confirmDelete && (
                  <Button
                    secondary
                    title={text("Keep record", "الاحتفاظ بالسجل")}
                    onPress={() => setConfirmDelete(false)}
                  />
                )}
              </Card>
            )}
        </>
      )}
    </Screen>
  );
}
function WorkoutFields({
  items,
  onChange,
}: {
  items: WorkoutItemDraft[];
  onChange(v: WorkoutItemDraft[]): void;
}) {
  const { text } = usePrefs();
  const update = (i: number, k: string, v: unknown) =>
    onChange(items.map((item, n) => (n === i ? { ...item, [k]: v } : item)));
  return (
    <>
      <Section title={text("Exercises", "التمارين")} />
      {items.map((item, i) => (
        <Card key={i}>
          <Text bold>
            {text("Exercise", "تمرين")} {i + 1}
          </Text>
          <Picker
            label={text("Exercise *", "التمرين *")}
            endpoint="/exercises"
            value={item.exerciseId}
            onChange={(v) => update(i, "exerciseId", v)}
          />
          {(
            [
              ["sets", "Sets *", "المجموعات *"],
              ["reps", "Repetitions *", "التكرارات *"],
              ["weightKg", "Weight · kg", "الوزن · كجم"],
            ] as const
          ).map(([key, en, ar]) => (
            <Field
              key={key}
              label={text(en, ar)}
              value={item[key] == null ? "" : String(item[key])}
              keyboardType="decimal-pad"
              onChangeText={(v) =>
                update(
                  i,
                  key,
                  v === "" ? null : key === "weightKg" ? v : Number(v),
                )
              }
            />
          ))}
          <Text muted size={12}>
            {text("Weekday (optional)", "يوم الأسبوع (اختياري)")}
          </Text>
          <Chips
            value={item.dayOfWeek == null ? "any" : String(item.dayOfWeek)}
            onChange={(v) =>
              update(i, "dayOfWeek", v === "any" ? null : Number(v))
            }
            options={[
              { value: "any", label: text("Any day", "أي يوم") },
              ...[
                ["Sunday", "الأحد"],
                ["Monday", "الاثنين"],
                ["Tuesday", "الثلاثاء"],
                ["Wednesday", "الأربعاء"],
                ["Thursday", "الخميس"],
                ["Friday", "الجمعة"],
                ["Saturday", "السبت"],
              ].map(([en, ar], day) => ({
                value: String(day),
                label: text(en, ar),
              })),
            ]}
          />
          <Row>
            <View style={{ flex: 1 }}>
              <Button
                secondary
                title={text("Move up", "نقل لأعلى")}
                disabled={i === 0}
                onPress={() => onChange(moveWorkoutItem(items, i, -1))}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                secondary
                title={text("Move down", "نقل لأسفل")}
                disabled={i === items.length - 1}
                onPress={() => onChange(moveWorkoutItem(items, i, 1))}
              />
            </View>
          </Row>
          <Button
            secondary
            title={text("Remove exercise", "حذف التمرين")}
            onPress={() => onChange(removeWorkoutItem(items, i))}
          />
        </Card>
      ))}
      <Button
        secondary
        title={text("Add exercise", "إضافة تمرين")}
        disabled={items.length >= 200}
        onPress={() => onChange([...items, newWorkoutItem(items.length)])}
      />
    </>
  );
}
function MealFields({
  meals,
  onChange,
}: {
  meals: Values[];
  onChange(v: Values[]): void;
}) {
  const { text } = usePrefs();
  const update = (i: number, k: string, v: unknown) =>
    onChange(meals.map((m, n) => (n === i ? { ...m, [k]: v } : m)));
  return (
    <>
      <Section title={text("Meals", "الوجبات")} />
      {meals.map((meal, i) => (
        <Card key={i}>
          <Text bold>
            {text("Meal", "وجبة")} {i + 1}
          </Text>
          {[
            ["name", "Meal name", "اسم الوجبة"],
            ["time", "Time · HH:mm", "الوقت · HH:mm"],
            ["notes", "Notes", "ملاحظات"],
          ].map(([key, en, ar]) => (
            <Field
              key={key}
              label={text(en, ar)}
              value={meal[key] || ""}
              onChangeText={(v) => update(i, key, v || null)}
            />
          ))}
          {meal.items.map((food: Values, j: number) => (
            <View key={j} style={{ gap: 8 }}>
              {[
                ["food", "Food", "الطعام"],
                ["quantity", "Quantity", "الكمية"],
              ].map(([key, en, ar]) => (
                <Field
                  key={key}
                  label={`${text(en, ar)} ${j + 1}`}
                  value={food[key] || ""}
                  onChangeText={(v) =>
                    update(
                      i,
                      "items",
                      meal.items.map((f: Values, n: number) =>
                        n === j ? { ...f, [key]: v } : f,
                      ),
                    )
                  }
                />
              ))}
              <Button
                secondary
                title={text("Remove food", "حذف الطعام")}
                onPress={() =>
                  update(
                    i,
                    "items",
                    meal.items.filter((_: unknown, n: number) => n !== j),
                  )
                }
              />
            </View>
          ))}
          <Button
            secondary
            title={text("Add food", "إضافة طعام")}
            onPress={() =>
              update(i, "items", [...meal.items, { food: "", quantity: "" }])
            }
          />
          <Button
            secondary
            title={text("Remove meal", "حذف الوجبة")}
            onPress={() =>
              onChange(
                meals
                  .filter((_, n) => n !== i)
                  .map((v, order) => ({ ...v, order })),
              )
            }
          />
        </Card>
      ))}
      <Button
        secondary
        title={text("Add meal", "إضافة وجبة")}
        onPress={() =>
          onChange([
            ...meals,
            {
              name: "",
              time: null,
              notes: null,
              dayOfWeek: null,
              order: meals.length,
              items: [{ food: "", quantity: "" }],
            },
          ])
        }
      />
    </>
  );
}
