import { useEffect, useState, useCallback } from "react";
import { Platform, View, Text } from "react-native";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { StackScreenProps } from "@react-navigation/stack";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import BigNumber from "bignumber.js";
import { tailwind } from "@tailwind";
import { RootState } from "@store";
import {
  hasTxQueued,
  hasOceanTXQueued,
  tokensSelector,
} from "@waveshq/walletkit-ui/dist/store";
import { translate } from "@translations";
import { useBottomSheet } from "@hooks/useBottomSheet";
import { NumericFormat as NumberFormat } from "react-number-format";
import {
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
  ThemedScrollViewV2,
} from "@components/themed";
import {
  BottomSheetWebWithNav,
  BottomSheetWithNav,
} from "@components/BottomSheetWithNav";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { useWhaleApiClient } from "@waveshq/walletkit-ui/dist/contexts";
import { useTokenPrice } from "@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice";
import {
  TokenDropdownButton,
  TokenDropdownButtonStatus,
} from "@components/TokenDropdownButton";
import { getPrecisedTokenValue } from "@screens/AppNavigator/screens/Auctions/helpers/precision-token-value";
import { useToast } from "react-native-toast-notifications";
import { NumberRowV2 } from "@components/NumberRowV2";
import { ButtonV2 } from "@components/ButtonV2";
import { AuctionsParamList } from "../AuctionNavigator";
import { useAuctionBidValue } from "../hooks/AuctionBidValue";
import { useAuctionTime } from "../hooks/AuctionTimeLeft";
import { ActiveUSDValueV2 } from "../../Loans/VaultDetail/components/ActiveUSDValueV2";
import { ControlledTextInput } from "../../Loans/components/ControlledTextInput";

type Props = StackScreenProps<AuctionsParamList, "PlaceBidScreen">;

