import * as Localization from "expo-localization";
import { forwardRef } from "react";
import * as React from "react";
import {
  KeyboardTypeOptions,
  Platform,
  TextInput,
  TextInputProps,
} from "react-native";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { useStyles } from "@tailwind";
import { ThemedProps } from "./";

export const ThemedTextInputV2 = forwardRef(
  (
    props: React.PropsWithChildren<TextInputProps & ThemedProps>,
    ref: React.Ref<any>
  ): JSX.Element => {
    const { getColor, tailwind } = useStyles();
    const { isLight } = useThemeContext();
    const {
      style,
      keyboardType,
      light = tailwind("text-mono-light-v2-800"),
      dark = tailwind("text-mono-dark-v2-800"),
      placeholderTextColor = isLight
        ? getColor("mono-light-v2-500")
        : getColor("mono-dark-v2-500"),
      ...otherProps
    } = props;

    const getKeyboardType = (): KeyboardTypeOptions | undefined => {
      if (
        keyboardType === "numeric" &&
        Platform.OS === "ios" &&
        Localization.decimalSeparator !== "."
      ) {
        return "default";
      }
      return keyboardType;
    };

    return (
      <TextInput
        placeholderTextColor={placeholderTextColor}
        selectionColor={getColor("brand-v2-500")}
        style={[style, isLight ? light : dark]}
        ref={ref}
        {...otherProps}
        keyboardType={getKeyboardType()}
      />
    );
  }
);
