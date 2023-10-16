import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, ScrollView, TextInput, View } from "react-native";
import { useSelector } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import BigNumber from "bignumber.js";
import {
  NavigationProp,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { getColor, tailwind } from "@tailwind";
import { translate } from "@translations";
import { RootState } from "@store";
import {
  hasTxQueued,
  hasOceanTXQueued,
  DFITokenSelector,
  DFIUtxoSelector,
  tokensSelector,
} from "@waveshq/walletkit-ui/dist/store";
import {
  queueConvertTransaction,
  useConversion,
} from "@hooks/wallet/Conversion";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import {
  useWhaleApiClient,
  useWhaleRpcClient,
} from "@waveshq/walletkit-ui/dist/contexts";
import { PoolPairData } from "@defichain/whale-api-client/dist/api/poolpairs";
import { StackScreenProps } from "@react-navigation/stack";
import {
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedTextInputV2,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import { BottomSheetToken } from "@components/BottomSheetTokenList";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useTokenPrice } from "@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice";

import { fetchExecutionBlock } from "@store/futureSwap";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { WalletAlert } from "@components/WalletAlert";
import { useFeatureFlagContext } from "@contexts/FeatureFlagContext";
import { useThemeContext } from "@waveshq/walletkit-ui";
import { useBottomSheet } from "@hooks/useBottomSheet";
import {
  BottomSheetNavScreen,
  BottomSheetWebWithNavV2,
  BottomSheetWithNavV2,
} from "@components/BottomSheetWithNavV2";
import { PriceRateProps } from "@components/PricesSection";
import { SubmitButtonGroup } from "@components/SubmitButtonGroup";
import { TokenListType } from "@screens/AppNavigator/screens/Dex/CompositeSwap/SwapTokenSelectionScreen";
import { useSwappableTokens } from "@screens/AppNavigator/screens/Dex/hook/SwappableTokens";
import {
  AmountButtonTypes,
  TransactionCard,
} from "@components/TransactionCard";
import { useToast } from "react-native-toast-notifications";
import { useDisplayUtxoWarning } from "@hooks/wallet/DisplayUtxoWarning";
import { DEXIcon as SwapTokenButton } from "@screens/WalletNavigator/assets/BottomNavIcon";
import {
  TokenDropdownButton,
  TokenDropdownButtonStatus,
} from "@components/TokenDropdownButton";
import { ConvertDirection } from "@screens/enum";
import {
  Announcement,
  AnnouncementBannerV2,
} from "../../Portfolio/components/Announcements";
import { useDexStabilization } from "../hook/DexStabilization";
import { useFutureSwap, useFutureSwapDate } from "../hook/FutureSwap";
import { useTokenBestPath } from "../../Portfolio/hooks/TokenBestPath";
import { DexParamList } from "../DexNavigator";
import {
  ButtonGroupTabKey,
  SwapButtonGroup,
} from "./components/SwapButtonGroup";
import { ActiveUSDValueV2 } from "../../Loans/VaultDetail/components/ActiveUSDValueV2";
import {
  SlippageError,
  SlippageTolerance,
} from "./components/SlippageTolerance";
import { FutureSwapRowTo, InstantSwapRowTo } from "./components/SwapRowTo";
import { SwapSummary } from "./components/SwapSummary";
import { getPrecisedCurrencyValue } from "../../Auctions/helpers/precision-token-value";
import { useSlippageTolerance } from "../hook/SlippageTolerance";
import { BottomSheetModalInfo } from "../../../../../components/BottomSheetModalInfo";

export interface TokenState {
  id: string;
  reserve: string;
  displaySymbol: string;
  symbol: string;
  name?: string;
}

export interface OwnedTokenState extends TokenState {
  amount: string;
}

type Props = StackScreenProps<DexParamList, "CompositeSwapScreen">;

export function CompositeSwapScreen({ route }: Props): JSX.Element {
  const logger = useLogger();
  const client = useWhaleApiClient();
  const whaleRpcClient = useWhaleRpcClient();
  const isFocused = useIsFocused();
  const { isLight } = useThemeContext();
  const navigation = useNavigation<NavigationProp<DexParamList>>();
  const dispatch = useAppDispatch();
  const { address } = useWalletContext();
  const { getArbitraryPoolPair, calculatePriceRates, getBestPath } =
    useTokenBestPath();
  const { getTokenPrice } = useTokenPrice();
  const { slippage, setSlippage } = useSlippageTolerance();
  const { getDisplayUtxoWarningStatus } = useDisplayUtxoWarning();

  const blockCount = useSelector((state: RootState) => state.block.count ?? 0);
  const pairs = useSelector((state: RootState) => state.wallet.poolpairs);
  const tokens = useSelector((state: RootState) =>
    tokensSelector(state.wallet),
  );
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue),
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasOceanTXQueued(state.ocean),
  );
  const DFIToken = useSelector((state: RootState) =>
    DFITokenSelector(state.wallet),
  );
  const DFIUtxo = useSelector((state: RootState) =>
    DFIUtxoSelector(state.wallet),
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
  const [estimatedLessFeesAfterSlippage, setEstimatedLessFeesAfterSlippage] =
    useState<BigNumber | undefined>(undefined);
  const [activeButtonGroup, setActiveButtonGroup] = useState<ButtonGroupTabKey>(
    ButtonGroupTabKey.InstantSwap,
  );
  const [isFutureSwap, setIsFutureSwap] = useState(false);
  const [bestPathEstimatedReturn, setBestPathEstimatedReturn] = useState<
    { estimatedReturn: string; estimatedReturnLessDexFees: string } | undefined
  >(undefined);
  const [oraclePriceMessage, setOraclePriceMessage] = useState<string>(
    translate(
      "screens/CompositeSwapScreen",
      "Future swap uses the oracle price of the selected token on the settlement block",
    ),
  );
  const [hasShownInputFocusBefore, setHasShownInputFocusBefore] =
    useState<boolean>(false);

  const executionBlock = useSelector(
    (state: RootState) => state.futureSwaps.executionBlock,
  );
  const { timeRemaining, transactionDate, isEnded } = useFutureSwapDate(
    executionBlock,
    blockCount,
  );
  const { fromTokens, toTokens } = useSwappableTokens(
    selectedTokenA?.id,
    selectedTokenA?.displaySymbol,
    selectedTokenA?.symbol,
    activeButtonGroup === ButtonGroupTabKey.FutureSwap,
  );
  const {
    isFutureSwapOptionEnabled,
    oraclePriceText,
    isSourceLoanToken,
    isFromLoanToken,
    isToLoanToken,
  } = useFutureSwap({
    fromTokenDisplaySymbol: selectedTokenA?.displaySymbol,
    toTokenDisplaySymbol: selectedTokenB?.displaySymbol,
  });
  const amountInputRef = useRef<TextInput>();
  const scrollViewRef = useRef<ScrollView>();

  const {
    bottomSheetRef,
    containerRef,
    dismissModal,
    expandModal,
    isModalDisplayed,
  } = useBottomSheet();

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

  const toast = useToast();
  const TOAST_DURATION = 2000;
  const oraclePriceAnnouncement: Announcement = {
    content: oraclePriceMessage,
    url: "",
    id: undefined,
    type: "OTHER_ANNOUNCEMENT",
    icon: "info",
  };

  const onButtonGroupChange = (buttonGroupTabKey: ButtonGroupTabKey): void => {
    setActiveButtonGroup(buttonGroupTabKey);
    scrollViewRef.current?.scrollTo({
      y: 0,
      animated: false,
    });
  };

  const [isEditingCustomSlippageInput, setIsEditingCustomSlippageInput] =
    useState(false); // for custom slippage input

  // component UI state
  const { control, formState, setValue, trigger, watch } = useForm<{
    tokenA: string;
    tokenB: string;
  }>({ mode: "onChange" });
  const { tokenA, tokenB } = watch();
  const isReservedUtxoUsed = getDisplayUtxoWarningStatus(
    new BigNumber(tokenA),
    selectedTokenA?.displaySymbol ?? "",
  );

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
      0,
    );
    return maxAmount.isLessThanOrEqualTo(0)
      ? new BigNumber(0).toFixed(8)
      : maxAmount.toFixed(8);
  };

  const onTokenSelect = (
    { tokenId, reserve, token: { displaySymbol, symbol } }: BottomSheetToken,
    direction: "FROM" | "TO",
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

  const BottomSheetHeader = {
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
          style={tailwind("mr-5", {
            "mt-4 -mb-4": Platform.OS === "ios",
            "mt-1.5": Platform.OS === "android",
          })}
          onPress={dismissModal}
          testID="close_bottom_sheet_button"
        >
          <ThemedIcon iconType="Feather" name="x-circle" size={22} />
        </ThemedTouchableOpacityV2>
      );
    },
    headerLeft: () => <></>,
  };
  const title = "Slippage Tolerance";
  const description =
    "Slippages are rate charges that occur within an order transaction. Note that the slippage tolerance also includes the DEX stabilization fees. Choose how much of this slippage you are willing to accept.";

  const onBottomSheetSlippageSelect = (): void => {
    setBottomSheetScreen([
      {
        stackScreenName: "SlippageInfo",
        component: BottomSheetModalInfo({ title, description }),
        option: BottomSheetHeader,
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
        "FROM",
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
        "FROM",
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
        "TO",
      );
    }
  }, [
    route.params.pair,
    route.params.tokenSelectOption,
    route.params.fromToken,
  ]);

  useEffect(() => {
    void getSelectedPoolPairs();

    if (hasShownInputFocusBefore || !isBothTokensSelected()) {
      return;
    }
    /* timeout added to auto display keyboard on Android */
    if (Platform.OS === "android") {
      setTimeout(() => amountInputRef?.current?.focus(), 0);
    } else {
      amountInputRef?.current?.focus();
    }
    setHasShownInputFocusBefore(true);
  }, [selectedTokenA, selectedTokenB]);

  const getSelectedPoolPairs = async (): Promise<void> => {
    if (selectedTokenA !== undefined && selectedTokenB !== undefined) {
      const poolPairs = await getArbitraryPoolPair(
        selectedTokenA.id,
        selectedTokenB.id,
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
      const { aToBPrice, bToAPrice, estimated, estimatedLessDexFees } =
        await calculatePriceRates(
          selectedTokenA.id,
          selectedTokenB.id,
          new BigNumber(tokenA),
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
        new BigNumber(tokenA).div(tokenAReserve),
      );
      setEstimatedLessFeesAfterSlippage(
        new BigNumber(estimatedLessDexFees).multipliedBy(slippage),
      );

      setPriceRates([
        {
          label: translate("components/PricesSection", "1 {{token}} =", {
            token: selectedTokenA.displaySymbol,
          }),
          value: aToBPrice.toFixed(8),
          symbolUSDValue: getAmountInUSDValue(selectedTokenA, new BigNumber(1)),
          usdTextStyle: tailwind("text-sm"),
          aSymbol: selectedTokenA.displaySymbol,
          bSymbol: selectedTokenB.displaySymbol,
        },
        {
          label: translate("components/PricesSection", "1 {{token}} =", {
            token: selectedTokenB.displaySymbol,
          }),
          value: bToAPrice.toFixed(8),
          symbolUSDValue: getAmountInUSDValue(selectedTokenB, new BigNumber(1)),
          usdTextStyle: tailwind("text-sm"),
          aSymbol: selectedTokenB.displaySymbol,
          bSymbol: selectedTokenA.displaySymbol,
        },
      ]);
      setValue("tokenB", estimated.toFixed(8));
      // trigger validation for tokenB
      await trigger("tokenB");
    }
  };

  useEffect(() => {
    setIsFutureSwap(
      activeButtonGroup === ButtonGroupTabKey.FutureSwap &&
        isFutureSwapOptionEnabled,
    );
  }, [activeButtonGroup, isFutureSwapOptionEnabled]);

  useEffect(() => {
    if (selectedTokenA === undefined || selectedTokenB === undefined) {
      return undefined;
    }

    const fetchBestPath = async () => {
      const bestPath = await getBestPath(
        selectedTokenA.id === "0_unified" ? "0" : selectedTokenA.id,
        selectedTokenB.id === "0_unified" ? "0" : selectedTokenB.id,
      );
      setBestPathEstimatedReturn({
        estimatedReturn: bestPath.estimatedReturn,
        estimatedReturnLessDexFees: bestPath.estimatedReturnLessDexFees,
      });
    };

    fetchBestPath();
  }, [selectedTokenA, selectedTokenB, selectedPoolPairs]);

  const totalFees = useMemo(() => {
    if (
      tokenA === "" ||
      new BigNumber(tokenA).isZero() ||
      priceRates === undefined ||
      selectedTokenB === undefined
    ) {
      return "-";
    }

    /*
      dexFeesInTokenBUnit = Burn fees + commission fee of 1 tokenA
    */
    const dexFeesInTokenBUnit = new BigNumber(
      bestPathEstimatedReturn?.estimatedReturn ?? 0,
    )
      .minus(
        new BigNumber(bestPathEstimatedReturn?.estimatedReturnLessDexFees ?? 0),
      )
      .multipliedBy(tokenA);

    /* Transaction fee + DEX fees */
    return getPrecisedCurrencyValue(
      getTokenPrice("DFI", fee).plus(
        getTokenPrice(selectedTokenB.symbol, dexFeesInTokenBUnit),
      ),
    );
  }, [priceRates, selectedTokenB, tokenA, bestPathEstimatedReturn, fee]);

  useEffect(() => {
    let message = translate(
      "screens/CompositeSwapScreen",
      "Future swap uses the oracle price of the selected token on the settlement block",
    );
    if (selectedTokenA !== undefined) {
      if (selectedTokenA.displaySymbol === "DUSD") {
        if (selectedTokenB === undefined) {
          message = translate(
            "screens/CompositeSwapScreen",
            "You are buying dTokens at 5% more than the oracle price at settlement block.",
          );
        } else {
          message = translate(
            "screens/CompositeSwapScreen",
            "You are buying {{displaySymbol}} at 5% more than the oracle price at settlement block.",
            { displaySymbol: selectedTokenB.displaySymbol },
          );
        }
      } else {
        message = translate(
          "screens/CompositeSwapScreen",
          "You are selling your {{displaySymbol}} at 5% less than the oracle price at settlement block.",
          {
            displaySymbol: selectedTokenA.displaySymbol,
          },
        );
      }
    }
    setOraclePriceMessage(message);
  }, [selectedTokenA, selectedTokenB]);

  const navigateToTokenSelectionScreen = (listType: TokenListType): void => {
    navigation.navigate("SwapTokenSelectionScreen", {
      fromToken: {
        symbol: selectedTokenA?.symbol,
        displaySymbol: selectedTokenA?.displaySymbol,
      },
      listType: listType,
      list: listType === TokenListType.From ? fromTokens ?? [] : toTokens ?? [],
      onTokenPress: (item) => {
        onTokenSelect(item, listType);
        navigation.goBack();
      },
      isFutureSwap: activeButtonGroup === ButtonGroupTabKey.FutureSwap,
      isSearchDTokensOnly: selectedTokenA?.displaySymbol === "DUSD",
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
    const params: DexParamList["ConfirmCompositeSwapScreen"] = {
      fee,
      pairs: selectedPoolPairs,
      priceRates,
      originScreen: route.params.originScreen,
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
      estimatedLessFeesAfterSlippage:
        estimatedLessFeesAfterSlippage?.toFixed(8) ?? "",
      totalFees,
    };

    if (isConversionRequired) {
      queueConvertTransaction(
        {
          mode: ConvertDirection.utxosToAccount,
          amount: conversionAmount,
        },
        dispatch,
        () => {
          navigation.navigate("ConfirmCompositeSwapScreen", params);
        },
        logger,
        () => {
          params.conversion = {
            DFIUtxo,
            DFIToken,
            isConversionRequired: true,
            conversionAmount,
            isConverted: true,
          };
          navigation.navigate({
            name: "ConfirmCompositeSwapScreen",
            params,
            merge: true,
          });
        },
      );
    } else {
      navigation.navigate("ConfirmCompositeSwapScreen", params);
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
    [],
  );

  const isBothTokensSelected = (): boolean => {
    return selectedTokenA !== undefined && selectedTokenB !== undefined;
  };

  async function onPercentagePress(
    amount: string,
    type: AmountButtonTypes,
  ): Promise<void> {
    setValue("tokenA", amount);
    await trigger("tokenA");
    showToast(type);
  }

  function showToast(type: AmountButtonTypes): void {
    if (selectedTokenA === undefined) {
      return;
    }

    toast.hideAll();
    const isMax = type === AmountButtonTypes.Max;
    const toastMessage = isMax
      ? "Max available {{unit}} entered"
      : "{{percent}} of available {{unit}} entered";
    const toastOption = {
      unit: selectedTokenA.displaySymbol,
      percent: type,
    };
    toast.show(
      translate("screens/CompositeSwapScreen", toastMessage, toastOption),
      {
        type: "wallet_toast",
        placement: "top",
        duration: TOAST_DURATION,
      },
    );
  }

  return (
    <View style={tailwind("h-full")} ref={containerRef}>
      <ThemedViewV2 style={tailwind("h-full")}>
        <SwapButtonGroup
          activeButtonGroup={activeButtonGroup}
          onPress={(type) => onButtonGroupChange(type)}
          disableFutureSwap={
            (isFromLoanToken !== undefined && !isFromLoanToken) ||
            (isToLoanToken !== undefined && !isToLoanToken)
          }
        />
        <ThemedScrollViewV2 ref={scrollViewRef}>
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

          {activeButtonGroup === ButtonGroupTabKey.FutureSwap && (
            <View style={tailwind("flex mx-5 mt-8 rounded")}>
              <AnnouncementBannerV2
                announcement={oraclePriceAnnouncement}
                testID="oracle_announcements_banner"
                containerStyle={{
                  light: tailwind("bg-transparent"),
                  dark: tailwind("bg-transparent"),
                }}
              />
            </View>
          )}

          <ThemedTextV2
            style={tailwind(
              "mx-10 text-xs font-normal-v2 mt-8 tracking-wide-v2",
            )}
            light={tailwind("text-mono-light-v2-500")}
            dark={tailwind("text-mono-dark-v2-500")}
            testID="text_balance_amount"
          >
            {translate(
              "screens/CompositeSwapScreen",
              "I HAVE {{totalAmount}} {{token}}",
              {
                totalAmount:
                  selectedTokenA != null ? getMaxAmount(selectedTokenA) : "",
                token:
                  selectedTokenA != null ? selectedTokenA.displaySymbol : "",
              },
            )}
          </ThemedTextV2>

          <View style={tailwind("mx-5")}>
            <TransactionCard
              maxValue={
                new BigNumber(
                  selectedTokenA != null ? getMaxAmount(selectedTokenA) : 0,
                )
              }
              onChange={onPercentagePress}
              componentStyle={{
                light: tailwind("bg-transparent"),
                dark: tailwind("bg-transparent"),
              }}
              containerStyle={{
                light: tailwind("bg-transparent"),
                dark: tailwind("bg-transparent"),
              }}
              amountButtonsStyle={{
                light: tailwind("bg-mono-light-v2-00"),
                dark: tailwind("bg-mono-dark-v2-00"),
                style: tailwind("mt-6 rounded-xl-v2"),
              }}
              disabled={
                selectedTokenA === undefined ||
                new BigNumber(getMaxAmount(selectedTokenA)).isZero()
              }
            >
              <View
                style={tailwind(
                  "flex flex-row justify-between items-center pl-5 mt-4",
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
                        light={tailwind("text-mono-light-v2-900", {
                          "opacity-30": selectedTokenA === undefined,
                        })}
                        dark={tailwind("text-mono-dark-v2-900", {
                          "opacity-30": selectedTokenA === undefined,
                        })}
                        keyboardType="numeric"
                        value={value}
                        onBlur={async () => {
                          await onChange(value?.trim());
                        }}
                        onChangeText={async (amount) => {
                          amount = isNaN(+amount) ? "0" : amount;
                          setValue("tokenA", amount);
                          await trigger("tokenA");
                        }}
                        placeholder="0.00"
                        placeholderTextColor={getColor(
                          isLight ? "mono-light-v2-900" : "mono-dark-v2-900",
                        )}
                        ref={amountInputRef}
                        testID="text_input_tokenA"
                        editable={selectedTokenA !== undefined}
                      />
                    )}
                    rules={{
                      required: true,
                      pattern: /^\d*\.?\d*$/,
                      max: selectedTokenA ? getMaxAmount(selectedTokenA) : "0",
                      validate: {
                        greaterThanZero: (value: string) =>
                          new BigNumber(
                            value !== undefined && value !== "" ? value : 0,
                          ).isGreaterThan(0),
                      },
                    }}
                  />
                  <ActiveUSDValueV2
                    price={getAmountInUSDValue(
                      selectedTokenA ?? undefined,
                      tokenA,
                    )}
                    testId="tokenA_value_in_usd"
                    containerStyle={tailwind("w-full break-words")}
                  />
                </View>

                <TokenDropdownButton
                  symbol={selectedTokenA?.displaySymbol}
                  tokenId={selectedTokenA?.id}
                  testID={TokenListType.From}
                  onPress={() =>
                    navigateToTokenSelectionScreen(TokenListType.From)
                  }
                  status={
                    route.params.tokenSelectOption?.from?.isDisabled
                      ? TokenDropdownButtonStatus.Locked
                      : TokenDropdownButtonStatus.Enabled
                  }
                />
              </View>
            </TransactionCard>
            <View style={tailwind("ml-5")}>
              {tokenA !== "" && selectedTokenA === undefined && (
                <ThemedTextV2
                  light={tailwind("text-red-v2")}
                  dark={tailwind("text-red-v2")}
                  style={tailwind("text-xs pt-2 font-normal-v2")}
                >
                  {translate(
                    "screens/CompositeSwapScreen",
                    "Select a token first",
                  )}
                </ThemedTextV2>
              )}
              {formState.errors.tokenA?.type === "max" &&
                selectedTokenA !== undefined &&
                tokenA !== "" && (
                  <ThemedTextV2
                    light={tailwind("text-red-v2")}
                    dark={tailwind("text-red-v2")}
                    style={tailwind("text-xs pt-2 font-normal-v2")}
                    testID="text_insufficient_balance"
                  >
                    {translate(
                      "screens/CompositeSwapScreen",
                      "Insufficient balance",
                    )}
                  </ThemedTextV2>
                )}

              {formState.errors.tokenA?.type === undefined &&
                isReservedUtxoUsed && (
                  <ThemedTextV2
                    light={tailwind("text-orange-v2")}
                    dark={tailwind("text-orange-v2")}
                    style={tailwind("text-xs pt-2 font-normal-v2")}
                    testID="utxo_reserved_fees_text"
                  >
                    {translate(
                      "screens/CompositeSwapScreen",
                      "A small amount of UTXO is reserved for fees",
                    )}
                  </ThemedTextV2>
                )}
            </View>

            <View style={tailwind("my-8 flex-row")}>
              <ThemedViewV2
                dark={tailwind("border-mono-dark-v2-300")}
                light={tailwind("border-mono-light-v2-300")}
                style={tailwind("border-b-0.5 flex-1 h-1/2")}
              />
              <ThemedTouchableOpacityV2
                onPress={onTokenSwitch}
                style={tailwind("p-2.5 rounded-full z-50", {
                  "opacity-30": !isBothTokensSelected(),
                })}
                dark={tailwind("bg-mono-dark-v2-900")}
                light={tailwind("bg-mono-light-v2-900")}
                testID="switch_button"
                disabled={!isBothTokensSelected()}
              >
                <View
                  style={{
                    transform: [{ rotate: "90deg" }, { scaleX: -1 }],
                  }}
                >
                  <SwapTokenButton
                    size={24}
                    color={
                      isLight
                        ? getColor("mono-light-v2-00")
                        : getColor("mono-dark-v2-00")
                    }
                  />
                </View>
              </ThemedTouchableOpacityV2>
              <ThemedViewV2
                dark={tailwind("border-mono-dark-v2-300")}
                light={tailwind("border-mono-light-v2-300")}
                style={tailwind("border-b-0.5 flex-1 h-1/2")}
              />
            </View>

            <ThemedViewV2
              style={tailwind("border-0 pb-8")}
              dark={tailwind("bg-transparent")}
              light={tailwind("bg-transparent")}
            >
              <ThemedTextV2
                style={tailwind("px-5 text-xs font-normal-v2 tracking-wide-v2")}
                light={tailwind("text-mono-light-v2-500")}
                dark={tailwind("text-mono-dark-v2-500")}
                testID="tokenB_displaySymbol"
              >
                {translate("screens/CompositeSwapScreen", "I WANT {{token}}", {
                  token: selectedTokenB?.displaySymbol ?? "",
                })}
              </ThemedTextV2>

              <ThemedViewV2
                style={tailwind(
                  "flex flex-row justify-between items-center pl-5 mt-4",
                  {
                    "border-b-0.5 pb-8":
                      isBothTokensSelected() &&
                      priceRates !== undefined &&
                      activeButtonGroup === ButtonGroupTabKey.InstantSwap,
                  },
                )}
                light={tailwind("border-mono-light-v2-300")}
                dark={tailwind("border-mono-dark-v2-300")}
              >
                {activeButtonGroup === ButtonGroupTabKey.FutureSwap && (
                  <FutureSwapRowTo oraclePriceText={oraclePriceText} />
                )}
                {activeButtonGroup === ButtonGroupTabKey.InstantSwap && (
                  <InstantSwapRowTo
                    tokenAmount={new BigNumber(tokenB).toFixed(8)}
                    tokenUsdAmount={getAmountInUSDValue(
                      selectedTokenB ?? undefined,
                      tokenB,
                    )}
                  />
                )}
                <TokenDropdownButton
                  symbol={selectedTokenB?.displaySymbol}
                  tokenId={selectedTokenB?.id}
                  testID={TokenListType.To}
                  onPress={() =>
                    navigateToTokenSelectionScreen(TokenListType.To)
                  }
                  status={
                    route.params.tokenSelectOption?.to?.isDisabled
                      ? TokenDropdownButtonStatus.Locked
                      : selectedTokenA === undefined || toTokens.length === 0
                      ? TokenDropdownButtonStatus.Disabled
                      : TokenDropdownButtonStatus.Enabled
                  }
                />
              </ThemedViewV2>
            </ThemedViewV2>
          </View>

          {isBothTokensSelected() &&
            activeButtonGroup === ButtonGroupTabKey.InstantSwap && (
              <View style={tailwind("px-4 pb-6")}>
                <SlippageTolerance
                  setSlippage={setSlippage}
                  setSlippageError={setSlippageError}
                  onPress={onBottomSheetSlippageSelect}
                  slippageError={slippageError}
                  slippage={slippage}
                  isEditing={isEditingCustomSlippageInput}
                  setIsEditing={setIsEditingCustomSlippageInput}
                />
              </View>
            )}

          {isBothTokensSelected() && priceRates !== undefined && (
            <>
              <ThemedViewV2
                light={tailwind("border-mono-light-v2-300")}
                dark={tailwind("border-mono-dark-v2-300")}
                style={tailwind("pt-5 px-5 mx-5 border-0.5 rounded-lg-v2")}
              >
                <SwapSummary
                  instantSwapPriceRate={priceRates}
                  activeTab={activeButtonGroup}
                  executionBlock={executionBlock}
                  transactionFee={fee}
                  totalFees={totalFees}
                  dexStabilizationFee={dexStabilizationFee}
                  dexStabilizationType={dexStabilizationType}
                  timeRemaining={timeRemaining}
                />
              </ThemedViewV2>
            </>
          )}

          {formState.isValid && isBothTokensSelected() && (
            <ThemedTextV2
              testID="transaction_details_hint_text"
              light={tailwind("text-mono-light-v2-500")}
              dark={tailwind("text-mono-dark-v2-500")}
              style={tailwind("pt-12 px-10 text-xs text-center font-normal-v2")}
            >
              {isConversionRequired
                ? translate(
                    "screens/CompositeSwapScreen",
                    "By continuing, the required amount of DFI will be converted",
                  )
                : translate(
                    "screens/CompositeSwapScreen",
                    "Review full details in the next screen",
                  )}
            </ThemedTextV2>
          )}

          <View
            style={tailwind("mb-12 mx-12 mt-16", {
              "mt-5": formState.isValid && isBothTokensSelected(),
            })}
          >
            <SubmitButtonGroup
              isDisabled={
                !formState.isValid ||
                hasPendingJob ||
                hasPendingBroadcastJob ||
                (slippageError?.type === "error" &&
                  slippageError !== undefined) ||
                (isFutureSwap && isEnded) ||
                !isBothTokensSelected()
              }
              label={translate("components/Button", "Continue")}
              onSubmit={
                (dexStabilizationType === "none" &&
                  isDexStabilizationEnabled) ||
                !isDexStabilizationEnabled
                  ? onSubmit
                  : onWarningBeforeSubmit
              }
              title="submit"
              displayCancelBtn={false}
              buttonStyle="mt-0 mx-0"
            />
          </View>

          {Platform.OS === "web" && (
            <BottomSheetWebWithNavV2
              modalRef={containerRef}
              screenList={bottomSheetScreen}
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
          )}

          {Platform.OS !== "web" && (
            <BottomSheetWithNavV2
              modalRef={bottomSheetRef}
              screenList={bottomSheetScreen}
              snapPoints={{
                ios: ["40%"],
                android: ["45%"],
              }}
            />
          )}
        </ThemedScrollViewV2>
      </ThemedViewV2>
    </View>
  );
}