export function PlaceBidScreen(props: Props): JSX.Element {
  const { batch, vault } = props.route.params;
  const tokens = useSelector((state: RootState) =>
    tokensSelector(state.wallet),
  );
  const ownedToken = tokens.find((token) => token.id === batch.loan.id);

  const { minNextBidInToken, totalCollateralsValueInUSD } = useAuctionBidValue(
    batch,
    vault.liquidationPenalty,
  );
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001));
  const { bottomSheetRef, containerRef, isModalDisplayed, bottomSheetScreen } =
    useBottomSheet();

  const navigation = useNavigation<NavigationProp<AuctionsParamList>>();
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue),
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasOceanTXQueued(state.ocean),
  );
  const blockCount = useSelector((state: RootState) => state.block.count) ?? 0;
  const { blocksRemaining } = useAuctionTime(
    vault.liquidationHeight,
    blockCount,
  );
  const logger = useLogger();
  const client = useWhaleApiClient();
  const toast = useToast();
  const TOAST_DURATION = 2000;

  const { control, formState, setValue, trigger, watch } = useForm<{
    bidAmount: string;
  }>({ mode: "onChange" });
  const { bidAmount } = watch();
  const { getTokenPrice } = useTokenPrice();

  useEffect(() => {
    client.fee
      .estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error);
  }, []);

  const getAmountInUSDValue = useCallback((tokenAmount: string) => {
    if (batch.loan === undefined || tokenAmount === "") {
      return new BigNumber(0);
    }

    const tokenSymbol = batch.loan?.symbol || "";
    return getTokenPrice(tokenSymbol, new BigNumber(tokenAmount));
  }, []);

  async function onBidPercentagePress(
    amount: BigNumber,
    type: BidAmountButtonTypes,
  ): Promise<void> {
    setValue("bidAmount", amount.toFixed(8));
    await trigger("bidAmount");
    showToast(type);
  }

  function showToast(type: BidAmountButtonTypes): void {
    toast.hideAll();
    toast.show(
      translate("screens/PlaceBidScreen", "{{percent}} min bid entered", {
        percent: type,
      }),
      {
        type: "wallet_toast",
        placement: "top",
        duration: TOAST_DURATION,
      },
    );
  }

  const onSubmit = async (): Promise<void> => {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return;
    }

    navigation.navigate("ConfirmPlaceBidScreen", {
      batch,
      bidAmount: new BigNumber(bidAmount),
      estimatedFees: fee,
      totalAuctionValue: getPrecisedTokenValue(totalCollateralsValueInUSD),
      vault,
    });
  };

  const ownedTokenAmount = ownedToken === undefined ? "0" : ownedToken.amount;
  const displayHigherBidWarning = getAmountInUSDValue(bidAmount).gte(
    totalCollateralsValueInUSD.times(1.2),
  );
  const displayMinBidError = formState.errors.bidAmount?.type === "min";
  const displayMinBidMessage =
    !displayHigherBidWarning &&
    (formState.isValid || formState.errors.bidAmount?.type === "required");

  return (
    <View ref={containerRef} style={tailwind("h-full")}>
      <ThemedScrollViewV2
        testID="place_bid_screen"
        contentContainerStyle={tailwind(
          "flex flex-col justify-between pb-8 px-4 h-full",
        )}
      >
        <View>
          <ThemedTextV2
            style={tailwind("mx-6 text-xs font-normal-v2 mt-8")}
            light={tailwind("text-mono-light-v2-500")}
            dark={tailwind("text-mono-dark-v2-500")}
            testID="text_balance_amount"
          >
            {translate(
              "screens/PlaceBidScreen",
              "I HAVE {{ownedAmount}} {{symbol}}",
              {
                ownedAmount: ownedToken?.amount ?? "0.00",
                symbol: batch.loan.displaySymbol,
              },
            )}
          </ThemedTextV2>
          <View
            style={tailwind(
              "flex flex-row justify-between items-center mt-4 ml-6 mr-1",
            )}
          >
            <View style={tailwind("w-6/12 mr-2")}>
              <ControlledTextInput
                name="bidAmount"
                control={control}
                testID="text_input_bid_amount"
                inputProps={{
                  keyboardType: "numeric",
                  placeholder: "0.00",
                  onChangeText: async (amount: string) => {
                    amount = isNaN(+amount) ? "0" : amount;
                    setValue("bidAmount", amount);
                    await trigger("bidAmount");
                  },
                }}
                value={bidAmount}
                rules={{
                  required: true,
                  pattern: /^\d*\.?\d*$/,
                  validate: {
                    min: (value: string) =>
                      new BigNumber(value).gte(minNextBidInToken.toFixed(8)),
                    hasSufficientFunds: (value: string) =>
                      new BigNumber(ownedTokenAmount).gte(value),
                  },
                }}
              />
              <ActiveUSDValueV2
                price={getAmountInUSDValue(bidAmount)}
                testId="bid_value_in_usd"
                containerStyle={tailwind("w-full break-words")}
              />
            </View>
            <TokenDropdownButton
              symbol={batch.loan.displaySymbol}
              tokenId={batch.loan.id}
              testID="place_bid_quick_input"
              onPress={() => {}}
              status={TokenDropdownButtonStatus.Locked}
            />
          </View>
          <ThemedViewV2
            light={tailwind("bg-mono-light-v2-00")}
            dark={tailwind("bg-mono-dark-v2-00")}
            style={tailwind(
              "flex flex-row justify-around items-center py-3 mt-6 mx-1 rounded-xl-v2 font-normal-v2",
            )}
          >
            {Object.values(BidAmountButtonTypes).map(
              (percentageAmount, index, { length }) => {
                return (
                  <BidAmountButton
                    key={percentageAmount}
                    onPress={onBidPercentagePress}
                    bidPercentageAmount={percentageAmount}
                    minNextBidInToken={minNextBidInToken}
                    hasBorder={length - 1 !== index}
                  />
                );
              },
            )}
          </ThemedViewV2>

          {(displayMinBidError || displayMinBidMessage) && (
            <ThemedTextV2
              light={tailwind("text-mono-light-v2-500", {
                "text-red-v2": displayMinBidError,
              })}
              dark={tailwind("text-mono-dark-v2-500", {
                "text-red-v2": displayMinBidError,
              })}
              style={tailwind("text-xs pt-2 mx-6 font-normal-v2")}
              testID="min_next_bid_text"
            >
              {translate(
                "screens/PlaceBidScreen",
                "The minimum next bid is {{amount}} {{symbol}} (100%)",
                {
                  amount: minNextBidInToken.toFixed(8),
                  symbol: batch.loan.symbol,
                },
              )}
            </ThemedTextV2>
          )}
          {formState.errors.bidAmount?.type === "hasSufficientFunds" && (
            <ThemedTextV2
              light={tailwind("text-red-v2")}
              dark={tailwind("text-red-v2")}
              style={tailwind("text-xs pt-2 mx-6 font-normal-v2")}
              testID="insufficient_balance_text"
            >
              {translate("screens/PlaceBidScreen", "Insufficient balance")}
            </ThemedTextV2>
          )}
          {displayHigherBidWarning && formState.isValid && (
            <NumberFormat
              displayType="text"
              renderText={(value: string) => (
                <Text
                  style={tailwind(
                    "text-xs pt-2 mx-6 font-normal-v2 text-orange-v2",
                  )}
                >
                  {translate(
                    "components/QuickBid",
                    "Your bid is higher than the auction's collateral value of {{currency}}{{amount}}",
                    { amount: value, currency: "$" },
                  )}
                </Text>
              )}
              thousandSeparator
              value={getPrecisedTokenValue(totalCollateralsValueInUSD)}
            />
          )}

          {new BigNumber(bidAmount || 0).gt(0) && (
            <ThemedViewV2
              dark={tailwind("border-gray-700")}
              light={tailwind("border-gray-300")}
              style={tailwind(
                "p-5 border-0.5 rounded-lg-v2 mx-1 my-6 font-normal-v2",
              )}
            >
              <NumberRowV2
                lhs={{
                  value: translate("screens/PlaceBidScreen", "Transaction fee"),
                  testID: "bid_txn_fee",
                  themedProps: {
                    light: tailwind("text-mono-light-v2-500"),
                    dark: tailwind("text-mono-dark-v2-500"),
                  },
                }}
                rhs={{
                  value: fee.toFixed(8),
                  testID: "bid_txn_text_fee",
                  suffix: " DFI",
                }}
              />
            </ThemedViewV2>
          )}
        </View>

        <View>
          {blocksRemaining === 0 && (
            <ThemedTextV2
              light={tailwind("text-red-v2")}
              dark={tailwind("text-red-v2")}
              style={tailwind(
                "text-red-v2 text-center text-xs font-normal-v2 mb-4",
              )}
            >
              {translate("screens/PlaceBidScreen", "Auction timeout")}
            </ThemedTextV2>
          )}
          <ThemedTextV2
            light={tailwind("text-mono-light-v2-500")}
            dark={tailwind("text-mono-dark-v2-500")}
            style={tailwind("text-center text-xs font-normal-v2")}
          >
            {translate(
              "screens/PlaceBidScreen",
              "Review full details in the next screen",
            )}
          </ThemedTextV2>
          <ButtonV2
            fillType="fill"
            label={translate("components/Button", "Continue")}
            disabled={
              !formState.isValid ||
              blocksRemaining === 0 ||
              hasPendingJob ||
              hasPendingBroadcastJob
            }
            styleProps="mt-5 mx-12"
            onPress={onSubmit}
            testID="bid_button_submit"
          />
        </View>
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
          />
        )}
      </ThemedScrollViewV2>
    </View>
  );
}

