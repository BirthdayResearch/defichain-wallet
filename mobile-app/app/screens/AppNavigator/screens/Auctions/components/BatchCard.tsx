import * as React from "react";
import { memo, useMemo, useState } from "react";
import { Text, View, LayoutChangeEvent } from "react-native";
import {
  ThemedText,
  ThemedIcon,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
} from "@components/themed";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import {
  LoanVaultLiquidationBatch,
  LoanVaultLiquidated,
} from "@defichain/whale-api-client/dist/api/loan";
import NumberFormat from "react-number-format";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { TokenIconGroupV2 } from "@components/TokenIconGroupV2";
import BigNumber from "bignumber.js";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { SymbolIcon } from "@components/SymbolIcon";
import { AuctionsParamList } from "../AuctionNavigator";
import { useAuctionBidValue } from "../hooks/AuctionBidValue";
import { onQuickBidProps } from "./BrowseAuctions";
import { useAuctionTime } from "../hooks/AuctionTimeLeft";
import { VerticalProgressBar } from "./VerticalProgressBar";
import { getPrecisedTokenValue } from "../helpers/precision-token-value";

export interface BatchCardProps {
  vault: LoanVaultLiquidated;
  batch: LoanVaultLiquidationBatch;
  testID: string;
  collateralTokenSymbols: string[];
  onQuickBid: (props: onQuickBidProps) => void;
  isVaultOwner: boolean;
}

export function BatchCard(props: BatchCardProps): JSX.Element {
  const navigation = useNavigation<NavigationProp<AuctionsParamList>>();
  const { address } = useWalletContext();
  const { batch, testID, vault, collateralTokenSymbols } = props;
  const [progressBarHeight, setProgressBarHeight] = useState<number>(0);
  const blockCount = useSelector((state: RootState) => state.block.count) ?? 0;
  const {
    minNextBidInToken,
    totalCollateralsValueInUSD,
    hasFirstBid,
    minNextBidInUSD,
  } = useAuctionBidValue(batch, vault.liquidationPenalty);
  const { timeRemaining, blocksRemaining, blocksPerAuction } = useAuctionTime(
    vault.liquidationHeight,
    blockCount
  );
  const normalizedBlocks = useMemo(
    () => new BigNumber(blocksRemaining).dividedBy(blocksPerAuction),
    [blocksRemaining, blocksPerAuction]
  );
  const timeRemainingThemedColor = normalizedBlocks.gt(0.5)
    ? "green-v2"
    : normalizedBlocks.gt(0.26)
    ? "orange-v2"
    : "red-v2";
  const onCardPress = (): void => {
    navigation.navigate("AuctionDetailScreen", {
      batch,
      vault,
    });
  };
  const onPageLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setProgressBarHeight(height);
  };

  const onQuickBid = (): void => {
    props.onQuickBid({
      batch: batch,
      vaultId: vault.vaultId,
      minNextBidInToken,
      totalCollateralsValueInUSD,
      minNextBidInUSD,
      vaultLiquidationHeight: vault.liquidationHeight,
    });
  };

  return (
    <ThemedTouchableOpacityV2
      light={tailwind("bg-mono-light-v2-00")}
      dark={tailwind("bg-mono-dark-v2-00")}
      style={tailwind("mx-5 rounded-lg-v2 mb-2 overflow-hidden")}
      testID={testID}
      onPress={onCardPress}
    >
      <View
        style={tailwind("flex flex-row justify-between items-start")}
        onLayout={onPageLayout}
      >
        <View style={tailwind("flex-1 p-5 pr-3.5")}>
          <View style={tailwind("flex flex-row justify-between items-start")}>
            <TokenIconGroupV2
              testID="required_collateral_token_group"
              size={24}
              symbols={collateralTokenSymbols}
            />
            <View>
              <NumberFormat
                displayType="text"
                prefix="$"
                decimalScale={2}
                renderText={(value: string) => (
                  <ThemedTextV2
                    light={tailwind("text-mono-light-v2-1000")}
                    dark={tailwind("text-mono-dark-v2-1000")}
                    style={tailwind("font-semibold-v2 text-right")}
                  >
                    {value}
                  </ThemedTextV2>
                )}
                thousandSeparator
                value={getPrecisedTokenValue(totalCollateralsValueInUSD)}
              />
              {timeRemaining !== "" && (
                <Text
                  style={tailwind(
                    `font-normal-v2 text-xs text-right text-${timeRemainingThemedColor}`
                  )}
                >
                  {translate(
                    "components/AuctionTimeProgress",
                    "{{time}} left",
                    { time: timeRemaining }
                  )}
                </Text>
              )}
            </View>
          </View>
          <View
            style={tailwind("mt-2 flex flex-row justify-between items-end")}
          >
            <View>
              <BidInfo
                hasFirstBid={hasFirstBid}
                isOutBid={
                  batch?.highestBid?.owner !== address &&
                  batch?.froms.includes(address)
                }
                isHighestBidder={batch?.highestBid?.owner === address}
                testID={testID}
              />
              <NumberFormat
                displayType="text"
                suffix={` ${batch.loan.displaySymbol}`}
                renderText={(value: string) => (
                  <ThemedTextV2
                    light={tailwind("text-mono-light-v2-700")}
                    dark={tailwind("text-mono-dark-v2-700")}
                    style={tailwind("mt-1 text-xs font-normal-v2 flex-wrap")}
                    testID={`batch_${batch.index}_min_next_bid`}
                  >
                    {value}
                  </ThemedTextV2>
                )}
                thousandSeparator
                value={minNextBidInToken.toFixed(8)}
              />
            </View>
            <View>
              <ThemedTouchableOpacityV2
                light={tailwind("bg-mono-light-v2-100")}
                dark={tailwind("bg-mono-dark-v2-100")}
                style={tailwind(
                  "flex flex-row items-center rounded-2xl-v2 py-2 px-3"
                )}
                onPress={onQuickBid}
                testID={`${testID}_quick_bid_button`}
              >
                <SymbolIcon
                  symbol={batch.loan.displaySymbol}
                  styleProps={tailwind("w-4 h-4")}
                />
                <ThemedTextV2
                  style={tailwind("font-semibold-v2 text-xs text-center ml-1")}
                >
                  {translate(
                    "components/BatchCard",
                    batch?.froms.includes(address) ? "Quick rebid" : "Quick bid"
                  )}
                </ThemedTextV2>
              </ThemedTouchableOpacityV2>
            </View>
          </View>
        </View>
        <VerticalProgressBar
          height={progressBarHeight}
          normalizedBlocks={normalizedBlocks.toNumber()}
          color={timeRemainingThemedColor}
        />
      </View>
    </ThemedTouchableOpacityV2>
  );
}

