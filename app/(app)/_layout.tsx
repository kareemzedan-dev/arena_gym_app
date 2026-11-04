import { Stack } from "expo-router";
import { useReducedMotion } from "react-native-reanimated";
import { colors } from "../../mobile/theme/tokens";
export default function Layout() {
  const reduced = useReducedMotion();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: reduced ? "none" : "slide_from_right",
      }}
    />
  );
}
