import React from "react";
import { Image } from "react-native";

/** Official artwork, kept at its original square aspect ratio. */
export function ArenaLogo({ size = 136 }: { size?: number }) {
  return (
    <Image
      source={require("../../assets/arena-logo.png")}
      accessibilityLabel="Arena Gym"
      accessibilityRole="image"
      resizeMode="contain"
      style={{ width: size, height: size }}
    />
  );
}
