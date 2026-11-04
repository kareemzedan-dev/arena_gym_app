import React, { useState } from "react";
import { Modal, View, Pressable } from "react-native";
import { z } from "zod";
import { usePrefs } from "../state/preferences";
import { useData, DataState } from "./data";
import { Screen, Text, Button, Field, ListRow } from "./ui";
const choice = z.object({
  id: z.number(),
  name: z.string().optional(),
  fullName: z.string().optional(),
  username: z.string().optional(),
  coachProfile: z.object({ fullName: z.string() }).nullable().optional(),
});
const response = z.union([
  z.array(choice),
  z.object({ items: z.array(choice), total: z.number() }),
]);
export function Picker({
  label,
  endpoint,
  value,
  onChange,
  multiple = false,
}: {
  label: string;
  endpoint: string;
  value?: number | number[] | null;
  onChange(value: number | number[] | null): void;
  multiple?: boolean;
}) {
  const { text } = usePrefs();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [labels, setLabels] = useState<Record<number, string>>({});
  const arrayEndpoint =
    endpoint.includes("/branches/active") || endpoint === "/coaches";
  const q = useData(
    arrayEndpoint
      ? endpoint
      : `${endpoint}${endpoint.includes("?") ? "&" : "?"}pageSize=30&page=${page}&search=${encodeURIComponent(search)}`,
    response,
    open,
  );
  const items = Array.isArray(q.data) ? q.data : q.data?.items;
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  return (
    <View style={{ gap: 6 }}>
      <Text muted bold size={12}>
        {label}
      </Text>
      <Button
        secondary
        title={
          selected.length
            ? selected.map((id) => labels[id] || `#${id}`).join(", ")
            : text("Select…", "اختر…")
        }
        onPress={() => setOpen(true)}
      />
      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Screen
          title={label}
          action={
            <Pressable onPress={() => setOpen(false)} style={{ padding: 12 }}>
              <Text accent>{text("Done", "تم")}</Text>
            </Pressable>
          }
        >
          <Field
            label={text("Search", "بحث")}
            value={search}
            onChangeText={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />
          <Button
            secondary
            title={text("Clear selection", "مسح الاختيار")}
            onPress={() => {
              onChange(multiple ? [] : null);
              setOpen(false);
            }}
          />
          <DataState query={q}>
            {items
              ?.filter(
                (i) =>
                  !arrayEndpoint ||
                  `${i.name} ${i.fullName}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
              )
              .map((i) => {
                const name =
                  i.name ||
                  i.fullName ||
                  i.coachProfile?.fullName ||
                  i.username ||
                  `#${i.id}`;
                return (
                  <ListRow
                    key={i.id}
                    title={name}
                    icon={
                      selected.includes(i.id)
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    onPress={() => {
                      setLabels({ ...labels, [i.id]: name });
                      onChange(
                        multiple
                          ? selected.includes(i.id)
                            ? selected.filter((n) => n !== i.id)
                            : [...selected, i.id]
                          : i.id,
                      );
                      if (!multiple) setOpen(false);
                    }}
                  />
                );
              })}
            {page > 1 && (
              <Button
                secondary
                title={text("Previous", "السابق")}
                onPress={() => setPage(page - 1)}
              />
            )}{" "}
            {q.data && !Array.isArray(q.data) && page * 30 < q.data.total && (
              <Button
                secondary
                title={text("More", "المزيد")}
                onPress={() => setPage(page + 1)}
              />
            )}
          </DataState>
        </Screen>
      </Modal>
    </View>
  );
}
