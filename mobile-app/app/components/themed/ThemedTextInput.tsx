import * as Localization from "expo-localization";
import { forwardRef } from "react";
import * as React from "react";
import {
  KeyboardTypeOptions,
  Platform,
  TextInput,
  TextInputProps,
} from "react-native";
import { useThemeContext } from "@waveshq/walletkit-ui";
import { tailwind } from "@tailwind";

export const ThemedTextInput = forwardRef(
  (
    props: React.PropsWithChildren<TextInputProps>,
    ref: React.Ref<any>
  ): JSX.Element => {
    const { isLight } = useThemeContext();
    const { style, keyboardType, ...otherProps } = props;

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
        placeholderTextColor={isLight ? "rgba(0, 0, 0, 0.4)" : "#828282"}
        style={[style, tailwind(isLight ? "text-gray-700" : "text-white")]}
        ref={ref}
        {...otherProps}
        keyboardType={getKeyboardType()}
      />
    );
  }
);
