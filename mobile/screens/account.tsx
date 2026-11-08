import React, { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { z } from "zod";
import { ChangePasswordRequest } from "@arena/shared";
import { usePrefs } from "../state/preferences";
import { useSession } from "../state/session";
import {
  Screen,
  Text,
  Card,
  Row,
  Button,
  ListRow,
  Field,
  Failure,
  Badge,
} from "../components/ui";
import { useSave } from "../components/data";
import { colors as c } from "../theme/tokens";
export default function Account() {
  const { text, toggleLanguage, ar } = usePrefs();
  const { user, logout } = useSession();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const links =
    user?.role === "MEMBER"
      ? [
          ["membership", "My membership", "عضويتي"],
          ["coach", "My coach", "مدربي"],
          ["classes", "Classes & bookings", "الحصص والحجوزات"],
          ["invoices", "My invoices", "فواتيري"],
          ["history", "Attendance history", "سجل الحضور"],
        ]
      : [
          ["schedule", "Schedule", "جدول الحصص"],
          ["messages", "Messages", "الرسائل"],
        ];
  return (
    <Screen title={text("Your space.", "مساحتك.")} subtitle="ARENA GYM">
      <Card>
        <Row>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 24,
              backgroundColor: c.accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text size={28} bold style={{ color: c.ink }}>
              {user?.username.slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text bold size={22}>
              {user?.username}
            </Text>
            <Text muted size={12}>
              {user?.email ||
                user?.mobile ||
                text("Arena community", "مجتمع أرينا")}
            </Text>
          </View>
        </Row>
        <Badge>{text("YOUR ARENA ACCOUNT", "حسابك في أرينا")}</Badge>
      </Card>
      {links.map(([path, en, arabic]) => (
        <ListRow
          key={path}
          title={text(en, arabic)}
          onPress={() => router.push(`/(app)/${path}` as never)}
        />
      ))}
      <ListRow
        title={text("Language", "اللغة")}
        subtitle={ar ? "العربية" : "English"}
        icon="language-outline"
        onPress={toggleLanguage}
      />
      <ListRow
        title={text("Change password", "تغيير كلمة المرور")}
        icon="lock-closed-outline"
        onPress={() => router.push("/(app)/password")}
      />
      {confirm ? (
        <Card>
          <Text>
            {text("Sign out on this device?", "تسجيل الخروج من الجهاز؟")}
          </Text>
          <Button
            title={text("Sign out", "تسجيل الخروج")}
            onPress={() => void logout()}
          />
          <Button
            secondary
            title={text("Stay signed in", "البقاء في الحساب")}
            onPress={() => setConfirm(false)}
          />
        </Card>
      ) : (
        <Button
          secondary
          title={text("Sign out", "تسجيل الخروج")}
          onPress={() => setConfirm(true)}
        />
      )}
      <Text muted size={10} style={{ textAlign: "center" }}>
        ARENA GYM · 4.0.0
      </Text>
    </Screen>
  );
}
export function Password() {
  const { text } = usePrefs();
  const { logout } = useSession();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const save = useSave(
    "/auth/change-password",
    z.null(),
    "POST",
    () => void logout(),
  );
  const valid = ChangePasswordRequest.safeParse({
    currentPassword: current,
    newPassword: next,
  });
  return (
    <Screen back title={text("Keep it secure.", "حافظ على أمان حسابك.")}>
      <Field
        label={text("Current password", "كلمة المرور الحالية")}
        value={current}
        onChangeText={setCurrent}
        secureTextEntry
      />
      <Field
        label={text(
          "New password (8–128 characters)",
          "كلمة المرور الجديدة (٨–١٢٨ حرف)",
        )}
        value={next}
        onChangeText={setNext}
        secureTextEntry
      />
      <Field
        label={text("Repeat new password", "أعد كلمة المرور الجديدة")}
        value={repeat}
        onChangeText={setRepeat}
        secureTextEntry
      />
      <Text muted size={12}>
        {text(
          "You will sign in again after changing your password.",
          "ستسجّلين الدخول مجددًا بعد تغيير كلمة المرور.",
        )}
      </Text>
      {save.error && <Failure error={save.error} />}
      <Button
        title={text("Update password", "تحديث كلمة المرور")}
        busy={save.isPending}
        disabled={!valid.success || repeat !== next}
        onPress={() => valid.success && save.mutate(valid.data)}
      />
    </Screen>
  );
}
