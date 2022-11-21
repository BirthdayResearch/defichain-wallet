import { View } from "@components";
import { ThemedProps, ThemedTextV2, ThemedViewV2 } from "@components/themed";
import { useStyles } from "@tailwind";
import BigNumber from "bignumber.js";
import {
  StyleProp,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

interface ButtonGroupProps {
  buttons: Buttons[];
  activeButtonGroupItem: string;
  testID: string;
  labelStyle?: StyleProp<TextStyle>;
  containerThemedProps?: ThemedProps;
  modalStyle?: StyleProp<TextStyle>;
  lightThemeStyle?: { [key: string]: string };
  darkThemeStyle?: { [key: string]: string };
  customButtonGroupStyle?: StyleProp<TouchableOpacityProps>;
  customActiveStyle?: ThemedProps;
}

interface Buttons {
  id: string;
  label: string;
  handleOnPress: () => void;
  isDisabled?: boolean;
}

export function ButtonGroupV2(props: ButtonGroupProps): JSX.Element {
  const { tailwind } = useStyles();
  const buttonWidth = new BigNumber(100).dividedBy(props.buttons.length);
  return (
    <ThemedViewV2
      light={props.lightThemeStyle ?? tailwind("bg-mono-light-v2-00")}
      dark={props.darkThemeStyle ?? tailwind("bg-mono-dark-v2-00")}
      style={tailwind("flex flex-row")}
      testID={props.testID}
      {...props.containerThemedProps}
    >
      {props.buttons.map((button) => (
        <ButtonGroupItem
          label={button.label}
          onPress={button.handleOnPress}
          isActive={props.activeButtonGroupItem === button.id}
          width={buttonWidth}
          key={button.id}
          testID={`${props.testID}_${button.id}`}
          labelStyle={props.labelStyle}
          modalStyle={props.modalStyle}
          customButtonGroupStyle={props.customButtonGroupStyle}
          customActiveStyle={props.customActiveStyle}
          isDisabled={button.isDisabled}
        />
      ))}
    </ThemedViewV2>
  );
}

interface ButtonGroupItemProps {
  label: string;
  onPress: () => void;
  isActive: boolean;
  width: BigNumber;
  testID: string;
  labelStyle?: StyleProp<TextStyle>;
  modalStyle?: StyleProp<TextStyle>;
  customButtonGroupStyle?: StyleProp<TouchableOpacityProps>;
  customActiveStyle?: ThemedProps;
  isDisabled?: boolean;
}

function ButtonGroupItem(props: ButtonGroupItemProps): JSX.Element {
  const { tailwind } = useStyles();
  return (
    <TouchableOpacity
      onPress={props.onPress}
      {...(props.isActive && props.customActiveStyle)}
      style={
        props.customButtonGroupStyle ?? [
          tailwind("px-2"),
          { width: `${props.width.toFixed(2)}%` },
        ]
      }
      testID={`${props.testID}${props.isActive ? "_active" : ""}`}
      disabled={props.isDisabled}
    >
      <View
        style={
          props.customButtonGroupStyle ?? [
            tailwind([
              "break-words justify-center pt-2.5 pb-4 border-brand-v2-500",
              { "border-b-2 border-brand-v2-500": props.isActive },
            ]),
          ]
        }
      >
        <ThemedTextV2
          light={tailwind({
            "text-brand-v2-500": props.isActive,
            "text-mono-light-v2-900": !props.isActive,
            "text-opacity-30": props.isDisabled,
          })}
          dark={tailwind({
            "text-brand-v2-500": props.isActive,
            "text-mono-dark-v2-900": !props.isActive,
            "text-opacity-30": props.isDisabled,
          })}
          style={
            props.labelStyle ?? tailwind("font-semibold-v2 text-sm text-center")
          }
        >
          {props.label}
        </ThemedTextV2>
      </View>
    </TouchableOpacity>
  );
}
