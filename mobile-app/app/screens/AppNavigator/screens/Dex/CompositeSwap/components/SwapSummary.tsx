import { Linking, Platform, TouchableOpacity, View } from "react-native";
import { NumericFormat as NumberFormat } from "react-number-format";
import BigNumber from "bignumber.js";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { useDeFiScanContext } from "@shared-contexts/DeFiScanContext";
import { useTokenPrice } from "@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice";
import { ThemedIcon, ThemedTextV2, ThemedViewV2 } from "@components/themed";
import { PriceRateProps, PricesSection } from "@components/PricesSection";
import { BottomSheetInfoV2 } from "@components/BottomSheetInfoV2";
import { NumberRowV2 } from "@components/NumberRowV2";
import { ButtonGroupTabKey } from "@screens/AppNavigator/screens/Dex/CompositeSwap/components/SwapButtonGroup";
import { DexStabilizationType } from "../../hook/DexStabilization";

interface SwapSummaryProps {
  instantSwapPriceRate: PriceRateProps[];
  activeTab: ButtonGroupTabKey;
  transactionFee: BigNumber;
  executionBlock?: number;
  totalFees: string;
  dexStabilizationFee: string;
  dexStabilizationType: DexStabilizationType;
  timeRemaining: string;
}

export function SwapSummary({
  instantSwapPriceRate,
  activeTab,
  executionBlock,
  transactionFee,
  totalFees,
  dexStabilizationFee,
  dexStabilizationType,
  timeRemaining,
}: SwapSummaryProps): JSX.Element {
  const { getTokenPrice } = useTokenPrice();

  return (
    <>
      {activeTab === ButtonGroupTabKey.InstantSwap ? (
        <View testID="instant_swap_summary">
          <PricesSection
            priceRates={instantSwapPriceRate}
            testID="instant_swap_prices"
          />
          <ThemedViewV2
            style={tailwind("py-5 border-t-0.5")}
            light={tailwind("border-mono-light-v2-300")}
            dark={tailwind("border-mono-dark-v2-300")}
          >
            <NumberRowV2
              lhs={{
                value: translate("screens/CompositeSwapScreen", "Total fees"),
                testID: "swap_total_fees",
                themedProps: {
                  light: tailwind("text-mono-light-v2-500"),
                  dark: tailwind("text-mono-dark-v2-500"),
                },
              }}
              info={{
                title: translate("screens/CompositeSwapScreen", "Total fees"),
                message: translate(
                  "screens/CompositeSwapScreen",
                  "Total fees are charged based on the type of swap, and tokens selected. It comprises of: \n\n1. Commission Fee\n2. Transaction fee\n3. DEX related fee such as stabilization fee and burn fee (if applicable)"
                ),
              }}
              customSnapPoints={["50%"]}
              rhs={{
                value: totalFees,
                testID: "swap_total_fee_amount",
                prefix: "$",
                themedProps: {
                  style: tailwind("font-normal-v2 text-sm"),
                  light: tailwind("text-mono-light-v2-700"),
                  dark: tailwind("text-mono-dark-v2-700"),
                },
                usdTextStyle: tailwind("text-sm"),
              }}
            />
            {dexStabilizationType !== "none" && (
              <ThemedTextV2
                light={tailwind("text-mono-light-v2-500")}
                dark={tailwind("text-mono-light-v2-500")}
                style={tailwind("text-xs font-normal-v2")}
              >
                {translate(
                  "screens/CompositeSwapScreen",
                  "incl. stabilization fee ({{dexStabilizationFee}}%)",
                  { dexStabilizationFee }
                )}
              </ThemedTextV2>
            )}
          </ThemedViewV2>
        </View>
      ) : (
        <View>
          <SettlementBlockInfo
            executionBlock={executionBlock}
            timeRemaining={timeRemaining}
          />
          <NumberRowV2
            containerStyle={{
              style: tailwind(
                "flex-row items-start pt-5 w-full bg-transparent"
              ),
            }}
            lhs={{
              value: translate(
                "screens/CompositeSwapScreen",
                "Transaction fee"
              ),
              testID: "swap_total_fees",
              themedProps: {
                light: tailwind("text-mono-light-v2-500"),
                dark: tailwind("text-mono-dark-v2-500"),
              },
            }}
            rhs={{
              value: transactionFee.toFixed(8),
              usdAmount: getTokenPrice("DFI", transactionFee),
              testID: "swap_total_fee_amount",
              suffix: " DFI",
              themedProps: {
                style: tailwind("font-normal-v2 text-sm"),
              },
              usdTextStyle: tailwind("text-sm"),
            }}
          />
          {Platform.OS === "web" ? (
            <></> // hide Settlement info in web
          ) : (
            <View style={tailwind("flex-row items-center mb-5")}>
              <BottomSheetInfoV2
                alertInfo={{
                  title: "Settlements",
                  message: "",
                }}
                styledMessage={SettlementMessage()}
                name="test2"
                snapPoints={["55%"]}
                triggerComponent={
                  <View style={tailwind("flex flex-row")}>
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
                }
              />
            </View>
          )}
        </View>
      )}
    </>
  );
}

function SettlementMessage(): JSX.Element {
  return (
    <>
      <ThemedTextV2 style={tailwind("text-base font-normal-v2 pb-4")}>
        {translate(
          "screens/CompositeSwapScreen",
          "Settlement block is the pre-determined block height that this transaction will be executed."
        )}
      </ThemedTextV2>
      <ThemedTextV2 style={tailwind("text-base font-normal-v2 pb-4")}>
        {translate(
          "screens/CompositeSwapScreen",
          "Settlement value is based on the oracle price at the settlement block."
        )}
      </ThemedTextV2>
      <ThemedTextV2 style={tailwind("text-base font-normal-v2 pb-4")}>
        {translate(
          "screens/CompositeSwapScreen",
          "Users will be able to cancel this transaction as long as the settlement block has not been executed."
        )}
      </ThemedTextV2>
    </>
  );
}

function SettlementBlockInfo({
  executionBlock,
  timeRemaining,
}: {
  executionBlock?: number;
  timeRemaining: string;
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
          {translate("screens/CompositeSwapScreen", "Settlement block")}
        </ThemedTextV2>
      </View>

      <View style={tailwind("flex-1")}>
        <TouchableOpacity
          onPress={onBlockUrlPressed}
          testID="block_detail_explorer_url"
        >
          <View style={tailwind("flex-row items-center justify-end")}>
            <NumberFormat
              displayType="text"
              renderText={(val: string) => (
                <ThemedTextV2
                  light={tailwind("text-mono-light-v2-900")}
                  dark={tailwind("text-mono-dark-v2-900")}
                  style={tailwind(
                    "text-sm font-normal-v2 flex-wrap text-right pr-1"
                  )}
                  testID="execution_block"
                >
                  {val}
                </ThemedTextV2>
              )}
              thousandSeparator
              value={executionBlock}
            />
            <ThemedIcon iconType="MaterialIcons" name="open-in-new" size={16} />
          </View>
        </TouchableOpacity>
        <View style={tailwind("flex-row items-center justify-end")}>
          <ThemedTextV2
            light={tailwind("text-mono-light-v2-700")}
            dark={tailwind("text-mono-dark-v2-700")}
            testID="execution_time_remaining"
          >
            {translate("screens/CompositeSwapScreen", "{{time}} left", {
              time: timeRemaining.trim(),
            })}
          </ThemedTextV2>
        </View>
      </View>
    </ThemedViewV2>
  );
}
