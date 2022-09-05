import { Platform, View } from "react-native";
import { memo } from "react";
import { tailwind } from "@tailwind";
import BigNumber from "bignumber.js";
import { ThemedTextV2, ThemedViewV2 } from "@components/themed";
import { useTokenPrice } from "@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice";
import { translate } from "@translations";
import { NumberRowV2 } from "@components/NumberRowV2";
import { FutureSwapData } from "@store/futureSwap";
import { PoolPairIconV2 } from "@screens/AppNavigator/screens/Dex/components/PoolPairCards/PoolPairIconV2";
import { OraclePriceType } from "@screens/AppNavigator/screens/Dex/hook/FutureSwap";
import { TextRowV2 } from "@components/TextRowV2";

interface ViewSwapInfoProps {
  futureSwap: FutureSwapData;
  executionBlock: number;
  transactionDate: string;
}

export const ViewSwapInfo = ({
  futureSwap: { source, destination },
  executionBlock,
  transactionDate,
}: ViewSwapInfoProps): React.MemoExoticComponent<() => JSX.Element> =>
  memo(() => {
    const { getTokenPrice } = useTokenPrice();
    const themedProps = {
      light: tailwind("text-mono-light-v2-700"),
      dark: tailwind("text-mono-dark-v2-700"),
    };

    return (
      <ThemedViewV2
        style={tailwind(
          "flex-col px-5 h-full flex flex-grow",
          { "-mt-0.5": Platform.OS === "ios" },
          { "-mt-1": Platform.OS === "android" }
        )}
      >
        <View
          style={tailwind(
            "pb-9 flex-row items-center",
            { "mt-1": Platform.OS === "ios" },
            { "mt-2": Platform.OS === "android" }
          )}
        >
          <View>
            <PoolPairIconV2
              symbolA={source.displaySymbol}
              symbolB={destination.displaySymbol}
              customSize={36}
              iconBStyle={tailwind("-ml-3")}
            />
          </View>
          <ThemedTextV2
            style={tailwind("pl-1 text-xl font-semibold-v2")}
            testID="view_pool_details_title"
          >
            {`${source.displaySymbol}-${destination.displaySymbol}`}
          </ThemedTextV2>
        </View>

        <NumberRowV2
          lhs={{
            value: translate(
              "screens/WithdrawFutureSwapScreen",
              "Amount to swap"
            ),
            themedProps: themedProps,
            testID: "amount_swap_label",
          }}
          rhs={{
            value: source.amount,
            suffix: ` ${source.displaySymbol}`,
            usdAmount: getTokenPrice(
              source.symbol,
              new BigNumber(source.amount)
            ),
            usdTextStyle: tailwind("text-sm"),
            usdContainerStyle: tailwind("pb-4 pt-1"),
            testID: "amount_swap_value",
          }}
        />

        <NumberRowV2
          lhs={{
            value: translate(
              "screens/WithdrawFutureSwapScreen",
              "Settlement block"
            ),
            themedProps: themedProps,
            testID: "settlement_block_label",
          }}
          rhs={{
            value: executionBlock,
            testID: "settlement_block_value",
          }}
        />
        <ThemedTextV2
          style={tailwind(
            "text-sm font-normal-v2 pb-4 pt-1 text-right justify-end"
          )}
          light={tailwind("text-mono-light-v2-700")}
          dark={tailwind("text-mono-dark-v2-700")}
        >
          {transactionDate}
        </ThemedTextV2>

        <TextRowV2
          lhs={{
            value: translate(
              "screens/WithdrawFutureSwapScreen",
              "To receive (est.)"
            ),
            themedProps: themedProps,
            testID: "to_receive_label",
          }}
          rhs={{
            value: `${translate(
              "screens/WithdrawFutureSwapScreen",
              "Settlement value"
            )} ${
              !source.isLoanToken
                ? OraclePriceType.POSITIVE
                : OraclePriceType.NEGATIVE
            }`,
            themedProps: {
              light: tailwind("text-mono-light-v2-900"),
              dark: tailwind("text-mono-dark-v2-900"),
            },
            testID: "to_receive_value",
          }}
        />
      </ThemedViewV2>
    );
  });
