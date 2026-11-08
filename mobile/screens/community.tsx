import React, { useState } from "react";
import {
  OperationListResponse,
  OperationResponse,
  operationDataSchema,
} from "@arena/shared";
import { usePrefs } from "../state/preferences";
import { useData, useSave, DataState } from "../components/data";
import {
  Screen,
  Text,
  Card,
  Button,
  Field,
  Row,
  Empty,
  Failure,
  Section,
} from "../components/ui";
import { Picker } from "../components/picker";
import { dateLabel } from "../api/format";
export function Community({ kind }: { kind: "messages" | "notices" }) {
  const { text, ar } = usePrefs();
  const [page, setPage] = useState(1);
  const [compose, setCompose] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [recipient, setRecipient] = useState<number | null>(null);
  const q = useData(
    `/operations/${kind}?pageSize=20&page=${page}`,
    OperationListResponse,
  );
  const save = useSave(
    "/operations/messages",
    OperationResponse,
    "POST",
    () => {
      setCompose(false);
      setTitle("");
      setBody("");
    },
  );
  const valid = operationDataSchema("messages").safeParse({
    recipientIds: recipient ? [recipient] : [],
    body,
  });
  return (
    <Screen
      back
      title={
        kind === "messages"
          ? text("Stay connected.", "ابقي على تواصل.")
          : text("Around your arena.", "أخبار أرينا.")
      }
      subtitle={text(
        kind.toUpperCase(),
        kind === "messages" ? "الرسائل" : "الإعلانات",
      )}
      onRefresh={() => void q.refetch()}
      refreshing={q.isRefetching}
    >
      {kind === "messages" && (
        <Button
          title={text("New message", "رسالة جديدة")}
          onPress={() => setCompose(!compose)}
        />
      )}{" "}
      {compose && (
        <Card>
          <Picker
            label={text("To", "إلى")}
            endpoint="/directory"
            value={recipient}
            onChange={(v) => setRecipient(v as number | null)}
          />
          <Field
            label={text("Subject", "الموضوع")}
            value={title}
            onChangeText={setTitle}
          />
          <Field
            label={text("Message", "الرسالة")}
            multiline
            value={body}
            onChangeText={setBody}
          />
          {save.error && <Failure error={save.error} />}
          <Button
            title={text("Send message", "إرسال الرسالة")}
            disabled={!title.trim() || !valid.success}
            busy={save.isPending}
            onPress={() =>
              save.mutate({
                title,
                status: "ACTIVE",
                branchId: null,
                data: { recipientIds: [recipient], body },
              })
            }
          />
        </Card>
      )}
      <DataState query={q}>
        {q.data?.items.map((m) => (
          <Card key={m.id}>
            <Text muted size={10}>
              {dateLabel(m.createdAt, ar)}
            </Text>
            <Text bold size={19}>
              {m.title}
            </Text>
            <Text>{String(m.data.body || "")}</Text>
          </Card>
        ))}
        {!q.data?.items.length && (
          <Empty title={text("You’re all caught up", "اطّلعتِ على جميع المستجدات")} />
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
    </Screen>
  );
}
