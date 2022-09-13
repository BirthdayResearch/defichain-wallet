import BigNumber from "bignumber.js";
import { StackScreenProps } from "@react-navigation/stack";
import { DexParamList } from "@screens/AppNavigator/screens/Dex/DexNavigator";
import {
  ThemedFlatListV2,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
} from "@components/themed";
import { tailwind } from "@tailwind";
import { TextInput, View } from "react-native";
import { SearchInputV2 } from "@components/SearchInputV2";
import { useMemo, useRef, useState, useCallback } from "react";
import { useDebounce } from "@hooks/useDebounce";
import { TokenIcon } from "@screens/AppNavigator/screens/Portfolio/components/TokenIcon";
import { TokenNameTextV2 } from "@screens/AppNavigator/screens/Portfolio/components/TokenNameTextV2";
import NumberFormat from "react-number-format";
import { ActiveUSDValueV2 } from "@screens/AppNavigator/screens/Loans/VaultDetail/components/ActiveUSDValueV2";
import { useTokenPrice } from "@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice";
import { translate } from "@translations";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { useSelector } from "react-redux";
import { fetchDexPrice } from "@store/wallet";
import { RootState } from "@store";
import { useFocusEffect } from "@react-navigation/native";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";

export enum TokenListType {
  From = "FROM",
  To = "TO",
}

export interface SelectionToken {
  tokenId: string;
  available: BigNumber;
  token: {
    name: string;
    displaySymbol: string;
    symbol: string;
    isLPS?: boolean;
  };
  factor?: string;
  reserve?: string;
}

type Props = StackScreenProps<DexParamList, "SwapTokenSelectionScreen">;

