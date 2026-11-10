import React from "react";
import { Image } from "react-native";

import { usePrefs } from "../state/preferences";

/** Official artwork, kept at its original square aspect ratio. */
export function ArenaLogo({ size = 136 }: { size?: number }) {
  const { scheme } = usePrefs();
  return (
    <Image
      source={
        scheme === "dark"
          ? require("../../assets/arena-logo-white.png")
          : require("../../assets/arena-logo.png")
      }
      accessibilityLabel="Arena Gym"
      accessibilityRole="image"
      resizeMode="contain"
      style={{ width: size, height: size }}
    />
  );
}
