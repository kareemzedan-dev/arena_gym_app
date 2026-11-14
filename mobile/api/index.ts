import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { TokenPair } from "@arena/shared";
import { ApiClient } from "./client";
let webSession: string | null = null; // Preview sessions never persist tokens into browser storage.
export const api = new ApiClient(
  (
    process.env.EXPO_PUBLIC_API_URL || "https://test-api.arenagym-om.com"
  ).replace(/\/$/, ""),
  {
    async read() {
      const raw =
        Platform.OS === "web"
          ? webSession
          : await SecureStore.getItemAsync("arena.v4.session");
      if (!raw) return null;
      try {
        const parsed = TokenPair.safeParse(JSON.parse(raw));
        return parsed.success ? parsed.data : null;
      } catch {
        return null;
      }
    },
    async write(pair) {
      const raw = pair ? JSON.stringify(pair) : null;
      if (Platform.OS === "web") {
        webSession = raw;
        return;
      }
      if (raw)
        await SecureStore.setItemAsync("arena.v4.session", raw, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
      else await SecureStore.deleteItemAsync("arena.v4.session");
    },
  },
);
