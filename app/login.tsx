import React, { useState } from "react";
import {
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArenaLogo } from "../mobile/components/arena-logo";
import { useRouter } from "expo-router";
import { useSession } from "../mobile/state/session";
import { usePrefs } from "../mobile/state/preferences";
import {
  Text,
  Field,
  Button,
  Failure,
  Row,
  Icon,
} from "../mobile/components/ui";
import { colors as c } from "../mobile/theme/tokens";
export default function Login() {
  const { text, ar, toggleLanguage } = usePrefs();
  const { height } = useWindowDimensions();
  const compact = height < 750;
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
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 8,
            paddingBottom: 24,
            width: "100%",
            maxWidth: 480,
            alignSelf: "center",
          }}
        >
          <Row style={{ justifyContent: "flex-end" }}>
            <Pressable
              accessibilityRole="button"
              onPress={toggleLanguage}
              style={{ padding: 8, minHeight: 44, justifyContent: "center" }}
            >
              <Text bold size={12}>
                {text("العربية", "English")}
              </Text>
            </Pressable>
          </Row>
          <View
            style={{
              flexGrow: 1,
              justifyContent: "center",
              gap: compact ? 16 : 24,
              paddingTop: 16,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <ArenaLogo size={compact ? 120 : 136} />
            </View>
            <View style={{ gap: 8 }}>
              <Text size={compact ? 28 : 30} bold>
                {text("Welcome back", "مرحبًا بعودتك")}
              </Text>
              <Text muted>
                {text(
                  "Sign in with the account provided by your gym.",
                  "سجّلي الدخول بالحساب الذي تسلّمتِه من إدارة النادي.",
                )}
              </Text>
            </View>
            <View style={{ gap: 16 }}>
              <Field
                label={text(
                  "Username, email or mobile",
                  "اسم المستخدم أو البريد الإلكتروني أو الهاتف المحمول",
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
                icon={ar ? "arrow-back" : "arrow-forward"}
              />
            </View>
            <View style={{ gap: 8 }}>
              <Row style={{ justifyContent: "center", gap: 8 }}>
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
                  "هل تحتاجين إلى حساب أو إعادة تعيين كلمة المرور؟ تواصلي مع استقبال النادي.",
                )}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
