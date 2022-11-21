import classNames, { Argument } from "classnames";
import { useTailwind } from 'tailwind-rn';

// TODO(platno): Move this to theme
const fonts = {
  "font-light": {
    fontFamily: "LightFont",
    fontWeight: "300",
  },
  "font-normal": {
    fontFamily: "RegularFont",
    fontWeight: "400",
  },
  "font-medium": {
    fontFamily: "MediumFont",
    fontWeight: "500",
  },
  "font-semibold": {
    fontFamily: "SemiBoldFont",
    fontWeight: "600",
  },
  "font-bold": {
    fontFamily: "BoldFont",
    fontWeight: "700",
  },
  "font-light-v2": {
    fontFamily: "SoraLight",
    fontWeight: "300",
  },
  "font-normal-v2": {
    fontFamily: "SoraRegular",
    fontWeight: "400",
  },
  "font-medium-v2": {
    fontFamily: "SoraMedium",
    fontWeight: "500",
  },
  "font-semibold-v2": {
    fontFamily: "SoraSemiBold",
    fontWeight: "600",
  },
  "font-bold-v2": {
    fontFamily: "SoraBold",
    fontWeight: "700",
  },
};

export function useStyles(): {
  tailwind: (...args: Argument[]) => { [key: string]: string },
  getColor: (colorClassName: string) => string;
} {
  const tailwind = useTailwind();
  
  const getStyles = (...args: Argument[]) => {
    return tailwind(classNames(args));
  };

  const getColor = (colorClassName: string) => {
    const { color } = tailwind(colorClassName);

    //TODO(platno): I need to fix getting color from theme
    console.log('getColor', colorClassName, color);

    return '#ffffff';
  }

  return {
    tailwind: getStyles,
    getColor
  };
}
