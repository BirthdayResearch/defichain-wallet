import { tailwind } from "@tailwind";
import {
  ThemedView,
  ThemedText,
  ThemedViewV2,
  ThemedTextV2,
} from "@components/themed";
import NumberFormat from "react-number-format";
import { StyleProp, ViewProps } from "react-native";
import { TextProps } from "@components";
import { SuffixType } from "./NumberRow";

interface InputHelperTextProps extends React.PropsWithChildren<ViewProps> {
  testID?: string;
  label: string;
  content: string;
  suffix?: string;
  suffixType?: SuffixType;
  styleProps?: StyleProp<TextProps>;
  labelStyleProps?: StyleProp<TextProps>;
}
export function InputHelperText(props: InputHelperTextProps): JSX.Element {
  return (
    <ThemedView
      light={tailwind("bg-transparent")}
      dark={tailwind("bg-transparent")}
      style={tailwind("flex-1 flex-row flex-wrap mt-1 mb-4 text-sm")}
    >
      <ThemedText
        light={tailwind("text-gray-400")}
        dark={tailwind("text-gray-500")}
        style={[tailwind("text-sm"), props.labelStyleProps]}
      >
        {`${props.label}`}
      </ThemedText>

      <NumberFormat
        decimalScale={8}
        displayType="text"
        renderText={(value) => (
          <ThemedText
            light={tailwind("text-gray-700")}
            dark={tailwind("text-gray-200")}
            style={[tailwind("text-sm"), props.styleProps]}
            testID={props.testID}
          >
            {value}
          </ThemedText>
        )}
        suffix={props.suffixType !== "component" ? props.suffix : ""}
        thousandSeparator
        value={props.content}
      />
      {props.suffixType === "component" && props.children}
    </ThemedView>
  );
}
export function InputHelperTextV2(props: InputHelperTextProps): JSX.Element {
  return (
    <ThemedViewV2
      light={tailwind("bg-transparent")}
      dark={tailwind("bg-transparent")}
      style={tailwind("flex flex-row pt-1 text-sm px-4")}
    >
      <ThemedTextV2
        light={tailwind("text-mono-light-v2-500")}
        dark={tailwind("text-mono-light-v2-500")}
        style={[tailwind("text-xs font-normal-v2"), props.labelStyleProps]}
      >
        {`${props.label}`}
      </ThemedTextV2>

      <NumberFormat
        decimalScale={8}
        displayType="text"
        renderText={(value) => (
          <ThemedTextV2
            light={tailwind("text-mono-light-v2-500")}
            dark={tailwind("text-mono-light-v2-500")}
            style={[tailwind("text-xs font-normal-v2"), props.styleProps]}
            testID={props.testID}
          >
            {value}
          </ThemedTextV2>
        )}
        suffix={props.suffixType !== "component" ? props.suffix : ""}
        thousandSeparator
        value={props.content}
      />
      {props.suffixType === "component" && props.children}
    </ThemedViewV2>
  );
}
