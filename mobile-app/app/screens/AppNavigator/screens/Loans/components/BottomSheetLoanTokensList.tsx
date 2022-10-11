import {
  ThemedFlatListV2,
  ThemedTouchableOpacityV2,
  ThemedTextV2,
} from "@components/themed";
import { LoanToken } from "@defichain/whale-api-client/dist/api/loan";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { memo } from "react";
import * as React from "react";
import { NumericFormat as NumberFormat } from "react-number-format";
import { SearchInputV2 } from "@components/SearchInputV2";
import { TextInput } from "react-native-gesture-handler";
import { debounce } from "lodash";
import { Platform, View } from "react-native";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
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
    const searchRef = React.useRef<TextInput>();
    const [searchString, setSearchString] = React.useState("");
    const [isSearchFocus, setIsSearchFocus] = React.useState(false);
    const [filteredLoanTokens, setFilteredLoanTokens] =
      React.useState(loanTokens);

    const handleFilter = React.useCallback(
      debounce((searchString: string) => {
        setFilteredLoanTokens(
          loanTokens.filter((loanToken) =>
            loanToken.token.displaySymbol
              .toLowerCase()
              .includes(searchString.trim().toLowerCase())
          )
        );
      }, 250),
      [loanTokens]
    );

    const inSearchMode = React.useMemo(() => {
      return isSearchFocus || searchString !== "";
    }, [isSearchFocus, searchString]);

    const flatListComponents = {
      mobile: BottomSheetFlatList,
      web: ThemedFlatListV2,
    };
    const FlatList =
      Platform.OS === "web"
        ? flatListComponents.web
        : flatListComponents.mobile;

    React.useEffect(() => {
      handleFilter(searchString);
    }, [searchString]);

    const LoansListItem = React.useCallback(
      ({ item }: { item: LoanToken }): JSX.Element => {
        const currentPrice = getPrecisedTokenValue(
          getActivePrice(item.token.symbol, item.activePrice)
        );
        return (
          <ThemedTouchableOpacityV2
            style={tailwind(
              "flex flex-row p-5 mb-2 border-0 rounded-lg-v2 items-center justify-between"
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
                  suffix="% interest"
                />
              </View>
            </View>
          </ThemedTouchableOpacityV2>
        );
      },
      []
    );
    return (
      <FlatList
        contentContainerStyle={tailwind("px-5 pb-15 flex-1", {
          "bg-mono-light-v2-100": isLight,
          "bg-mono-dark-v2-100": !isLight,
        })}
        testID="swap_token_selection_screen"
        data={filteredLoanTokens}
        keyExtractor={(item) => item.tokenId}
        renderItem={LoansListItem}
        ListHeaderComponent={
          <View style={tailwind("pb-5")}>
            <ThemedTextV2
              style={tailwind("text-xl font-normal-v2 pb-5")}
              light={tailwind("text-mono-light-v2-900")}
              dark={tailwind("text-mono-dark-v2-900")}
              testID="empty_search_result_text"
            >
              {translate("screens/SwapTokenSelectionScreen", "Select Token")}
            </ThemedTextV2>
            <SearchInputV2
              ref={searchRef}
              value={searchString}
              showClearButton={searchString !== ""}
              placeholder={translate(
                "screens/LoansScreen",
                "Search available loan tokens"
              )}
              containerStyle={tailwind("", [
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
          </View>
        }
      />
    );
  });
