import React, { useState } from "react";
import {
  View,
  Text as RNText,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  type TextProps,
  type ViewStyle,
  type StyleProp,
  type TextInputProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, {
  FadeInDown,
  useReducedMotion,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { colors as c } from "../theme/tokens";
import { usePrefs } from "../state/preferences";
import { ApiError } from "../api/client";
export function Text({
  style,
  muted,
  accent,
  size = 14,
  bold,
  ...props
}: TextProps & {
  muted?: boolean;
  accent?: boolean;
  size?: number;
  bold?: boolean;
}) {
  const { ar } = usePrefs();
  return (
    <RNText
      {...props}
      style={[
        {
          color: accent ? c.accent : muted ? c.muted : c.text,
          fontFamily: bold ? "CairoBold" : "Cairo",
          fontSize: size,
          lineHeight: size * 1.55,
          textAlign: ar ? "right" : "left",
          writingDirection: ar ? "rtl" : "ltr",
        },
        style,
      ]}
    />
  );
}
export function Row({
  children,
  style,
}: React.PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const { ar } = usePrefs();
  return (
    <View
      style={[
        {
          flexDirection: ar ? "row-reverse" : "row",
          alignItems: "center",
          gap: 12,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
export function Icon({
  name,
  color = c.accent,
  size = 22,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  color?: string;
  size?: number;
}) {
  return (
    <Ionicons
      name={name}
      color={color}
      size={size}
      accessible={false}
      aria-hidden={true}
    />
  );
}
export function Button({
  title,
  onPress,
  secondary,
  busy,
  disabled,
  icon,
}: {
  title: string;
  onPress(): void;
  secondary?: boolean;
  busy?: boolean;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof Icon>["name"];
}) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const animation = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={animation}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: !!disabled || !!busy, busy: !!busy }}
        disabled={disabled || busy}
        onPressIn={() => {
          if (!reduced) scale.value = withSpring(0.97);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={() => {
          if (Platform.OS !== "web")
            void Haptics.selectionAsync().catch(() => {});
          onPress();
        }}
        style={[
          s.button,
          secondary && {
            backgroundColor: c.raised,
            borderWidth: 1,
            borderColor: c.line,
          },
          (disabled || busy) && { opacity: 0.5 },
        ]}
      >
        {busy ? (
          <ActivityIndicator color={secondary ? c.accent : c.ink} />
        ) : (
          <Row style={{ justifyContent: "center" }}>
            <Text bold size={15} style={{ color: secondary ? c.text : c.ink }}>
              {title}
            </Text>
            {icon && (
              <Icon
                name={icon}
                color={secondary ? c.accent : c.ink}
                size={19}
              />
            )}
          </Row>
        )}
      </Pressable>
    </Animated.View>
  );
}
export function Card({
  children,
  style,
  delay = 0,
}: React.PropsWithChildren<{ style?: StyleProp<ViewStyle>; delay?: number }>) {
  const reduced = useReducedMotion();
  return (
    <Animated.View
      entering={reduced ? undefined : FadeInDown.duration(280).delay(delay)}
      style={[s.card, style]}
    >
      {children}
    </Animated.View>
  );
}
export function Screen({
  children,
  title,
  subtitle,
  back,
  action,
  refreshing = false,
  onRefresh,
}: React.PropsWithChildren<{
  title?: string;
  subtitle?: string;
  back?: boolean;
  action?: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
}>) {
  const router = useRouter();
  const { text, ar } = usePrefs();
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: c.bg }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={s.page}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={c.accent}
              />
            ) : undefined
          }
        >
          {title && (
            <Row style={{ marginBottom: 8 }}>
              {back && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={text("Back", "رجوع")}
                  hitSlop={12}
                  style={s.iconButton}
                  onPress={() =>
                    router.canGoBack() ? router.back() : router.replace("/")
                  }
                >
                  <Icon
                    name={ar ? "arrow-forward" : "arrow-back"}
                    color={c.text}
                  />
                </Pressable>
              )}
              <View style={{ flex: 1 }}>
                {subtitle && (
                  <Text
                    accent
                    size={11}
                    bold
                    style={{ letterSpacing: ar ? 0 : 2 }}
                  >
                    {subtitle}
                  </Text>
                )}
                <Text size={28} bold>
                  {title}
                </Text>
              </View>
              {action}
            </Row>
          )}
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const { ar } = usePrefs();
  return (
    <View style={{ gap: 6 }}>
      <Text muted size={12} bold>
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        maxLength={4096}
        placeholderTextColor="#7B8F85"
        selectionColor={c.accent}
        {...props}
        style={[
          s.input,
          { textAlign: ar ? "right" : "left" },
          props.multiline && { minHeight: 100, textAlignVertical: "top" },
          props.style,
        ]}
      />
    </View>
  );
}
export function Section({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <Row style={{ justifyContent: "space-between", marginTop: 8 }}>
      <Text size={19} bold>
        {title}
      </Text>
      {action && (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          style={{ paddingVertical: 12 }}
        >
          <Text accent size={12} bold>
            {action}
          </Text>
        </Pressable>
      )}
    </Row>
  );
}
export function Badge({
  children,
  good = true,
}: React.PropsWithChildren<{ good?: boolean }>) {
  return (
    <View
      style={{
        backgroundColor: good ? "#254638" : "#4A332D",
        alignSelf: "flex-start",
        paddingHorizontal: 11,
        paddingVertical: 4,
        borderRadius: 30,
      }}
    >
      <Text size={10} bold style={{ color: good ? c.lime : c.red }}>
        {children}
      </Text>
    </View>
  );
}
export function Stat({
  value,
  label,
  unit,
}: {
  value: string | number;
  label: string;
  unit?: string;
}) {
  return (
    <View style={{ flex: 1, gap: 3 }}>
      <Row style={{ gap: 4, alignItems: "baseline" }}>
        <Text bold size={29}>
          {value}
        </Text>
        {unit && (
          <Text muted size={11}>
            {unit}
          </Text>
        )}
      </Row>
      <Text muted size={11}>
        {label}
      </Text>
    </View>
  );
}
export function Empty({
  title,
  detail,
  icon = "leaf-outline",
}: {
  title: string;
  detail?: string;
  icon?: React.ComponentProps<typeof Icon>["name"];
}) {
  return (
    <Card style={{ paddingVertical: 35, alignItems: "center" }}>
      <View style={s.iconButton}>
        <Icon name={icon} />
      </View>
      <Text bold style={{ textAlign: "center" }}>
        {title}
      </Text>
      {detail && (
        <Text muted size={12} style={{ textAlign: "center" }}>
          {detail}
        </Text>
      )}
    </Card>
  );
}
export function Failure({
  error,
  retry,
}: {
  error: unknown;
  retry?: () => void;
}) {
  const { text } = usePrefs();
  const code = error instanceof ApiError ? error.status : 0;
  return (
    <Card style={{ borderColor: "#69423D" }}>
      <Text style={{ color: c.red }} accessibilityRole="alert">
        {code === 401
          ? text("Please sign in again.", "سجّل الدخول مرة أخرى.")
          : code === 403
            ? text(
                "Your account cannot access this action.",
                "هذه العملية غير متاحة لحسابك.",
              )
            : code === 429
              ? text(
                  "Too many attempts. Please wait a minute.",
                  "محاولات كثيرة. انتظر دقيقة ثم حاول مجددًا.",
                )
              : code === 409
                ? text(
                    "This record changed or conflicts with an existing record. Refresh and review.",
                    "البيانات اتغيرت أو متعارضة مع سجل موجود. حدّث وراجع البيانات.",
                  )
                : code === 400
                  ? text(
                      "Check the values and try again.",
                      "راجع البيانات وحاول مرة أخرى.",
                    )
                  : text(
                      "Could not connect. Check your connection and try again.",
                      "تعذر الاتصال. تأكد من الإنترنت وحاول مجددًا.",
                    )}
      </Text>
      {retry && (
        <Button
          title={text("Try again", "حاول مجددًا")}
          onPress={retry}
          secondary
        />
      )}
    </Card>
  );
}
export function Loading() {
  const { text } = usePrefs();
  return (
    <View
      accessibilityLabel={text("Loading", "جار التحميل")}
      style={{ padding: 40 }}
    >
      <ActivityIndicator color={c.accent} />
    </View>
  );
}
export function ListRow({
  title,
  subtitle,
  icon,
  onPress,
  trailing,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ComponentProps<typeof Icon>["name"];
  onPress?: () => void;
  trailing?: React.ReactNode;
}) {
  const { ar } = usePrefs();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={onPress ? title : undefined}
      style={({ pressed }) => [
        s.listRow,
        pressed && onPress && { backgroundColor: c.raised },
      ]}
    >
      <Row>
        {icon && (
          <View style={s.iconButton}>
            <Icon name={icon} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text bold>{title}</Text>
          {subtitle && (
            <Text size={11} muted>
              {subtitle}
            </Text>
          )}
        </View>
        {trailing ||
          (onPress && (
            <Icon
              name={ar ? "chevron-back" : "chevron-forward"}
              color={c.muted}
              size={17}
            />
          ))}
      </Row>
    </Pressable>
  );
}
export function Chips({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange(v: string): void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
    >
      {options.map((o) => (
        <Pressable
          key={o.value}
          accessibilityRole="radio"
          accessibilityState={{ checked: value === o.value }}
          onPress={() => onChange(o.value)}
          style={{
            minHeight: 46,
            justifyContent: "center",
            paddingHorizontal: 18,
            borderRadius: 30,
            backgroundColor: value === o.value ? c.accent : c.card,
            borderWidth: 1,
            borderColor: value === o.value ? c.accent : c.line,
          }}
        >
          <Text
            bold
            size={12}
            style={{ color: value === o.value ? c.ink : c.muted }}
          >
            {o.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
export const s = StyleSheet.create({
  page: {
    padding: 24,
    paddingBottom: 44,
    gap: 18,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  card: {
    backgroundColor: c.card,
    borderRadius: 24,
    padding: 22,
    gap: 16,
    borderWidth: 1,
    borderColor: c.line,
  },
  button: {
    backgroundColor: c.accent,
    borderRadius: 18,
    minHeight: 56,
    padding: 14,
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.card,
    color: c.text,
    borderRadius: 16,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: "Cairo",
    fontSize: 14,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.raised,
  },
  listRow: {
    backgroundColor: c.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: c.line,
  },
});
