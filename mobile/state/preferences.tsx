import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
const Context = createContext<{
  ar: boolean;
  ready: boolean;
  introDone: boolean;
  text(en: string, ar: string): string;
  toggleLanguage(): void;
  finishIntro(): Promise<void>;
}>(null!);
export function Preferences({ children }: React.PropsWithChildren) {
  const [ar, setAr] = useState(getLocales()[0]?.languageCode === "ar");
  const [ready, setReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  useEffect(() => {
    AsyncStorage.multiGet(["arena.language", "arena.intro"])
      .then((values) => {
        if (values[0][1]) setAr(values[0][1] === "ar");
        setIntroDone(values[1][1] === "1");
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);
  return (
    <Context.Provider
      value={{
        ar,
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
          await AsyncStorage.setItem("arena.intro", "1").catch(() => {});
          setIntroDone(true);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const usePrefs = () => useContext(Context);
