import { usePrefs } from "../state/preferences";
import { themes } from "./tokens";
export function useTheme() {
  return themes[usePrefs().scheme];
}
