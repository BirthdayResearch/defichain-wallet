import { useEffect, useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import { StackScreenProps } from "@react-navigation/stack";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { getNativeIcon } from "@components/icons/assets";
import {
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedSectionTitleV2,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { hasTxQueued } from "@store/transaction_queue";
import {
  hasTxQueued,
  hasOceanTXQueued,
} from "@waveshq/walletkit-ui/dist/store";
import { RootState } from "@store";
import { useSelector } from "react-redux";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { ViewPoolHeader } from "@screens/AppNavigator/screens/Dex/components/ViewPoolHeader";
import {
  AmountButtonTypes,
  TransactionCard,
  TransactionCardStatus,
} from "@components/TransactionCard";
import { WalletTransactionCardTextInput } from "@components/WalletTransactionCardTextInput";
import { useToast } from "react-native-toast-notifications";
import { InputHelperTextV2 } from "@components/InputHelperText";
import { NumberRowV2 } from "@components/NumberRowV2";
import { ButtonV2 } from "@components/ButtonV2";
import { useBottomSheet } from "@hooks/useBottomSheet";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { ViewSwapInfo } from "@screens/AppNavigator/screens/Portfolio/screens/ViewSwapInfo";
import { Platform, View } from "react-native";
import {
  BottomSheetWebWithNavV2,
  BottomSheetWithNavV2,
} from "@components/BottomSheetWithNavV2";
import { useFutureSwapDate } from "../../Dex/hook/FutureSwap";
import { useTokenPrice } from "../hooks/TokenPrice";
import { PortfolioParamList } from "../PortfolioNavigator";

type Props = StackScreenProps<PortfolioParamList, "WithdrawFutureSwapScreen">;

export function WithdrawFutureSwapScreen(props: Props): JSX.Element {
  const {
    futureSwap: { source, destination },
    executionBlock,
  } = props.route.params;
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>();
  const client = useWhaleApiClient();
  const logger = useLogger();
  const { isLight } = useThemeContext();
  const { getTokenPrice } = useTokenPrice();
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue)
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasOceanTXQueued(state.ocean)
  );
  const blockCount = useSelector((state: RootState) => state.block.count ?? 0);
  const { isEnded, transactionDate } = useFutureSwapDate(
    executionBlock,
    blockCount
  );
  const [amountToWithdraw, setAmountToWithdraw] = useState("");
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001));

  const toast = useToast();
  const TOAST_DURATION = 2000;
  const [transactionCardStatus, setTransactionCardStatus] =
    useState<TransactionCardStatus>();
  const [isInputFocus, setIsInputFocus] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const modalSortingSnapPoints = {
    ios: ["45%"],
    android: ["45%"],
  };
  const IconSource = getNativeIcon(source.displaySymbol);

  useEffect(() => {
    client.fee
      .estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error);
  }, []);

  useEffect(() => {
    setTransactionCardStatus(
      hasError
        ? TransactionCardStatus.Error
        : isInputFocus
        ? TransactionCardStatus.Active
        : TransactionCardStatus.Default
    );
  }, [hasError, isInputFocus]);

  useEffect(() => {
    setHasError(BigNumber(amountToWithdraw).gt(BigNumber(source.amount)));
  }, [source, amountToWithdraw]);

  const { remainingAmount, remainingAmountInUSD } = useMemo(() => {
    return {
      remainingAmount: new BigNumber(source.amount)
        .minus(BigNumber.max(amountToWithdraw, 0))
        .toFixed(8),
      remainingAmountInUSD: getTokenPrice(
        source.symbol,
        new BigNumber(source.amount).minus(BigNumber.max(amountToWithdraw, 0)),
        false
      ),
    };
  }, [source, amountToWithdraw]);

  const {
    bottomSheetRef,
    containerRef,
    expandModal,
    dismissModal,
    isModalDisplayed,
  } = useBottomSheet();

  const bottomSheetHeader = {
    headerStatusBarHeight: 2,
    headerTitle: "",
    headerBackTitleVisible: false,
    headerStyle: tailwind("rounded-t-xl-v2 border-b-0", {
      "bg-mono-light-v2-100": isLight,
      "bg-mono-dark-v2-100": !isLight,
    }),
    headerRight: (): JSX.Element => {
      return (
        <ThemedTouchableOpacityV2
          style={tailwind("mr-5")}
          onPress={dismissModal}
          testID="close_bottom_sheet_button"
        >
          <ThemedIcon iconType="Feather" name="x-circle" size={22} />
        </ThemedTouchableOpacityV2>
      );
    },
    headerLeft: () => <></>,
  };

  const viewSwapInfo = useMemo(() => {
    return [
      {
        stackScreenName: "ViewSwapInfo",
        component: ViewSwapInfo({
          futureSwap: {
            source: source,
            destination: destination,
          },
          executionBlock: executionBlock,
          transactionDate: transactionDate,
        }),
        option: bottomSheetHeader,
      },
    ];
  }, [isLight]);

  const onSubmit = async (): Promise<void> => {
    navigation.navigate({
      name: "ConfirmWithdrawFutureSwapScreen",
      params: {
        source: {
          amountToWithdraw: new BigNumber(amountToWithdraw),
          remainingAmount: new BigNumber(remainingAmount),
          remainingAmountInUSD: new BigNumber(remainingAmountInUSD),
          displaySymbol: source.displaySymbol,
          tokenId: source.tokenId,
          isLoanToken: source.isLoanToken,
          symbol: source.symbol,
        },
        destination: {
          tokenId: destination.tokenId,
          displaySymbol: destination.displaySymbol,
        },
        fee,
        executionBlock,
      },
      merge: true,
    });
  };

  function onPercentagePress(amount: string, type: AmountButtonTypes): void {
    setAmountToWithdraw(amount);
    showToast(type);
  }

  function showToast(type: AmountButtonTypes): void {
    if (source === undefined) {
      return;
    }

    toast.hideAll();
    const isMax = type === AmountButtonTypes.Max;
    const toastMessage = isMax
      ? "Max available {{unit}} entered"
      : "{{percent}} of available {{unit}} entered";
    const toastOption = {
      unit: source.displaySymbol,
      percent: type,
    };
    toast.show(
      translate("screens/WithdrawFutureSwapScreen", toastMessage, toastOption),
      {
        type: "wallet_toast",
        placement: "top",
        duration: TOAST_DURATION,
      }
    );
  }

  return (
    <View ref={containerRef} style={tailwind("flex-col flex-1")}>
      <ThemedScrollViewV2
        contentContainerStyle={tailwind("flex-grow justify-between pb-12 pt-8")}
      >
        <View>
          <ViewPoolHeader
            tokenASymbol={source.displaySymbol}
            tokenBSymbol={destination.displaySymbol}
            headerLabel={translate(
              "screens/WithdrawFutureSwapScreen",
              "View swap info"
            )}
            onPress={expandModal}
            testID="view_swap_info"
          />
          <View style={tailwind("flex-col mt-2 px-5")}>
            <ThemedSectionTitleV2
              testID="withdraw_title"
              text={translate(
                "screens/WithdrawFutureSwapScreen",
                "I WANT TO WITHDRAW"
              )}
            />
            <TransactionCard
              maxValue={new BigNumber(source.amount)}
              onChange={onPercentagePress}
              amountButtonsStyle={{ style: tailwind("border-t-0.5") }}
              containerStyle={{
                style: tailwind("px-5 rounded-t-lg-v2"),
              }}
              status={transactionCardStatus}
            >
              <ThemedViewV2
                light={tailwind("border-mono-light-v2-300")}
                dark={tailwind("border-mono-dark-v2-300")}
                style={tailwind("flex flex-row items-center py-4.5")}
              >
                <IconSource height={20} width={20} />
                <WalletTransactionCardTextInput
                  onFocus={() => setIsInputFocus(true)}
                  onBlur={() => setIsInputFocus(false)}
                  onChangeText={setAmountToWithdraw}
                  placeholder="0.00"
                  value={amountToWithdraw}
                  inputType="numeric"
                  displayClearButton={amountToWithdraw !== ""}
                  onClearButtonPress={() => setAmountToWithdraw("")}
                  testID="text_input_percentage"
                  containerStyle="flex-1 flex-col"
                  inputContainerStyle={tailwind("pl-2 pr-0 py-0")}
                />
              </ThemedViewV2>
            </TransactionCard>
            {hasError ? (
              <ThemedTextV2
                style={tailwind("font-normal-v2 text-xs px-5 pt-2 text-red-v2")}
                light={tailwind("text-red-v2")}
                dark={tailwind("text-red-v2")}
                testID="text_inline_error"
              >
                {translate(
                  "screens/WithdrawFutureSwapScreen",
                  "Insufficient Balance"
                )}
              </ThemedTextV2>
            ) : (
              <View style={tailwind("pt-1 px-1")}>
                <InputHelperTextV2
                  testID="text_inline"
                  label={`${translate(
                    "screens/WithdrawFutureSwapScreen",
                    "Withdraw from"
                  )}: `}
                  content={source.amount}
                  suffix={` ${source.displaySymbol}`}
                />
              </View>
            )}
          </View>

          {amountToWithdraw.length > 0 && (
            <View style={tailwind("flex-col")}>
              <ThemedViewV2
                style={tailwind("rounded-lg-v2 border-0.5 mt-8 mx-5 p-5 pb-0")}
                light={tailwind("border-mono-light-v2-300")}
                dark={tailwind("border-mono-dark-v2-300")}
              >
                <NumberRowV2
                  lhs={{
                    value: translate(
                      "screens/WithdrawFutureSwapScreen",
                      "Transaction fee"
                    ),
                    testID: "transaction_fee_label",
                    themedProps: {
                      light: tailwind("text-mono-light-v2-500"),
                      dark: tailwind("text-mono-dark-v2-500"),
                    },
                  }}
                  rhs={{
                    value: fee.toFixed(8),
                    testID: "text_fee",
                    suffix: " DFI",
                    usdAmount: getTokenPrice("DFI", new BigNumber(fee)),
                    usdTextStyle: tailwind("text-sm"),
                    usdContainerStyle: tailwind("pt-1"),
                  }}
                />
              </ThemedViewV2>
              <ThemedTextV2
                style={tailwind(
                  "font-normal-v2 text-xs text-center pt-12 pb-5"
                )}
                light={tailwind("text-mono-light-v2-500")}
                dark={tailwind("text-mono-dark-v2-500")}
              >
                {translate(
                  "screens/WithdrawFutureSwapScreen",
                  "Review full details in the next screen"
                )}
              </ThemedTextV2>
            </View>
          )}
        </View>

        <View style={tailwind("w-full px-12")}>
          <ButtonV2
            fillType="fill"
            label={translate("components/Button", "Continue")}
            disabled={
              hasPendingJob ||
              hasPendingBroadcastJob ||
              new BigNumber(amountToWithdraw).isNaN() ||
              new BigNumber(amountToWithdraw).isZero() ||
              isEnded ||
              hasError
            }
            styleProps="w-full"
            onPress={onSubmit}
            testID="button_continue_withdraw"
          />
        </View>

        {Platform.OS === "web" ? (
          <BottomSheetWebWithNavV2
            modalRef={containerRef}
            screenList={viewSwapInfo}
            isModalDisplayed={isModalDisplayed}
            // eslint-disable-next-line react-native/no-inline-styles
            modalStyle={{
              position: "absolute",
              bottom: "0",
              height: "404px",
              width: "375px",
              zIndex: 50,
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
              overflow: "hidden",
            }}
          />
        ) : (
          <BottomSheetWithNavV2
            modalRef={bottomSheetRef}
            screenList={viewSwapInfo}
            snapPoints={modalSortingSnapPoints}
          />
        )}
      </ThemedScrollViewV2>
    </View>
  );
}
