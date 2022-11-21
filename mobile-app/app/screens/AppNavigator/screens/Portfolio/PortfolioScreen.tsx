import {
  CommonActions,
  useIsFocused,
  useScrollToTop,
} from "@react-navigation/native";
import {
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import { useDisplayBalancesContext } from "@contexts/DisplayBalancesContext";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useWalletPersistenceContext } from "@shared-contexts/WalletPersistenceContext";
import {
  useWhaleApiClient,
  useWhaleRpcClient,
} from "@shared-contexts/WhaleContext";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { StackScreenProps } from "@react-navigation/stack";
import { ocean } from "@store/ocean";
import {
  dexPricesSelectorByDenomination,
  fetchDexPrice,
  fetchTokens,
  tokensSelector,
  WalletToken,
} from "@store/wallet";
import { tailwind } from "@tailwind";
import BigNumber from "bignumber.js";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { batch, useSelector } from "react-redux";
import { Announcements } from "@screens/AppNavigator/screens/Portfolio/components/Announcements";
import { DFIBalanceCard } from "@screens/AppNavigator/screens/Portfolio/components/DFIBalanceCard";
import { translate } from "@translations";
import { Platform, RefreshControl, View } from "react-native";
import { RootState } from "@store";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import {
  activeVaultsSelector,
  fetchCollateralTokens,
  fetchLoanTokens,
  fetchVaults,
} from "@store/loans";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import {
  SkeletonLoader,
  SkeletonLoaderScreen,
} from "@components/SkeletonLoader";
import { LoanVaultActive } from "@defichain/whale-api-client/dist/api/loan";
import { fetchExecutionBlock, fetchFutureSwaps } from "@store/futureSwap";
import { useAppDispatch } from "@hooks/useAppDispatch";
import {
  AssetsFilterRow,
  ButtonGroupTabKey,
} from "@screens/AppNavigator/screens/Portfolio/components/AssetsFilterRow";
import { BottomSheetAddressDetailV2 } from "@screens/AppNavigator/screens/Portfolio/components/BottomSheetAddressDetailV2";
import {
  BottomSheetWebWithNavV2,
  BottomSheetWithNavV2,
} from "@components/BottomSheetWithNavV2";
import { CreateOrEditAddressLabelForm } from "@screens/AppNavigator/screens/Portfolio/components/CreateOrEditAddressLabelForm";
import { BottomSheetHeaderBackButton } from "@screens/AppNavigator/screens/Portfolio/components/BottomSheetHeaderBackButton";
import { BottomSheetHeader } from "@components/BottomSheetHeader";
import * as SplashScreen from "expo-splash-screen";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { bottomTabDefaultRoutes } from "@screens/AppNavigator/constants/DefaultRoutes";
import { AddressSelectionButtonV2 } from "./components/AddressSelectionButtonV2";
import { ActionButtons } from "./components/ActionButtons";
import {
  BottomSheetAssetSortList,
  PortfolioSortType,
} from "./components/BottomSheetAssetSortList";
import { useDenominationCurrency } from "./hooks/PortfolioCurrency";
import { PortfolioCard } from "./components/PortfolioCard";
import {
  LockedBalance,
  useTokenLockedBalance,
} from "./hooks/TokenLockedBalance";
import {
  PortfolioButtonGroupTabKey,
  TotalPortfolio,
} from "./components/TotalPortfolio";
import { useTokenPrice } from "./hooks/TokenPrice";
import { PortfolioParamList } from "./PortfolioNavigator";

type Props = StackScreenProps<PortfolioParamList, "PortfolioScreen">;

export interface PortfolioRowToken extends WalletToken {
  usdAmount: BigNumber;
}

