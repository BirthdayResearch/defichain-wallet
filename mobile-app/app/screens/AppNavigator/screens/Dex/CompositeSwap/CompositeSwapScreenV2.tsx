import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import BigNumber from "bignumber.js";
import {
  NavigationProp,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { getColor, tailwind } from "@tailwind";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { translate } from "@translations";
import { RootState } from "@store";
import { hasTxQueued as hasBroadcastQueued } from "@store/ocean";
import { hasTxQueued } from "@store/transaction_queue";
import {
  DFITokenSelector,
  DFIUtxoSelector,
  tokensSelector,
} from "@store/wallet";
import {
  queueConvertTransaction,
  useConversion,
} from "@hooks/wallet/Conversion";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import {
  useWhaleApiClient,
  useWhaleRpcClient,
} from "@shared-contexts/WhaleContext";
import { PoolPairData } from "@defichain/whale-api-client/dist/api/poolpairs";
import { StackScreenProps } from "@react-navigation/stack";
import {
  ThemedIcon,
  ThemedScrollView,
  ThemedText,
  ThemedTextInputV2,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedView,
  ThemedViewV2,
} from "@components/themed";
import {
  BottomSheetNavScreen,
  BottomSheetWebWithNav,
  BottomSheetWithNav,
} from "@components/BottomSheetWithNav";
import {
  BottomSheetToken,
  BottomSheetTokenList,
  TokenType,
} from "@components/BottomSheetTokenList";
import { InfoRow, InfoType } from "@components/InfoRow";
import { NumberRow } from "@components/NumberRow";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useTokenPrice } from "@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice";
import { useDeFiScanContext } from "@shared-contexts/DeFiScanContext";
import { openURL } from "@api/linking";
import { TextRow } from "@components/TextRow";
import { fetchExecutionBlock } from "@store/futureSwap";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { WalletAlert } from "@components/WalletAlert";
import { useFeatureFlagContext } from "@contexts/FeatureFlagContext";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { PriceRateProps } from "@components/PricesSectionV2";
import { SubmitButtonGroupV2 } from "@components/SubmitButtonGroupV2";
import { AnnouncementBannerV2 } from "../../Portfolio/components/Announcements";
import {
  DexStabilizationType,
  useDexStabilization,
} from "../hook/DexStabilization";
import { useFutureSwap, useFutureSwapDate } from "../hook/FutureSwap";
import { useSwappableTokens } from "../hook/SwappableTokens";
import { useSlippageTolerance } from "../hook/SlippageTolerance";
import { useTokenBestPath } from "../../Portfolio/hooks/TokenBestPath";
import { DexParamList } from "../DexNavigator";
import {
  SlippageError,
  SlippageTolerance,
} from "./components/SlippageTolerance";
import {
  ButtonGroupTabKey,
  SwapButtonGroup,
} from "./components/SwapButtonGroup";
import { TokenDropdownButton } from "./components/TokenDropdownButton";
import { ActiveUSDValueV2 } from "../../Loans/VaultDetail/components/ActiveUSDValueV2";
import {
  WantFutureSwapRow,
  WantInstantSwapRow,
} from "./components/WantSwapRow";
import { SwapSummary } from "./components/SwapSummary";

export interface TokenState {
  id: string;
  reserve: string;
  displaySymbol: string;
  symbol: string;
}

export interface OwnedTokenState extends TokenState {
  amount: string;
}

type Props = StackScreenProps<DexParamList, "CompositeSwapScreen">;

