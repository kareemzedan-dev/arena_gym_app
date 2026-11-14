import React, { useEffect } from "react";
import { Platform } from "react-native";
import * as SystemUI from "expo-system-ui";
import { useReducedMotion } from "react-native-reanimated";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SessionProvider, useSession } from "../mobile/state/session";
import { Preferences, usePrefs } from "../mobile/state/preferences";
import { Failure, Loading, Screen } from "../mobile/components/ui";
import { useTheme } from "../mobile/theme/use-theme";
export { ErrorBoundary } from "expo-router";
function Navigator() {
  const c = useTheme();
  const reduced = useReducedMotion();
  const session = useSession();
  const prefs = usePrefs();
  if (!session.ready || !prefs.ready)
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  if (session.bootError)
    return (
      <Screen>
        <Failure error={new Error("Connection failed")} retry={session.retry} />
      </Screen>
    );
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: c.bg },
        animation: reduced ? "none" : "fade",
        animationDuration: 180,
      }}
    >
      <Stack.Protected guard={!prefs.introDone || !session.user}>
        <Stack.Screen name="index" />
      </Stack.Protected>
      <Stack.Protected guard={!session.user}>
        <Stack.Screen name="login" />
      </Stack.Protected>
      <Stack.Protected guard={!!session.user && prefs.introDone}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
function ThemedRoot() {
  const c = useTheme();
  const { scheme } = usePrefs();
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(c.bg).catch(() => {});
    if (Platform.OS === "web")
      document.documentElement.style.colorScheme = scheme;
  }, [c.bg, scheme]);
  const [loaded, error] = useFonts({
    ...Ionicons.font,
    Cairo: require("../assets/Fonts/Cairo-Regular.ttf"),
    CairoBold: require("../assets/Fonts/Cairo-Bold.ttf"),
  });
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaProvider>
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        <SessionProvider>
          {loaded || error ? (
            <Navigator />
          ) : (
            <Screen>
              <Loading />
            </Screen>
          )}
        </SessionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function Root() {
  return (
    <Preferences>
      <ThemedRoot />
    </Preferences>
  );
}