export function PortfolioScreen({ navigation }: Props): JSX.Element {
  const { isLight } = useThemeContext();
  const isFocused = useIsFocused();
  const height = useBottomTabBarHeight();
  const client = useWhaleApiClient();
  const whaleRpcClient = useWhaleRpcClient();
  const { address, addressLength } = useWalletContext();
  const { denominationCurrency, setDenominationCurrency } =
    useDenominationCurrency();

  const { getTokenPrice } = useTokenPrice(denominationCurrency);
  const prices = useSelector((state: RootState) =>
    dexPricesSelectorByDenomination(state.wallet, denominationCurrency)
  );
  const { wallets } = useWalletPersistenceContext();
  const lockedTokens = useTokenLockedBalance({ denominationCurrency }) as Map<
    string,
    LockedBalance
  >;
  const {
    isBalancesDisplayed,
    toggleDisplayBalances: onToggleDisplayBalances,
  } = useDisplayBalancesContext();
  const blockCount = useSelector((state: RootState) => state.block.count);
  const vaults = useSelector((state: RootState) =>
    activeVaultsSelector(state.loans)
  );

  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [isZeroBalance, setIsZeroBalance] = useState(true);
  const { hasFetchedToken, allTokens } = useSelector(
    (state: RootState) => state.wallet
  );
  const ref = useRef(null);
  const logger = useLogger();
  useScrollToTop(ref);

  useEffect(() => {
    dispatch(ocean.actions.setHeight(height));
  }, [height, wallets]);

  useEffect(() => {
    if (isFocused) {
      batch(() => {
        dispatch(
          fetchFutureSwaps({
            client: whaleRpcClient,
            address,
          })
        );
        dispatch(fetchExecutionBlock({ client: whaleRpcClient }));
      });
    }
  }, [address, blockCount, isFocused]);

  useEffect(() => {
    batch(() => {
      // fetch only once to decide flag to display locked balance breakdown
      dispatch(fetchCollateralTokens({ client }));
      dispatch(fetchLoanTokens({ client }));
    });
  }, []);

  const fetchPortfolioData = (): void => {
    batch(() => {
      dispatch(
        fetchTokens({
          client,
          address,
        })
      );
      dispatch(
        fetchVaults({
          client,
          address,
        })
      );
    });
  };

  // TODO: check if can reduce API calls. Already being called on WalletDataProvider
  // But doesn't use the denominationCurrency
  useEffect(() => {
    dispatch(
      fetchDexPrice({
        client,
        denomination: denominationCurrency,
      })
    );
  }, [blockCount, denominationCurrency]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    fetchPortfolioData();
    setRefreshing(false);
  }, [address, client, dispatch]);

  const tokens = useSelector((state: RootState) =>
    tokensSelector(state.wallet)
  );
  const { totalAvailableValue, dstTokens } = useMemo(() => {
    return tokens.reduce(
      (
        {
          totalAvailableValue,
          dstTokens,
        }: { totalAvailableValue: BigNumber; dstTokens: PortfolioRowToken[] },
        token
      ) => {
        const usdAmount = getTokenPrice(
          token.symbol,
          new BigNumber(token.amount),
          token.isLPS
        );
        if (token.symbol === "DFI") {
          return {
            // `token.id === '0_unified'` to avoid repeated DFI price to get added in totalAvailableValue
            totalAvailableValue:
              token.id === "0_unified"
                ? totalAvailableValue
                : totalAvailableValue.plus(usdAmount.isNaN() ? 0 : usdAmount),
            dstTokens,
          };
        }
        return {
          totalAvailableValue: totalAvailableValue.plus(
            usdAmount.isNaN() ? 0 : usdAmount
          ),
          dstTokens: [
            ...dstTokens,
            {
              ...token,
              usdAmount,
            },
          ],
        };
      },
      {
        totalAvailableValue: new BigNumber(0),
        dstTokens: [],
      }
    );
  }, [prices, tokens]);

  // add token that are 100% locked as collateral into dstTokens
  const combinedTokens = useMemo(() => {
    if (lockedTokens === undefined || lockedTokens.size === 0) {
      return dstTokens;
    }

    const dstTokenSymbols = dstTokens.map((token) => token.displaySymbol);
    const lockedTokensArray: PortfolioRowToken[] = [];
    lockedTokens.forEach((_lockedBalance, displaySymbol) => {
      if (displaySymbol === "DFI") {
        return;
      }

      const tokenExist = dstTokenSymbols.includes(displaySymbol);
      if (!tokenExist) {
        const tokenData = allTokens[displaySymbol];
        if (tokenData !== undefined) {
          lockedTokensArray.push({
            id: tokenData.id,
            amount: "0",
            symbol: tokenData.symbol,
            displaySymbol: tokenData.displaySymbol,
            symbolKey: tokenData.symbolKey,
            name: tokenData.name,
            isDAT: tokenData.isDAT,
            isLPS: tokenData.isLPS,
            isLoanToken: tokenData.isLoanToken,
            avatarSymbol: tokenData.displaySymbol,
            usdAmount: new BigNumber(0),
          });
        }
      }
    });
    return [...dstTokens, ...lockedTokensArray];
  }, [dstTokens, allTokens, lockedTokens]);

  const [filteredTokens, setFilteredTokens] = useState(combinedTokens);
  // portfolio tab items
  const onPortfolioButtonGroupChange = (
    portfolioButtonGroupTabKey: PortfolioButtonGroupTabKey
  ): void => {
    setDenominationCurrency(portfolioButtonGroupTabKey);
  };

  const portfolioButtonGroup = [
    {
      id: PortfolioButtonGroupTabKey.USDT,
      label: translate("screens/PortfolioScreen", "USDT"),
      handleOnPress: () =>
        onPortfolioButtonGroupChange(PortfolioButtonGroupTabKey.USDT),
    },
    {
      id: PortfolioButtonGroupTabKey.DFI,
      label: translate("screens/PortfolioScreen", "DFI"),
      handleOnPress: () =>
        onPortfolioButtonGroupChange(PortfolioButtonGroupTabKey.DFI),
    },
    {
      id: PortfolioButtonGroupTabKey.BTC,
      label: translate("screens/PortfolioScreen", "BTC"),
      handleOnPress: () =>
        onPortfolioButtonGroupChange(PortfolioButtonGroupTabKey.BTC),
    },
    {
      id: PortfolioButtonGroupTabKey.DUSD,
      label: translate("screens/PortfolioScreen", "DUSD"),
      handleOnPress: () =>
        onPortfolioButtonGroupChange(PortfolioButtonGroupTabKey.DUSD),
    },
    {
      id: PortfolioButtonGroupTabKey.USDC,
      label: translate("screens/PortfolioScreen", "USDC"),
      handleOnPress: () =>
        onPortfolioButtonGroupChange(PortfolioButtonGroupTabKey.USDC),
    },
  ];

  // Asset sort bottom sheet list
  const [assetSortType, setAssetSortType] = useState<PortfolioSortType>(
    PortfolioSortType.HighestDenominationValue
  ); // to display selected sorted type text
  const [isSorted, setIsSorted] = useState<boolean>(false); // to display acsending/descending icon
  const [showAssetSortBottomSheet, setShowAssetSortBottomSheet] =
    useState(false);
  const sortTokensAssetOnType = useCallback(
    (assetSortType: PortfolioSortType): PortfolioRowToken[] => {
      let sortTokensFunc: (
        a: PortfolioRowToken,
        b: PortfolioRowToken
      ) => number;
      switch (assetSortType) {
        case PortfolioSortType.HighestDenominationValue:
          sortTokensFunc = (a, b) => b.usdAmount.minus(a.usdAmount).toNumber();
          break;
        case PortfolioSortType.LowestDenominationValue:
          sortTokensFunc = (a, b) => a.usdAmount.minus(b.usdAmount).toNumber();
          break;
        case PortfolioSortType.HighestTokenAmount:
          sortTokensFunc = (a, b) =>
            new BigNumber(b.amount).minus(new BigNumber(a.amount)).toNumber();
          break;
        case PortfolioSortType.LowestTokenAmount:
          sortTokensFunc = (a, b) =>
            new BigNumber(a.amount).minus(new BigNumber(b.amount)).toNumber();
          break;
        case PortfolioSortType.AtoZ:
          sortTokensFunc = (a, b) => a.symbol.localeCompare(b.symbol);
          break;
        case PortfolioSortType.ZtoA:
          sortTokensFunc = (a, b) => b.symbol.localeCompare(a.symbol);
          break;
        default:
          sortTokensFunc = (a, b) => b.usdAmount.minus(a.usdAmount).toNumber();
      }

      return filteredTokens.sort(sortTokensFunc);
    },
    [filteredTokens, assetSortType, denominationCurrency]
  );

  useEffect(() => {
    setAssetSortType(PortfolioSortType.HighestDenominationValue); // reset sorting state upon denominationCurrency change
  }, [denominationCurrency]);

  // token tab items
  const [activeButtonGroup, setActiveButtonGroup] = useState<ButtonGroupTabKey>(
    ButtonGroupTabKey.AllTokens
  );
  const handleButtonFilter = useCallback(
    (buttonGroupTabKey: ButtonGroupTabKey) => {
      const filterTokens = combinedTokens.filter((token) => {
        switch (buttonGroupTabKey) {
          case ButtonGroupTabKey.LPTokens:
            return token.isLPS;
          case ButtonGroupTabKey.Crypto:
            return token.isDAT && !token.isLoanToken && !token.isLPS;
          case ButtonGroupTabKey.dTokens:
            return token.isLoanToken;
          // for All token tab will return true for list of dstToken
          default:
            return true;
        }
      });
      setFilteredTokens(filterTokens);
    },
    [combinedTokens]
  );

  const totalLockedValue = useMemo(() => {
    if (lockedTokens === undefined) {
      return new BigNumber(0);
    }
    return [...lockedTokens.values()].reduce(
      (totalLockedValue: BigNumber, value: LockedBalance) =>
        totalLockedValue.plus(value.tokenValue.isNaN() ? 0 : value.tokenValue),
      new BigNumber(0)
    );
  }, [lockedTokens, prices]);

  const totalLoansValue = useMemo(() => {
    if (vaults === undefined) {
      return new BigNumber(0);
    }
    return vaults.reduce(
      (totalLoansValue: BigNumber, vault: LoanVaultActive) => {
        const totalVaultLoansValue = vault.loanAmounts.reduce(
          (totalVaultLoansValue, loanToken) => {
            const tokenValue = getTokenPrice(
              loanToken.symbol,
              new BigNumber(loanToken.amount)
            );
            return totalVaultLoansValue.plus(
              new BigNumber(tokenValue).isNaN() ? 0 : tokenValue
            );
          },
          new BigNumber(0)
        );
        return totalLoansValue.plus(
          new BigNumber(totalVaultLoansValue).isNaN() ? 0 : totalVaultLoansValue
        );
      },
      new BigNumber(0)
    );
  }, [prices, vaults]);

  // to update filter list from selected token tab
  useEffect(() => {
    handleButtonFilter(activeButtonGroup);
  }, [activeButtonGroup, combinedTokens]);

  useEffect(() => {
    setIsZeroBalance(
      !tokens.some((token) => new BigNumber(token.amount).isGreaterThan(0))
    );
  }, [tokens]);

  const assetSortBottomSheetScreen = useMemo(() => {
    return [
      {
        stackScreenName: "AssetSortList",
        component: BottomSheetAssetSortList({
          onButtonPress: (item: PortfolioSortType) => {
            setIsSorted(true);
            setAssetSortType(item);
            sortTokensAssetOnType(item);
            setShowAssetSortBottomSheet(false);
            dismissModal(true);
          },
          denominationCurrency,
          selectedAssetSortType: assetSortType,
        }),
        option: {
          headerStatusBarHeight: 1,
          headerTitle: "",
          headerBackTitleVisible: false,
          header: (): JSX.Element => {
            return (
              <BottomSheetHeader
                headerText={translate("screens/PortfolioScreen", "Sort Assets")}
                onClose={() => {
                  setShowAssetSortBottomSheet(false);
                  dismissModal(true);
                }}
              />
            );
          },
        },
      },
    ];
  }, [denominationCurrency, assetSortType]);

  // Address selection bottom sheet
  const bottomSheetRef = useRef<BottomSheetModalMethods>(null);
  const bottomSheetSortRef = useRef<BottomSheetModalMethods>(null);
  const containerRef = useRef(null);
  const [isModalDisplayed, setIsModalDisplayed] = useState(false);
  const modalSnapPoints = { ios: ["75%"], android: ["75%"] };
  const modalSortingSnapPoints = { ios: ["55%"], android: ["55%"] };
  const expandModal = useCallback((isSortBottomSheet: boolean) => {
    if (Platform.OS === "web") {
      setIsModalDisplayed(true);
    } else if (isSortBottomSheet) {
      bottomSheetSortRef.current?.present();
    } else {
      bottomSheetRef.current?.present();
    }
  }, []);
  const dismissModal = useCallback((isSortBottomSheet: boolean) => {
    if (Platform.OS === "web") {
      setIsModalDisplayed(false);
    } else if (isSortBottomSheet) {
      bottomSheetSortRef.current?.close();
    } else {
      bottomSheetRef.current?.close();
    }
  }, []);

  const addressBottomSheetHeader = {
    headerStatusBarHeight: 1,
    headerTitle: "",
    headerBackTitleVisible: false,
    headerStyle: tailwind("rounded-t-xl-v2", {
      "bg-mono-light-v2-100": isLight,
      "bg-mono-dark-v2-100": !isLight,
    }),
    headerRight: (): JSX.Element => {
      return (
        <ThemedTouchableOpacityV2
          style={tailwind("border-0 mr-5 mt-2")}
          onPress={() => dismissModal(false)}
          testID="close_bottom_sheet_button"
        >
          <ThemedIcon iconType="Feather" name="x-circle" size={22} />
        </ThemedTouchableOpacityV2>
      );
    },
  };

  const resetNavigationStack = () => {
    navigation.dispatch(
      CommonActions.reset({
        routes: bottomTabDefaultRoutes,
      })
    );
  };

  const addressBottomSheetScreen = useMemo(() => {
    return [
      {
        stackScreenName: "AddressDetail",
        component: BottomSheetAddressDetailV2({
          address: address,
          addressLabel: "TODO: get label from storage api",
          onReceiveButtonPress: () => {
            dismissModal(false);
            navigation.navigate("Receive");
          },
          onTransactionsButtonPress: () => {
            dismissModal(false);
            navigation.navigate("TransactionsScreen");
          },
          onCloseButtonPress: () => dismissModal(false),
          navigateToScreen: {
            screenName: "CreateOrEditAddressLabelForm",
          },
          onSwitchAddress: resetNavigationStack,
        }),
        option: addressBottomSheetHeader,
      },
      {
        stackScreenName: "CreateOrEditAddressLabelForm",
        component: CreateOrEditAddressLabelForm,
        option: {
          ...addressBottomSheetHeader,
          headerLeft: (): JSX.Element => <BottomSheetHeaderBackButton />,
        },
      },
    ];
  }, [address, isLight]);

  // Hide splashscreen when first page is loaded to prevent white screen
  // It is wrapped on a timeout so it will execute once the JS stack is cleared up
  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hideAsync().catch(logger.error);
    });
  }, []);

  return (
    <View ref={containerRef} style={tailwind("flex-1")}>
      <ThemedScrollViewV2
        ref={ref}
        contentContainerStyle={tailwind("pb-12")}
        testID="portfolio_list"
        refreshControl={
          <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
        }
      >
        <ThemedViewV2
          light={tailwind("bg-mono-light-v2-00")}
          dark={tailwind("bg-mono-dark-v2-00")}
          style={tailwind("px-5 flex flex-row items-center")}
        >
          <AddressSelectionButtonV2
            address={address}
            addressLength={addressLength}
            onPress={() => expandModal(false)}
          />
          <ThemedTouchableOpacityV2
            testID="toggle_balance"
            style={tailwind("ml-2")}
            light={tailwind("bg-transparent")}
            dark={tailwind("bg-transparent")}
            onPress={onToggleDisplayBalances}
          >
            <ThemedIcon
              iconType="MaterialCommunityIcons"
              dark={tailwind("text-mono-dark-v2-900")}
              light={tailwind("text-mono-light-v2-900")}
              name={`${isBalancesDisplayed ? "eye" : "eye-off"}`}
              size={18}
            />
          </ThemedTouchableOpacityV2>
        </ThemedViewV2>

        <TotalPortfolio
          totalAvailableValue={totalAvailableValue}
          totalLockedValue={totalLockedValue}
          totalLoansValue={totalLoansValue}
          portfolioButtonGroup={portfolioButtonGroup}
          denominationCurrency={denominationCurrency}
          setDenominationCurrency={setDenominationCurrency}
        />
        <ActionButtons />
        <Announcements />
        <AssetsFilterRow
          activeButtonGroup={activeButtonGroup}
          onButtonGroupPress={handleButtonFilter}
          setActiveButtonGroup={setActiveButtonGroup}
        />
        {/* to show bottom sheet for asset sort */}
        <AssetSortRow
          assetSortType={assetSortType}
          onPress={() => {
            setShowAssetSortBottomSheet(true);
            expandModal(true);
          }}
          isSorted={isSorted}
          denominationCurrency={denominationCurrency}
        />
        {activeButtonGroup === "ALL_TOKENS" && (
          <DFIBalanceCard denominationCurrency={denominationCurrency} />
        )}
        {!hasFetchedToken ? (
          <View style={tailwind("px-5")}>
            <SkeletonLoader row={2} screen={SkeletonLoaderScreen.Portfolio} />
          </View>
        ) : (
          <PortfolioCard
            isZeroBalance={isZeroBalance}
            filteredTokens={sortTokensAssetOnType(assetSortType)}
            navigation={navigation}
            buttonGroupOptions={{
              activeButtonGroup: activeButtonGroup,
              setActiveButtonGroup: setActiveButtonGroup,
              onButtonGroupPress: handleButtonFilter,
            }}
            denominationCurrency={denominationCurrency}
          />
        )}
        {Platform.OS === "web" ? (
          <BottomSheetWebWithNavV2
            modalRef={containerRef}
            screenList={
              showAssetSortBottomSheet
                ? assetSortBottomSheetScreen
                : addressBottomSheetScreen
            }
            isModalDisplayed={isModalDisplayed}
            modalStyle={{
              position: "absolute",
              bottom: "0",
              height: "505px",
              width: "375px",
              zIndex: 50,
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
              overflow: "hidden",
            }}
          />
        ) : (
          <>
            <BottomSheetWithNavV2
              modalRef={bottomSheetSortRef}
              screenList={assetSortBottomSheetScreen}
              snapPoints={modalSortingSnapPoints}
            />
            <BottomSheetWithNavV2
              modalRef={bottomSheetRef}
              screenList={addressBottomSheetScreen}
              snapPoints={modalSnapPoints}
            />
          </>
        )}
      </ThemedScrollViewV2>
    </View>
  );
}

