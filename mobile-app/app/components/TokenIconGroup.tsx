import { View } from "@components";
import { tailwind } from "@tailwind";

import BigNumber from "bignumber.js";
import { SymbolIcon } from "@components/SymbolIcon";
import { translate } from "@translations";
import { ThemedText } from "./themed";

interface TokenIconGroupProps {
  symbols: string[];
  maxIconToDisplay: number;
  testID?: string;
  /**
   * Flag to "push" token container rightwards, used when no spacing is allowed at the right of TokenIconGroup
   *
   * In which the spacing is created by the relative position of each icon to display overlap effect
   */
  offsetContainer?: boolean;
}

export function TokenIconGroup(props: TokenIconGroupProps): JSX.Element {
  const additionalIcon = BigNumber.max(
    props.symbols?.length - props.maxIconToDisplay,
    0
  );
  let rightOffset = 0;
  if (props.offsetContainer === true) {
    rightOffset = additionalIcon.gt(0)
      ? (props.maxIconToDisplay - 2) * -5
      : (props.symbols.length - 1) * -5 - 1;
  }
  return (
    <View style={[tailwind("flex flex-row relative"), { right: rightOffset }]}>
      {props.symbols?.map((symbol, index): JSX.Element | null => {
        if (index < props.maxIconToDisplay) {
          return (
            <View
              testID={`${props.testID ?? ""}_${symbol}`}
              key={symbol}
              style={[
                tailwind("rounded-full p-px relative"),
                { left: index * -5 },
              ]}
            >
              <SymbolIcon key={symbol} symbol={symbol} />
            </View>
          );
        }
        return null;
      })}
      {additionalIcon.gt(0) && (
        <ThemedText
          light={tailwind("text-gray-500")}
          dark={tailwind("text-gray-400")}
          style={[
            tailwind("relative text-xs font-medium"),
            { left: (props.maxIconToDisplay - 2) * -5 },
          ]}
        >
          {`& ${additionalIcon.toFixed()} ${translate(
            "components/TokenIconGroup",
            "more"
          )}`}
        </ThemedText>
      )}
    </View>
  );
}
