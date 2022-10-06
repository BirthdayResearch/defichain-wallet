import { useState, useEffect } from "react";
import { Platform, View } from "react-native";
import { useSelector, batch as reduxBatch } from "react-redux";
import { NumericFormat as NumberFormat } from "react-number-format";
import BigNumber from "bignumber.js";
import * as Progress from "react-native-progress";
import {
  ThemedIcon,
  ThemedTextV2,
  ThemedViewV2,
  ThemedScrollViewV2,
  ThemedTouchableOpacityV2,
} from "@components/themed";
import { getColor, tailwind } from "@tailwind";
import { translate } from "@translations";
import {
  NavigationProp,
  useNavigation,
  useIsFocused,
} from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import { RootState } from "@store";
import {
  auctions as storeAuctions,
  fetchAuctions,
  fetchBidHistory,
} from "@store/auctions";
import { useBottomSheet } from "@hooks/useBottomSheet";
import { LoanVaultLiquidationBatch } from "@defichain/whale-api-client/dist/api/loan";
import {
  BottomSheetWebWithNav,
  BottomSheetWithNav,
} from "@components/BottomSheetWithNav";
import { ButtonV2 } from "@components/ButtonV2";
import { TextRowV2 } from "@components/TextRowV2";
import { NumberRowV2 } from "@components/NumberRowV2";
import { PriceRateProps, PricesSectionV2 } from "@components/PricesSectionV2";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { BidInfo } from "@screens/AppNavigator/screens/Auctions/components/BatchCard";
import { TokenIconGroupV2 } from "@components/TokenIconGroupV2";
import { useAuctionTime } from "../hooks/AuctionTimeLeft";
import { useAuctionBidValue } from "../hooks/AuctionBidValue";
import { getPrecisedTokenValue } from "../helpers/precision-token-value";
import { useTokenPrice } from "../../Portfolio/hooks/TokenPrice";
import { AuctionVaultDetails } from "../components/AuctionVaultDetails";
import { AuctionsParamList } from "../AuctionNavigator";

type BatchDetailScreenProps = StackScreenProps<
  AuctionsParamList,
  "AuctionDetailScreen"
>;

