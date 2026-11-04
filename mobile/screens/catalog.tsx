import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { configs } from "./editor-config";
import { usePrefs } from "../state/preferences";
import { useData, DataState } from "../components/data";
import {
  Screen,
  Field,
  Button,
  ListRow,
  Row,
  Empty,
  Text,
} from "../components/ui";
import { z } from "zod";
export default function Catalog({ kind: fixed }: { kind?: string }) {
  const params = useLocalSearchParams<{ screen: string }>();
  const kind = fixed || params.screen;
  const config = configs[kind];
  const { text } = usePrefs();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const q = useData(
    `/${kind}?page=${page}&pageSize=20&search=${encodeURIComponent(search)}`,
    config?.list || z.unknown(),
    !!config?.list,
  );
  const data = q.data as
    | {
        items: {
          id: number;
          name?: string;
          username?: string;
          coachProfile?: { fullName: string } | null;
          price?: string;
        }[];
        total: number;
      }
    | undefined;
  if (!config)
    return (
      <Screen back>
        <Empty title={text("Not available", "غير متاح")} />
      </Screen>
    );
  return (
    <Screen
      back
      title={text(config.en, config.ar)}
      subtitle={text("WORKSPACE", "مساحة العمل")}
      onRefresh={() => void q.refetch()}
      refreshing={q.isRefetching}
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
        title={text("Create new", "إضافة جديد")}
        icon="add"
        onPress={() =>
          router.push({ pathname: "/(app)/editor", params: { kind } })
        }
      />
      <DataState query={q}>
        {data?.items.map((i) => (
          <ListRow
            key={i.id}
            title={
              i.name || i.coachProfile?.fullName || i.username || `#${i.id}`
            }
            subtitle={i.price ? `${i.price} OMR` : undefined}
            onPress={() =>
              router.push({
                pathname: "/(app)/editor",
                params: { kind, id: i.id },
              })
            }
          />
        ))}
        {!data?.items.length && (
          <Empty title={text("Nothing here yet", "لا توجد بيانات بعد")} />
        )}
        <Row>
          {page > 1 && (
            <Button
              secondary
              title={text("Previous", "السابق")}
              onPress={() => setPage(page - 1)}
            />
          )}{" "}
          {!!data && page * 20 < data.total && (
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