enum BidAmountButtonTypes {
  Min = "100%",
  One = "101%",
  Two = "102%",
  Five = "105%",
}
interface PercentageAmountButtonProps {
  onPress: (value: BigNumber, type: BidAmountButtonTypes) => void;
  bidPercentageAmount: BidAmountButtonTypes;
  minNextBidInToken: BigNumber;
  hasBorder: boolean;
}
function BidAmountButton({
  onPress,
  bidPercentageAmount,
  minNextBidInToken,
  hasBorder,
}: PercentageAmountButtonProps): JSX.Element {
  const minNextBid = new BigNumber(minNextBidInToken);
  let value = minNextBidInToken;

  switch (bidPercentageAmount) {
    case BidAmountButtonTypes.One:
      value = minNextBid.multipliedBy(1.01);
      break;
    case BidAmountButtonTypes.Two:
      value = minNextBid.multipliedBy(1.02);
      break;
    case BidAmountButtonTypes.Five:
      value = minNextBid.multipliedBy(1.05);
      break;
    case BidAmountButtonTypes.Min:
    default:
      value = minNextBidInToken;
      break;
  }

  return (
    <ThemedTouchableOpacityV2
      style={tailwind("w-3/12 items-center justify-center self-stretch", {
        "border-r-0.5": hasBorder,
      })}
      onPress={() => onPress(value, bidPercentageAmount)}
      testID={`${bidPercentageAmount}_amount_button`}
    >
      <ThemedViewV2
        light={tailwind("border-mono-light-v2-300")}
        dark={tailwind("border-mono-dark-v2-300")}
      >
        <ThemedTextV2
          light={tailwind("text-mono-light-v2-700")}
          dark={tailwind("text-mono-dark-v2-700")}
          style={tailwind("font-semibold-v2 text-xs font-normal-v2")}
        >
          {bidPercentageAmount}
        </ThemedTextV2>
      </ThemedViewV2>
    </ThemedTouchableOpacityV2>
  );
}
