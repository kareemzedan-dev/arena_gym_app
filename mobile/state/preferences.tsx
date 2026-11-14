import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import { Appearance, Platform, useColorScheme } from "react-native";
import { resolveTheme, type ThemePreference } from "../theme/tokens";
const Context = createContext<{
  ar: boolean;
  theme: ThemePreference;
  scheme: "light" | "dark";
  setTheme(value: ThemePreference): void;
  ready: boolean;
  introDone: boolean;
  text(en: string, ar: string): string;
  toggleLanguage(): void;
  finishIntro(): Promise<void>;
}>(null!);
export function Preferences({ children }: React.PropsWithChildren) {
  const system = useColorScheme();
  const [theme, updateTheme] = useState<ThemePreference>("system");
  useEffect(() => {
    // Native controls and system chrome must follow explicit overrides as well.
    if (Platform.OS !== "web")
      Appearance.setColorScheme(theme === "system" ? "unspecified" : theme);
  }, [theme]);
  const [ar, setAr] = useState(getLocales()[0]?.languageCode === "ar");
  const [ready, setReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  useEffect(() => {
    AsyncStorage.multiGet([
      "arena.language",
      "arena.intro.icons.v1",
      "arena.theme",
    ])
      .then((values) => {
        if (values[0][1]) setAr(values[0][1] === "ar");
        const savedTheme = values[2][1];
        if (
          savedTheme === "light" ||
          savedTheme === "dark" ||
          savedTheme === "system"
        )
          updateTheme(savedTheme);
        setIntroDone(values[1][1] === "1");
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);
  return (
    <Context.Provider
      value={{
        ar,
        theme,
        scheme: resolveTheme(theme, system),
        setTheme(value) {
          updateTheme(value);
          void AsyncStorage.setItem("arena.theme", value).catch(() => {});
        },
        ready,
        introDone,
        text: (en, arabic) => (ar ? arabic : en),
        toggleLanguage() {
          setAr(!ar);
          void AsyncStorage.setItem("arena.language", ar ? "en" : "ar").catch(
            () => {},
          );
        },
        async finishIntro() {
          await AsyncStorage.setItem("arena.intro.icons.v1", "1").catch(
            () => {},
          );
          setIntroDone(true);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const usePrefs = () => useContext(Context);
