import { tailwind } from "@tailwind";
import { View } from "react-native";
import { NumericFormat as NumberFormat } from "react-number-format";
import BigNumber from "bignumber.js";
import { useDisplayBalancesContext } from "@contexts/DisplayBalancesContext";
import { ThemedTextV2 } from "@components/themed";
import { BalanceTextV2 } from "./BalanceTextV2";
import { ActiveUSDValueV2 } from "../../Loans/VaultDetail/components/ActiveUSDValueV2";

interface TokenAmountTextProps {
  testID: string;
  usdAmount: BigNumber;
  tokenAmount: string;
  denominationCurrency: string;
}

export function TokenAmountText({
  testID,
  usdAmount,
  tokenAmount,
  denominationCurrency,
}: TokenAmountTextProps): JSX.Element {
  const { isBalancesDisplayed, hiddenBalanceText } =
    useDisplayBalancesContext();

  return (
    <NumberFormat
      displayType="text"
      renderText={(value) => (
        <View style={tailwind("flex flex-1")}>
          <BalanceTextV2
            containerStyle={[
              tailwind("text-sm font-semibold-v2 justify-end text-right mb-1"),
            ]}
            style={tailwind("text-sm font-semibold-v2 flex-wrap text-right")}
            testID={`${testID}_amount`}
            value={value}
          />
          {isBalancesDisplayed ? (
            <ActiveUSDValueV2
              testId={`${testID}_usd_amount`}
              price={usdAmount}
              style={tailwind("text-right")}
              containerStyle={tailwind("justify-end")}
              denominationCurrency={denominationCurrency}
            />
          ) : (
            <ThemedTextV2
              style={tailwind("text-xs font-normal-v2 text-right")}
              dark={tailwind("text-mono-dark-v2-700")}
              light={tailwind("text-mono-light-v2-700")}
              testID={`${testID}_usd_amount`}
            >
              {hiddenBalanceText}
            </ThemedTextV2>
          )}
        </View>
      )}
      thousandSeparator
      value={new BigNumber(tokenAmount).toFixed(8)}
    />
  );
}
