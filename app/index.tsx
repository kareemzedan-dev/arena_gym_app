import React, { useState } from "react";
import { View, ScrollView, Pressable, useWindowDimensions } from "react-native";
import { ArenaMark, FitnessArt } from "../mobile/components/fitness-art";
import { Redirect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  useReducedMotion,
} from "react-native-reanimated";
import { Button, Text, Row } from "../mobile/components/ui";
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
    icon: "barbell-outline",
  },
  {
    eyebrow: ["BUILT AROUND YOU", "خطة مصممة لك"],
    title: ["A plan. A coach.\nYour pace.", "خطتك. مدربتك.\nعلى إيقاعك."],
    detail: [
      "Follow your workouts and meals, designed\nby the coach who knows your goals.",
      "تابعي تمارينك ووجباتك، بإعداد مدربتك\nاللي تعرف أهدافك.",
    ],
    icon: "fitness-outline",
  },
  {
    eyebrow: ["EVERY STEP COUNTS", "كل خطوة بتفرق"],
    title: [
      "See your effort.\nFeel your progress.",
      "شوفي مجهودك.\nحسّي بتطورك.",
    ],
    detail: [
      "Keep your membership, sessions and\nmeasurements close. Keep moving forward.",
      "اشتراكك، جلساتك وقياساتك معاك دائمًا.\nكمّلي رحلتك خطوة بخطوة.",
    ],
    icon: "trending-up-outline",
  },
] as const;
export default function Onboarding() {
  const { introDone, finishIntro, text, ar, toggleLanguage } = usePrefs();
  const { user } = useSession();
  const [slide, setSlide] = useState(0);
  const router = useRouter();
  const reduced = useReducedMotion();
  const { height, width } = useWindowDimensions();
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
          paddingTop: 12,
          width: "100%",
          maxWidth: 650,
          alignSelf: "center",
        }}
      >
        <Row style={{ justifyContent: "space-between" }}>
          <Row>
            <ArenaMark />
            <Text size={18} bold>
              ARENA
              <Text accent size={11}>
                {" "}
                / WOMEN
              </Text>
            </Text>
          </Row>
          <Pressable
            onPress={toggleLanguage}
            accessibilityRole="button"
            style={{ padding: 12 }}
          >
            <Text bold size={12}>
              {text("العربية", "English")}
            </Text>
          </Pressable>
        </Row>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-between",
            paddingBottom: 12,
            gap: 12,
          }}
        >
          <FitnessArt
            key={`art-${slide}`}
            icon={item.icon}
            size={Math.min(width - 56, height < 750 ? 250 : 320)}
            animate
          />
          <Animated.View
            key={`copy-${slide}`}
            entering={reduced ? undefined : FadeInDown.duration(240)}
            style={{ gap: 12 }}
          >
            <Row>
              <View
                style={{ width: 32, height: 2, backgroundColor: c.accent }}
              />
              <Text accent bold size={10} style={{ letterSpacing: ar ? 0 : 2 }}>
                {text(item.eyebrow[0], item.eyebrow[1])}
              </Text>
            </Row>
            <Text
              size={height < 750 ? 29 : 36}
              bold
              style={{ lineHeight: height < 750 ? 41 : 49 }}
            >
              {text(item.title[0], item.title[1])}
            </Text>
            <Text muted size={14}>
              {text(item.detail[0], item.detail[1])}
            </Text>
            <Row
              style={{ marginVertical: 12, justifyContent: "space-between" }}
            >
              <Row>
                {slides.map((_, i) => (
                  <View
                    key={i}
                    style={{
                      width: slide === i ? 30 : 7,
                      height: 5,
                      borderRadius: 3,
                      backgroundColor: slide === i ? c.accent : "#51615A",
                    }}
                  />
                ))}
              </Row>
              <Text muted size={11}>
                0{slide + 1} / 03
              </Text>
            </Row>
          </Animated.View>
          <View style={{ gap: 4 }}>
            <Button
              title={
                slide === 2
                  ? text("Enter your arena", "ابدئي رحلتك")
                  : text("Let’s keep moving", "يلا نكمل")
              }
              icon={ar ? "arrow-back" : "arrow-forward"}
              onPress={() =>
                slide === 2 ? void finish() : setSlide(slide + 1)
              }
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => void finish()}
              style={{ padding: 18 }}
            >
              <Text muted size={12} style={{ textAlign: "center" }}>
                {user
                  ? text("Go to your dashboard", "افتحي حسابك")
                  : text(
                      "Already a member? Sign in",
                      "عندك حساب؟ سجّلي الدخول",
                    )}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
