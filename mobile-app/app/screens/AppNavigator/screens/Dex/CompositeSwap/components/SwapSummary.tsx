import { View, TouchableOpacity, Linking } from "react-native";
import NumberFormat from "react-number-format";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { useDeFiScanContext } from "@shared-contexts/DeFiScanContext";
import { ThemedViewV2, ThemedIcon, ThemedTextV2 } from "@components/themed";
import { PricesSectionV2, PriceRateProps } from "@components/PricesSectionV2";
import { ButtonGroupTabKey } from "../CompositeSwapScreen";

interface SwapSummaryProps {
  instantSwapPriceRate: PriceRateProps[];
  activeTab: ButtonGroupTabKey;
  executionBlock?: number;
  transactionDate?: string;
}

export function SwapSummary({
  instantSwapPriceRate,
  activeTab,
  executionBlock,
  transactionDate,
}: SwapSummaryProps): JSX.Element {
  return (
    <>
      {activeTab === ButtonGroupTabKey.InstantSwap ? (
        <View>
          <PricesSectionV2
            priceRates={instantSwapPriceRate}
            testID="instant_swap_summary"
          />
        </View>
      ) : (
        <View>
          <SettlementBlockInfo
            executionBlock={executionBlock}
            transactionDate={transactionDate}
          />
          <View style={tailwind("flex-row items-center my-5")}>
            <ThemedTextV2
              light={tailwind("text-mono-light-v2-900")}
              dark={tailwind("text-mono-dark-v2-900")}
              style={tailwind("mr-1 font-semibold-v2 text-xs")}
            >
              {translate(
                "screens/CompositeSwapScreen",
                "Learn about settlements"
              )}
            </ThemedTextV2>
            <ThemedIcon
              name="info-outline"
              size={16}
              iconType="MaterialIcons"
              light={tailwind("text-mono-light-v2-900")}
              dark={tailwind("text-mono-dark-v2-900")}
            />
          </View>
        </View>
      )}
    </>
  );
}

function SettlementBlockInfo({
  executionBlock,
  transactionDate,
}: {
  executionBlock?: number;
  transactionDate?: string;
}): JSX.Element {
  const { getBlocksCountdownUrl } = useDeFiScanContext();

  const onBlockUrlPressed = async (): Promise<void> => {
    if (executionBlock !== undefined) {
      const url = getBlocksCountdownUrl(executionBlock);
      await Linking.openURL(url);
    }
  };

  return (
    <ThemedViewV2
      style={tailwind("flex-row items-start w-full bg-transparent")}
      light={tailwind("border-mono-light-v2-300")}
      dark={tailwind("border-mono-dark-v2-300")}
    >
      <View style={tailwind("w-6/12")}>
        <ThemedTextV2
          style={tailwind("font-normal-v2 text-sm")}
          light={tailwind("text-mono-light-v2-500")}
          dark={tailwind("text-mono-dark-v2-500")}
        >
          {translate("screens/NetworkDetails", "Settlement block")}
        </ThemedTextV2>
      </View>

      <View style={tailwind("flex-1")}>
        <TouchableOpacity
          onPress={onBlockUrlPressed}
          testID="block_detail_explorer_url"
        >
          <NumberFormat
            displayType="text"
            renderText={(val: string) => (
              <ThemedTextV2
                light={tailwind("text-mono-light-v2-900")}
                dark={tailwind("text-mono-dark-v2-900")}
                style={tailwind("text-sm font-normal-v2 flex-wrap text-right")}
                testID="network_details_block_height"
              >
                {val}
              </ThemedTextV2>
            )}
            thousandSeparator
            value={executionBlock}
          />
          <View style={tailwind("flex-row items-center justify-end")}>
            <ThemedTextV2
              light={tailwind("text-mono-light-v2-700")}
              dark={tailwind("text-mono-dark-v2-700")}
              style={tailwind("text-right text-sm font-normal-v2")}
            >
              {transactionDate}
            </ThemedTextV2>

            <View style={tailwind("ml-1 flex-grow-0 justify-center")}>
              <ThemedIcon
                iconType="MaterialIcons"
                light={tailwind("text-mono-light-v2-700")}
                dark={tailwind("text-mono-dark-v2-700")}
                name="open-in-new"
                size={16}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </ThemedViewV2>
  );
}
