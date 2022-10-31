import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ThemedFlashList,
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedText,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { NumericFormat as NumberFormat } from "react-number-format";
import { Platform, TextInput, View } from "react-native";
import { getNativeIcon } from "@components/icons/assets";
import {
  LoanToken,
  LoanVaultActive,
  LoanVaultState,
} from "@defichain/whale-api-client/dist/api/loan";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { ActivePrice } from "@defichain/whale-api-client/dist/api/prices";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import BigNumber from "bignumber.js";
import { loanTokensSelector, vaultsSelector } from "@store/loans";
import { getPrecisedTokenValue } from "@screens/AppNavigator/screens/Auctions/helpers/precision-token-value";
import { BottomSheetHeader as BottonSheetHeaderSort } from "@components/BottomSheetHeader";
import { useBottomSheet } from "@hooks/useBottomSheet";
import {
  BottomSheetWebWithNavV2,
  BottomSheetWithNavV2,
} from "@components/BottomSheetWithNavV2";
import { BottomSheetModalInfo } from "@components/BottomSheetModalInfo";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { SearchInputV2 } from "@components/SearchInputV2";
import { debounce } from "lodash";
import {
  SkeletonLoader,
  SkeletonLoaderScreen,
} from "@components/SkeletonLoader";
import { BottomSheetTokenListHeader } from "@components/BottomSheetTokenListHeader";
import { ListRenderItemInfo } from "@shopify/flash-list";
import {
  LoansTokensSortRow,
  LoansTokensSortType,
  BottomSheetTokensLoansSortList,
} from "./LoansTokensSortRow";
import { getActivePrice } from "../../Auctions/helpers/ActivePrice";
import { LoanParamList } from "../LoansNavigator";
import { LoanActionButton } from "./LoanActionButton";
import { VaultStatus } from "../VaultStatusTypes";
import { PriceOracleInfo } from "./PriceOracleInfo";
import { VaultBanner } from "./VaultBanner";
import { BottomSheetVaultList } from "./BottomSheetVaultList";

interface LoanCardsProps {
  testID: string;
  vaultId?: string;
  scrollRef?: React.Ref<any>;
  sortRef?: React.Ref<any>;
}
export interface LoanCardOptions {
  symbol: string;
  displaySymbol: string;
  price?: ActivePrice;
  interestRate: string;
  onPress: () => void;
  testID: string;
  parentTestID: string;
  isBorrowHidden: boolean;
}

