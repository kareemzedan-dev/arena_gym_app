import { Redirect, Stack } from "expo-router";
import { useReducedMotion } from "react-native-reanimated";
import { colors } from "../../mobile/theme/tokens";
import { useSession } from "../../mobile/state/session";
import { Screen, Loading, Failure } from "../../mobile/components/ui";
export const unstable_settings = { initialRouteName: "(tabs)" };
export default function Layout() {
  const reduced = useReducedMotion();
  const session = useSession();
  if (!session.ready)
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
  if (!session.user) return <Redirect href="/login" />;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: reduced ? "none" : "fade",
        animationDuration: 180,
      }}
    />
  );
}
