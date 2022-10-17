import { memo } from "react";
import * as React from "react";
import { tailwind } from "@tailwind";
import { Platform, View } from "react-native";
import { NumericFormat as NumberFormat } from "react-number-format";
import BigNumber from "bignumber.js";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { AddOrRemoveCollateralResponse } from "@screens/AppNavigator/screens/Loans/components/AddOrRemoveCollateralForm";
import { CollateralItem } from "@screens/AppNavigator/screens/Loans/screens/EditCollateralScreen";
import { LoanVaultActive } from "@defichain/whale-api-client/dist/api/loan";
import { useTokenPrice } from "@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice";
import { getActivePrice } from "@screens/AppNavigator/screens/Auctions/helpers/ActivePrice";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { ActiveUSDValueV2 } from "@screens/AppNavigator/screens/Loans/VaultDetail/components/ActiveUSDValueV2";
import { BottomSheetWithNavRouteParam } from "./BottomSheetWithNav";
import {
  ThemedFlatListV2,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
} from "./themed";
import { CollateralFactorTag } from "./CollateralFactorTag";
import { SymbolIcon } from "./SymbolIcon";

interface BottomSheetTokenListProps {
  onTokenPress?: (token: CollateralItem | BottomSheetToken) => void;
  navigateToScreen?: {
    screenName: string;
    onButtonPress?: (item: AddOrRemoveCollateralResponse) => void;
  };
  tokens: Array<CollateralItem | BottomSheetToken>;
  vault?: LoanVaultActive;
  tokenType: TokenType;
  isOraclePrice?: boolean;
}

export interface BottomSheetToken {
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

export enum TokenType {
  BottomSheetToken = "BottomSheetToken",
  CollateralItem = "CollateralItem",
}

export const BottomSheetTokenList = ({
  onTokenPress,
  navigateToScreen,
  tokens,
  vault,
  tokenType,
  isOraclePrice,
}: BottomSheetTokenListProps): React.MemoExoticComponent<() => JSX.Element> =>
  memo(() => {
    const collateralTokens = useSelector(
      (state: RootState) => state.loans.collateralTokens
    );
    const { isLight } = useThemeContext();
    const navigation =
      useNavigation<NavigationProp<BottomSheetWithNavRouteParam>>();
    const flatListComponents = {
      mobile: BottomSheetFlatList,
      web: ThemedFlatListV2,
    };
    const FlatList =
      Platform.OS === "web"
        ? flatListComponents.web
        : flatListComponents.mobile;
    const { getTokenPrice } = useTokenPrice();

    function isCollateralItem(
      item: CollateralItem | BottomSheetToken
    ): item is CollateralItem {
      return (item as CollateralItem).activateAfterBlock !== undefined;
    }

    return (
      <FlatList
        testID="bottom_sheet_token_list"
        data={tokens}
        renderItem={({
          item,
        }: {
          item: CollateralItem | BottomSheetToken;
        }): JSX.Element => {
          const activePrice =
            tokenType === TokenType.CollateralItem
              ? new BigNumber(
                  getActivePrice(
                    item.token.symbol,
                    (item as CollateralItem)?.activePrice,
                    (item as CollateralItem).factor,
                    "ACTIVE",
                    "COLLATERAL"
                  )
                )
              : getTokenPrice(
                  item.token.symbol,
                  new BigNumber("1"),
                  item.token.isLPS
                );
          return (
            <ThemedTouchableOpacityV2
              disabled={new BigNumber(item.available).lte(0)}
              onPress={() => {
                if (onTokenPress !== undefined) {
                  onTokenPress(item);
                }
                if (navigateToScreen !== undefined) {
                  navigation.navigate({
                    name: navigateToScreen.screenName,
                    params: {
                      token: item.token,
                      activePrice,
                      available: item.available.toFixed(8),
                      onButtonPress: navigateToScreen.onButtonPress,
                      collateralFactor: new BigNumber(item.factor ?? 0).times(
                        100
                      ),
                      isAdd: true,
                      vault,
                      collateralTokens,
                      ...(isCollateralItem(item) && { collateralItem: item }),
                    },
                    merge: true,
                  });
                }
              }}
              style={tailwind(
                "px-5 py-4.5 flex flex-row items-start justify-between mt-2 rounded-lg-v2",
                {
                  "opacity-30": new BigNumber(item.available).lte(0),
                }
              )}
              light={tailwind("bg-mono-light-v2-00")}
              dark={tailwind("bg-mono-dark-v2-00")}
              testID={`select_${item.token.displaySymbol}`}
            >
              <View style={tailwind("w-7/12 flex flex-row items-center")}>
                <SymbolIcon
                  symbol={item.token.displaySymbol}
                  styleProps={tailwind("w-9 h-9")}
                />
                <View style={tailwind("ml-2 flex-auto")}>
                  <View style={tailwind("flex flex-row")}>
                    <ThemedTextV2
                      testID={`token_symbol_${item.token.displaySymbol}`}
                      style={tailwind("text-sm font-semibold-v2")}
                      light={tailwind("text-mono-light-v2-900")}
                      dark={tailwind("text-mono-dark-v2-900")}
                    >
                      {item.token.displaySymbol}
                    </ThemedTextV2>
                    <View style={tailwind("ml-1")}>
                      <CollateralFactorTag factor={item.factor} />
                    </View>
                  </View>
                  <ThemedTextV2
                    light={tailwind("text-mono-light-v2-700")}
                    dark={tailwind("text-mono-dark-v2-700")}
                    style={tailwind([
                      "text-xs font-normal-v2 mt-1",
                      { hidden: item.token.name === "" },
                    ])}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.token.name}
                  </ThemedTextV2>
                </View>
              </View>
              <View style={tailwind("w-5/12 flex flex-row items-center")}>
                <View style={tailwind("flex flex-1")}>
                  <NumberFormat
                    value={item.available.toFixed(8)}
                    thousandSeparator
                    displayType="text"
                    renderText={(value) => (
                      <ThemedTextV2
                        style={tailwind("text-sm font-semibold-v2 text-right")}
                        light={tailwind("text-mono-light-v2-900")}
                        dark={tailwind("text-mono-dark-v2-900")}
                        testID={`select_${item.token.displaySymbol}_value`}
                      >
                        {value}
                      </ThemedTextV2>
                    )}
                  />
                  <ActiveUSDValueV2
                    price={new BigNumber(item.available).multipliedBy(
                      activePrice
                    )}
                    containerStyle={tailwind("justify-end mt-1")}
                    isOraclePrice={isOraclePrice}
                  />
                </View>
              </View>
            </ThemedTouchableOpacityV2>
          );
        }}
        keyExtractor={(item) => item.tokenId}
        style={tailwind({
          "bg-mono-dark-v2-100": !isLight,
          "bg-mono-light-v2-100": isLight,
          "pt-1 -mt-1": Platform.OS === "android", // Word-around fix for line showing on android
        })}
        contentContainerStyle={tailwind("px-5 pb-20")}
      />
    );
  });
