import classNames, { Argument } from "classnames";
import { useTailwind } from 'tailwind-rn';
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { Theme } from "@react-navigation/native/lib/typescript/src/types";
import { useThemeContext } from "@shared-contexts/ThemeProvider";

export function useStyles(): {
  tailwind: (...args: Argument[]) => { [key: string]: string },
  getColor: (colorClassName: string) => string,
  getDefaultTheme: () => Theme,
} {
  const tailwind = useTailwind();
  const theme = useThemeContext();
  
  const getStyles = (...args: Argument[]) => {
    return tailwind(classNames(args));
  };

  const getColor = (colorClassName: string) => {
    const { color } = tailwind(`text-${colorClassName}`);
    return color;
  };

  const getDefaultTheme = () => {
    const defaultTheme = theme?.isLight ? DefaultTheme : DarkTheme;
    return {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        primary: getColor(theme?.isLight ? "mono-light-v2-900" : "mono-dark-v2-900"),
        border: getColor(theme?.isLight ? "mono-light-v2-100" : "mono-dark-v2-100"),
      },
    };
  };

  return {
    tailwind: getStyles,
    getColor,
    getDefaultTheme,
  };
}