export function LoanCards(props: LoanCardsProps): JSX.Element {
  const { isLight } = useThemeContext();
  const loanTokens = useSelector((state: RootState) =>
    loanTokensSelector(state.loans)
  );

  const vaults = useSelector((state: RootState) => vaultsSelector(state.loans));
  const { hasFetchedLoansData } = useSelector(
    (state: RootState) => state.loans
  );

  // Search
  const [filteredLoanTokens, setFilteredLoanTokens] =
    useState<LoanToken[]>(loanTokens);
  const [isVaultReady, setIsVaultReady] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [isSearchFocus, setIsSearchFocus] = useState(false);
  const searchRef = useRef<TextInput>();

  const [showLoader, setShowLoader] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(false);
  const [loansTokensSortType, setLoansTokensSortType] =
    useState<LoansTokensSortType>(LoansTokensSortType.LowestOraclePrice);
  const [isSorted, setIsSorted] = useState<boolean>(false);

  const inSearchMode = useMemo(() => {
    return isSearchFocus || searchString !== "";
  }, [isSearchFocus, searchString]);

  const handleFilter = useCallback(
    debounce((searchString: string) => {
      setFilteredLoanTokens(
        loanTokens.filter((loanToken) =>
          loanToken.token.displaySymbol
            .toLowerCase()
            .includes(searchString.trim().toLowerCase())
        )
      );
    }, 250),
    [loanTokens, hasFetchedLoansData]
  );

  const sortLoansTokensOnSort = useCallback(
    (loansTokensSortType: LoansTokensSortType): LoanToken[] => {
      let sortTokensFunc: (a: LoanToken, b: LoanToken) => number;
      function getCurrentPrice(symbol: string, price?: ActivePrice) {
        return new BigNumber(
          getPrecisedTokenValue(getActivePrice(symbol, price))
        );
      }

      switch (loansTokensSortType) {
        case LoansTokensSortType.LowestOraclePrice:
          sortTokensFunc = (a, b) =>
            getCurrentPrice(a.token.displaySymbol, a.activePrice)
              .minus(getCurrentPrice(b.token.displaySymbol, b.activePrice))
              .toNumber();
          break;
        case LoansTokensSortType.HighestOraclePrice:
          sortTokensFunc = (a, b) =>
            getCurrentPrice(b.token.displaySymbol, b.activePrice)
              .minus(getCurrentPrice(a.token.displaySymbol, a.activePrice))
              .toNumber();
          break;
        case LoansTokensSortType.LowestInterest:
          sortTokensFunc = (a, b) =>
            new BigNumber(a.interest)
              .minus(new BigNumber(b.interest))
              .toNumber();
          break;
        case LoansTokensSortType.HighestInterest:
          sortTokensFunc = (a, b) =>
            new BigNumber(b.interest)
              .minus(new BigNumber(a.interest))
              .toNumber();
          break;
        case LoansTokensSortType.AtoZ:
          sortTokensFunc = (a, b) =>
            a.token.displaySymbol.localeCompare(b.token.displaySymbol);
          break;
        case LoansTokensSortType.ZtoA:
          sortTokensFunc = (a, b) =>
            b.token.displaySymbol.localeCompare(a.token.displaySymbol);
          break;
        default:
          sortTokensFunc = (a, b) =>
            getCurrentPrice(a.token.displaySymbol, a.activePrice)
              .minus(getCurrentPrice(b.token.displaySymbol, b.activePrice))
              .toNumber();
      }

      return filteredLoanTokens.sort(sortTokensFunc);
    },
    [filteredLoanTokens, loansTokensSortType]
  );

  useEffect(() => {
    if (loanTokens.length === 0) {
      return;
    }
    handleFilter(searchString);
  }, [searchString]);

  useEffect(() => {
    setFilteredLoanTokens(loanTokens);
  }, [hasFetchedLoansData]);

  useEffect(() => {
    setIsVaultReady(
      vaults.some((vault) =>
        [
          VaultStatus.Ready,
          VaultStatus.Healthy,
          VaultStatus.AtRisk,
          VaultStatus.NearLiquidation,
        ].includes(vault.vaultState)
      )
    );
  }, [vaults]);

  useEffect(() => {
    setIsFirstLoad(true);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isFirstLoad) {
      // extend loader for an arbitrary amount of time for flashlist to complete rendering
      const extendedLoaderTime = 1000;
      timeout = setTimeout(() => {
        setShowLoader(false);
      }, extendedLoaderTime);
    }
    return () => clearTimeout(timeout);
  }, [isFirstLoad]);

  const navigation = useNavigation<NavigationProp<LoanParamList>>();
  const activeVault = vaults.find(
    (v) =>
      v.vaultId === props.vaultId && v.state !== LoanVaultState.IN_LIQUIDATION
  ) as LoanVaultActive;

  const goToCreateVault = (): void => {
    navigation.navigate({
      name: "CreateVaultScreen",
      params: {},
      merge: true,
    });
  };

  const title = "Price Oracles";
  const description =
    "Oracles provide real time price data points from trusted sources, to reflect onto DeFiChain.";

  const {
    bottomSheetRef,
    dismissModal,
    expandModal,
    isModalDisplayed,
    bottomSheetScreen,
    setBottomSheetScreen,
    snapPoints,
    setSnapPoints,
  } = useBottomSheet();
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

  const onBorrowPress = (loanToken: LoanToken): void => {
    setSnapPoints({
      ios: ["60%"],
      android: ["60%"],
    });
    setBottomSheetScreen([
      {
        stackScreenName: "VaultList",
        component: BottomSheetVaultList({
          onVaultPress: (vault: LoanVaultActive) => {
            dismissModal();
            navigation.navigate({
              name: "BorrowLoanTokenScreen",
              params: {
                vault: vault,
                loanToken: loanToken,
              },
              merge: true,
            });
          },
          vaults,
        }),
        option: {
          headerTitle: "",
          headerBackTitleVisible: false,
          headerStyle: tailwind("rounded-t-xl-v2 border-b-0"),
          header: () => (
            <BottomSheetTokenListHeader
              headerLabel={translate(
                "screens/BorrowLoanTokenScreen",
                "Select Vault"
              )}
              onCloseButtonPress={dismissModal}
            />
          ),
        },
      },
    ]);
    expandModal();
  };

  const onBottomSheetOraclePriceSelect = (): void => {
    setSnapPoints({
      ios: ["30%"],
      android: ["35%"],
    });
    setBottomSheetScreen([
      {
        stackScreenName: "OraclePriceInfo",
        component: BottomSheetModalInfo({
          title,
          description,
        }),
        option: BottomSheetHeader,
      },
    ]);
    expandModal();
  };

  const tokenLoansSortBottomSheetScreen = (): void => {
    setSnapPoints({
      ios: ["65%"],
      android: ["65%"],
    });
    setBottomSheetScreen([
      {
        stackScreenName: "TokensLoansSortList",
        component: BottomSheetTokensLoansSortList({
          onButtonPress: (item: LoansTokensSortType) => {
            setIsSorted(true);
            sortLoansTokensOnSort(item);
            setLoansTokensSortType(item);
            dismissModal();
          },
          selectedLoansTokensSortType: loansTokensSortType,
        }),
        option: {
          headerStatusBarHeight: 1,
          headerTitle: "",
          headerBackTitleVisible: false,
          header: (): JSX.Element => {
            return (
              <BottonSheetHeaderSort
                onClose={dismissModal}
                headerText={translate("screens/LoansScreen", "Sort Tokens")}
              />
            );
          },
        },
      },
    ]);
    expandModal();
  };

  return (
    <View style={tailwind("flex-1")}>
      <ThemedScrollViewV2
        ref={props.scrollRef}
        contentContainerStyle={tailwind("py-8 w-full")}
      >
        {isVaultReady && (
          <>
            <SearchInputV2
              ref={searchRef}
              value={searchString}
              showClearButton={searchString !== ""}
              placeholder={translate(
                "screens/LoansScreen",
                "Search available loan tokens"
              )}
              inputStyle={{
                style: tailwind({ "py-3": Platform.OS === "web" }),
              }}
              containerStyle={tailwind("flex-1 mx-5", [
                "border-0.5",
                isSearchFocus
                  ? {
                      "border-mono-light-v2-800": isLight,
                      "border-mono-dark-v2-800": !isLight,
                    }
                  : {
                      "border-mono-light-v2-00": isLight,
                      "border-mono-dark-v2-00": !isLight,
                    },
              ])}
              onClearInput={() => {
                setSearchString("");
                searchRef?.current?.focus();
              }}
              onChangeText={(text: string) => {
                setSearchString(text);
              }}
              onFocus={() => {
                setIsSearchFocus(true);
              }}
              onBlur={() => {
                setIsSearchFocus(false);
              }}
              testID="loan_search_input"
            />
            {!isSearchFocus && searchString === "" && (
              <LoansTokensSortRow
                isSorted={isSorted}
                loansTokensSortType={loansTokensSortType}
                onPress={tokenLoansSortBottomSheetScreen}
              />
            )}
          </>
        )}

        {vaults.length === 0 && hasFetchedLoansData && (
          <ThemedViewV2 style={tailwind("mx-5 rounded-lg-v2")}>
            <VaultBanner
              buttonLabel="Create a vault"
              description="You need a vault with collaterals to borrow tokens"
              onButtonPress={goToCreateVault}
              testID="vault_banner"
            />
            <View style={tailwind("mt-2 mx-2")}>
              <PriceOracleInfo
                onPress={onBottomSheetOraclePriceSelect}
                text="Loan tokens get their prices from oracles."
              />
            </View>
          </ThemedViewV2>
        )}
        {showLoader && (
          <View style={tailwind("mt-5 mx-2")}>
            <SkeletonLoader row={6} screen={SkeletonLoaderScreen.LoanV2} />
          </View>
        )}

        {!showLoader && inSearchMode && (
          <View style={tailwind("mt-8 mx-5")}>
            <ThemedTextV2
              style={tailwind("text-xs pl-5 font-normal-v2")}
              light={tailwind("text-mono-light-v2-700")}
              dark={tailwind("text-mono-dark-v2-700")}
              testID="empty_search_result_text"
            >
              {searchString.trim() === ""
                ? translate("screens/LoansScreen", "Search with token name")
                : translate(
                    "screens/LoansScreen",
                    "Search results for “{{searchTerm}}”",
                    { searchTerm: searchString }
                  )}
            </ThemedTextV2>
          </View>
        )}
        {/* Known intermittent issue wherein the two-column layout is not followed
      in web - FlashList */}
        <ThemedFlashList
          keyExtractor={(_item, index) => index.toString()}
          testID={`${props.testID}_token_lists`}
          estimatedItemSize={116}
          contentContainerStyle={tailwind(
            "pb-2 pt-8",
            {
              "pt-0": vaults.length >= 1,
            },
            { "pt-4": searchString !== "" }
          )}
          parentContainerStyle={tailwind("mx-3", {
            hidden: isSearchFocus && searchString.trim() === "",
          })}
          data={filteredLoanTokens}
          /* This tells FlashList to rerender if any of the props below is updated */
          extraData={{
            isVaultReady,
            activeVault,
          }}
          numColumns={2}
          renderItem={({
            item,
            index,
          }: ListRenderItemInfo<LoanToken>): JSX.Element => {
            return (
              <View style={{ flexBasis: "100%" }}>
                <LoanCard
                  symbol={item.token.symbol}
                  displaySymbol={item.token.displaySymbol}
                  interestRate={item.interest}
                  price={item.activePrice}
                  onPress={() => {
                    onBorrowPress(item);
                  }}
                  testID={`loan_card_${index}`}
                  parentTestID={props.testID}
                  isBorrowHidden={!isVaultReady}
                />
              </View>
            );
          }}
        />
        {vaults.length >= 1 &&
          ((searchString.trim() !== "" &&
            isSearchFocus &&
            filteredLoanTokens.length > 0) ||
            (!isSearchFocus && filteredLoanTokens.length > 0)) && (
            <PriceOracleInfo
              onPress={onBottomSheetOraclePriceSelect}
              text="Loan tokens get their prices from oracles."
            />
          )}

        {Platform.OS === "web" && (
          <BottomSheetWebWithNavV2
            modalRef={props.sortRef}
            screenList={bottomSheetScreen}
            isModalDisplayed={isModalDisplayed}
            // eslint-disable-next-line react-native/no-inline-styles
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
        )}

        {Platform.OS !== "web" && (
          <BottomSheetWithNavV2
            modalRef={bottomSheetRef}
            screenList={bottomSheetScreen}
            snapPoints={snapPoints}
          />
        )}
      </ThemedScrollViewV2>
    </View>
  );
}

