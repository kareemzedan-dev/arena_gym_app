import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { ArenaMark, FitnessArt } from "../mobile/components/fitness-art";
import { useRouter } from "expo-router";
import { useSession } from "../mobile/state/session";
import { usePrefs } from "../mobile/state/preferences";
import {
  Screen,
  Text,
  Field,
  Button,
  Failure,
  Row,
  Icon,
} from "../mobile/components/ui";
import { colors as c } from "../mobile/theme/tokens";
export default function Login() {
  const { text, toggleLanguage } = usePrefs();
  const session = useSession();
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  async function submit() {
    if (pending || !id.trim() || !password) return;
    setPending(true);
    setError(null);
    try {
      await session.login(id, password);
      router.replace("/(app)/(tabs)/home");
    } catch (e) {
      setError(e);
    } finally {
      setPending(false);
    }
  }
  return (
    <Screen>
      <Row style={{ justifyContent: "space-between" }}>
        <Row>
          <ArenaMark />
          <Text bold size={21}>
            ARENA
          </Text>
        </Row>
        <Pressable
          accessibilityRole="button"
          onPress={toggleLanguage}
          style={{ padding: 12 }}
        >
          <Text accent>{text("العربية", "English")}</Text>
        </Pressable>
      </Row>
      <View style={{ alignItems: "center", gap: 8 }}>
        <FitnessArt icon="fitness-outline" size={190} />
        <Text accent size={11} bold>
          {text("YOUR SPACE. YOUR STRENGTH.", "مساحتك. قوتك.")}
        </Text>
        <Text size={28} bold style={{ textAlign: "center" }}>
          {text("Good to have you back.", "سعداء برجوعك.")}
        </Text>
      </View>
      <Text muted>
        {text(
          "Sign in with the account provided by your gym.",
          "سجّلي بحسابك اللي استلمته من إدارة الجيم.",
        )}
      </Text>
      <Field
        label={text(
          "Username, email or mobile",
          "اسم المستخدم، البريد أو الموبايل",
        )}
        value={id}
        onChangeText={setId}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        textContentType="username"
        returnKeyType="next"
      />
      <Field
        label={text("Password", "كلمة المرور")}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={() => void submit()}
      />
      {!!error && <Failure error={error} />}
      <Button
        title={text("Sign in", "تسجيل الدخول")}
        onPress={() => void submit()}
        busy={pending}
        disabled={!id.trim() || !password}
        icon="arrow-forward"
      />
      <Row style={{ justifyContent: "center", marginTop: 10 }}>
        <Icon name="shield-checkmark-outline" size={17} />
        <Text muted size={11}>
          {text(
            "Your journey. Your data. Securely connected.",
            "رحلتك وبياناتك، باتصال آمن.",
          )}
        </Text>
      </Row>
      <Text muted size={11} style={{ textAlign: "center" }}>
        {text(
          "Need an account or a password reset? Contact your gym reception.",
          "محتاجة حساب أو إعادة تعيين كلمة المرور؟ تواصلي مع استقبال الجيم.",
        )}
      </Text>
    </Screen>
  );
}
