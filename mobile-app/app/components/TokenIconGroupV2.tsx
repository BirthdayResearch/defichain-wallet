import { View } from "@components";
import { tailwind } from "@tailwind";
import BigNumber from "bignumber.js";
import { SymbolIcon } from "@components/SymbolIcon";

interface TokenIconGroupV2Props {
  symbols: string[];
  maxIconToDisplay: number;
  testID?: string;
  offsetContainer?: boolean;
  size?: number;
}

export function TokenIconGroupV2(props: TokenIconGroupV2Props): JSX.Element {
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
                {
                  left: index * -10,
                  zIndex: index * -1,
                },
              ]}
            >
              <SymbolIcon
                key={symbol}
                symbol={symbol}
                styleProps={
                  props.size !== undefined
                    ? {
                        width: props.size,
                        height: props.size,
                      }
                    : undefined
                }
              />
            </View>
          );
        }
        return null;
      })}
      {/* Keeping for future reference as current design 2.0 only displays max 6 collaterals */}
      {/* {additionalIcon.gt(0) && (
        <ThemedTextV2
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
        </ThemedTextV2>
      )} */}
    </View>
  );
}
