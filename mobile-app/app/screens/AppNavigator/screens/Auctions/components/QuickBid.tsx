import { ThemedTextV2, ThemedViewV2 } from "@components/themed";
import { memo, useEffect, useState } from "react";
import * as React from "react";
import { tailwind } from "@tailwind";
import { SymbolIcon } from "@components/SymbolIcon";
import { translate } from "@translations";
import { Text, View } from "react-native";
import BigNumber from "bignumber.js";
import { PlaceAuctionBid } from "@defichain/jellyfish-transaction/dist";
import { LoanVaultLiquidated } from "@defichain/whale-api-client/dist/api/loan";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import NumberFormat from "react-number-format";
import { NumberRowV2 } from "@components/NumberRowV2";
import { ButtonV2 } from "@components/ButtonV2";
import { tokensSelector } from "@store/wallet";
import { ScrollView } from "react-native-gesture-handler";
import { useSignBidAndSend } from "../hooks/SignBidAndSend";
import { useAuctionTime } from "../hooks/AuctionTimeLeft";
import { getPrecisedTokenValue } from "../helpers/precision-token-value";

interface QuickBidProps {
  loanTokenId: string;
  loanTokenDisplaySymbol: string;
  onCloseButtonPress: () => void;
  minNextBid: BigNumber;
  minNextBidInUSD: BigNumber;
  totalCollateralsValueInUSD: BigNumber;
  vaultId: PlaceAuctionBid["vaultId"];
  index: PlaceAuctionBid["index"];
  vaultLiquidationHeight: LoanVaultLiquidated["liquidationHeight"];
}

