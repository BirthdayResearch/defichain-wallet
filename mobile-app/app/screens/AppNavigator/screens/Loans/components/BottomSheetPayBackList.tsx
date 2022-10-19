import { ThemedFlatListV2, ThemedTextV2 } from "@components/themed";
import {
  LoanVaultActive,
  LoanVaultTokenAmount,
} from "@defichain/whale-api-client/dist/api/loan";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import * as React from "react";
import { memo } from "react";
import { Platform } from "react-native";
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
        style={tailwind("px-5 pb-12", {
          "bg-mono-light-v2-100": isLight,
          "bg-mono-dark-v2-100": !isLight,
        })}
        testID="swap_token_selection_screen"
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: LoanVaultTokenAmount }) => {
          return (
            <PayLoanCard
              key={item.id}
              symbol={item.symbol}
              displaySymbol={item.displaySymbol}
              amount={item.amount}
              interestAmount={
                vault.interestAmounts.find(
                  (interest) => interest.symbol === item.symbol
                )?.amount
              }
              vaultState={vault.state}
              vault={vault}
              loanToken={item}
              onPay={() => onPress(item, false)}
              onPaybackDUSD={() => onPress(item, true)}
            />
          );
        }}
        ListHeaderComponent={
          <ThemedTextV2
            style={tailwind("text-xl font-normal-v2 pb-5")}
            light={tailwind("text-mono-light-v2-900")}
            dark={tailwind("text-mono-dark-v2-900")}
          >
            {translate("screens/VaultDetailScreen", "Select Loan")}
          </ThemedTextV2>
        }
      />
    );
  });
