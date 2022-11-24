import {
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import { ScrollView, StyleProp, ViewStyle } from "react-native";
import { tailwind } from "@tailwind";
import { translate } from "@translations";

export enum ButtonGroupTabKey {
  AllTokens = "ALL_TOKENS",
  LPTokens = "LP_TOKENS",
  Crypto = "CRYPTO",
  dTokens = "d_TOKENS",
}

interface AssetsFilterRowProps {
  onButtonGroupPress: (key: ButtonGroupTabKey) => void;
  activeButtonGroup: string;
  setActiveButtonGroup: (key: ButtonGroupTabKey) => void;
}

export function AssetsFilterRow(props: AssetsFilterRowProps): JSX.Element {
  const onButtonGroupChange = (buttonGroupTabKey: ButtonGroupTabKey): void => {
    props.setActiveButtonGroup(buttonGroupTabKey);
    props.onButtonGroupPress(buttonGroupTabKey);
  };

  const filterButtonGroup = [
    {
      id: ButtonGroupTabKey.AllTokens,
      label: translate("screens/PortfolioScreen", "All tokens"),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.AllTokens),
    },
    {
      id: ButtonGroupTabKey.dTokens,
      label: translate("screens/PortfolioScreen", "dTokens"),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.dTokens),
    },
    {
      id: ButtonGroupTabKey.Crypto,
      label: translate("screens/PortfolioScreen", "Crypto"),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.Crypto),
    },
    {
      id: ButtonGroupTabKey.LPTokens,
      label: translate("screens/PortfolioScreen", "LP tokens"),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.LPTokens),
    },
  ];
  return (
    <ThemedViewV2 testID="portfolio_button_group" style={tailwind("my-8")}>
      <ScrollView
        contentContainerStyle={tailwind("pl-5")}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {filterButtonGroup.map((button, index) => (
          <AssetsFilterItem
            key={button.id}
            label={button.label}
            onPress={button.handleOnPress}
            isActive={props.activeButtonGroup === button.id}
            testID={`portfolio_button_group_${button.id}`}
            additionalStyles={
              !(filterButtonGroup.length === index)
                ? tailwind("mr-3")
                : undefined
            }
          />
        ))}
      </ScrollView>
    </ThemedViewV2>
  );
}

export interface AssetsFilterItemProps {
  label: string;
  onPress: () => void;
  isActive: boolean;
  testID: string;
  additionalStyles?: StyleProp<ViewStyle>;
}

export function AssetsFilterItem(props: AssetsFilterItemProps): JSX.Element {
  return (
    <ThemedTouchableOpacityV2
      onPress={props.onPress}
      dark={tailwind({
        "bg-mono-dark-v2-900 border-mono-dark-v2-900": props.isActive,
        "border-mono-dark-v2-700": !props.isActive,
      })}
      light={tailwind({
        "bg-mono-light-v2-900": props.isActive,
        "border-mono-light-v2-700": !props.isActive,
      })}
      style={[
        tailwind("rounded-2xl text-center py-2 px-4 border"),
        props.additionalStyles,
      ]}
      testID={`${props.testID}${props.isActive ? "_active" : ""}`}
    >
      <ThemedTextV2
        style={tailwind("font-normal-v2 text-center text-xs")}
        light={tailwind(
          `${
            props.isActive ? "text-mono-light-v2-100" : "text-mono-light-v2-700"
          }`
        )}
        dark={tailwind(
          `${
            props.isActive ? "text-mono-dark-v2-100" : "text-mono-dark-v2-700"
          }`
        )}
      >
        {props.label}
      </ThemedTextV2>
    </ThemedTouchableOpacityV2>
  );
}
