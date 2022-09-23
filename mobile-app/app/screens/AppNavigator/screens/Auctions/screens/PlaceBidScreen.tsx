import { useEffect, useState, useCallback } from "react";
import { Platform, View } from "react-native";
import { useSelector } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import { StackScreenProps } from "@react-navigation/stack";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import BigNumber from "bignumber.js";
import { getColor, tailwind } from "@tailwind";
import { RootState } from "@store";
import { hasTxQueued as hasBroadcastQueued } from "@store/ocean";
import { hasTxQueued } from "@store/transaction_queue";
import { translate } from "@translations";
import { useBottomSheet } from "@hooks/useBottomSheet";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import {
  ThemedScrollView,
  ThemedTextV2,
  ThemedTextInputV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import {
  BottomSheetWebWithNav,
  BottomSheetWithNav,
} from "@components/BottomSheetWithNav";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import { useTokenPrice } from "@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice";
import {
  TokenDropdownButton,
  TokenDropdownButtonStatus,
} from "@components/TokenDropdownButton";
import { tokensSelector } from "@store/wallet";
import { useToast } from "react-native-toast-notifications";
import { NumberRowV2 } from "@components/NumberRowV2";
import { ButtonV2 } from "@components/ButtonV2";
import { AuctionsParamList } from "../AuctionNavigator";
import { useAuctionBidValue } from "../hooks/AuctionBidValue";
import { useAuctionTime } from "../hooks/AuctionTimeLeft";
import { ActiveUSDValueV2 } from "../../Loans/VaultDetail/components/ActiveUSDValueV2";

type Props = StackScreenProps<AuctionsParamList, "PlaceBidScreen">;

export function PlaceBidScreen(props: Props): JSX.Element {
  const { batch, vault } = props.route.params;
  const tokens = useSelector((state: RootState) =>
    tokensSelector(state.wallet)
  );
  const ownedToken = tokens.find((token) => token.id === batch.loan.id);

  const { minNextBidInToken, totalCollateralsValueInUSD } = useAuctionBidValue(
    batch,
    vault.liquidationPenalty
  );
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001));
  const { bottomSheetRef, containerRef, isModalDisplayed, bottomSheetScreen } =
    useBottomSheet();

  const navigation = useNavigation<NavigationProp<AuctionsParamList>>();
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue)
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasBroadcastQueued(state.ocean)
  );
  const blockCount = useSelector((state: RootState) => state.block.count) ?? 0;
  const { blocksRemaining } = useAuctionTime(
    vault.liquidationHeight,
    blockCount
  );
  const logger = useLogger();
  const client = useWhaleApiClient();
  const { isLight } = useThemeContext();
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
    amount: string,
    type: BidAmountButtonTypes
  ): Promise<void> {
    setValue("bidAmount", amount);
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
      }
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
      totalAuctionValue: totalCollateralsValueInUSD,
      vault,
    });
  };

  const ownedTokenAmount = ownedToken === undefined ? "0" : ownedToken.amount;
  const displayHigherBidWarning = getAmountInUSDValue(bidAmount).gte(
    new BigNumber(totalCollateralsValueInUSD).times(1.2)
  );

  return (
    <View ref={containerRef} style={tailwind("h-full")}>
      <ThemedScrollView
        testID="place_bid_screen"
        contentContainerStyle={tailwind(
          "flex flex-col justify-between pb-8 px-4 h-full"
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
              }
            )}
          </ThemedTextV2>
          <View
            style={tailwind(
              "flex flex-row justify-between items-center mt-4 mx-6"
            )}
          >
            <View style={tailwind("w-6/12 mr-2")}>
              <Controller
                control={control}
                defaultValue=""
                name="bidAmount"
                render={({ field: { onChange, value } }) => (
                  <ThemedTextInputV2
                    style={tailwind("text-xl font-semibold-v2 w-full")}
                    light={tailwind("text-mono-light-v2-900")}
                    dark={tailwind("text-mono-dark-v2-900")}
                    keyboardType="numeric"
                    value={value}
                    onBlur={async () => {
                      await onChange(value?.trim());
                    }}
                    onChangeText={async (amount) => {
                      amount = isNaN(+amount) ? "0" : amount;
                      setValue("bidAmount", amount);
                      await trigger("bidAmount");
                    }}
                    placeholder="0.00"
                    placeholderTextColor={getColor(
                      isLight
                        ? bidAmount === ""
                          ? "mono-light-v2-500"
                          : "mono-light-v2-900"
                        : bidAmount === ""
                        ? "mono-dark-v2-500"
                        : "mono-dark-v2-900"
                    )}
                    testID="text_input_bid_amount"
                    editable={bidAmount !== undefined}
                  />
                )}
                rules={{
                  required: true,
                  pattern: /^\d*\.?\d*$/,
                  validate: {
                    min: (value) => new BigNumber(minNextBidInToken).lte(value),
                    hasSufficientFunds: (value) =>
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
              testID="place_bid"
              onPress={() => {}}
              status={TokenDropdownButtonStatus.Locked}
            />
          </View>
          <ThemedViewV2
            light={tailwind("bg-mono-light-v2-00")}
            dark={tailwind("bg-mono-dark-v2-00")}
            style={tailwind(
              "flex flex-row justify-around items-center py-3 mt-6 mx-1 rounded-xl-v2 font-normal-v2"
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
              }
            )}
          </ThemedViewV2>

          {(formState.errors.bidAmount?.type === "min" ||
            (!displayHigherBidWarning &&
              (formState.errors.bidAmount === undefined ||
                formState.errors.bidAmount.type === "required"))) && (
            <ThemedTextV2
              light={tailwind("text-mono-light-v2-500", {
                "text-red-v2": formState.errors.bidAmount?.type === "min",
              })}
              dark={tailwind("text-mono-dark-v2-500", {
                "text-red-v2": formState.errors.bidAmount?.type === "min",
              })}
              style={tailwind("text-xs pt-2 mx-6 font-normal-v2")}
              testID="min_next_bid_text"
            >
              {translate(
                "screens/PlaceBidScreen",
                "The minimum next bid is {{amount}} {{symbol}} (100%)",
                {
                  amount: minNextBidInToken,
                  symbol: batch.loan.symbol,
                }
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
            <ThemedTextV2
              light={tailwind("text-orange-v2")}
              dark={tailwind("text-orange-v2")}
              style={tailwind("text-xs pt-2 mx-6 font-normal-v2")}
              testID="high_bid_text"
            >
              {translate(
                "screens/PlaceBidScreen",
                "Your bid is higher than the auction's collateral value of {{prefix}}{{amount}}",
                { prefix: "$", amount: totalCollateralsValueInUSD }
              )}
            </ThemedTextV2>
          )}

          {new BigNumber(bidAmount || 0).gt(0) && (
            <ThemedViewV2
              dark={tailwind("border-gray-700")}
              light={tailwind("border-gray-300")}
              style={tailwind("p-5 border-0.5 rounded-lg-v2 mx-1 my-6")}
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
                "text-red-v2 text-center text-xs font-normal-v2 mb-4"
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
              "Review full details in the next screen"
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
      </ThemedScrollView>
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
  onPress: (value: string, type: BidAmountButtonTypes) => void;
  bidPercentageAmount: BidAmountButtonTypes;
  minNextBidInToken: string;
  hasBorder: boolean;
}
function BidAmountButton({
  onPress,
  bidPercentageAmount,
  minNextBidInToken,
  hasBorder,
}: PercentageAmountButtonProps): JSX.Element {
  const minNextBid = new BigNumber(minNextBidInToken);
  const decimalPlace = 8;
  let value = minNextBid.toFixed(decimalPlace);

  switch (bidPercentageAmount) {
    case BidAmountButtonTypes.Min:
      value = minNextBid.toFixed(decimalPlace);
      break;
    case BidAmountButtonTypes.One:
      value = minNextBid.multipliedBy(1.01).toFixed(decimalPlace);
      break;
    case BidAmountButtonTypes.Two:
      value = minNextBid.multipliedBy(1.02).toFixed(decimalPlace);
      break;
    case BidAmountButtonTypes.Five:
      value = minNextBid.multipliedBy(1.05).toFixed(decimalPlace);
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
          style={tailwind("font-semibold-v2 text-xs")}
        >
          {bidPercentageAmount}
        </ThemedTextV2>
      </ThemedViewV2>
    </ThemedTouchableOpacityV2>
  );
}