export function CompositeSwapScreenV2({ route }: Props): JSX.Element {
  const logger = useLogger();
  const client = useWhaleApiClient();
  const whaleRpcClient = useWhaleRpcClient();
  const isFocused = useIsFocused();
  const { isLight } = useThemeContext();
  const navigation = useNavigation<NavigationProp<DexParamList>>();
  const dispatch = useAppDispatch();
  const { address } = useWalletContext();
  const { getArbitraryPoolPair, calculatePriceRates } = useTokenBestPath();
  const { getTokenPrice } = useTokenPrice();
  const { slippage, setSlippage } = useSlippageTolerance();

  const blockCount = useSelector((state: RootState) => state.block.count ?? 0);
  const pairs = useSelector((state: RootState) => state.wallet.poolpairs);
  const tokens = useSelector((state: RootState) =>
    tokensSelector(state.wallet)
  );
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue)
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasBroadcastQueued(state.ocean)
  );
  const DFIToken = useSelector((state: RootState) =>
    DFITokenSelector(state.wallet)
  );
  const DFIUtxo = useSelector((state: RootState) =>
    DFIUtxoSelector(state.wallet)
  );

  const reservedDfi = 0.1;
  const [bottomSheetScreen, setBottomSheetScreen] = useState<
    BottomSheetNavScreen[]
  >([]);
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001));
  const [slippageError, setSlippageError] = useState<
    SlippageError | undefined
  >();
  const [selectedTokenA, setSelectedTokenA] = useState<OwnedTokenState>();
  const [selectedTokenB, setSelectedTokenB] = useState<TokenState>();
  const [selectedPoolPairs, setSelectedPoolPairs] = useState<PoolPairData[]>();
  const [priceRates, setPriceRates] = useState<PriceRateProps[]>();
  const [isModalDisplayed, setIsModalDisplayed] = useState(false);
  const [isFromTokenSelectDisabled, setIsFromTokenSelectDisabled] =
    useState(false);
  const [isToTokenSelectDisabled, setIsToTokenSelectDisabled] = useState(false);
  const buttonGroup = [
    {
      id: ButtonGroupTabKey.InstantSwap,
      label: translate("screens/CompositeSwapScreen", "Instant Swap"),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.InstantSwap),
    },
    {
      id: ButtonGroupTabKey.FutureSwap,
      label: translate("screens/CompositeSwapScreen", "Future Swap"),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.FutureSwap),
    },
  ];
  const [activeButtonGroup, setActiveButtonGroup] = useState<ButtonGroupTabKey>(
    ButtonGroupTabKey.InstantSwap
  );
  const [isFutureSwap, setIsFutureSwap] = useState(false);

  const executionBlock = useSelector(
    (state: RootState) => state.futureSwaps.executionBlock
  );
  const { timeRemaining, transactionDate, isEnded } = useFutureSwapDate(
    executionBlock,
    blockCount
  );
  const { fromTokens, toTokens } = useSwappableTokens(selectedTokenA?.id);
  const { isFutureSwapOptionEnabled, oraclePriceText, isSourceLoanToken } =
    useFutureSwap({
      fromTokenDisplaySymbol: selectedTokenA?.displaySymbol,
      toTokenDisplaySymbol: selectedTokenB?.displaySymbol,
    });
  const containerRef = useRef(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // dex stabilization
  const { isFeatureAvailable } = useFeatureFlagContext();
  const isDexStabilizationEnabled = isFeatureAvailable("dusd_dex_high_fee");
  const {
    dexStabilizationAnnouncement,
    dexStabilization: {
      dexStabilizationType,
      pair: dexStabilizationPair,
      dexStabilizationFee,
    },
  } = useDexStabilization(selectedTokenA, selectedTokenB);

  const expandModal = useCallback(() => {
    if (Platform.OS === "web") {
      setIsModalDisplayed(true);
    } else {
      bottomSheetRef.current?.present();
    }
  }, []);

  const dismissModal = useCallback(() => {
    if (Platform.OS === "web") {
      setIsModalDisplayed(false);
    } else {
      bottomSheetRef.current?.close();
    }
  }, []);

  const onButtonGroupChange = (buttonGroupTabKey: ButtonGroupTabKey): void => {
    setSelectedTokenA(undefined);
    setSelectedTokenB(undefined);
    setValue("tokenA", "");
    setValue("tokenB", "");
    setActiveButtonGroup(buttonGroupTabKey);
  };

  // component UI state
  const { control, formState, setValue, trigger, watch } = useForm<{
    tokenA: string;
    tokenB: string;
  }>({ mode: "onChange" });
  const { tokenA, tokenB } = watch();

  const { isConversionRequired, conversionAmount } = useConversion({
    inputToken: {
      type: selectedTokenA?.id === "0_unified" ? "token" : "others",
      amount: new BigNumber(tokenA),
    },
    deps: [tokenA, JSON.stringify(tokens)],
  });

  const getMaxAmount = (token: OwnedTokenState): string => {
    if (token.id !== "0_unified") {
      return new BigNumber(token.amount).toFixed(8);
    }

    const maxAmount = BigNumber.max(
      new BigNumber(token.amount).minus(reservedDfi),
      0
    );
    return maxAmount.isLessThanOrEqualTo(0)
      ? new BigNumber(0).toFixed(8)
      : maxAmount.toFixed(8);
  };

  const onTokenSelect = (
    { tokenId, reserve, token: { displaySymbol, symbol } }: BottomSheetToken,
    direction: "FROM" | "TO"
  ): void => {
    if (
      (selectedTokenA?.displaySymbol === displaySymbol &&
        direction === "FROM") ||
      (selectedTokenB?.displaySymbol === displaySymbol && direction === "TO")
    ) {
      return;
    }

    const ownedToken = tokens?.find((token) => token.id === tokenId);
    const derivedToken = {
      id: ownedToken !== undefined ? ownedToken.id : tokenId, // retrieve unified token if selected
      symbol,
      displaySymbol,
      reserve:
        reserve !== undefined
          ? new BigNumber(reserve).toFixed(8)
          : new BigNumber(0).toFixed(8),
    };

    if (direction === "FROM") {
      setSelectedTokenA({
        ...derivedToken,
        amount: ownedToken === undefined ? "0" : ownedToken.amount,
      });
      setSelectedTokenB(undefined);
      setValue("tokenA", "");
      setValue("tokenB", "");
    } else {
      setSelectedTokenB(derivedToken);
    }
  };

  const onBottomSheetSelect = ({
    direction,
  }: {
    direction: "FROM" | "TO";
  }): void => {
    setBottomSheetScreen([
      {
        stackScreenName: "TokenList",
        component: BottomSheetTokenList({
          tokens: direction === "FROM" ? fromTokens ?? [] : toTokens ?? [],
          tokenType: TokenType.BottomSheetToken,
          headerLabel: translate(
            "screens/CompositeSwapScreen",
            direction === "FROM"
              ? "Choose token for swap"
              : "Choose token to swap"
          ),
          onCloseButtonPress: () => dismissModal(),
          onTokenPress: (item): void => {
            onTokenSelect(item, direction);
            dismissModal();
          },
        }),
        option: {
          header: () => null,
        },
      },
    ]);
    expandModal();
  };

  useEffect(() => {
    if (isFocused) {
      dispatch(fetchExecutionBlock({ client: whaleRpcClient }));
    }
  }, [address, blockCount, isFocused]);

  useEffect(() => {
    client.fee
      .estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error);
  }, []);

  useEffect(() => {
    if (
      route.params.pair?.id === undefined &&
      route.params.fromToken === undefined
    ) {
      return;
    }

    const tokenSelectOption: DexParamList["CompositeSwapScreen"]["tokenSelectOption"] =
      route.params.tokenSelectOption ?? {
        from: {
          isDisabled: true,
          isPreselected: true,
        },
        to: {
          isDisabled: true,
          isPreselected: true,
        },
      };

    setIsFromTokenSelectDisabled(tokenSelectOption.from.isDisabled);
    setIsToTokenSelectDisabled(tokenSelectOption.to.isDisabled);

    if (route.params.fromToken !== undefined) {
      onTokenSelect(
        {
          tokenId: route.params.fromToken.id,
          available: new BigNumber(route.params.fromToken.amount),
          token: {
            displaySymbol: route.params.fromToken.displaySymbol,
            symbol: route.params.fromToken.symbol,
            name: route.params.fromToken.name,
          },
        },
        "FROM"
      );

      return;
    }

    const pair = pairs.find((pair) => pair.data.id === route.params.pair?.id);
    if (pair === undefined) {
      return;
    }
    if (tokenSelectOption.from.isPreselected) {
      onTokenSelect(
        {
          tokenId: pair.data.tokenA.id,
          available: new BigNumber(pair.data.tokenA.reserve),
          token: {
            displaySymbol: pair.data.tokenA.displaySymbol,
            symbol: pair.data.tokenA.symbol,
            name: "", // not available in API
          },
          reserve: pair.data.tokenA.reserve,
        },
        "FROM"
      );
    }
    if (tokenSelectOption.to.isPreselected) {
      onTokenSelect(
        {
          tokenId: pair.data.tokenB.id,
          available: new BigNumber(pair.data.tokenB.reserve),
          token: {
            displaySymbol: pair.data.tokenB.displaySymbol,
            symbol: pair.data.tokenB.symbol,
            name: "", // not available in API
          },
          reserve: pair.data.tokenB.reserve,
        },
        "TO"
      );
    }
  }, [
    route.params.pair,
    route.params.tokenSelectOption,
    route.params.fromToken,
  ]);

  useEffect(() => {
    void getSelectedPoolPairs();
  }, [selectedTokenA, selectedTokenB]);

  const getSelectedPoolPairs = async (): Promise<void> => {
    if (selectedTokenA !== undefined && selectedTokenB !== undefined) {
      const poolPairs = await getArbitraryPoolPair(
        selectedTokenA.id,
        selectedTokenB.id
      );
      setSelectedPoolPairs(poolPairs);
    }
  };

  useEffect(() => {
    void getPriceRates();
  }, [selectedPoolPairs, tokenA]);

  const getPriceRates = async (): Promise<void> => {
    if (
      selectedTokenA !== undefined &&
      selectedTokenB !== undefined &&
      selectedPoolPairs !== undefined &&
      tokenA !== undefined
    ) {
      const { aToBPrice, bToAPrice, estimated } = await calculatePriceRates(
        selectedTokenA.id,
        selectedTokenB.id,
        new BigNumber(tokenA)
      );
      // Find the selected reserve in case it's null. From Token Detail Screen, reserve does not exist due to pair not existing
      const selectedReserve =
        selectedPoolPairs[0]?.tokenA?.id === selectedTokenA.id
          ? selectedPoolPairs[0]?.tokenA?.reserve
          : selectedPoolPairs[0]?.tokenB?.reserve;
      // This will keep the old behavior to prevent regression
      const tokenAReserve = new BigNumber(selectedTokenA.reserve).gt(0)
        ? selectedTokenA.reserve
        : selectedReserve;
      const slippage = new BigNumber(1).minus(
        new BigNumber(tokenA).div(tokenAReserve)
      );

      const estimatedAmountAfterSlippage = estimated.times(slippage).toFixed(8);
      setPriceRates([
        {
          label: translate("components/PricesSection", "1 {{token}} =", {
            token: selectedTokenA.displaySymbol,
          }),
          value: bToAPrice.toFixed(8),
          symbolUSDValue: getAmountInUSDValue(selectedTokenA, new BigNumber(1)),
          usdTextStyle: tailwind("text-sm"),
          aSymbol: selectedTokenA.displaySymbol,
          bSymbol: selectedTokenB.displaySymbol,
        },
        {
          label: translate("components/PricesSection", "1 {{token}} =", {
            token: selectedTokenB.displaySymbol,
          }),
          value: aToBPrice.toFixed(8),
          symbolUSDValue: getAmountInUSDValue(selectedTokenB, new BigNumber(1)),
          usdTextStyle: tailwind("text-sm"),
          aSymbol: selectedTokenB.displaySymbol,
          bSymbol: selectedTokenA.displaySymbol,
        },
      ]);
      setValue("tokenB", estimatedAmountAfterSlippage);
      // trigger validation for tokenB
      await trigger("tokenB");
    }
  };

  useEffect(() => {
    setIsFutureSwap(
      activeButtonGroup === ButtonGroupTabKey.FutureSwap &&
        isFutureSwapOptionEnabled
    );
  }, [activeButtonGroup, isFutureSwapOptionEnabled]);

  const navigateToConfirmScreen = (): void => {
    if (
      selectedPoolPairs === undefined ||
      selectedTokenA === undefined ||
      selectedTokenB === undefined ||
      priceRates === undefined ||
      tokenA === undefined ||
      tokenB === undefined
    ) {
      return;
    }

    const ownedTokenB = tokens.find((token) => token.id === selectedTokenB.id);
    const slippageInDecimal = new BigNumber(slippage).div(100);
    navigation.navigate("ConfirmCompositeSwapScreenV2", {
      fee,
      pairs: selectedPoolPairs,
      priceRates,
      slippage: slippageInDecimal,
      futureSwap: isFutureSwap
        ? {
            executionBlock,
            transactionDate,
            isSourceLoanToken: isSourceLoanToken,
            oraclePriceText,
          }
        : undefined,
      swap: {
        tokenTo: selectedTokenB,
        tokenFrom: selectedTokenA,
        amountFrom: new BigNumber(tokenA),
        amountTo: new BigNumber(tokenB),
      },
      tokenA: selectedTokenA,
      tokenB:
        ownedTokenB !== undefined
          ? {
              ...selectedTokenB,
              amount: ownedTokenB.amount,
            }
          : selectedTokenB,
      ...(isConversionRequired && {
        conversion: {
          isConversionRequired,
          DFIToken,
          DFIUtxo,
          conversionAmount,
        },
      }),
      estimatedAmount: new BigNumber(tokenB),
    });
  };

  const onWarningBeforeSubmit = async (): Promise<void> => {
    if (selectedTokenB === undefined) {
      return;
    }

    const message =
      dexStabilizationType === "composite-dusd-with-fee"
        ? "Are you certain you want to proceed with this swap despite the DEX Stabilization fees of {{fee}} that will be incurred as part of the composite path (DUSD -> {{tokenB}})?"
        : "Are you certain you want to proceed to swap DUSD for {{tokenB}} despite the DEX Stabilization fees of {{fee}}?";

    WalletAlert({
      title: translate("screens/CompositeSwapScreen", ""),
      message: translate("screens/CompositeSwapScreen", message, {
        fee: `${dexStabilizationFee ?? 0}%`,
        tokenB:
          dexStabilizationType === "composite-dusd-with-fee"
            ? dexStabilizationPair?.tokenBDisplaySymbol
            : selectedTokenB.displaySymbol,
      }),
      buttons: [
        {
          text: translate("screens/Settings", "Cancel"),
          style: "cancel",
        },
        {
          text: translate("screens/Settings", "Confirm"),
          onPress: async () => {
            await onSubmit();
          },
          style: "default",
        },
      ],
    });
  };

  const onSubmit = async (): Promise<void> => {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return;
    }
    if (isConversionRequired) {
      queueConvertTransaction(
        {
          mode: "utxosToAccount",
          amount: conversionAmount,
        },
        dispatch,
        () => {
          navigateToConfirmScreen();
        },
        logger
      );
    } else {
      navigateToConfirmScreen();
    }
  };

  const onTokenSwitch = async (): Promise<void> => {
    if (selectedTokenA !== undefined && selectedTokenB !== undefined) {
      const tokenBId =
        selectedTokenB.id === "0" ? "0_unified" : selectedTokenB.id;
      const ownedTokenB = tokens.find((token) => token.id === tokenBId);
      setSelectedTokenA({
        ...selectedTokenB,
        id: tokenBId,
        amount: ownedTokenB !== undefined ? ownedTokenB.amount : "0",
      });
      setSelectedTokenB(selectedTokenA);
      setValue("tokenA", "");
      await trigger("tokenA");
      setValue("tokenB", "");
      await trigger("tokenB");
    }
  };

  const getAmountInUSDValue = useCallback(
    (token: OwnedTokenState | TokenState | undefined, tokenAmount: any) => {
      if (token === undefined || tokenAmount === "" || isNaN(tokenAmount)) {
        return new BigNumber(0);
      }

      return getTokenPrice(token.symbol, new BigNumber(tokenAmount));
    },
    []
  );

  return (
    <View style={tailwind("h-full")} ref={containerRef}>
      <SwapButtonGroup
        activeButtonGroup={activeButtonGroup}
        onPress={(type) => onButtonGroupChange(type)}
      />
      <ThemedScrollView>
        {activeButtonGroup === ButtonGroupTabKey.InstantSwap &&
          isDexStabilizationEnabled &&
          dexStabilizationType !== "none" &&
          dexStabilizationAnnouncement !== undefined && (
            <View style={tailwind("flex mx-5 mt-8 rounded")}>
              <AnnouncementBannerV2
                announcement={dexStabilizationAnnouncement}
                testID="swap_announcements_banner"
                containerStyle={{
                  light: tailwind("bg-transparent"),
                  dark: tailwind("bg-transparent"),
                }}
              />
            </View>
          )}

        <ThemedTextV2
          style={tailwind("mx-10 text-xs font-normal-v2 mt-8")}
          light={tailwind("text-mono-light-v2-500")}
          dark={tailwind("text-mono-dark-v2-500")}
        >
          {translate(
            "screens/CompositeSwapScreen",
            "I HAVE {{totalAmount}} {{token}}",
            {
              totalAmount:
                selectedTokenA != null ? getMaxAmount(selectedTokenA) : "",
              token: selectedTokenA != null ? selectedTokenA.displaySymbol : "",
            }
          )}
        </ThemedTextV2>

        <View style={tailwind("mb-6 mx-5")}>
          <View
            style={tailwind(
              "flex flex-row justify-between items-center pl-5 mt-4"
            )}
          >
            <View style={tailwind("w-6/12 mr-2")}>
              <Controller
                control={control}
                defaultValue=""
                name="tokenA"
                render={({ field: { onChange, value } }) => (
                  <ThemedTextInputV2
                    style={tailwind("text-xl font-semibold-v2 w-full")}
                    light={tailwind("text-mono-light-v2-900")}
                    dark={tailwind("text-mono-dark-v2-900")}
                    keyboardType="numeric"
                    value={value}
                    onChange={onChange}
                    onChangeText={async (amount) => {
                      amount = isNaN(+amount) ? "0" : amount;
                      setValue("tokenA", amount);
                      await trigger("tokenA");
                    }}
                    placeholder="0.00"
                    placeholderTextColor={getColor(
                      isLight ? "mono-light-v2-900" : "mono-dark-v2-900"
                    )}
                  />
                )}
                rules={{
                  required: true,
                  pattern: /^\d*\.?\d*$/,
                  max: BigNumber.max(selectedTokenA?.amount ?? 0, 0).toFixed(8),
                  validate: {
                    greaterThanZero: (value: string) =>
                      new BigNumber(
                        value !== undefined && value !== "" ? value : 0
                      ).isGreaterThan(0),
                  },
                }}
              />
              <ActiveUSDValueV2
                price={getAmountInUSDValue(selectedTokenA ?? undefined, tokenA)}
                testId="amount_input_in_usd"
                containerStyle={tailwind("w-full break-words")}
              />
            </View>

            <TokenDropdownButton
              symbol={selectedTokenA?.displaySymbol}
              onPress={() => onBottomSheetSelect({ direction: "FROM" })}
              disabled={
                isFromTokenSelectDisabled ||
                fromTokens === undefined ||
                fromTokens?.length === 0
              }
            />
          </View>
          <View style={tailwind("ml-5")}>
            {tokenA !== "" && selectedTokenA === undefined && (
              <ThemedTextV2
                light={tailwind("text-red-v2")}
                dark={tailwind("text-red-v2")}
                style={tailwind("text-xs pt-2 font-normal-v2")}
              >
                {translate("screens/RemoveLiquidity", "Select a token first")}
              </ThemedTextV2>
            )}
            {formState.errors.tokenA?.type === "max" &&
              selectedTokenA !== undefined &&
              tokenA !== "" && (
                <ThemedTextV2
                  light={tailwind("text-red-v2")}
                  dark={tailwind("text-red-v2")}
                  style={tailwind("text-xs pt-2 font-normal-v2")}
                >
                  {translate("screens/RemoveLiquidity", "Insufficient balance")}
                </ThemedTextV2>
              )}
          </View>

          <View style={tailwind("my-8 relative items-center")}>
            <ThemedTouchableOpacityV2
              onPress={onTokenSwitch}
              style={tailwind("p-2.5 rounded-full z-50", {
                "opacity-30":
                  selectedTokenA === undefined || selectedTokenB === undefined,
              })}
              dark={tailwind("bg-mono-dark-v2-900")}
              light={tailwind("bg-mono-light-v2-900")}
              testID="switch_button"
              disabled={
                selectedTokenA === undefined || selectedTokenB === undefined
              }
            >
              <ThemedIcon
                name="swap-vert"
                size={24}
                iconType="MaterialIcons"
                dark={tailwind("text-mono-dark-v2-00")}
                light={tailwind("text-mono-light-v2-00")}
              />
            </ThemedTouchableOpacityV2>
            <ThemedViewV2
              dark={tailwind("border-mono-dark-v2-300")}
              light={tailwind("border-mono-light-v2-300")}
              style={tailwind("border-t-0.5 w-full bottom-1/2")}
            />
          </View>

          <ThemedViewV2
            style={tailwind("border-0", {
              "pb-8": activeButtonGroup === ButtonGroupTabKey.InstantSwap,
            })}
            dark={tailwind("bg-transparent")}
            light={tailwind("bg-transparent")}
          >
            <ThemedTextV2
              style={tailwind("px-5 text-xs font-normal-v2")}
              light={tailwind("text-mono-light-v2-500")}
              dark={tailwind("text-mono-dark-v2-500")}
            >
              {translate("screens/CompositeSwapScreen", "I WANT {{token}}", {
                token: selectedTokenB?.displaySymbol ?? "",
              })}
            </ThemedTextV2>

            <View
              style={tailwind(
                "flex flex-row justify-between items-center pl-5 mt-4"
              )}
            >
              {activeButtonGroup === ButtonGroupTabKey.FutureSwap && (
                <WantFutureSwapRow oraclePriceText={oraclePriceText} />
              )}
              {activeButtonGroup === ButtonGroupTabKey.InstantSwap && (
                <WantInstantSwapRow
                  tokenAmount={new BigNumber(tokenB).toFixed(8)}
                  tokenUsdAmount={getAmountInUSDValue(
                    selectedTokenB ?? undefined,
                    tokenB
                  )}
                />
              )}
              <TokenDropdownButton
                symbol={selectedTokenB?.displaySymbol}
                onPress={() => onBottomSheetSelect({ direction: "TO" })}
                disabled={
                  isToTokenSelectDisabled ||
                  toTokens === undefined ||
                  toTokens?.length === 0
                }
              />
            </View>
          </ThemedViewV2>
        </View>

        {activeButtonGroup === ButtonGroupTabKey.InstantSwap &&
          selectedTokenB !== undefined &&
          selectedTokenA !== undefined && (
            <ThemedViewV2
              style={tailwind("border-t-0.5 mx-5")}
              dark={tailwind("border-mono-dark-v2-300")}
              light={tailwind("border-mono-light-v2-300")}
            >
              <SlippageTolerance
                setSlippage={setSlippage}
                slippageError={slippageError}
                setSlippageError={setSlippageError}
                slippage={slippage}
              />
            </ThemedViewV2>
          )}

        {selectedTokenB !== undefined &&
          selectedTokenA !== undefined &&
          priceRates !== undefined &&
          tokenA !== undefined &&
          tokenA !== "" &&
          tokenB !== undefined && (
            <>
              <ThemedViewV2
                light={tailwind("border-mono-light-v2-300")}
                dark={tailwind("border-mono-dark-v2-300")}
                style={tailwind("pt-5 px-5 mx-5 border rounded-lg-v2")}
              >
                <SwapSummary
                  instantSwapPriceRate={priceRates}
                  activeTab={activeButtonGroup}
                  executionBlock={executionBlock}
                  transactionDate={transactionDate}
                />
              </ThemedViewV2>
            </>
          )}

        <View style={tailwind("mb-2")}>
          <SubmitButtonGroupV2
            isDisabled={
              !formState.isValid ||
              hasPendingJob ||
              hasPendingBroadcastJob ||
              (slippageError?.type === "error" &&
                slippageError !== undefined) ||
              (isFutureSwap && isEnded)
            }
            label={translate("screens/CompositeSwapScreen", "CONTINUE")}
            onSubmit={
              (dexStabilizationType === "none" && isDexStabilizationEnabled) ||
              !isDexStabilizationEnabled
                ? onSubmit
                : onWarningBeforeSubmit
            }
            title="submit"
            displayCancelBtn={false}
          />
        </View>

        {formState.isValid &&
          selectedTokenA !== undefined &&
          selectedTokenB !== undefined && (
            <ThemedText
              testID="transaction_details_hint_text"
              light={tailwind("text-gray-600")}
              dark={tailwind("text-gray-300")}
              style={tailwind("pb-8 px-4 text-sm text-center")}
            >
              {isConversionRequired
                ? translate(
                    "screens/CompositeSwapScreen",
                    "Authorize transaction in the next screen to convert"
                  )
                : translate(
                    "screens/CompositeSwapScreen",
                    "Review and confirm transaction in the next screen"
                  )}
            </ThemedText>
          )}

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
              android: ["45%"],
            }}
          />
        )}
      </ThemedScrollView>
    </View>
  );
}

