import { View } from "react-native";
import { ThemedTextV2 } from "@components/themed";
import { NumericFormat as NumberFormat } from "react-number-format";
import { useStyles } from "@tailwind";
import BigNumber from "bignumber.js";
import { translate } from "@translations";
import { ActiveUSDValueV2 } from "@screens/AppNavigator/screens/Loans/VaultDetail/components/ActiveUSDValueV2";

interface InstantSwapRowToProps {
  tokenAmount: string;
  tokenUsdAmount: BigNumber;
}

export function InstantSwapRowTo({
  tokenAmount,
  tokenUsdAmount,
}: InstantSwapRowToProps): JSX.Element {
  const { tailwind } = useStyles();
  return (
    <View style={tailwind("w-6/12 mr-2")}>
      <NumberFormat
        displayType="text"
        thousandSeparator
        renderText={(val: string) => (
          <ThemedTextV2
            style={tailwind("text-left font-normal-v2 text-xl")}
            light={tailwind("text-mono-light-v2-700")}
            dark={tailwind("text-mono-dark-v2-700")}
            testID="tokenB_value"
          >
            {val === "" || val === "NaN" ? "0.00" : val}
          </ThemedTextV2>
        )}
        value={new BigNumber(tokenAmount).toFixed(8)}
      />
      <ActiveUSDValueV2
        price={tokenUsdAmount}
        testId="tokenB_value_in_usd"
        containerStyle={tailwind("w-full break-words")}
      />
    </View>
  );
}

interface FutureSwapRowToProps {
  oraclePriceText: string;
}

export function FutureSwapRowTo({
  oraclePriceText,
}: FutureSwapRowToProps): JSX.Element {
  const { tailwind } = useStyles();
  return (
    <View style={tailwind("w-1/3")}>
      <ThemedTextV2
        light={tailwind("text-mono-light-v2-700")}
        dark={tailwind("text-mono-dark-v2-700")}
        style={tailwind("text-lg font-normal-v2")}
        testID="settlement_value_percentage"
      >
        {translate(
          "screens/CompositeSwapScreen",
          "Settlement Value {{percentageChange}}",
          {
            percentageChange: oraclePriceText,
          }
        )}
      </ThemedTextV2>
    </View>
  );
}
