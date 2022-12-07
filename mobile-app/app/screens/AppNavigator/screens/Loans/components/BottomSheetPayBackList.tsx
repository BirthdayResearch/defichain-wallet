import { ThemedFlatListV2 } from "@components/themed";
import {
  LoanVaultActive,
  LoanVaultTokenAmount,
} from "@defichain/whale-api-client/dist/api/loan";
import { useStyles } from "@tailwind";
import * as React from "react";
import { memo } from "react";
import { ListRenderItemInfo, Platform } from "react-native";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { PayLoanCard } from "@screens/AppNavigator/screens/Loans/components/PayLoanCard";

export const BottomSheetPayBackList = ({
  onPress,
  vault,
  data,
  isLight,
}: {
  onPress: (
    item: LoanVaultTokenAmount,
    isPayDUSDUsingCollateral: boolean
  ) => void;
  vault: LoanVaultActive;
  data: LoanVaultTokenAmount[];
  isLight: boolean;
}): React.MemoExoticComponent<() => JSX.Element> =>
  memo(() => {
    const { tailwind } = useStyles();
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
        style={tailwind("px-5 pb-12 pt-2", {
          "bg-mono-light-v2-100": isLight,
          "bg-mono-dark-v2-100": !isLight,
        })}
        testID="swap_token_selection_screen"
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: ListRenderItemInfo<LoanVaultTokenAmount>) => {
          return (
            <PayLoanCard
              key={item.id}
              displaySymbol={item.displaySymbol}
              amount={item.amount}
              interestAmount={
                vault.interestAmounts.find(
                  (interest) => interest.symbol === item.symbol
                )?.amount
              }
              vaultState={vault.state}
              vault={vault}
              onPay={() => onPress(item, false)}
              onPaybackDUSD={() => onPress(item, true)}
            />
          );
        }}
      />
    );
  });
