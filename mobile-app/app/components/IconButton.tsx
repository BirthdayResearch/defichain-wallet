import * as React from "react";
import { StyleProp, TextStyle, TouchableOpacityProps } from "react-native";
import { useStyles } from "@tailwind";
import {
  ThemedIcon,
  ThemedProps,
  ThemedText,
  ThemedTouchableOpacity,
  IconType,
  IconName,
} from "./themed";

interface IconButtonProps extends TouchableOpacityProps {
  iconName?: IconName;
  iconType?: IconType;
  iconSize?: number;
  iconLabel?: string;
  disabled?: boolean;
  disabledThemedProps?: ThemedProps;
  themedProps?: ThemedProps;
  textStyle?: StyleProp<TextStyle>;
  textThemedProps?: ThemedProps;
}

export function IconButton(props: IconButtonProps): JSX.Element {
  const { disabled = false } = props;
  const { tailwind } = useStyles();
  return (
    <ThemedTouchableOpacity
      light={tailwind({
        "border-gray-300 bg-white": !disabled,
        "border-gray-100 bg-gray-100": disabled,
      })}
      dark={tailwind({
        "border-gray-400 bg-gray-900": !disabled,
        "border-gray-800 bg-gray-800": disabled,
      })}
      {...(disabled ? props.disabledThemedProps : props.themedProps)}
      onPress={props.onPress}
      style={[
        tailwind("p-1 flex-row items-center border rounded"),
        props.style,
      ]}
      testID={props.testID}
      disabled={props.disabled}
    >
      {props.iconName !== undefined && props.iconType !== undefined && (
        <ThemedIcon
          light={tailwind({
            "text-primary-500": !disabled,
            "text-gray-300": disabled,
          })}
          dark={tailwind({
            "text-darkprimary-500": !disabled,
            "text-gray-600": disabled,
          })}
          iconType={props.iconType}
          name={props.iconName}
          size={props.iconSize}
        />
      )}

      {props.iconLabel !== undefined && (
        <ThemedText
          light={tailwind({
            "text-primary-500": !disabled,
            "text-gray-300": disabled,
          })}
          dark={tailwind({
            "text-darkprimary-500": !disabled,
            "text-gray-600": disabled,
          })}
          style={[
            tailwind("px-1 text-sm font-medium leading-4"),
            props.textStyle,
          ]}
          {...(disabled ? undefined : props.textThemedProps)}
        >
          {props.iconLabel}
        </ThemedText>
      )}
    </ThemedTouchableOpacity>
  );
}
