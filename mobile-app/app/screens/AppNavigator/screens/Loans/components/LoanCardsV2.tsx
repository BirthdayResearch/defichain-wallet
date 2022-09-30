import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  ThemedFlashList,
  ThemedScrollViewV2,
  ThemedText,
  ThemedTextV2,
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
import {
  NavigationProp,
  useNavigation,
  useScrollToTop,
} from "@react-navigation/native";
import { ActivePrice } from "@defichain/whale-api-client/dist/api/prices";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { loanTokensSelector, vaultsSelector } from "@store/loans";
import { getPrecisedTokenValue } from "@screens/AppNavigator/screens/Auctions/helpers/precision-token-value";
import { SearchInputV2 } from "@components/SearchInputV2";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { debounce } from "lodash";
import { getActivePrice } from "../../Auctions/helpers/ActivePrice";
import { LoanParamList } from "../LoansNavigator";
import { LoanActionButton } from "./LoanActionButton";
import { VaultStatus } from "../VaultStatusTypes";

interface LoanCardsProps {
  testID?: string;
  vaultId?: string;
}

export interface LoanCardOptions {
  loanTokenId: string;
  symbol: string;
  displaySymbol: string;
  price?: ActivePrice;
  interestRate: string;
  onPress: () => void;
  testID: string;
  isBorrowHidden: boolean;
}

export function LoanCardsV2(props: LoanCardsProps): JSX.Element {
  const { isLight } = useThemeContext();
  const loanTokens = useSelector((state: RootState) =>
    loanTokensSelector(state.loans)
  );
  const vaultsList = useSelector((state: RootState) =>
    vaultsSelector(state.loans)
  );
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
      vaultsList.some((vault) => vault.vaultState !== VaultStatus.Empty)
    );
  }, [vaultsList]);

  const ref = useRef(null);
  useScrollToTop(ref);
  const navigation = useNavigation<NavigationProp<LoanParamList>>();
  const vaults = useSelector((state: RootState) => vaultsSelector(state.loans));
  const activeVault = vaults.find(
    (v) =>
      v.vaultId === props.vaultId && v.state !== LoanVaultState.IN_LIQUIDATION
  ) as LoanVaultActive;

  return (
    <ThemedScrollViewV2
      contentContainerStyle={tailwind("px-5 py-8 w-full")}
      ref={ref}
    >
      <SearchInputV2
        ref={searchRef}
        value={searchString}
        showClearButton={searchString !== ""}
        placeholder={translate(
          "screens/LoansScreen",
          "Search available loan tokens"
        )}
        containerStyle={tailwind("flex-1", [
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
      />
      {/* Known intermittent issue wherein the two-column layout is not followed
      in web - FlashList */}
      <ThemedFlashList
        estimatedItemSize={116}
        contentContainerStyle={tailwind("pt-4 pb-2")}
        data={filteredLoanTokens}
        /* This tells FlashList to rerender if any of the props below is updated */
        extraData={{
          isVaultReady,
          activeVault,
        }}
        numColumns={2}
        ListEmptyComponent={
          <View style={tailwind("mt-1")}>
            <ThemedTextV2
              style={tailwind("text-xs pl-5 my-4 font-normal-v2")}
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
        }
        renderItem={({
          item,
          index,
        }: {
          item: LoanToken;
          index: number;
        }): JSX.Element => {
          return (
            <View style={{ flexBasis: "98%" }}>
              <LoanCard
                symbol={item.token.symbol}
                displaySymbol={item.token.displaySymbol}
                interestRate={item.interest}
                price={item.activePrice}
                loanTokenId={item.tokenId}
                onPress={() => {
                  navigation.navigate({
                    name: "BorrowLoanTokenScreen",
                    params: {
                      loanToken: item,
                      vault: activeVault,
                    },
                    merge: true,
                  });
                }}
                testID={`loan_card_${index}`}
                isBorrowHidden={!isVaultReady}
              />
            </View>
          );
        }}
        keyExtractor={(_item, index) => index.toString()}
        testID={props.testID}
      />
    </ThemedScrollViewV2>
  );
}

function LoanCard({
  symbol,
  displaySymbol,
  price,
  interestRate,
  onPress,
  testID,
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
            <ThemedText
              testID={`${testID}_loan_amount`}
              style={tailwind("text-sm")}
            >
              <ThemedTextV2
                style={tailwind("font-semibold-v2")}
                testID={`${testID}_interest_rate`}
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
        decimalScale={2}
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
        value={interestRate}
        suffix="%"
      />
      {!isBorrowHidden && (
        <LoanActionButton
          label={translate("components/LoanCard", "Borrow")}
          onPress={onPress}
          style={tailwind("mt-3")}
          testID={`${displaySymbol}_borrow_button`}
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
          style={tailwind("font-medium font-normal-v2")}
          testID={`${testID}_display_symbol`}
        >
          {displaySymbol}
        </ThemedTextV2>
        <LoanIcon
          width={36}
          height={36}
          style={tailwind({
            "font-medium font-normal-v2": Platform.OS === "web",
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
