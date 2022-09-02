import { View } from "react-native";
import { ThemedTextV2 } from "@components/themed";
import NumberFormat from "react-number-format";
import { tailwind } from "@tailwind";
import BigNumber from "bignumber.js";
import { translate } from "@translations";
import { ActiveUSDValueV2 } from "@screens/AppNavigator/screens/Loans/VaultDetail/components/ActiveUSDValueV2";

interface WantInstantSwapRowProps {
  tokenAmount: string;
  tokenUsdAmount: BigNumber;
}

export function WantInstantSwapRow({
  tokenAmount,
  tokenUsdAmount,
}: WantInstantSwapRowProps): JSX.Element {
  return (
    <View style={tailwind("w-6/12 mr-2")}>
      <NumberFormat
        decimalScale={8}
        displayType="text"
        renderText={(val: string) => (
          <ThemedTextV2
            style={tailwind("text-left font-normal-v2 text-xl")}
            light={tailwind("text-mono-light-v2-700")}
            dark={tailwind("text-mono-dark-v2-700")}
          >
            {val === "" ? "0.00" : val}
          </ThemedTextV2>
        )}
        value={new BigNumber(tokenAmount).toFixed(8)}
      />
      <ActiveUSDValueV2
        price={tokenUsdAmount}
        testId="amount_input_in_usd"
        containerStyle={tailwind("w-full break-words")}
      />
    </View>
  );
}

interface WantFutureSwapRowProps {
  oraclePriceText: string;
}

export function WantFutureSwapRow({
  oraclePriceText,
}: WantFutureSwapRowProps): JSX.Element {
  return (
    <View style={tailwind("w-1/3")}>
      <ThemedTextV2
        light={tailwind("text-mono-light-v2-700")}
        dark={tailwind("text-mono-dark-v2-700")}
        style={tailwind("text-lg font-normal-v2")}
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