export function AuctionDetailScreen(
  props: BatchDetailScreenProps
): JSX.Element {
  const { batch: batchFromParam, vault } = props.route.params;
  const [batch, setBatch] = useState<LoanVaultLiquidationBatch>(batchFromParam);

  const { address } = useWalletContext();
  const { isLight } = useThemeContext();
  const navigation = useNavigation<NavigationProp<AuctionsParamList>>();
  const client = useWhaleApiClient();
  const dispatch = useAppDispatch();

  const { auctions } = useSelector((state: RootState) => state.auctions);
  const blockCount = useSelector((state: RootState) => state.block.count) ?? 0;
  const bidHistory = useSelector(
    (state: RootState) => state.auctions.bidHistory
  );

  const { minNextBidInToken, totalCollateralsValueInUSD, minNextBidInUSD } =
    useAuctionBidValue(batch, vault.liquidationPenalty);

  const {
    timeRemaining,
    blocksRemaining,
    normalizedBlocks,
    timeRemainingThemedColor,
  } = useAuctionTime(vault.liquidationHeight, blockCount);

  const isFocused = useIsFocused();
  const { bottomSheetRef, containerRef, isModalDisplayed, bottomSheetScreen } =
    useBottomSheet();

  const { getTokenPrice } = useTokenPrice();

  useEffect(() => {
    if (isFocused) {
      reduxBatch(() => {
        dispatch(fetchAuctions({ client }));
        dispatch(
          fetchBidHistory({
            vaultId: vault.vaultId,
            liquidationHeight: vault.liquidationHeight,
            batchIndex: batch.index,
            client: client,
            size: 200,
          })
        );
      });
    }
  }, [blockCount, isFocused]);

  useEffect(() => {
    const _vault = auctions.find(
      (auction) => auction.vaultId === vault.vaultId
    );
    if (_vault === undefined) {
      return;
    }

    const _batch = _vault.batches.find(
      (batch) => batch.index === batchFromParam.index
    );
    if (_batch === undefined) {
      return;
    }

    setBatch(_batch);
  }, [auctions]);

  const onPlaceBid = (): void => {
    navigation.navigate("PlaceBidScreen", { batch, vault });
  };

  const onBidHistory = (): void => {
    navigation.navigate("BidHistoryScreen", { batch, vault });
  };

  const totalPrecisedCollateralsValue = getPrecisedTokenValue(
    totalCollateralsValueInUSD
  );
  const precisedMinNextBidInUSD = getPrecisedTokenValue(minNextBidInUSD);

  // List of collaterals
  const loanCollaterals: PriceRateProps[] = batch.collaterals.map(
    (collateral) => {
      const value = getTokenPrice(
        collateral.symbol,
        new BigNumber(collateral.amount)
      );
      return {
        label: collateral.displaySymbol,
        bSymbol: collateral.displaySymbol,
        value: collateral.amount,
        symbolUSDValue: value,
        usdTextStyle: tailwind("text-sm"),
      };
    }
  );

  const timeRemainingThemedProps = {
    light: tailwind(`text-${timeRemainingThemedColor} text-xs font-normal-v2`),
    dark: tailwind(`text-${timeRemainingThemedColor} text-xs font-normal-v2`),
  };
  const isHighestBidder = batch.highestBid?.owner === address;
  const isOutbid =
    batch.highestBid?.owner !== address && batch.froms.includes(address);
  const displayBidStatus = isHighestBidder || isOutbid;

  return (
    <View style={tailwind("flex-1")} ref={containerRef}>
      <ThemedScrollViewV2
        contentContainerStyle={tailwind("pt-8 px-5 pb-14")}
        style={tailwind("flex-1")}
        testID="auction_details_screen"
      >
        {/* Loan collaterals summary */}
        <View style={tailwind("flex flex-row justify-between")}>
          <ThemedTextV2
            style={tailwind("text-xs font-normal-v2")}
            light={tailwind("text-mono-light-v2-500")}
            dark={tailwind("text-mono-dark-v2-500")}
            testID="text_auction_detail_collaterals"
          >
            {translate("components/AuctionDetailScreen", "Collaterals")}
          </ThemedTextV2>
          {displayBidStatus && (
            <BidInfo
              hasFirstBid={bidHistory.length > 0}
              isOutBid={isOutbid}
              isHighestBidder={isHighestBidder}
              testID="auction_detail_bid_status"
            />
          )}
        </View>
        <View style={tailwind("flex-row items-center mt-2")}>
          <TokenIconGroupV2
            testID="auction_detail_collateral_group"
            size={36}
            symbols={batch.collaterals.map(
              (collateral) => collateral.displaySymbol
            )}
            // overlap={16}
            maxIconToDisplay={6}
          />
          <NumberFormat
            displayType="text"
            prefix="$"
            decimalScale={2}
            renderText={(value: string) => (
              <ThemedTextV2
                light={tailwind("text-mono-light-v2-1000")}
                dark={tailwind("text-mono-dark-v2-1000")}
                style={[
                  tailwind("font-semibold-v2 text-right text-xl"),
                  {
                    marginLeft:
                      loanCollaterals.length === 1
                        ? 8
                        : -((loanCollaterals.length - 1) * 16 - 8),
                  },
                ]}
              >
                {value}
              </ThemedTextV2>
            )}
            thousandSeparator
            value={totalPrecisedCollateralsValue}
          />
        </View>

        {/* Loan collaterals Breakdown */}
        <ThemedViewV2
          light={tailwind("border-mono-light-v2-300")}
          dark={tailwind("border-mono-dark-v2-300")}
          style={tailwind("pt-5 px-5 mt-8 border-0.5 rounded-lg-v2")}
        >
          <PricesSectionV2
            priceRates={loanCollaterals}
            testID="auction_detail_loan_collaterals"
          />
          <ThemedViewV2
            style={tailwind("py-5 border-t-0.5")}
            light={tailwind("border-mono-light-v2-300")}
            dark={tailwind("border-mono-dark-v2-300")}
          >
            <NumberRowV2
              lhs={{
                value: translate(
                  "components/AuctionDetailScreen",
                  "Total value"
                ),
                testID: "auction_detail_total_label",
                themedProps: {
                  light: tailwind("text-mono-light-v2-500"),
                  dark: tailwind("text-mono-dark-v2-500"),
                },
              }}
              rhs={{
                value: totalPrecisedCollateralsValue,
                testID: "auction_detail_total_value",
                prefix: "$",
                themedProps: {
                  style: tailwind("font-normal-v2 text-sm"),
                  light: tailwind("text-mono-light-v2-900"),
                  dark: tailwind("text-mono-dark-v2-900"),
                },
                usdTextStyle: tailwind("text-sm"),
              }}
            />
          </ThemedViewV2>
        </ThemedViewV2>

        {/* Remaining time progress bar */}
        <View style={tailwind("mt-8")}>
          <Progress.Bar
            progress={normalizedBlocks.toNumber()}
            color={getColor(timeRemainingThemedColor)}
            unfilledColor={getColor(
              isLight ? "mono-light-v2-200" : "mono-dark-v2-200"
            )}
            borderWidth={0}
            width={null}
          />
          <TextRowV2
            containerStyle={{
              style: tailwind(
                "flex-row items-start w-full bg-transparent mt-3"
              ),
              light: tailwind("bg-transparent border-mono-light-v2-300"),
              dark: tailwind("bg-transparent border-mono-dark-v2-300"),
            }}
            lhs={{
              value: translate(
                "components/AuctionDetailScreen",
                timeRemaining ? "Time remaining" : "No time remaining"
              ),
              testID: "text_time_remaining_label",
              themedProps: timeRemainingThemedProps,
            }}
            rhs={{
              value: `${timeRemaining || "0s"} (${blocksRemaining} Blks)`,
              testID: "text_time_remaining_value",
              themedProps: timeRemainingThemedProps,
            }}
          />
        </View>

        {/* Vault info */}
        <ThemedViewV2
          style={tailwind("border-t-0.5 mt-12")}
          light={tailwind("bg-transparent border-mono-light-v2-300")}
          dark={tailwind("bg-transparent border-mono-dark-v2-300")}
        >
          <AuctionVaultDetails
            testID="auction_details"
            vault={vault}
            showLinkToVault
          />
          <NumberRowV2
            containerStyle={{
              style: tailwind(
                "flex-row items-start w-full bg-transparent mt-6"
              ),
              light: tailwind("bg-transparent border-mono-light-v2-300"),
              dark: tailwind("bg-transparent border-mono-dark-v2-300"),
            }}
            lhs={{
              value: translate(
                "components/AuctionDetailScreen",
                "Min. next bid"
              ),
              testID: "min_next_bid_label",
              themedProps: {
                light: tailwind("text-mono-light-v2-500"),
                dark: tailwind("text-mono-dark-v2-500"),
              },
            }}
            rhs={{
              value: minNextBidInToken.toNumber(),
              testID: "min_next_bid_amount",
              prefixSymbol: batch.loan.displaySymbol,
              suffix: ` ${batch.loan.displaySymbol}`,
              usdAmount: new BigNumber(precisedMinNextBidInUSD),
              usdTextStyle: tailwind("text-sm"),
              themedProps: {
                style: tailwind("font-semibold-v2 text-base"),
                light: tailwind("text-mono-light-v2-900 "),
                dark: tailwind("text-mono-dark-v2-900"),
              },
            }}
          />
        </ThemedViewV2>

        {/* Bid History button */}
        {bidHistory.length > 0 && (
          <ThemedTouchableOpacityV2
            light={tailwind("bg-mono-light-v2-00")}
            dark={tailwind("bg-mono-dark-v2-00")}
            style={tailwind(
              "border-0 py-4.5 px-5 mt-7 mb-5 flex-row items-center justify-between rounded-lg-v2"
            )}
            onPress={onBidHistory}
            testID="auction_detail_bid_history_btn"
          >
            <ThemedTextV2
              style={tailwind("font-normal-v2 text-sm text-red-v2")}
            >
              {translate(
                "components/AuctionDetailScreen",
                "Bid History ({{bidHistoryCount}})",
                { bidHistoryCount: bidHistory.length }
              )}
            </ThemedTextV2>
            <ThemedIcon
              iconType="MaterialIcons"
              light={tailwind("text-mono-light-v2-700")}
              dark={tailwind("text-mono-dark-v2-700")}
              name="access-time"
              size={20}
              testID="auction_detail_bid_history_btn_icon"
            />
          </ThemedTouchableOpacityV2>
        )}

        {/* Bid button and auction close message */}
        <View style={tailwind("mt-7")}>
          {blocksRemaining === 0 && (
            <ThemedTextV2
              light={tailwind("text-red-v2")}
              dark={tailwind("text-red-v2")}
              style={tailwind(
                "text-red-v2 text-center text-xs font-normal-v2 mb-6"
              )}
            >
              {translate("components/AuctionDetailScreen", "Auction closed")}
            </ThemedTextV2>
          )}

          <ButtonV2
            fillType="fill"
            label={translate("components/AuctionDetailScreen", "Bid")}
            disabled={blocksRemaining === 0}
            styleProps="mx-7"
            onPress={onPlaceBid}
            testID="auction_detail_place_bid_btn"
          />
        </View>
      </ThemedScrollViewV2>
    </View>
  );
}