function TransactionDetailsSection({
  isFutureSwap,
  conversionAmount,
  estimatedAmount,
  fee,
  isConversionRequired,
  tokenA,
  tokenB,
  executionBlock,
  timeRemaining,
  transactionDate,
  oraclePriceText,
  isDexStabilizationEnabled,
  dexStabilizationType,
  dexStabilizationFee,
}: {
  isFutureSwap: boolean;
  conversionAmount: BigNumber;
  estimatedAmount: string;
  fee: BigNumber;
  isConversionRequired: boolean;
  tokenA: OwnedTokenState;
  tokenB: TokenState;
  executionBlock: number;
  timeRemaining: string;
  transactionDate: string;
  oraclePriceText: string;
  isDexStabilizationEnabled: boolean;
  dexStabilizationType: DexStabilizationType;
  dexStabilizationFee?: string;
}): JSX.Element {
  const { getBlocksCountdownUrl } = useDeFiScanContext();
  const { getTokenPrice } = useTokenPrice();
  const rowStyle = {
    lhsThemedProps: {
      light: tailwind("text-gray-500"),
      dark: tailwind("text-gray-400"),
    },
    rhsThemedProps: {
      light: tailwind("text-gray-900"),
      dark: tailwind("text-gray-50"),
    },
  };

  return (
    <View
      style={tailwind("mx-4 overflow-hidden", {
        "rounded-b-lg": !isFutureSwap,
        "rounded-lg": isFutureSwap,
      })}
    >
      {isConversionRequired && (
        <NumberRow
          lhs={translate("screens/CompositeSwapScreen", "UTXO to be converted")}
          rhs={{
            testID: "amount_to_convert",
            value: conversionAmount.toFixed(8),
            suffixType: "text",
            suffix: tokenA.displaySymbol,
          }}
          lhsThemedProps={rowStyle.lhsThemedProps}
          rhsThemedProps={rowStyle.rhsThemedProps}
        />
      )}

      {!isFutureSwap ? (
        <NumberRow
          lhs={translate("screens/CompositeSwapScreen", "Estimated to receive")}
          rhs={{
            value: estimatedAmount,
            suffixType: "text",
            suffix: tokenB.displaySymbol,
            testID: "estimated_to_receive",
          }}
          textStyle={tailwind("text-sm font-normal")}
          rhsUsdAmount={getTokenPrice(
            tokenB.symbol,
            new BigNumber(estimatedAmount),
            false
          )}
          lhsThemedProps={rowStyle.lhsThemedProps}
          rhsThemedProps={rowStyle.rhsThemedProps}
        />
      ) : (
        <>
          <TimeRemainingTextRow
            timeRemaining={timeRemaining}
            transactionDate={transactionDate}
          />
          <InfoRow
            type={InfoType.ExecutionBlock}
            value={executionBlock}
            testID="execution_block"
            suffix={
              <TouchableOpacity
                onPress={async () =>
                  await openURL(getBlocksCountdownUrl(executionBlock))
                }
              >
                <ThemedIcon
                  name="open-in-new"
                  size={16}
                  iconType="MaterialIcons"
                  style={tailwind("ml-1")}
                  light={tailwind("text-primary-500")}
                  dark={tailwind("text-darkprimary-500")}
                />
              </TouchableOpacity>
            }
            lhsThemedProps={rowStyle.lhsThemedProps}
            rhsThemedProps={rowStyle.rhsThemedProps}
          />
          <TextRow
            lhs={{
              value: translate(
                "screens/ConfirmCompositeSwapScreen",
                "Estimated to receive"
              ),
              themedProps: rowStyle.lhsThemedProps,
              testID: "estimated_to_receive",
            }}
            rhs={{
              value: translate(
                "screens/CompositeSwapScreen",
                `Oracle price ${oraclePriceText}`
              ),
              themedProps: rowStyle.rhsThemedProps,
              testID: "estimated_to_receive",
            }}
            textStyle={tailwind("text-sm font-normal")}
            containerStyle={{
              dark: tailwind("bg-gray-800 border-b border-gray-700"),
              light: tailwind("bg-white border-b border-gray-200"),
              style: tailwind("p-4 flex-row items-start w-full"),
            }}
          />
        </>
      )}
      <InfoRow
        type={InfoType.EstimatedFee}
        value={fee.toFixed(8)}
        testID="text_fee"
        suffix="DFI"
        lhsThemedProps={rowStyle.lhsThemedProps}
        rhsThemedProps={rowStyle.rhsThemedProps}
      />
      {isDexStabilizationEnabled &&
        dexStabilizationType !== "none" &&
        dexStabilizationFee !== undefined && (
          <NumberRow
            lhs={translate(
              "screens/CompositeSwapScreen",
              "DEX stabilization fee"
            )}
            rhs={{
              value: dexStabilizationFee,
              suffix: "%",
              testID: "dex_stab_fee",
              suffixType: "text",
            }}
            textStyle={tailwind("text-sm font-normal")}
            lhsThemedProps={rowStyle.lhsThemedProps}
            rhsThemedProps={rowStyle.rhsThemedProps}
          />
        )}
    </View>
  );
}

