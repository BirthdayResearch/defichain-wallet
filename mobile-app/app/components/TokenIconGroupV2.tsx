import { View } from "@components";
import { tailwind } from "@tailwind";
import BigNumber from "bignumber.js";
import { SymbolIcon } from "@components/SymbolIcon";
import { translate } from "@translations";
import { ThemedTextV2 } from "./themed";

interface TokenIconGroupProps {
  symbols: string[];
  maxIconToDisplay?: number;
  testID?: string;
  size?: number;
  /**
   * Flag to "push" token container rightwards, used when no spacing is allowed at the right of TokenIconGroup
   *
   * In which the spacing is created by the relative position of each icon to display overlap effect
   */
  offsetContainer?: boolean;
}

export function TokenIconGroupV2({
  symbols,
  maxIconToDisplay = 6,
  testID,
  size,
  offsetContainer,
}: TokenIconGroupProps): JSX.Element {
  const additionalIcon = BigNumber.max(symbols?.length - maxIconToDisplay, 0);
  let rightOffset = 0;
  // increase overlap in case of more than and equal to 5 token icon
  const overlap = -8;
  if (offsetContainer === true) {
    rightOffset = additionalIcon.gt(0)
      ? (maxIconToDisplay - 2) * overlap
      : (symbols?.length - 1) * overlap - 1;
  }
  return (
    <View
      style={[
        tailwind("flex flex-row relative items-center"),
        { right: rightOffset },
      ]}
    >
      {symbols?.map((symbol, index): JSX.Element | null => {
        if (index < maxIconToDisplay) {
          return (
            <View
              testID={`${testID ?? ""}_${symbol}`}
              key={symbol}
              style={[
                tailwind("rounded-full p-px relative"),
                { left: index * overlap },
              ]}
            >
              <SymbolIcon
                key={symbol}
                symbol={symbol}
                styleProps={{ width: size, height: size }}
              />
            </View>
          );
        }
        return null;
      })}
      {additionalIcon.gt(0) && (
        <ThemedTextV2
          style={[
            tailwind("relative text-xs font-medium-v2"),
            { left: (maxIconToDisplay - 2) * overlap },
          ]}
        >
          {`& ${additionalIcon.toFixed()} ${translate(
            "components/TokenIconGroup",
            "more"
          )}`}
        </ThemedTextV2>
      )}
    </View>
  );
}