export function SwapTokenSelectionScreen({ route }: Props): JSX.Element {
  const {
    fromToken,
    listType,
    list,
    onTokenPress,
    isFutureSwap = false,
    isSearchDTokensOnly = false,
  } = route.params;

  const { isLight } = useThemeContext();
  const client = useWhaleApiClient();
  const dispatch = useAppDispatch();
  const blockCount = useSelector((state: RootState) => state.block.count);
  const { getTokenPrice: getTokenPriceUSDT } = useTokenPrice();
  const { getTokenPrice: getTokenPriceTokenA } = useTokenPrice(
    fromToken.symbol
  );
  const [searchString, setSearchString] = useState("");
  const [isSearchFocus, setIsSearchFocus] = useState(false);
  const debouncedSearchTerm = useDebounce(searchString, 250);
  const searchRef = useRef<TextInput>();

  useFocusEffect(
    useCallback(() => {
      dispatch(
        fetchDexPrice({
          client,
          denomination: fromToken.symbol ?? "USDT",
        })
      );
    }, [blockCount, fromToken.symbol])
  );

  const filteredTokensWithBalance = useMemo(() => {
    return filterTokensBySearchTerm(list, debouncedSearchTerm, isSearchFocus);
  }, [list, debouncedSearchTerm, isSearchFocus]);

  const getEmptyResultText = (): string => {
    let text: string;
    if (debouncedSearchTerm.trim() === "") {
      text = "Search with token name";
      if (
        isFutureSwap &&
        isSearchDTokensOnly &&
        listType === TokenListType.To
      ) {
        text = "Search dTokens for future swap";
      }
    } else {
      text = "Search results for “{{searchTerm}}”";
      if (isFutureSwap && filteredTokensWithBalance.length === 0) {
        text =
          "No results for “{{searchTerm}}” found. Do note that only selected tokens are available for future swap.";
      }
    }
    return text;
  };

  return (
    <ThemedFlatListV2
      contentContainerStyle={tailwind("px-5 pb-12")}
      testID="swap_token_selection_screen"
      data={filteredTokensWithBalance}
      keyExtractor={(item) => item.tokenId}
      renderItem={({ item }: { item: SelectionToken }): JSX.Element => {
        return (
          <TokenItem
            fromToken={fromToken}
            item={item}
            onPress={() => onTokenPress(item)}
            getTokenPriceUSDT={getTokenPriceUSDT}
            getTokenPriceTokenA={getTokenPriceTokenA}
            listType={listType}
          />
        );
      }}
      ListHeaderComponent={
        <View style={tailwind("flex-col mt-8")}>
          <SearchInputV2
            ref={searchRef}
            value={searchString}
            showClearButton={debouncedSearchTerm !== ""}
            placeholder={translate(
              "screens/SwapTokenSelectionScreen",
              "Search token"
            )}
            containerStyle={tailwind([
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
          {debouncedSearchTerm.trim() === "" && !isSearchFocus ? (
            <ThemedTextV2
              style={tailwind("text-xs pl-5 mt-6 mb-2 font-normal-v2")}
              light={tailwind("text-mono-light-v2-500")}
              dark={tailwind("text-mono-dark-v2-500")}
            >
              {translate(
                "screens/SwapTokenSelectionScreen",
                listType === TokenListType.From
                  ? "AVAILABLE TOKENS"
                  : isFutureSwap
                  ? "AVAILABLE FOR FUTURE SWAP"
                  : "AVAILABLE FOR SWAP"
              )}
            </ThemedTextV2>
          ) : (
            <ThemedTextV2
              style={tailwind("text-xs pl-5 mt-8 mb-4 font-normal-v2")}
              light={tailwind("text-mono-light-v2-700")}
              dark={tailwind("text-mono-dark-v2-700")}
              testID="empty_search_result_text"
            >
              {translate(
                "screens/SwapTokenSelectionScreen",
                getEmptyResultText(),
                { searchTerm: debouncedSearchTerm }
              )}
            </ThemedTextV2>
          )}
        </View>
      }
    />
  );
}

type TokenPrice = (
  symbol: string,
  amount: BigNumber,
  isLPS?: boolean | undefined
) => BigNumber;

interface TokenItemProps {
  fromToken: {
    symbol?: string;
    displaySymbol?: string;
  };
  item: SelectionToken;
  onPress: any;
  getTokenPriceUSDT: TokenPrice;
  getTokenPriceTokenA: TokenPrice;
  listType: TokenListType;
}

function TokenItem({
  fromToken,
  item,
  onPress,
  getTokenPriceUSDT,
  getTokenPriceTokenA,
  listType,
}: TokenItemProps): JSX.Element {
  const activePriceUSDT = getTokenPriceUSDT(
    item.token.symbol,
    new BigNumber("1"),
    item.token.isLPS
  );

  const activePriceTokenA = getTokenPriceTokenA(
    item.token.symbol,
    new BigNumber("1"),
    item.token.isLPS
  );
  return (
    <ThemedTouchableOpacityV2
      style={tailwind(
        "flex flex-row p-5 mb-2 border-0 rounded-lg-v2 items-center justify-between"
      )}
      light={tailwind("bg-mono-light-v2-00")}
      dark={tailwind("bg-mono-dark-v2-00")}
      onPress={onPress}
      testID={`select_${item.token.displaySymbol}`}
    >
      <View style={tailwind("w-6/12 flex flex-row items-center pr-2")}>
        <TokenIcon
          testID={`${item.token.displaySymbol}_icon`}
          token={{
            isLPS: item.token.isLPS,
            displaySymbol: item.token.displaySymbol,
          }}
          size={36}
        />
        <TokenNameTextV2
          displaySymbol={item.token.displaySymbol}
          name={item.token.name}
          testID={item.token.displaySymbol}
        />
      </View>
      <View style={tailwind("flex-1 flex-wrap flex-col items-end")}>
        <NumberFormat
          value={
            listType === TokenListType.From
              ? item.available.toFixed(8)
              : activePriceTokenA.toFixed(8)
          }
          suffix={
            listType === TokenListType.From ? "" : ` ${fromToken.displaySymbol}`
          }
          thousandSeparator
          displayType="text"
          renderText={(value) => (
            <ThemedTextV2
              style={tailwind(
                "w-full flex-wrap font-semibold-v2 text-xs text-right"
              )}
              testID={`select_${item.token.displaySymbol}_value`}
            >
              {value}
            </ThemedTextV2>
          )}
        />
        <View style={tailwind("pt-1")}>
          {listType === TokenListType.From ? (
            <ActiveUSDValueV2
              price={new BigNumber(item.available).multipliedBy(
                activePriceUSDT
              )}
              containerStyle={tailwind("justify-end")}
              style={tailwind("flex-wrap")}
            />
          ) : (
            <NumberFormat
              value={activePriceUSDT.toFixed(2)}
              thousandSeparator
              displayType="text"
              renderText={(value) => (
                <ThemedTextV2
                  style={tailwind(
                    "flex-wrap font-normal-v2 text-xs text-right"
                  )}
                  testID={`select_${item.token.displaySymbol}_sub_value`}
                  light={tailwind("text-mono-light-v2-700")}
                  dark={tailwind("text-mono-dark-v2-700")}
                >
                  {value}
                </ThemedTextV2>
              )}
              prefix="$"
            />
          )}
        </View>
      </View>
    </ThemedTouchableOpacityV2>
  );
}

function filterTokensBySearchTerm(
  tokens: SelectionToken[],
  searchTerm: string,
  isFocused: boolean
): SelectionToken[] {
  if (isFocused && searchTerm === "") {
    return [];
  }
  return tokens.filter((t) =>
    [t.token.displaySymbol, t.token.name].some((searchItem) =>
      searchItem.toLowerCase().includes(searchTerm.trim().toLowerCase())
    )
  );
}
