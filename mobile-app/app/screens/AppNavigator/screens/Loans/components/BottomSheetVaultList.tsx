import { View } from "@components";
import {
  ThemedIcon,
  ThemedFlatList,
  ThemedViewV2,
  ThemedTouchableOpacityV2,
  ThemedTextV2,
} from "@components/themed";
import {
  LoanVaultActive,
  LoanVaultState,
} from "@defichain/whale-api-client/dist/api/loan";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { LoanVault } from "@store/loans";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { memo } from "react";
import * as React from "react";
import { Platform } from "react-native";
import BigNumber from "bignumber.js";
import { NumericFormat } from "react-number-format";
import { CollateralizationRatio } from "./CollateralizationRatio";

interface BottomSheetVaultListProps {
  headerLabel: string;
  onCloseButtonPress: () => void;
  onVaultPress: (vault: LoanVaultActive) => void;
  navigateToScreen?: {
    screenName: string;
    onButtonPress: () => void;
  };
  selectedVault?: LoanVault;
  vaults: LoanVault[];
}

export const BottomSheetVaultList = ({
  headerLabel,
  onCloseButtonPress,
  onVaultPress,
  selectedVault,
  vaults,
}: BottomSheetVaultListProps): React.MemoExoticComponent<() => JSX.Element> =>
  memo(() => {
    const { isLight } = useThemeContext();
    const flatListComponents = {
      mobile: BottomSheetFlatList,
      web: ThemedFlatList,
    };
    const FlatList =
      Platform.OS === "web"
        ? flatListComponents.web
        : flatListComponents.mobile;

    // Remove halted, liquidated vault then sort in ascending order of col ratio
    const filteredVaults = React.useMemo(() => {
      const _vaults = vaults.filter((vault) => {
        return (
          vault.state !== LoanVaultState.IN_LIQUIDATION &&
          vault.state !== LoanVaultState.FROZEN &&
          vault.state !== LoanVaultState.UNKNOWN &&
          vault.collateralAmounts.length !== 0
        );
      }) as LoanVaultActive[];

      return _vaults.sort((a, b) => {
        const _a = new BigNumber(a.informativeRatio);
        const _b = new BigNumber(b.informativeRatio);
        if (_a.isNegative() && _b.isNegative()) {
          return 0;
        } else if (_a.isNegative() || _a.isLessThanOrEqualTo(_b)) {
          return -1;
        } else {
          return 1;
        }
      });
    }, [vaults]);
    return (
      <FlatList
        data={filteredVaults}
        renderItem={({
          item,
          index,
        }: {
          item: LoanVaultActive;
          index: number;
        }): JSX.Element => {
          return (
            <ThemedTouchableOpacityV2
              onPress={() => {
                onVaultPress(item);
              }}
              testID={`select_vault_${index}`}
              style={tailwind(
                "px-5 py-4.5 mb-2 flex flex-row items-center rounded-lg-v2"
              )}
              light={tailwind("bg-mono-light-v2-00")}
              dark={tailwind("bg-mono-dark-v2-00")}
            >
              <View style={tailwind("w-6/12")}>
                <ThemedTextV2
                  ellipsizeMode="middle"
                  numberOfLines={1}
                  style={tailwind("text-sm font-semibold-v2 mb-1")}
                >
                  {item.vaultId}
                </ThemedTextV2>
                <NumericFormat
                  value={item.loanScheme.interestRate}
                  thousandSeparator
                  displayType="text"
                  renderText={(value) => (
                    <ThemedTextV2
                      style={tailwind("text-xs font-normal-v2")}
                      light={tailwind("text-mono-light-v2-700")}
                      dark={tailwind("text-mono-dark-v2-700")}
                    >
                      {translate("", "{{value}}% interest", { value })}
                    </ThemedTextV2>
                  )}
                />
              </View>
              {selectedVault && selectedVault.vaultId === item.vaultId && (
                <ThemedIcon
                  style={tailwind("h-full mt-0.5")}
                  light={tailwind("text-green-v2")}
                  dark={tailwind("text-green-v2")}
                  iconType="MaterialIcons"
                  name="check-circle"
                  size={18}
                  testID="playground_status_indicator"
                />
              )}
              <View style={tailwind("flex-1")}>
                <View style={tailwind("flex items-end")}>
                  <CollateralizationRatio
                    totalLoanAmount={new BigNumber(item.loanValue)}
                    colRatio={new BigNumber(item.collateralRatio)}
                    minColRatio={new BigNumber(item.loanScheme.minColRatio)}
                  />
                  <NumericFormat
                    value={item.loanScheme.minColRatio}
                    thousandSeparator
                    displayType="text"
                    renderText={(value) => (
                      <ThemedTextV2
                        style={tailwind("text-xs font-normal-v2 mt-1")}
                        light={tailwind("text-mono-light-v2-700")}
                        dark={tailwind("text-mono-dark-v2-700")}
                      >
                        {translate("", "min. {{value}}%", { value })}
                      </ThemedTextV2>
                    )}
                  />
                </View>
              </View>
            </ThemedTouchableOpacityV2>
          );
        }}
        ListHeaderComponent={
          <ThemedViewV2 style={tailwind("py-5")}>
            <View style={tailwind("w-full flex-row justify-end")}>
              <ThemedTouchableOpacityV2
                onPress={onCloseButtonPress}
                style={tailwind("border-0")}
              >
                <ThemedIcon iconType="Feather" name="x-circle" size={22} />
              </ThemedTouchableOpacityV2>
            </View>
            <ThemedTextV2 style={tailwind("text-xl font-normal-v2")}>
              {headerLabel}
            </ThemedTextV2>
          </ThemedViewV2>
        }
        stickyHeaderIndices={[0]}
        keyExtractor={(item) => item.vaultId}
        style={tailwind(
          {
            "bg-mono-dark-v2-100": !isLight,
            "bg-mono-light-v2-100": isLight,
          },
          "rounded-t-xl-v2"
        )}
        contentContainerStyle={tailwind("p-5 pt-0")}
      />
    );
  });
