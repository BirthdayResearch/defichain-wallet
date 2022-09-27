import { useState, useEffect, memo, useMemo } from "react";
import {
  ThemedText,
  ThemedView,
  ThemedIcon,
  ThemedTextV2,
  ThemedViewV2,
  ThemedScrollViewV2,
} from "@components/themed";
import { getColor, tailwind } from "@tailwind";
import {
  LayoutChangeEvent,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";
import { translate } from "@translations";
import { getNativeIcon } from "@components/icons/assets";
import { useSelector } from "react-redux";
import {
  NavigationProp,
  useNavigation,
  useIsFocused,
} from "@react-navigation/native";
import { RootState } from "@store";
import { useBottomSheet } from "@hooks/useBottomSheet";
import { StackScreenProps } from "@react-navigation/stack";
import { Tabs } from "@components/Tabs";
import {
  BottomSheetWebWithNav,
  BottomSheetWithNav,
} from "@components/BottomSheetWithNav";
import BigNumber from "bignumber.js";
import { openURL } from "@api/linking";
import { useDeFiScanContext } from "@shared-contexts/DeFiScanContext";
import { IconButton } from "@components/IconButton";
import { AuctionBidStatus } from "@screens/AppNavigator/screens/Auctions/components/BatchCard";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import { LoanVaultLiquidationBatch } from "@defichain/whale-api-client/dist/api/loan";
import { fetchAuctions } from "@store/auctions";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { TokenIconGroupV2 } from "@components/TokenIconGroupV2";
import { NumericFormat as NumberFormat } from "react-number-format";
import { PriceRateProps, PricesSectionV2 } from "@components/PricesSectionV2";
import { NumberRowV2 } from "@components/NumberRowV2";
import * as Progress from "react-native-progress";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { TextRowV2 } from "@components/TextRowV2";
import { MinNextBidTextRow } from "../components/MinNextBidTextRow";
import { BidHistory } from "../components/BidHistory";
import { QuickBid } from "../components/QuickBid";
import { useAuctionTime } from "../hooks/AuctionTimeLeft";
import { useAuctionBidValue } from "../hooks/AuctionBidValue";
import { AuctionedCollaterals } from "../components/AuctionedCollaterals";
import { AuctionDetails } from "../components/AuctionDetails";
import { CollateralTokenIconGroup } from "../components/CollateralTokenIconGroup";
import { AuctionsParamList } from "../AuctionNavigator";
import { AuctionTimeProgress } from "../components/AuctionTimeProgress";
import { getPrecisedTokenValue } from "../helpers/precision-token-value";
import { useTokenPrice } from "../../Portfolio/hooks/TokenPrice";
import { VerticalProgressBar } from "../components/VerticalProgressBar";
import { AuctionVaultDetails } from "../components/AuctionVaultDetails";

type BatchDetailScreenProps = StackScreenProps<
  AuctionsParamList,
  "AuctionDetailScreen"
>;

enum TabKey {
  BidHistory = "BID_HISTORY",
  Collaterals = "COLLATERALS",
  AuctionDetails = "AUCTION_DETAILS",
}

export function AuctionDetailScreen(
  props: BatchDetailScreenProps
): JSX.Element {
  const { isLight } = useThemeContext();
  const navigation = useNavigation<NavigationProp<AuctionsParamList>>();
  const { batch: batchFromParam, vault } = props.route.params;
  const [batch, setBatch] = useState<LoanVaultLiquidationBatch>(batchFromParam);
  const client = useWhaleApiClient();
  const dispatch = useAppDispatch();
  const { getAuctionsUrl } = useDeFiScanContext();
  const [activeTab, setActiveTab] = useState<string>(TabKey.BidHistory);
  const { minNextBidInToken, totalCollateralsValueInUSD, minNextBidInUSD } =
    useAuctionBidValue(batch, vault.liquidationPenalty);
  const blockCount = useSelector((state: RootState) => state.block.count) ?? 0;
  const {
    timeRemaining,
    blocksRemaining,
    blocksPerAuction,
    normalizedBlocks,
    timeRemainingThemedColor,
  } = useAuctionTime(vault.liquidationHeight, blockCount);
  const [progressBarHeight, setProgressBarHeight] = useState<number>(0);
  const { address } = useWalletContext();
  const LoanIcon = getNativeIcon(batch.loan.displaySymbol);
  const isFocused = useIsFocused();
  const {
    bottomSheetRef,
    containerRef,
    dismissModal,
    expandModal,
    isModalDisplayed,
    bottomSheetScreen,
    setBottomSheetScreen,
  } = useBottomSheet();
  const { auctions } = useSelector((state: RootState) => state.auctions);
  const { getTokenPrice } = useTokenPrice();

  useEffect(() => {
    if (isFocused) {
      dispatch(fetchAuctions({ client }));
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

  const onQuickBid = (): void => {
    setBottomSheetScreen([
      {
        stackScreenName: "Quick Bid",
        option: {
          header: () => null,
          headerBackTitleVisible: false,
        },
        component: QuickBid({
          minNextBidInUSD,
          vaultId: vault.vaultId,
          index: batch.index,
          loanTokenId: batch.loan.id,
          loanTokenDisplaySymbol: batch.loan.displaySymbol,
          totalCollateralsValueInUSD: totalCollateralsValueInUSD,
          onCloseButtonPress: dismissModal,
          minNextBid: minNextBidInToken.toFixed(8),
          vaultLiquidationHeight: vault.liquidationHeight,
        }),
      },
    ]);
    expandModal();
  };

  const onPlaceBid = (): void => {
    navigation.navigate("PlaceBidScreen", {
      batch,
      vault,
    });
  };

  const onPress = (tabId: string): void => {
    setActiveTab(tabId);
  };

  const tabsList = [
    {
      id: TabKey.BidHistory,
      label: "Bid history",
      disabled: false,
      handleOnPress: onPress,
    },
    {
      id: TabKey.Collaterals,
      label: "Collateral for auction",
      disabled: false,
      handleOnPress: onPress,
    },
    {
      id: TabKey.AuctionDetails,
      label: "Auction details",
      disabled: false,
      handleOnPress: onPress,
    },
  ];

  const totalPrecisedCollateralsValue = getPrecisedTokenValue(
    totalCollateralsValueInUSD
  );
  const precisedMinNextBidInUSD = getPrecisedTokenValue(minNextBidInUSD);
  const loanCollaterals: PriceRateProps[] = batch.collaterals.map(
    (collateral) => {
      const value = getTokenPrice(
        collateral.symbol,
        new BigNumber(collateral.amount)
      );
      return {
        label: collateral.symbol,
        bSymbol: collateral.symbol,
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

  return (
    <View style={tailwind("flex-1")} ref={containerRef}>
      <ThemedScrollViewV2
        style={tailwind("px-5 py-8")}
        testID="auction_details_screen"
      >
        {/* Loan collateral summary */}
        <ThemedTextV2
          style={tailwind("text-xs font-normal-v2")}
          light={tailwind("text-mono-light-v2-500")}
          dark={tailwind("text-mono-dark-v2-500")}
          testID="text_balance_amount"
        >
          {translate("screens/AuctionDetailScreen", "Collaterals")}
        </ThemedTextV2>
        <View style={tailwind("flex-row items-center mt-2")}>
          <TokenIconGroupV2
            testID="auction_detail_collateral_group"
            size={36}
            symbols={batch.collaterals.map(
              (collateral) => collateral.displaySymbol
            )}
          />
          <NumberFormat
            displayType="text"
            prefix="$"
            decimalScale={2}
            renderText={(value: string) => (
              <ThemedTextV2
                light={tailwind("text-mono-light-v2-1000")}
                dark={tailwind("text-mono-dark-v2-1000")}
                style={tailwind("font-semibold-v2 text-right ml-2")}
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
            testID="loan_collaterals"
          />
          <ThemedViewV2
            style={tailwind("py-5 border-t-0.5")}
            light={tailwind("border-mono-light-v2-300")}
            dark={tailwind("border-mono-dark-v2-300")}
          >
            <NumberRowV2
              lhs={{
                value: translate("screens/AuctionDetailScreen", "Total value"),
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
                "screens/AuctionDetailScreen",
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
            testID="auction_detail_vault_info"
            vault={vault}
            showLinkToVault
          />
          <NumberRowV2
            containerStyle={{
              style: tailwind(
                "flex-row items-start w-full bg-transparent pb-5 mt-6"
              ),
              light: tailwind("bg-transparent border-mono-light-v2-300"),
              dark: tailwind("bg-transparent border-mono-dark-v2-300"),
            }}
            lhs={{
              value: translate("screens/AuctionDetailScreen", "Min. next bid"),
              testID: "text_liquidation_height_label",
              themedProps: {
                light: tailwind("text-mono-light-v2-500"),
                dark: tailwind("text-mono-dark-v2-500"),
              },
            }}
            rhs={{
              value: minNextBidInToken.toNumber(),
              testID: "text_liquidation_height",
              prefixSymbol: batch.loan.displaySymbol,
              suffix: batch.loan.symbol,
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

        {/* <View style={tailwind("mt-8")}>
        {batch.collaterals.map((collateral, index) => (
          <> */}
        {/* <View key={collateral.id} style={tailwind("flex-row items-center")}>
              <View
                style={tailwind("w-5/12 flex-row items-center justify-start")}
              >
                <ThemedTextV2
                  // light={tailwind("text-red-v2")}
                  // dark={tailwind("text-red-v2")}
                  // style={tailwind("flex-row items-center justify-start")}
                  style={tailwind("text-sm font-normal-v2")}
                  light={tailwind("text-mono-light-v2-700")}
                  dark={tailwind("text-mono-dark-v2-700")}
                >
                  {collateral.symbol}
                </ThemedTextV2>
              </View>
              <View style={tailwind("flex-1 text-right")}>
                <NumberFormat
                  displayType="text"
                  suffix={` ${collateral.symbol}`}
                  renderText={(value: string) => (
                    <ThemedTextV2
                      light={tailwind("text-mono-light-v2-900")}
                      dark={tailwind("text-mono-dark-v2-900")}
                      style={tailwind("text-xs font-normal-v2 flex-wrap ")}
                      testID={`batch_${batch.index}_min_next_bid`}
                    >
                      {value}
                    </ThemedTextV2>
                  )}
                  thousandSeparator
                  value={collateral.amount}
                />
                <ThemedTextV2>
                  {getTokenPrice(
                    collateral.symbol,
                    new BigNumber(collateral.amount)
                  ).toFixed(8)}
                </ThemedTextV2>
              </View>
            </View> */}

        {/* <PricesSectionV2
              priceRates={instantSwapPriceRate}
              testID="instant_swap_prices"
            /> */}

        {/* Working but manual */}
        {/* <NumberRowV2
              key={collateral.id}
              lhs={{
                value: collateral.symbol,
                testID: `${collateral.symbol}_${index}`,
                suffix: collateral.symbol,
                themedProps: {
                  light: tailwind("text-mono-light-v2-500"),
                  dark: tailwind("text-mono-dark-v2-500"),
                },
              }}
              rhs={{
                value: collateral.amount,
                testID: `${collateral.amount}_${index}`,
                suffix: collateral.symbol,
                usdAmount: getTokenPrice(
                  collateral.symbol,
                  new BigNumber(collateral.amount)
                ),
                themedProps: {
                  light: tailwind("text-mono-light-v2-900"),
                  dark: tailwind("text-mono-dark-v2-900"),
                },
                usdTextStyle: tailwind("text-sm"),
              }}
            /> */}
        {/* </ThemedViewV2> */}
        {/* </View> */}
        {/* </>
        ))}
      </View> */}

        {/* END OF V2 */}

        {/* <ThemedView
        light={tailwind("bg-gray-50")}
        style={tailwind(["flex-1", { "pb-36": Platform.OS !== "web" }])}
      >
        <ThemedView
          light={tailwind("bg-white border-gray-200")}
          dark={tailwind("bg-gray-800 border-gray-700")}
          style={tailwind("rounded border-b p-4")}
          testID="batch_detail_screen"
        >
          <View
            style={tailwind(
              "flex-row w-full items-center justify-between mb-2"
            )}
          >
            <View style={tailwind("flex flex-row items-center")}>
              <ThemedView
                light={tailwind("bg-gray-100")}
                dark={tailwind("bg-gray-700")}
                style={tailwind(
                  "w-8 h-8 rounded-full items-center justify-center"
                )}
              >
                <LoanIcon height={32} width={32} />
              </ThemedView>
              <View style={tailwind("flex flex-row ml-2")}>
                <View style={tailwind("flex")}>
                  <ThemedText style={tailwind("font-semibold text-sm")}>
                    {batch.loan.displaySymbol}
                  </ThemedText>
                  <View style={tailwind("flex flex-row items-center")}>
                    <ThemedText
                      light={tailwind("text-gray-500")}
                      dark={tailwind("text-gray-400")}
                      style={tailwind("text-xs")}
                    >
                      {translate(
                        "components/AuctionDetailScreen",
                        "Batch #{{index}}",
                        { index: batch.index + 1 }
                      )}
                    </ThemedText>
                    <TouchableOpacity
                      onPress={async () =>
                        await openURL(
                          getAuctionsUrl(vault.vaultId, batch.index)
                        )
                      }
                      testID="ocean_vault_explorer"
                    >
                      <ThemedIcon
                        dark={tailwind("text-darkprimary-500")}
                        iconType="MaterialIcons"
                        light={tailwind("text-primary-500")}
                        name="open-in-new"
                        style={tailwind("ml-1")}
                        size={12}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
            <View style={tailwind("flex flex-row")}>
              <CollateralTokenIconGroup
                maxIconToDisplay={3}
                title={translate(
                  "components/AuctionDetailScreen",
                  "Collateral"
                )}
                symbols={batch.collaterals.map(
                  (collateral) => collateral.displaySymbol
                )}
              />
            </View>
          </View>

          {batch?.highestBid?.owner === address && (
            <View style={tailwind("mb-1")}>
              <AuctionBidStatus testID="batch_detail" type="highest" />
            </View>
          )}

          <AuctionTimeProgress
            liquidationHeight={vault.liquidationHeight}
            blockCount={blockCount}
            label="Auction time remaining"
          />
        </ThemedView>
        <Tabs
          tabSections={tabsList}
          testID="auction_detail_tab"
          activeTabKey={activeTab}
        />
        {activeTab === TabKey.BidHistory && (
          <BidHistory
            vaultId={vault.vaultId}
            liquidationHeight={vault.liquidationHeight}
            batchIndex={batch.index}
            loanDisplaySymbol={batch.loan.displaySymbol}
            loanSymbol={batch.loan.symbol}
            minNextBidInToken={minNextBidInToken}
          />
        )}
        {activeTab === TabKey.Collaterals && (
          <AuctionedCollaterals
            collaterals={batch.collaterals}
            auctionAmount={totalPrecisedCollateralsValue}
          />
        )}

        {activeTab === TabKey.AuctionDetails && (
          <AuctionDetails vault={vault} batch={batch} />
        )}
      </ThemedView>
      <AuctionActionSection
        minNextBidInToken={minNextBidInToken}
        displaySymbol={batch.loan.displaySymbol}
        symbol={batch.loan.symbol}
        minNextBidInUSD={minNextBidInUSD}
        blocksRemaining={blocksRemaining}
        onQuickBid={onQuickBid}
        onPlaceBid={onPlaceBid}
      /> */}
        {/* <AuctionActionSection
          minNextBidInToken={minNextBidInToken}
          displaySymbol={batch.loan.displaySymbol}
          symbol={batch.loan.symbol}
          minNextBidInUSD={minNextBidInUSD}
          blocksRemaining={blocksRemaining}
          onQuickBid={onQuickBid}
          onPlaceBid={onPlaceBid}
        /> */}

        {Platform.OS === "web" && (
          <BottomSheetWebWithNav
            modalRef={containerRef}
            screenList={bottomSheetScreen}
            isModalDisplayed={isModalDisplayed}
          />
        )}

        {Platform.OS !== "web" && (
          <BottomSheetWithNav
            modalRef={bottomSheetRef}
            screenList={bottomSheetScreen}
            snapPoints={{
              ios: ["40%"],
              android: ["40%"],
            }}
          />
        )}
      </ThemedScrollViewV2>
    </View>
  );
}

interface AuctionActionSectionProps {
  minNextBidInToken: BigNumber;
  minNextBidInUSD: BigNumber;
  symbol: string;
  displaySymbol: string;
  blocksRemaining: number;
  onQuickBid: () => void;
  onPlaceBid: () => void;
}

const AuctionActionSection = memo(
  (props: AuctionActionSectionProps): JSX.Element => {
    return (
      <ThemedView
        light={tailwind("bg-white border-gray-200")}
        dark={tailwind("bg-gray-900 border-gray-700")}
        style={tailwind(
          "absolute w-full bottom-0 flex-1 border-t px-4 pt-5 pb-10"
        )}
      >
        <MinNextBidTextRow
          displaySymbol={props.displaySymbol}
          minNextBidInToken={props.minNextBidInToken.toFixed(8)}
          minNextBidInUSD={getPrecisedTokenValue(props.minNextBidInUSD)}
          labelTextStyle={tailwind("text-sm items-center")}
          valueTextStyle={tailwind("font-semibold text-base")}
          testID="auction_detail_min_next_bid"
        />
        <View
          style={tailwind("flex flex-row mt-4 items-center justify-center")}
        >
          <IconButton
            iconLabel={translate("components/QuickBid", "QUICK BID")}
            iconSize={16}
            style={tailwind("mr-1 w-1/2 justify-center p-2 rounded-sm")}
            onPress={props.onQuickBid}
            disabled={props.blocksRemaining === 0}
            textStyle={tailwind("text-base")}
            testID="auction_details_quick_bid_button"
          />
          <IconButton
            iconLabel={translate("components/AuctionDetailScreen", "PLACE BID")}
            iconSize={16}
            style={tailwind(
              "ml-1 w-1/2 justify-center p-2 rounded-sm bg-primary-50"
            )}
            onPress={props.onPlaceBid}
            disabled={props.blocksRemaining === 0}
            themedProps={{
              light: tailwind("bg-primary-50 border-primary-50"),
              dark: tailwind("bg-darkprimary-700 border-darkprimary-700"),
            }}
            textStyle={tailwind("text-base")}
            textThemedProps={{
              light: tailwind("text-primary-500"),
              dark: tailwind("text-white"),
            }}
          />
        </View>
      </ThemedView>
    );
  }
);
