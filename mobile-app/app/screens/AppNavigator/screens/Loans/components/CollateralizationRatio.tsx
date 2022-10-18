import BigNumber from "bignumber.js";
import { ThemedText, ThemedTextV2 } from "@components/themed";
import { translate } from "@translations";
import { NumericFormat as NumberFormat } from "react-number-format";
import { tailwind } from "@tailwind";
import { useCollateralizationRatioColor } from "@screens/AppNavigator/screens/Loans/hooks/CollateralizationRatio";

interface CollateralizationRatioProps {
  colRatio: BigNumber;
  minColRatio: BigNumber;
  totalLoanAmount: BigNumber;
}

export function CollateralizationRatio(
  props: CollateralizationRatioProps
): JSX.Element {
  const ratioThemedProps = useCollateralizationRatioColor({
    colRatio: props.colRatio,
    minColRatio: props.minColRatio,
    totalLoanAmount: props.totalLoanAmount,
  });

  if (props.colRatio.isLessThan(0) || props.colRatio.isNaN()) {
    return (
      <ThemedTextV2
        light={tailwind("text-green-v2")}
        dark={tailwind("text-green-v2")}
        style={tailwind("text-sm font-semibold-v2")}
      >
        {translate("components/CollateralizationRatio", "Ready")}
      </ThemedTextV2>
    );
  }

  return (
    <NumberFormat
      value={props.colRatio.toFixed(2)}
      decimalScale={2}
      suffix="%"
      displayType="text"
      thousandSeparator
      renderText={(value) => (
        <ThemedTextV2
          style={tailwind("text-sm font-semibold-v2")}
          {...ratioThemedProps}
        >
          {value}
        </ThemedTextV2>
      )}
    />
  );
}
