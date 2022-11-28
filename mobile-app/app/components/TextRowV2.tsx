import { StyleProp, TextProps, View, ViewStyle } from "react-native";
import { useStyles } from "@tailwind";
import { openURL } from "@api/linking";
import {
  ThemedIcon,
  ThemedProps,
  ThemedText,
  ThemedTouchableOpacityV2,
  ThemedView,
} from "./themed";

interface TextRowElement extends TextProps {
  value: string;
  testID?: string;
  themedProps?: ThemedProps;
  outerContainerStyle?: StyleProp<ViewStyle>;
}

interface TextRowProps {
  lhs: TextRowElement;
  rhs: TextRowElement & { openNewBrowserLink?: string };
  containerStyle?: ThemedProps & { style: ThemedProps & StyleProp<ViewStyle> };
}

export function TextRowV2(props: TextRowProps): JSX.Element {
  const { tailwind } = useStyles();
  const {
    themedProps: lhsThemedProps,
    testID: lhsTestID,
    value: lhsValue,
    ...lhsOtherProps
  } = props.lhs;
  const {
    themedProps: rhsThemedProps,
    testID: rhsTestID,
    value: rhsValue,
    ...rhsOtherProps
  } = props.rhs;

  return (
    <ThemedView
      {...(props.containerStyle != null
        ? props.containerStyle
        : {
            style: tailwind("flex-row items-start w-full bg-transparent"),
            light: tailwind("bg-transparent"),
            dark: tailwind("bg-transparent"),
          })}
    >
      <View style={[tailwind("w-5/12"), props.lhs.outerContainerStyle]}>
        <View style={tailwind("flex-row items-center justify-start")}>
          <ThemedText
            style={tailwind("text-sm font-normal-v2 flex-wrap mr-1")}
            light={tailwind("text-mono-light-v2-900")}
            dark={tailwind("text-mono-dark-v2-900")}
            testID={lhsTestID}
            {...lhsThemedProps}
            {...lhsOtherProps}
          >
            {lhsValue}
          </ThemedText>
        </View>
      </View>

      <View style={[tailwind("flex-1"), props.rhs.outerContainerStyle]}>
        <ThemedTouchableOpacityV2
          onPress={async () =>
            await openURL(rhsOtherProps.openNewBrowserLink as string)
          }
          disabled={rhsOtherProps.openNewBrowserLink === undefined}
          style={tailwind("flex flex-row items-center justify-end")}
        >
          <View style={tailwind("flex-1")}>
            <ThemedText
              style={tailwind("text-right font-normal-v2 text-sm")}
              light={tailwind("text-mono-light-v2-700")}
              dark={tailwind("text-mono-dark-v2-700")}
              testID={rhsTestID}
              {...rhsThemedProps}
              {...rhsOtherProps}
            >
              {rhsValue}
            </ThemedText>
          </View>

          {rhsOtherProps.openNewBrowserLink !== undefined && (
            <View style={tailwind("border-b-0")}>
              <ThemedIcon
                iconType="MaterialIcons"
                style={tailwind("pl-1")}
                dark={tailwind("text-mono-dark-v2-900")}
                light={tailwind("text-mono-light-v2-900")}
                name="open-in-new"
                size={18}
              />
            </View>
          )}
        </ThemedTouchableOpacityV2>
      </View>
    </ThemedView>
  );
}