function AssetSortRow(props: {
  isSorted: boolean;
  assetSortType: PortfolioSortType;
  denominationCurrency: string;
  onPress: () => void;
}): JSX.Element {
  const highestCurrencyValue = translate(
    "screens/PortfolioScreen",
    "Highest value ({{denominationCurrency}})",
    { denominationCurrency: props.denominationCurrency }
  );
  const lowestCurrencyValue = translate(
    "screens/PortfolioScreen",
    "Lowest value ({{denominationCurrency}})",
    { denominationCurrency: props.denominationCurrency }
  );
  const getDisplayedSortText = (text: PortfolioSortType): string => {
    if (text === PortfolioSortType.HighestDenominationValue) {
      return highestCurrencyValue;
    } else if (text === PortfolioSortType.LowestDenominationValue) {
      return lowestCurrencyValue;
    }
    return text;
  };

  return (
    <View
      style={tailwind("px-10 flex flex-row justify-between")}
      testID="toggle_sorting_assets"
    >
      <ThemedTextV2
        style={tailwind("text-xs pr-1 font-normal-v2")}
        light={tailwind("text-mono-light-v2-500")}
        dark={tailwind("text-mono-dark-v2-500")}
      >
        {translate("screens/PortfolioScreen", "ASSETS")}
      </ThemedTextV2>
      <ThemedTouchableOpacityV2
        style={tailwind("flex flex-row items-center")}
        onPress={props.onPress}
        testID="your_assets_dropdown_arrow"
      >
        <ThemedTextV2
          light={tailwind("text-mono-light-v2-800")}
          dark={tailwind("text-mono-dark-v2-800")}
          style={tailwind("text-xs font-normal-v2")}
        >
          {translate(
            "screens/PortfolioScreen",
            props.isSorted
              ? getDisplayedSortText(props.assetSortType)
              : "Sort by"
          )}
        </ThemedTextV2>
        <ThemedIcon
          style={tailwind("ml-1 font-medium")}
          light={tailwind("text-mono-light-v2-800")}
          dark={tailwind("text-mono-dark-v2-800")}
          iconType="Feather"
          name="menu"
          size={16}
        />
      </ThemedTouchableOpacityV2>
    </View>
  );
}
