import { NavigationProp, useNavigation } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import BigNumber from "bignumber.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, View } from "react-native";
import { useSelector } from "react-redux";
import {
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import { useWhaleApiClient } from "@waveshq/walletkit-ui/dist/contexts";
import { RootState } from "@store";
import {
  hasTxQueued,
  hasOceanTXQueued,
  tokenSelector,
} from "@waveshq/walletkit-ui/dist/store";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import {
  BottomSheetWebWithNavV2,
  BottomSheetWithNavV2,
} from "@components/BottomSheetWithNavV2";
import { useThemeContext } from "@waveshq/walletkit-ui";
import { WalletTransactionCardTextInput } from "@components/WalletTransactionCardTextInput";
import {
  AmountButtonTypes,
  TransactionCard,
  TransactionCardStatus,
} from "@components/TransactionCard";
import { getNativeIcon } from "@components/icons/assets";
import { InputHelperTextV2 } from "@components/InputHelperText";
import { ButtonV2 } from "@components/ButtonV2";
import { useToast } from "react-native-toast-notifications";
import { useBottomSheet } from "@hooks/useBottomSheet";
import { useTokenPrice } from "../Portfolio/hooks/TokenPrice";
import { DataRoutes, ViewPoolDetails } from "./components/ViewPoolDetails";
import { ViewPoolHeader } from "./components/ViewPoolHeader";
import { DexParamList } from "./DexNavigator";
import { LiquidityCalculationSummary } from "./components/LiquidityCalculationSummary";

type Props = StackScreenProps<DexParamList, "RemoveLiquidity">;

export function RemoveLiquidityScreen(props: Props): JSX.Element {
  const logger = useLogger();
  const client = useWhaleApiClient();
  const toast = useToast();
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001));
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue)
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasOceanTXQueued(state.ocean)
  );
  const { getTokenPrice } = useTokenPrice();
  // this component state
  const [tokenAAmount, setTokenAAmount] = useState<BigNumber>(new BigNumber(0));
  const [tokenBAmount, setTokenBAmount] = useState<BigNumber>(new BigNumber(0));
  const [valid, setValidity] = useState(false);
  // ratio, before times 100
  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0)); // to construct tx
  const navigation = useNavigation<NavigationProp<DexParamList>>();

  // transaction card component UI
  const [transactionCardStatus, setTransactionCardStatus] =
    useState<TransactionCardStatus>();
  const [hasError, setHasError] = useState(false);
  const [isInputFocus, setIsInputFocus] = useState(false);
  const [tokenToRemove, setTokenToRemove] = useState<string>("");
  const TOAST_DURATION = 2000;

  // breakdown summary state
  const [hasInputAmount, setHasInputAmount] = useState(false);

  // gather required data
  const { pair, pairInfo, originScreen } = props.route.params;
  const tokenA = useSelector((state: RootState) =>
    tokenSelector(state.wallet, pair.tokenA.id)
  );
  const tokenB = useSelector((state: RootState) =>
    tokenSelector(state.wallet, pair.tokenB.id)
  );

  useEffect(() => {
    setTransactionCardStatus(
      hasError
        ? TransactionCardStatus.Error
        : isInputFocus
        ? TransactionCardStatus.Active
        : TransactionCardStatus.Default
    );
  }, [hasError, isInputFocus]);

  const removeLiquidity = (): void => {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return;
    }
    navigation.navigate("RemoveLiquidityConfirmScreen", {
      amount,
      pair,
      pairInfo,
      tokenAAmount,
      tokenBAmount,
      fee,
      tokenA,
      tokenB,
      originScreen,
    });
  };

  useEffect(() => {
    client.fee
      .estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error);
  }, []);

  useEffect(() => {
    setValidity(
      new BigNumber(tokenToRemove).isGreaterThan(new BigNumber(0)) &&
        new BigNumber(tokenToRemove).isLessThanOrEqualTo(
          new BigNumber(pairInfo.amount)
        ) &&
        !hasPendingJob &&
        !hasPendingBroadcastJob
    );
  }, [tokenToRemove]);

  function onPercentagePress(amount: string, type: AmountButtonTypes): void {
    buildSummary(amount);
    showToast(type);
  }

  function showToast(type: AmountButtonTypes): void {
    toast.hideAll();
    const isMax = type === AmountButtonTypes.Max;
    const toastMessage = isMax
      ? "Max available LP tokens entered"
      : "{{percent}} of available LP tokens entered";
    const toastOption = {
      unit: "LP tokens",
      percent: type,
    };
    toast.show(
      translate("screens/RemoveLiquidity", toastMessage, toastOption),
      {
        type: "wallet_toast",
        placement: "top",
        duration: TOAST_DURATION,
      }
    );
  }

  const ref = useRef(null);
  const { isLight } = useThemeContext();
  const modalSortingSnapPoints = {
    ios: ["50%"],
    android: ["50%"],
  };

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
          style={tailwind("mr-5 mt-4 -mb-4")}
          onPress={dismissModal}
          testID="close_bottom_sheet_button"
        >
          <ThemedIcon iconType="Feather" name="x-circle" size={22} />
        </ThemedTouchableOpacityV2>
      );
    },
    headerLeft: () => <></>,
  };

  const viewPoolContents = useMemo(() => {
    return [
      {
        stackScreenName: "ViewPoolShare",
        component: ViewPoolDetails({
          dataRoutes: DataRoutes.RemoveLiquidity,
          pairData: pair,
          pairInfo: pairInfo,
        }),
        option: bottomSheetHeader,
      },
    ];
  }, [isLight]);

  // Amount Input function
  const buildSummary = useCallback(
    (amountString: string): void => {
      // this must round down, avoid attempt remove more than selected (or even available)
      const toRemove = new BigNumber(amountString);
      const ratioToTotal = toRemove.div(pair.totalLiquidity.token);
      // assume defid will trim the dust values too
      const tokenA = ratioToTotal
        .times(pair.tokenA.reserve)
        .decimalPlaces(8, BigNumber.ROUND_DOWN);
      const tokenB = ratioToTotal
        .times(pair.tokenB.reserve)
        .decimalPlaces(8, BigNumber.ROUND_DOWN);
      setAmount(toRemove);
      setTokenAAmount(tokenA);
      setTokenBAmount(tokenB);
      setTokenToRemove(amountString);
    },
    [pair]
  );

  useEffect(() => {
    if (
      new BigNumber(tokenToRemove).isGreaterThan(new BigNumber(pairInfo.amount))
    ) {
      setHasError(true);
    } else {
      setHasError(false);
    }
  }, [tokenToRemove, pairInfo.amount]);

  useEffect(() => {
    setHasInputAmount(new BigNumber(tokenToRemove).isGreaterThan(0));
  }, [tokenToRemove]);

  const sharesUsdAmount = getTokenPrice(
    pair.symbol,
    new BigNumber(amount),
    true
  );

  return (
    <View ref={containerRef} style={tailwind("flex-col flex-1")}>
      <ThemedScrollViewV2
        ref={ref}
        contentContainerStyle={tailwind("flex-grow py-8 mx-5 justify-between")}
        style={tailwind("w-full")}
      >
        <View>
          <ViewPoolHeader
            tokenASymbol={pair.tokenA.displaySymbol}
            tokenBSymbol={pair.tokenB.displaySymbol}
            headerLabel={translate(
              "screens/RemoveLiquidity",
              "View pool share"
            )}
            onPress={expandModal}
            testID="view_pool_button"
          />
          <View style={tailwind("mt-8")}>
            <RemoveLiquidityInputCard
              tokenA={pair.tokenA.displaySymbol}
              tokenB={pair.tokenB.displaySymbol}
              balance={new BigNumber(pairInfo.amount)}
              current={tokenToRemove}
              onChange={(amount) => {
                buildSummary(amount);
              }}
              onPercentageChange={(amount, type) =>
                onPercentagePress(amount, type)
              }
              symbol={pair.tokenA.displaySymbol}
              setIsInputFocus={setIsInputFocus}
              status={transactionCardStatus}
              showErrMsg={hasError}
            />
          </View>
          {hasInputAmount && (
            <View testID="remove_liquidity_calculation_summary">
              <LiquidityCalculationSummary
                containerStyle={tailwind("pt-5 px-5 border rounded-lg-v2")}
                priceRatesOption={[
                  {
                    label: translate(
                      "screens/RemoveLiquidity",
                      "{{token}} to receive",
                      {
                        token: pair.tokenA.displaySymbol,
                      }
                    ),
                    value: BigNumber.max(tokenAAmount, 0).toFixed(8),
                    symbolUSDValue: getTokenPrice(
                      pair.tokenA.symbol,
                      tokenAAmount
                    ),
                    usdTextStyle: tailwind("text-sm"),
                  },
                  {
                    label: translate(
                      "screens/RemoveLiquidity",
                      "{{token}} to receive",
                      {
                        token: pair.tokenB.displaySymbol,
                      }
                    ),
                    value: BigNumber.max(tokenBAmount, 0).toFixed(8),
                    symbolUSDValue: getTokenPrice(
                      pair.tokenB.symbol,
                      tokenBAmount
                    ),
                    usdTextStyle: tailwind("text-sm"),
                  },
                ]}
                resultingLplhs={{
                  value: translate(
                    "screens/RemoveLiquidity",
                    "LP tokens to remove"
                  ),
                  themedProps: {
                    light: tailwind("text-mono-light-v2-500"),
                    dark: tailwind("text-mono-dark-v2-500"),
                  },
                  testID: "lp_tokens_to_remove_title",
                }}
                resultingLprhs={{
                  value: new BigNumber(amount).toFixed(8),
                  themedProps: {
                    style: tailwind("font-semibold-v2 text-sm"),
                  },
                  usdAmount: sharesUsdAmount.isNaN()
                    ? new BigNumber(0)
                    : sharesUsdAmount,
                  usdTextStyle: tailwind("text-sm"),
                  testID: "Lp_tokens_to_remove_amount",
                }}
              />
              <View style={tailwind("items-center")}>
                <ThemedTextV2
                  testID="transaction_details_hint_text"
                  light={tailwind("text-mono-light-v2-500")}
                  dark={tailwind("text-mono-dark-v2-500")}
                  style={tailwind("text-xs font-normal-v2 pt-14")}
                >
                  {translate(
                    "screens/ConvertScreen",
                    "Review full details in the next screen"
                  )}
                </ThemedTextV2>
              </View>
            </View>
          )}
        </View>

        <View style={tailwind("mt-5 mx-7")}>
          <ButtonV2
            fillType="fill"
            label={translate("components/Button", "Continue")}
            styleProps="w-full"
            disabled={!valid}
            onPress={removeLiquidity}
            testID="button_continue_remove_liq"
          />
        </View>

        {Platform.OS === "web" ? (
          <BottomSheetWebWithNavV2
            modalRef={containerRef}
            screenList={viewPoolContents}
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
            screenList={viewPoolContents}
            snapPoints={modalSortingSnapPoints}
          />
        )}
      </ThemedScrollViewV2>
    </View>
  );
}

