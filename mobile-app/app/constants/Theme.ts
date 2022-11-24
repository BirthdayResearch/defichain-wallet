import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { Theme } from "@react-navigation/native/lib/typescript/src/types";
import { getColor } from "@tailwind";

export function getDefaultTheme(isLight: boolean): Theme {
  const defaultTheme = isLight ? DefaultTheme : DarkTheme;
  return {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      primary: getColor(isLight ? "mono-light-v2-900" : "mono-dark-v2-900"),
      border: getColor(isLight ? "mono-light-v2-100" : "mono-dark-v2-100"),
    },
  };
}
