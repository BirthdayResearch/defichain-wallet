import * as React from "react";
import BigNumber from "bignumber.js";
import { ThemedTextV2 } from "@components/themed";
import { tailwind } from "@tailwind";
import { View } from "@components";
import NumberFormat from "react-number-format";
import { StyleProp, ViewStyle } from "react-native";
import { getPrecisedCurrencyValue } from "@screens/AppNavigator/screens/Auctions/helpers/precision-token-value";
import { PortfolioButtonGroupTabKey } from "@screens/AppNavigator/screens/Portfolio/components/TotalPortfolio";
import { IconTooltip } from "@components/tooltip/IconTooltip";

interface ActiveUSDValueProps {
  style?: StyleProp<ViewStyle>;
  lightTextStyle?: { [key: string]: string };
  darkTextStyle?: { [key: string]: string };
  containerStyle?: StyleProp<ViewStyle>;
  testId?: string;
  price: BigNumber;
  denominationCurrency?: string;
  isOraclePrice?: boolean;
}

export const ActiveUSDValueV2 = React.memo(
  (props: ActiveUSDValueProps): JSX.Element => {
    return (
      <View
        style={[tailwind("flex flex-row items-center"), props.containerStyle]}
      >
        <NumberFormat
          value={getPrecisedCurrencyValue(props.price)}
          thousandSeparator
          displayType="text"
          prefix={
            props.denominationCurrency === undefined ||
            props.denominationCurrency === PortfolioButtonGroupTabKey.USDT
              ? "$"
              : undefined
          }
          suffix={
            props.denominationCurrency !== undefined &&
            props.denominationCurrency !== PortfolioButtonGroupTabKey.USDT
              ? ` ${props.denominationCurrency}`
              : undefined
          }
          renderText={(val: string) => (
            <ThemedTextV2
              dark={props.darkTextStyle ?? tailwind("text-mono-dark-v2-700")}
              light={props.lightTextStyle ?? tailwind("text-mono-light-v2-700")}
              style={[tailwind("text-xs font-normal-v2"), props.style]}
              testID={props.testId}
            >
              {val}
            </ThemedTextV2>
          )}
        />
        {props.isOraclePrice === true && <IconTooltip />}
      </View>
    );
  }
);