function LoanCard({
  symbol,
  displaySymbol,
  price,
  interestRate,
  onPress,
  testID,
  parentTestID,
  isBorrowHidden,
}: LoanCardOptions): JSX.Element {
  const currentPrice = getPrecisedTokenValue(getActivePrice(symbol, price));
  return (
    <ThemedViewV2
      testID={`loan_card_${displaySymbol}`}
      light={tailwind("bg-mono-light-v2-00")}
      dark={tailwind("bg-mono-dark-v2-00")}
      style={tailwind("p-4 mx-2 mb-4 rounded-lg-v2")}
    >
      <View style={tailwind("flex-row items-center pb-2 justify-between")}>
        <MemoizedLoanIcon testID={testID} displaySymbol={displaySymbol} />
      </View>
      <NumberFormat
        decimalScale={2}
        thousandSeparator
        displayType="text"
        renderText={(value: string) => (
          <View style={tailwind("flex flex-row items-center")}>
            <ThemedText style={tailwind("text-sm")}>
              <ThemedTextV2
                style={tailwind("font-semibold-v2")}
                testID={`${testID}_oracle_price`}
                // eslint-disable-next-line react-native/no-raw-text
              >
                ${value}
              </ThemedTextV2>
            </ThemedText>
          </View>
        )}
        value={currentPrice}
      />
      <NumberFormat
        thousandSeparator
        displayType="text"
        renderText={(value: string) => (
          <ThemedTextV2
            light={tailwind("text-mono-light-v2-700")}
            dark={tailwind("text-mono-dark-v2-700")}
            style={tailwind("text-xs font-normal-v2")}
            testID={`${testID}_interest_rate`}
          >
            {translate("components/LoanCard", "{{interestValue}} Interest", {
              interestValue: value,
            })}
          </ThemedTextV2>
        )}
        value={BigNumber(interestRate).toFixed(2)}
        suffix="%"
      />
      {!isBorrowHidden && (
        <LoanActionButton
          label={translate("components/LoanCard", "Borrow")}
          onPress={onPress}
          style={tailwind("mt-3")}
          testID={`${displaySymbol}_borrow_button_${parentTestID}`}
        />
      )}
    </ThemedViewV2>
  );
}

/*
  Custom comparison is added because the debounced search is sluggish due to Loan Icon rendering
*/
const MemoizedLoanIcon = memo(
  ({ testID, displaySymbol }: { testID: string; displaySymbol: string }) => {
    const LoanIcon = getNativeIcon(displaySymbol);
    return (
      <View
        style={tailwind("flex flex-row justify-between items-center w-full")}
      >
        <ThemedTextV2
          light={tailwind("text-mono-light-v2-700")}
          dark={tailwind("text-mono-dark-v2-700")}
          style={tailwind("font-normal-v2")}
          testID={`${testID}_display_symbol`}
        >
          {displaySymbol}
        </ThemedTextV2>
        <LoanIcon
          width={36}
          height={36}
          style={tailwind({
            "font-normal-v2": Platform.OS === "web",
          })}
        />
      </View>
    );
  },
  comparisonFn
);

function comparisonFn(prevProps: any, nextProps: any): boolean {
  // compare objects by stringify
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
}
