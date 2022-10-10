import { View } from "@components";
import {
  ThemedFlatListV2,
  ThemedTouchableOpacityV2,
  ThemedTextV2,
} from "@components/themed";
import { LoanToken } from "@defichain/whale-api-client/dist/api/loan";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { memo } from "react";
import { Platform } from "react-native";
import * as React from "react";
import { NumericFormat as NumberFormat } from "react-number-format";
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
}): React.MemoExoticComponent<() => JSX.Element> => {
  const flatListComponents = {
    mobile: BottomSheetFlatList,
    web: ThemedFlatListV2,
  };
  const FlatList =
    Platform.OS === "web" ? flatListComponents.web : flatListComponents.mobile;
  return memo(() => {
    return (
      <FlatList
        contentContainerStyle={tailwind("px-5 pb-12", {
          "bg-mono-light-v2-100": isLight,
          "bg-mono-dark-v2-100": !isLight,
        })}
        testID="swap_token_selection_screen"
        data={loanTokens}
        keyExtractor={(item) => item.tokenId}
        renderItem={({ item }: { item: LoanToken }): JSX.Element => {
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
        }}
        ListHeaderComponent={
          <ThemedTextV2
            style={tailwind("text-xl font-normal-v2 pb-4")}
            light={tailwind("text-mono-light-v2-900")}
            dark={tailwind("text-mono-dark-v2-900")}
            testID="empty_search_result_text"
          >
            {translate("screens/SwapTokenSelectionScreen", "Select Token")}
          </ThemedTextV2>
        }
      />
    );
  });
};