function TimeRemainingTextRow({
  timeRemaining,
  transactionDate,
}: {
  timeRemaining: string;
  transactionDate: string;
}): JSX.Element {
  return (
    <ThemedView
      dark={tailwind("bg-gray-800 border-b border-gray-700")}
      light={tailwind("bg-white border-b border-gray-200")}
      style={tailwind("p-4 flex-row items-start w-full")}
    >
      <View style={tailwind("w-6/12")}>
        <View style={tailwind("flex-row items-end justify-start")}>
          <ThemedText
            style={tailwind("text-sm")}
            light={tailwind("text-gray-500")}
            dark={tailwind("text-gray-400")}
            testID="time_remaining_label"
          >
            {translate("screens/CompositeSwapScreen", "Est. time remaining")}
          </ThemedText>
        </View>
      </View>
      <View style={tailwind("flex flex-col justify-end flex-1")}>
        <ThemedText
          style={tailwind("text-sm text-right")}
          light={tailwind("text-gray-900")}
          dark={tailwind("text-gray-50")}
          testID="time_remaining"
        >
          {`≈${timeRemaining}`}
        </ThemedText>
        <ThemedText
          style={tailwind("text-xs text-right")}
          light={tailwind("text-gray-500")}
          dark={tailwind("text-gray-400")}
        >
          {`(${transactionDate})`}
        </ThemedText>
      </View>
    </ThemedView>
  );
}
