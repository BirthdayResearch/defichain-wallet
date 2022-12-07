import { View } from "react-native";
import { useStyles } from "@tailwind";
import BigNumber from "bignumber.js";
import { NumericFormat as NumberFormat } from "react-number-format";
import { ThemedTextV2 } from "@components/themed";

interface PoolSharesSectionProps {
  walletTokenPrice: BigNumber;
  walletTokenAmount: BigNumber;
  tokenID: string;
}
export function PoolSharesSection(props: PoolSharesSectionProps): JSX.Element {
  const { tailwind } = useStyles();
  return (
    <View style={tailwind("flex flex-col")}>
      <NumberFormat
        displayType="text"
        renderText={(textValue) => (
          <ThemedTextV2
            style={tailwind("text-xs font-semibold-v2")}
            testID={`pool_share_amount_${props.tokenID}`}
          >
            {textValue}
          </ThemedTextV2>
        )}
        thousandSeparator
        value={props.walletTokenAmount.toFixed(8)}
      />
      <NumberFormat
        displayType="text"
        renderText={(textValue) => (
          <ThemedTextV2
            light={tailwind("text-mono-light-v2-700")}
            dark={tailwind("text-mono-dark-v2-700")}
            style={tailwind("text-xs font-normal-v2")}
            testID={`pool_share_value_${props.tokenID}`}
          >
            {textValue}
          </ThemedTextV2>
        )}
        thousandSeparator
        value={props.walletTokenPrice.toFixed(2)}
        prefix="$"
      />
    </View>
  );
}
