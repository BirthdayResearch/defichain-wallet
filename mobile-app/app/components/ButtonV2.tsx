import { useState, useEffect } from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { tailwind } from "@tailwind";
import { Text } from "./Text";

export type ButtonFillType = "fill" | "flat";
enum ButtonState {
  default,
  disabled,
}

interface ButtonProps extends React.PropsWithChildren<TouchableOpacityProps> {
  fillType?: ButtonFillType;
  label?: string;
  styleProps?: string;
  customButtonStyle?: string;
  customTextStyle?: string;
}

export function ButtonV2(props: ButtonProps): JSX.Element {
  const [buttonState, setButtonState] = useState(ButtonState.default);

  useEffect(() => {
    setButtonState(
      props.disabled === true ? ButtonState.disabled : ButtonState.default
    );
  }, [props.disabled]);

  const {
    label,
    fillType = "fill",
    styleProps = "m-4 mt-8",
    customButtonStyle,
    customTextStyle,
  } = props;
  const { isLight } = useThemeContext();
  const buttonBg = {
    fill: {
      [ButtonState.default]: isLight
        ? "bg-mono-light-v2-900"
        : "bg-mono-dark-v2-900",
      [ButtonState.disabled]: isLight
        ? "bg-mono-light-v2-900 bg-opacity-30"
        : "bg-mono-dark-v2-900 bg-opacity-30",
    },
    flat: {
      [ButtonState.default]: "bg-transparent",
      [ButtonState.disabled]: "bg-transparent",
    },
  };
  const buttonStyle = buttonBg[fillType][buttonState];

  const buttonText = {
    fill: {
      [ButtonState.default]: isLight
        ? "text-mono-light-v2-100"
        : "text-mono-dark-v2-100",
      [ButtonState.disabled]: isLight
        ? "text-mono-light-v2-100"
        : "text-mono-dark-v2-100",
    },
    flat: {
      [ButtonState.default]: isLight
        ? "text-mono-light-v2-900"
        : "text-mono-dark-v2-900",
      [ButtonState.disabled]: isLight
        ? "text-mono-light-v2-900 text-opacity-30"
        : "text-mono-dark-v2-900 text-opacity-30",
    },
  };
  const textStyle = buttonText[fillType][buttonState];
  return (
    <TouchableOpacity
      {...props}
      style={[
        tailwind(
          `${styleProps} p-3.5 flex-row justify-center ${buttonStyle} ${
            customButtonStyle ?? ""
          }`
        ),
        { borderRadius: 26 },
      ]}
      activeOpacity={0.3}
    >
      <Text
        style={tailwind(
          `${textStyle} font-semibold-v2 text-center ${customTextStyle}`
        )}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
