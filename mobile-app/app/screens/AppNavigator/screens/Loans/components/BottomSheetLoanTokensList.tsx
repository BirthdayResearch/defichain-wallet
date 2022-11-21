import { View } from "@components";
import {
  ThemedFlatListV2,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import { LoanToken } from "@defichain/whale-api-client/dist/api/loan";
import { useStyles } from "@tailwind";
import { translate } from "@translations";
import * as React from "react";
import { memo } from "react";
import { NumericFormat as NumberFormat } from "react-number-format";
import { SearchInputV2 } from "@components/SearchInputV2";
import { TextInput } from "react-native-gesture-handler";
import { Platform } from "react-native";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useDebounce } from "@hooks/useDebounce";
import { getPrecisedTokenValue } from "../../Auctions/helpers/precision-token-value";
import { getActivePrice } from "../../Auctions/helpers/ActivePrice";
import { TokenIcon } from "../../Portfolio/components/TokenIcon";
import { TokenNameText } from "../../Portfolio/components/TokenNameText";

export const BottomSheetLoanTokensList = ({
  onPress,
  loanTokens,
  isLight,
}: {
  onPress: (item: LoanToken) => void;
  loanTokens: LoanToken[];
  isLight: boolean;
}): React.MemoExoticComponent<() => JSX.Element> =>
  memo(() => {
    const { tailwind } = useStyles();
    const searchRef = React.useRef<TextInput>();
    const [searchString, setSearchString] = React.useState("");
    const [isSearchFocus, setIsSearchFocus] = React.useState(false);
    const debouncedSearchTerm = useDebounce(searchString, 250);

    const filterLoanTokensWithBalance = React.useMemo(() => {
      return filterLoanTokensBySearchTerm(
        loanTokens,
        debouncedSearchTerm,
        isSearchFocus
      );
    }, [debouncedSearchTerm, isSearchFocus]);

    const inSearchMode = React.useMemo(() => {
      return isSearchFocus || debouncedSearchTerm !== "";
    }, [isSearchFocus, debouncedSearchTerm]);

    const flatListComponents = {
      mobile: BottomSheetFlatList,
      web: ThemedFlatListV2,
    };
    const FlatList =
      Platform.OS === "web"
        ? flatListComponents.web
        : flatListComponents.mobile;

    return (
      <FlatList
        testID="swap_token_selection_screen"
        data={filterLoanTokensWithBalance}
        keyExtractor={(item) => item.tokenId}
        renderItem={({ item }: { item: LoanToken }): JSX.Element => {
          const currentPrice = getPrecisedTokenValue(
            getActivePrice(item.token.symbol, item.activePrice)
          );
          return (
            <ThemedTouchableOpacityV2
              style={tailwind(
                "flex flex-row p-5 mt-2 border-0 rounded-lg-v2 items-center justify-between"
              )}
              light={tailwind("bg-mono-light-v2-00")}
              dark={tailwind("bg-mono-dark-v2-00")}
              onPress={() => {
                onPress(item);
              }}
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
                <TokenNameText
                  displaySymbol={item.token.displaySymbol}
                  name={item.token.name}
                  testID={item.token.displaySymbol}
                />
              </View>
              <View style={tailwind("flex-1 flex-wrap flex-col items-end")}>
                <NumberFormat
                  value={currentPrice}
                  thousandSeparator
                  displayType="text"
                  renderText={(value) => (
                    <ThemedTextV2
                      style={tailwind(
                        "w-full flex-wrap font-semibold-v2 text-sm text-right"
                      )}
                      testID={`select_${item.token.displaySymbol}_value`}
                    >
                      ${value}
                    </ThemedTextV2>
                  )}
                />
                <View style={tailwind("pt-1")}>
                  <NumberFormat
                    value={item.interest}
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
                    suffix={translate(
                      "components/BottomSheetLoanTokensList",
                      "% interest"
                    )}
                  />
                </View>
              </View>
            </ThemedTouchableOpacityV2>
          );
        }}
        ListHeaderComponent={
          <ThemedViewV2 style={tailwind("pt-2 pb-3")}>
            <SearchInputV2
              testID="loan_search_input"
              ref={searchRef}
              value={searchString}
              showClearButton={searchString !== ""}
              placeholder={translate(
                "components/BottomSheetLoanTokensList",
                "Search with token name"
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
            {inSearchMode && (
              <View style={tailwind("mt-5 mx-5")}>
                <ThemedTextV2
                  style={tailwind("text-xs font-normal-v2")}
                  light={tailwind("text-mono-light-v2-700")}
                  dark={tailwind("text-mono-dark-v2-700")}
                  testID="empty_search_result_text"
                >
                  {searchString.trim() === ""
                    ? translate(
                        "components/BottomSheetLoanTokensList",
                        "Search with token name"
                      )
                    : translate(
                        "components/BottomSheetLoanTokensList",
                        "Search results for “{{searchTerm}}”",
                        { searchTerm: searchString }
                      )}
                </ThemedTextV2>
              </View>
            )}
          </ThemedViewV2>
        }
        stickyHeaderIndices={[0]}
        style={tailwind({
          "bg-mono-dark-v2-100": !isLight,
          "bg-mono-light-v2-100": isLight,
          "pt-1 -mt-1": Platform.OS === "android", // Word-around fix for line showing on android
        })}
        contentContainerStyle={tailwind("px-5 pb-20")}
      />
    );
  });

function filterLoanTokensBySearchTerm(
  loanTokens: LoanToken[],
  searchTerm: string,
  isFocused: boolean
): LoanToken[] {
  if (searchTerm === "") {
    return isFocused ? [] : loanTokens;
  }
  return loanTokens.filter((t) => {
    return [t.token.displaySymbol].some((searchItem) =>
      searchItem.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
  });
}