function RemoveLiquidityInputCard(props: {
  tokenA: string;
  tokenB: string;
  balance: BigNumber;
  // eslint-disable-next-line react/no-unused-prop-types
  symbol: string;
  onPercentageChange: (amount: string, type: AmountButtonTypes) => void;
  onChange: (amount: string) => void;
  current: string;
  status?: TransactionCardStatus;
  setIsInputFocus: (flag: boolean) => void;
  showErrMsg: boolean;
}): JSX.Element {
  const IconA = getNativeIcon(props.tokenA);
  const IconB = getNativeIcon(props.tokenB);
  return (
    <>
      <ThemedTextV2
        light={tailwind("text-mono-light-v2-500")}
        dark={tailwind("text-mono-dark-v2-500")}
        style={tailwind("px-4 text-xs pb-2 font-normal-v2")}
      >
        {translate("screens/RemoveLiquidity", "I WANT TO REMOVE")}
      </ThemedTextV2>
      <TransactionCard
        maxValue={props.balance}
        onChange={props.onPercentageChange}
        status={props.status}
        amountButtonsStyle={{
          style: tailwind("border-t-0.5"),
        }}
        containerStyle={{
          style: tailwind("pl-5 pr-5 mr-px rounded-t-lg-v2"),
        }}
      >
        <ThemedViewV2
          light={tailwind("border-mono-light-v2-300")}
          dark={tailwind("border-mono-dark-v2-300")}
          style={tailwind("flex flex-row items-center py-2.5")}
        >
          <View style={tailwind("z-50")}>
            <IconA height={20} width={20} style={tailwind("relative z-50")} />
            <IconB
              height={20}
              width={20}
              style={tailwind("absolute ml-3 z-40")}
            />
          </View>
          <WalletTransactionCardTextInput
            onFocus={() => props.setIsInputFocus(true)}
            onBlur={() => props.setIsInputFocus(false)}
            onChangeText={(txt) => props.onChange(txt)}
            placeholder="0.00"
            value={props.current}
            inputType="numeric"
            displayClearButton={props.current !== ""}
            onClearButtonPress={() => props.onChange("")}
            testID="tokens_remove_amount_input"
          />
        </ThemedViewV2>
      </TransactionCard>

      <View style={tailwind("pt-0.5 pb-6")}>
        {props.showErrMsg ? (
          <ThemedTextV2
            light={tailwind("text-red-v2")}
            dark={tailwind("text-red-v2")}
            style={tailwind("px-4 text-xs pt-1 font-normal-v2")}
          >
            {translate("screens/RemoveLiquidity", "Insufficient balance")}
          </ThemedTextV2>
        ) : (
          <InputHelperTextV2
            testID={`token_balance_${props.tokenA}-${props.tokenB}`}
            label={`${translate("screens/RemoveLiquidity", "Available")}: `}
            content={BigNumber.max(props.balance, 0).toFixed(8)}
            suffix={` ${props.tokenA}-${props.tokenB}`}
          />
        )}
      </View>
    </>
  );
}
