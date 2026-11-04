import React, { useState } from "react";
import { View, StyleSheet, Pressable, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  useReducedMotion,
} from "react-native-reanimated";
import { Button, Text, Row, Icon } from "../mobile/components/ui";
import { usePrefs } from "../mobile/state/preferences";
import { colors as c } from "../mobile/theme/tokens";
const slides = [
  {
    eyebrow: ["WELCOME TO YOUR ARENA", "أهلًا بك في أرينا"],
    title: ["Your next chapter.\nStronger.", "بدايتك الجديدة.\nأقوى."],
    detail: [
      "Your training, your coach, your progress.\nOne place. All you.",
      "تمارينك، مدربك، وتطورك.\nكل رحلتك في مكان واحد.",
    ],
    icon: "barbell-outline",
  },
  {
    eyebrow: ["BUILT AROUND YOU", "خطة مصممة لك"],
    title: ["A plan. A coach.\nYour pace.", "خطتك. مدربك.\nعلى إيقاعك."],
    detail: [
      "Follow your workouts and meals, designed\nby the coach who knows your goals.",
      "تابع تمارينك ووجباتك، بإعداد مدربك\nاللي يعرف أهدافك.",
    ],
    icon: "fitness-outline",
  },
  {
    eyebrow: ["EVERY STEP COUNTS", "كل خطوة بتفرق"],
    title: ["See your effort.\nFeel your progress.", "شوف مجهودك.\nحس بتطورك."],
    detail: [
      "Keep your membership, sessions and\nmeasurements close. Keep moving forward.",
      "اشتراكك، جلساتك وقياساتك معاك دائمًا.\nكمّل رحلتك خطوة بخطوة.",
    ],
    icon: "trending-up-outline",
  },
] as const;
export default function Onboarding() {
  const { introDone, finishIntro, text, ar, toggleLanguage } = usePrefs();
  const [slide, setSlide] = useState(0);
  const router = useRouter();
  const reduced = useReducedMotion();
  const { height } = useWindowDimensions();
  if (introDone) return <Redirect href="/login" />;
  const item = slides[slide];
  async function finish() {
    await finishIntro();
    router.replace("/login");
  }
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Image
        source={require("../assets/arena-training.png")}
        contentFit="cover"
        contentPosition="top"
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["rgba(16,23,22,.08)", "rgba(16,23,22,.25)", c.bg, c.bg]}
        locations={[0, 0.35, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView
        style={{
          flex: 1,
          padding: 26,
          width: "100%",
          maxWidth: 650,
          alignSelf: "center",
        }}
      >
        <Row style={{ justifyContent: "space-between" }}>
          <Row>
            <Image
              source={require("../assets/icon.png")}
              style={{ width: 42, height: 42, borderRadius: 13 }}
            />
            <Text size={18} bold>
              ARENA
              <Text accent size={11}>
                {" "}
                / GYM
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
        <View style={{ flex: 1, minHeight: 80 }} />
        <Animated.View
          key={slide}
          entering={reduced ? undefined : FadeInDown.duration(350)}
          style={{ gap: 18 }}
        >
          <Row>
            <View style={{ width: 32, height: 2, backgroundColor: c.accent }} />
            <Text accent bold size={10} style={{ letterSpacing: ar ? 0 : 2 }}>
              {text(item.eyebrow[0], item.eyebrow[1])}
            </Text>
          </Row>
          <Text
            size={height < 750 ? 34 : 42}
            bold
            style={{ lineHeight: height < 750 ? 47 : 58 }}
          >
            {text(item.title[0], item.title[1])}
          </Text>
          <Text muted size={14}>
            {text(item.detail[0], item.detail[1])}
          </Text>
          <Row style={{ marginVertical: 12, justifyContent: "space-between" }}>
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
        <Button
          title={
            slide === 2
              ? text("Enter your arena", "ابدأ رحلتك")
              : text("Let’s keep moving", "يلا نكمل")
          }
          icon={ar ? "arrow-back" : "arrow-forward"}
          onPress={() => (slide === 2 ? void finish() : setSlide(slide + 1))}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => void finish()}
          style={{ padding: 18 }}
        >
          <Text muted size={12} style={{ textAlign: "center" }}>
            {text("Already a member? Sign in", "عندك حساب؟ سجّل الدخول")}
          </Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}
