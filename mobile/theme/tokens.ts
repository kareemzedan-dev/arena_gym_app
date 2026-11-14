export const darkColors = {
  bg: "#101716",
  card: "#1B2422",
  raised: "#25312E",
  line: "#34433E",
  text: "#F3F5F0",
  muted: "#A5B4AD",
  accent: "#42D5C3",
  primary: "#42D5C3",
  ink: "#082E29",
  lime: "#CFEB91",
  red: "#FFAAA4",
  placeholder: "#A5B4AD",
  successBg: "#254638",
  dangerBg: "#4A332D",
  dangerBorder: "#69423D",
  hero: "#203C36",
  highlight: "#203B34",
  highlightBorder: "#31594B",
  artBorder: "#42665A",
  transparent: "transparent",
  qrPaper: "#FFFFFF",
  qrInk: "#000000",
};
export type Colors = { [K in keyof typeof darkColors]: string };
export const lightColors: Colors = {
  bg: "#F8F7F2",
  card: "#FFFFFF",
  raised: "#E9EFEB",
  line: "#D5DFD9",
  text: "#123D39",
  muted: "#506963",
  accent: "#08777D",
  primary: "#30AFB5",
  ink: "#062C2B",
  lime: "#356323",
  red: "#A52B25",
  placeholder: "#506963",
  successBg: "#E7F1DE",
  dangerBg: "#FBE8E3",
  dangerBorder: "#C88C83",
  hero: "#DDF0EA",
  highlight: "#EAF4EF",
  highlightBorder: "#BED7CB",
  artBorder: "#95B8A8",
  transparent: "transparent",
  qrPaper: "#FFFFFF",
  qrInk: "#000000",
};
export const themes = { light: lightColors, dark: darkColors };
export type ThemePreference = "light" | "dark" | "system";
export const resolveTheme = (
  preference: ThemePreference,
  system: string | null | undefined,
) =>
  preference === "system" ? (system === "dark" ? "dark" : "light") : preference;
export const radius = 24;
