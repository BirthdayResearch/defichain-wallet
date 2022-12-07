import * as React from "react";
import BigNumber from "bignumber.js";
import { ThemedText } from "@components/themed";
import { useStyles } from "@tailwind";
import { View } from "@components";
import { NumericFormat as NumberFormat } from "react-number-format";
import { StyleProp, ViewStyle } from "react-native";
import { getPrecisedTokenValue } from "@screens/AppNavigator/screens/Auctions/helpers/precision-token-value";
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

export const ActiveUSDValue = React.memo(
  (props: ActiveUSDValueProps): JSX.Element => {
    const { tailwind } = useStyles();
    return (
      <View
        style={[tailwind("flex flex-row items-center"), props.containerStyle]}
      >
        <NumberFormat
          value={getPrecisedTokenValue(props.price)}
          thousandSeparator
          displayType="text"
          prefix={
            props.denominationCurrency === undefined ||
            props.denominationCurrency === PortfolioButtonGroupTabKey.USDT
              ? "≈ $"
              : undefined
          }
          suffix={
            props.denominationCurrency !== undefined &&
            props.denominationCurrency !== PortfolioButtonGroupTabKey.USDT
              ? ` ${props.denominationCurrency}`
              : undefined
          }
          renderText={(val: string) => (
            <ThemedText
              dark={props.darkTextStyle ?? tailwind("text-gray-400")}
              light={props.lightTextStyle ?? tailwind("text-gray-500")}
              style={[tailwind("text-xs"), props.style]}
              testID={props.testId}
            >
              {val}
            </ThemedText>
          )}
        />
        {props.isOraclePrice === true && <IconTooltip />}
      </View>
    );
  }
);