export const QuickBid = ({
  vaultId,
  index,
  loanTokenId,
  loanTokenDisplaySymbol,
  minNextBid,
  minNextBidInUSD,
  onCloseButtonPress,
  vaultLiquidationHeight,
  totalCollateralsValueInUSD,
}: QuickBidProps): React.MemoExoticComponent<() => JSX.Element> =>
  memo(() => {
    const tokens = useSelector((state: RootState) =>
      tokensSelector(state.wallet)
    );
    const ownedToken = tokens.find((token) => token.id === loanTokenId);
    const currentBalance = new BigNumber(ownedToken?.amount ?? 0);
    const blockCount =
      useSelector((state: RootState) => state.block.count) ?? 0;
    const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001));
    const { blocksRemaining } = useAuctionTime(
      vaultLiquidationHeight,
      blockCount
    );
    const isBalanceSufficient = currentBalance.gte(minNextBid);
    const { hasPendingJob, hasPendingBroadcastJob, constructSignedBidAndSend } =
      useSignBidAndSend();
    const logger = useLogger();
    const client = useWhaleApiClient();
    useEffect(() => {
      client.fee
        .estimate()
        .then((f) => setFee(new BigNumber(f)))
        .catch(logger.error);
    }, []);

    const displayHigherBidWarning = new BigNumber(minNextBidInUSD).gte(
      new BigNumber(totalCollateralsValueInUSD).times(1.2)
    );
    const onQuickBid = async (): Promise<void> => {
      await constructSignedBidAndSend({
        vaultId,
        index,
        tokenAmount: {
          amount: minNextBid,
          token: Number(loanTokenId),
        },
        displaySymbol: loanTokenDisplaySymbol,
        onBroadcast: () => {},
      });

      onCloseButtonPress();
    };

    return (
      <ThemedViewV2 style={tailwind("flex-1")}>
        <ScrollView contentContainerStyle={tailwind("pb-8")}>
          <View style={tailwind("mx-5")}>
            <View style={tailwind("flex flex-row justify-center items-center")}>
              <SymbolIcon
                symbol={loanTokenDisplaySymbol}
                styleProps={tailwind("w-6 h-6")}
              />
              <NumberFormat
                displayType="text"
                suffix={` ${loanTokenDisplaySymbol}`}
                renderText={(value: string) => (
                  <ThemedTextV2
                    light={tailwind("text-mono-light-v2-900")}
                    dark={tailwind("text-mono-dark-v2-900")}
                    style={tailwind("text-lg font-semibold-v2 flex-wrap ml-2")}
                    testID="quick_bid_min_next_bid"
                  >
                    {value}
                  </ThemedTextV2>
                )}
                thousandSeparator
                value={minNextBid.toFixed(8)}
              />
            </View>
            <NumberFormat
              displayType="text"
              prefix="$"
              renderText={(value: string) => (
                <ThemedTextV2
                  light={tailwind("text-mono-light-v2-500")}
                  dark={tailwind("text-mono-dark-v2-500")}
                  style={tailwind(
                    "text-sm flex-wrap text-center font-normal-v2"
                  )}
                  testID="quick_bid_min_next_bid"
                >
                  {value}
                </ThemedTextV2>
              )}
              thousandSeparator
              value={getPrecisedTokenValue(minNextBidInUSD)}
            />
            <View style={tailwind("mt-5")}>
              <NumberFormat
                displayType="text"
                prefix={`${translate("components/QuickBid", "Available")} `}
                suffix={` ${loanTokenDisplaySymbol}`}
                renderText={(value: string) => (
                  <ThemedTextV2
                    light={tailwind("text-mono-light-v2-700")}
                    dark={tailwind("text-mono-dark-v2-700")}
                    style={tailwind(
                      "text-sm flex-wrap text-center font-normal-v2"
                    )}
                    testID="quick_bid_min_next_bid"
                  >
                    {value}
                  </ThemedTextV2>
                )}
                thousandSeparator
                value={currentBalance.toFixed(8)}
              />
            </View>

            <ThemedViewV2
              light={tailwind("border-mono-light-v2-200")}
              dark={tailwind("border-mono-dark-v2-200")}
              style={tailwind("my-6 border p-5 rounded-lg-v2")}
            >
              <View style={tailwind("py-0.5")}>
                <NumberRowV2
                  lhs={{
                    value: translate("components/QuickBid", "Transaction fee"),
                    testID: "transaction_fee_label",
                    themedProps: {
                      style: tailwind("text-xs font-normal-v2"),
                      light: tailwind("text-mono-light-v2-700"),
                      dark: tailwind("text-mono-dark-v2-700"),
                    },
                  }}
                  rhs={{
                    value: fee.toFixed(8),
                    testID: "text_fee",
                    suffix: " DFI",
                    themedProps: {
                      style: tailwind("text-xs font-normal-v2"),
                      light: tailwind("text-mono-light-v2-800"),
                      dark: tailwind("text-mono-dark-v2-800"),
                    },
                  }}
                />
              </View>
            </ThemedViewV2>
            <View style={tailwind("mt-6")}>
              {isBalanceSufficient ? (
                <>
                  {displayHigherBidWarning && (
                    <NumberFormat
                      displayType="text"
                      prefix={translate(
                        "components/QuickBid",
                        "Your bid is higher than the auction's collateral value of $"
                      )}
                      renderText={(value: string) => (
                        <Text
                          style={tailwind(
                            "text-center font-normal-v2 text-xs text-orange-v2"
                          )}
                        >
                          {value}
                        </Text>
                      )}
                      thousandSeparator
                      value={getPrecisedTokenValue(totalCollateralsValueInUSD)}
                    />
                  )}
                </>
              ) : (
                <Text
                  style={tailwind(
                    "text-center font-normal-v2 text-xs text-red-v2"
                  )}
                >
                  {translate(
                    "components/QuickBid",
                    "Insufficient {{symbol}} balance",
                    { symbol: loanTokenDisplaySymbol }
                  )}
                </Text>
              )}
            </View>

            <ButtonV2
              disabled={
                blocksRemaining === 0 ||
                !isBalanceSufficient ||
                hasPendingJob ||
                hasPendingBroadcastJob
              }
              styleProps="mt-5 mx-7"
              label={translate("components/QuickBid", "Quick bid")}
              onPress={onQuickBid}
              testID="quick_bid_submit_button"
              style={tailwind("items-end")}
            />
          </View>
        </ScrollView>
      </ThemedViewV2>
    );
  });
