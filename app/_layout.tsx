import React from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SessionProvider, useSession } from "../mobile/state/session";
import { Preferences, usePrefs } from "../mobile/state/preferences";
import { Failure, Loading, Screen } from "../mobile/components/ui";
import { colors } from "../mobile/theme/tokens";
export { ErrorBoundary } from "expo-router";
function Navigator() {
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
        contentStyle: { backgroundColor: colors.bg },
        animation: "slide_from_right",
      }}
    >
      <Stack.Protected guard={!session.user}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
      </Stack.Protected>
      <Stack.Protected guard={!!session.user}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
export default function Root() {
  const [loaded, error] = useFonts({
    Cairo: require("../assets/Fonts/Cairo-Regular.ttf"),
    CairoBold: require("../assets/Fonts/Cairo-Bold.ttf"),
  });
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <Preferences>
          <StatusBar style="light" />
          <SessionProvider>
            {loaded || error ? (
              <Navigator />
            ) : (
              <Screen>
                <Loading />
              </Screen>
            )}
          </SessionProvider>
        </Preferences>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
