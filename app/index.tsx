import React, { useMemo, useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  PanResponder,
  useWindowDimensions,
} from "react-native";
import { ArenaLogo } from "../mobile/components/arena-logo";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import { Redirect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, useReducedMotion } from "react-native-reanimated";
import { Button, Text, Row, Screen, Loading } from "../mobile/components/ui";
import { usePrefs } from "../mobile/state/preferences";
import { useSession } from "../mobile/state/session";
import { colors as c } from "../mobile/theme/tokens";
const slides = [
  {
    eyebrow: ["YOUR SPACE. YOUR STRENGTH.", "أرينا للسيدات"],
    title: ["Your next chapter.\nStronger.", "بدايتك الجديدة.\nأقوى."],
    detail: [
      "Your training, your coach, your progress.\nOne place. All you.",
      "تمارينك، مدربتك، وتطورك.\nكل رحلتك في مكان واحد.",
    ],
  },
  {
    eyebrow: ["BUILT AROUND YOU", "خطة مصممة لك"],
    title: ["A plan. A coach.\nYour pace.", "خطتك. مدربتك.\nعلى إيقاعك."],
    detail: [
      "Follow your workouts and meals, designed\nby the coach who knows your goals.",
      "تابعي تمارينك ووجباتك، بإعداد مدربتك\nالتي تعرف أهدافك.",
    ],
  },
  {
    eyebrow: ["EVERY STEP COUNTS", "كل خطوة تصنع فرقًا"],
    title: [
      "See your effort.\nFeel your progress.",
      "تابعي جهودك.\nواشعري بتقدمك.",
    ],
    detail: [
      "Keep your membership, sessions and\nmeasurements close. Keep moving forward.",
      "اشتراكك وجلساتك وقياساتك متاحة دائمًا.\nواصلي رحلتك خطوة بخطوة.",
    ],
  },
] as const;
export default function Onboarding() {
  const {
    introDone,
    finishIntro,
    text,
    ar,
    toggleLanguage,
    ready: prefsReady,
  } = usePrefs();
  const { user, ready } = useSession();
  const [slide, setSlide] = useState(0);
  const router = useRouter();
  const reduced = useReducedMotion();
  const { height, width } = useWindowDimensions();
  const compact = height < 750;
  const logoSize = Math.min(width * 0.52, 248);
  const swipe = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, { dx, dy }) =>
          Math.abs(dx) > 16 && Math.abs(dx) > Math.abs(dy) * 1.5,
        onPanResponderRelease: (_, { dx }) => {
          if (Math.abs(dx) < 48) return;
          const next = ar ? dx > 0 : dx < 0;
          setSlide((current) =>
            Math.max(0, Math.min(slides.length - 1, current + (next ? 1 : -1))),
          );
        },
      }),
    [ar],
  );
  if (!ready || !prefsReady)
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  if (introDone)
    return <Redirect href={user ? "/(app)/(tabs)/home" : "/login"} />;
  const item = slides[slide];
  async function finish() {
    await finishIntro();
    router.replace(user ? "/(app)/(tabs)/home" : "/login");
  }
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: 8,
          width: "100%",
          maxWidth: 480,
          alignSelf: "center",
        }}
      >
        <Row style={{ justifyContent: "flex-end" }}>
          <Pressable
            onPress={toggleLanguage}
            accessibilityRole="button"
            style={{ padding: 8, minHeight: 44, justifyContent: "center" }}
          >
            <Text bold size={12}>
              {text("العربية", "English")}
            </Text>
          </Pressable>
        </Row>
        <View style={{ flex: 1 }} {...swipe.panHandlers}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "space-between",
              paddingBottom: 8,
              gap: compact ? 16 : 24,
            }}
          >
            <Animated.View
              testID="onboarding-brand"
              entering={reduced ? undefined : FadeIn.duration(600)}
              style={{
                flex: 1,
                minHeight: logoSize + (compact ? 32 : 64),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                pointerEvents="none"
                accessible={false}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                aria-hidden
                style={{ position: "absolute", width: "100%", height: "100%" }}
              >
                <Svg width="100%" height="100%">
                  <Defs>
                    <RadialGradient id="brand-glow">
                      <Stop
                        offset="0"
                        stopColor={c.accent}
                        stopOpacity={0.09}
                      />
                      <Stop offset="1" stopColor={c.accent} stopOpacity={0} />
                    </RadialGradient>
                  </Defs>
                  <Rect width="100%" height="100%" fill="url(#brand-glow)" />
                </Svg>
              </View>
              <ArenaLogo size={logoSize} />
            </Animated.View>
            <View style={{ gap: 8 }} accessibilityLiveRegion="polite">
              <Text accent bold size={11} style={{ letterSpacing: ar ? 0 : 2 }}>
                {text(item.eyebrow[0], item.eyebrow[1])}
              </Text>
              <Text
                size={compact ? 28 : 34}
                bold
                style={{ lineHeight: compact ? 40 : 48 }}
              >
                {text(item.title[0], item.title[1])}
              </Text>
              <Text muted size={14}>
                {text(item.detail[0], item.detail[1]).replace(/\n/g, " ")}
              </Text>
            </View>
            <Row style={{ justifyContent: "space-between" }}>
              <Row>
                {slides.map((_, i) => (
                  <View
                    key={i}
                    style={{
                      width: slide === i ? 24 : 8,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: slide === i ? c.accent : c.line,
                    }}
                  />
                ))}
              </Row>
              <Text muted size={11} style={{ writingDirection: "ltr" }}>
                0{slide + 1} / 03
              </Text>
            </Row>
            <View style={{ gap: 8 }}>
              <Button
                title={
                  slide === 2
                    ? text("Enter your arena", "ابدئي رحلتك")
                    : text("Next", "التالي")
                }
                icon={ar ? "arrow-back" : "arrow-forward"}
                onPress={() =>
                  slide === 2 ? void finish() : setSlide(slide + 1)
                }
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => void finish()}
                style={{ padding: 8, minHeight: 48, justifyContent: "center" }}
              >
                <Text muted size={12} style={{ textAlign: "center" }}>
                  {user
                    ? text("Go to your dashboard", "افتحي حسابك")
                    : text(
                        "Already a member? Sign in",
                        "هل لديكِ حساب؟ سجّلي الدخول",
                      )}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