const BidInfo = memo(
  ({
    isHighestBidder,
    hasFirstBid,
    testID,
    isOutBid,
  }: {
    isHighestBidder: boolean;
    hasFirstBid: boolean;
    isOutBid: boolean;
    testID: string;
  }): JSX.Element => {
    const { isLight } = useThemeContext();
    const { testId, title, icon, color } = useMemo(() => {
      if (isHighestBidder) {
        return {
          testId: `${testID}_lost`,
          title: "Leading bid",
          icon: "check-circle",
          color: "text-green-v2",
        };
      }
      if (isOutBid) {
        return {
          testId: `${testID}_leading`,
          title: "Outbid",
          icon: "info",
          color: "text-orange-v2",
        };
      }
      return {
        testId: hasFirstBid ? `${testID}_next_bid` : `${testID}_no_bid`,
        title: "Min bid",
        color: isLight ? "text-mono-light-v2-900" : "text-mono-dark-v2-900",
      };
    }, []);

    return (
      <View style={tailwind("flex flex-row items-center")}>
        <Text
          style={tailwind(`font-normal-v2 text-xs ${color}`)}
          testID={`${testId}_text`}
        >
          {translate("components/QuickBid", title)}
        </Text>
        {icon !== undefined && (
          <ThemedIcon
            size={18}
            name={icon}
            iconType="MaterialIcons"
            style={tailwind(`ml-1.5 ${color}`)}
            testID={`${testId}_icon`}
          />
        )}
      </View>
    );
  }
);

type AuctionBidStatusType = "lost" | "highest";

export const AuctionBidStatus = memo(
  ({
    type,
    testID,
  }: {
    type: AuctionBidStatusType;
    testID: string;
  }): JSX.Element => {
    return (
      <View style={tailwind("flex-row w-full items-center justify-between")}>
        <View style={tailwind("flex flex-row items-center justify-between")}>
          {type === "lost" ? (
            <>
              <ThemedIcon
                light={tailwind("text-warning-500")}
                dark={tailwind("text-darkwarning-500")}
                iconType="MaterialIcons"
                name="not-interested"
                size={12}
              />
              <ThemedText
                light={tailwind("text-warning-500")}
                dark={tailwind("text-darkwarning-500")}
                style={tailwind("text-xs ml-1")}
                testID={`${testID}_lost_text`}
              >
                {translate("components/BatchCard", "Your placed bid lost")}
              </ThemedText>
            </>
          ) : (
            <>
              <ThemedIcon
                light={tailwind("text-blue-500")}
                dark={tailwind("text-darkblue-500")}
                iconType="MaterialIcons"
                name="person-pin"
                size={12}
                style={tailwind("mr-1 mt-0.5")}
              />
              <ThemedText
                light={tailwind("text-blue-500")}
                dark={tailwind("text-darkblue-500")}
                style={tailwind("text-2xs mr-2")}
                testID={`${testID}_highest_text`}
              >
                {translate(
                  "components/BatchCard",
                  "You are the highest bidder"
                )}
              </ThemedText>
            </>
          )}
        </View>
      </View>
    );
  }
);
