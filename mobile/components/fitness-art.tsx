import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Icon } from "./ui";
import { colors as c } from "../theme/tokens";

/** Large vector artwork; one gentle entrance, never a continuous animation. */
export function FitnessArt({
  icon = "barbell-outline",
  size = 300,
  animate = false,
}: {
  icon?: React.ComponentProps<typeof Icon>["name"];
  size?: number;
  animate?: boolean;
}) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(animate && !reduced ? 0 : 1);
  useEffect(() => {
    progress.value = animate && !reduced ? 0 : 1;
    if (animate && !reduced)
      progress.value = withTiming(1, {
        duration: 900,
        easing: Easing.out(Easing.cubic),
      });
    return () => cancelAnimation(progress);
  }, [animate, reduced, progress]);
  const entrance = useAnimatedStyle(() => ({
    opacity: 0.3 + progress.value * 0.7,
    transform: [
      { scale: 0.84 + progress.value * 0.16 },
      { translateY: (1 - progress.value) * 12 },
    ],
  }));
  const orbit = useAnimatedStyle(() => ({
    transform: [{ rotate: `${(1 - progress.value) * -12}deg` }],
  }));
  return (
    <View
      testID="fitness-art"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
      pointerEvents="none"
      style={{
        width: size,
        height: size,
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            alignItems: "center",
            justifyContent: "center",
          },
          entrance,
        ]}
      >
        <Animated.View
          style={[
            {
              position: "absolute",
              width: size * 0.94,
              height: size * 0.94,
              borderRadius: size,
              borderWidth: 1,
              borderColor: "#31564F",
              alignItems: "center",
              justifyContent: "center",
            },
            orbit,
          ]}
        >
          <View
            style={{
              position: "absolute",
              top: size * 0.08,
              right: size * 0.01,
              padding: size * 0.045,
              backgroundColor: c.raised,
              borderRadius: size,
              borderWidth: 1,
              borderColor: c.line,
            }}
          >
            <Icon name="sparkles-outline" size={size * 0.11} color={c.lime} />
          </View>
          <View
            style={{
              position: "absolute",
              bottom: size * 0.03,
              left: size * 0.045,
              padding: size * 0.045,
              backgroundColor: c.raised,
              borderRadius: size,
              borderWidth: 1,
              borderColor: c.line,
            }}
          >
            <Icon name="heart-outline" size={size * 0.11} />
          </View>
        </Animated.View>
        <View
          style={{
            width: size * 0.69,
            height: size * 0.69,
            borderRadius: size * 0.24,
            backgroundColor: "#203C36",
            borderWidth: 1,
            borderColor: "#42665A",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={icon} size={size * 0.4} color={c.accent} />
        </View>
      </Animated.View>
    </View>
  );
}
