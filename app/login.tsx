import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
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
  const [visible, setVisible] = useState(false);
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
          <Image
            source={require("../assets/icon.png")}
            style={{ width: 46, height: 46, borderRadius: 14 }}
          />
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
      <View
        style={{
          height: 240,
          borderRadius: 28,
          overflow: "hidden",
          marginVertical: 6,
        }}
      >
        <Image
          source={require("../assets/arena-training.png")}
          style={{ width: "100%", height: "100%" }}
          contentPosition="top"
        />
        <LinearGradient
          colors={["transparent", "#101716EE"]}
          style={{
            position: "absolute",
            inset: 0,
            justifyContent: "flex-end",
            padding: 22,
          }}
        >
          <Text accent size={10} bold>
            {text("SHOW UP FOR YOURSELF", "خطوة جديدة لنفسك")}
          </Text>
          <Text size={29} bold>
            {text("Good to have you back.", "سعداء برجوعك.")}
          </Text>
        </LinearGradient>
      </View>
      <Text muted>
        {text(
          "Sign in with the account provided by your gym.",
          "سجّل بحسابك اللي استلمته من إدارة الجيم.",
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
      <View>
        <Field
          label={text("Password", "كلمة المرور")}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!visible}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={() => void submit()}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={text(
            "Show or hide password",
            "إظهار أو إخفاء كلمة المرور",
          )}
          onPress={() => setVisible(!visible)}
          style={{ alignSelf: "flex-end", padding: 12 }}
        >
          <Icon name={visible ? "eye-off-outline" : "eye-outline"} size={20} />
        </Pressable>
      </View>
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
          "محتاج حساب أو إعادة تعيين كلمة المرور؟ تواصل مع استقبال الجيم.",
        )}
      </Text>
    </Screen>
  );
}
