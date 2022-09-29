import BigNumber from "bignumber.js";
import {
  ThemedIcon,
  ThemedText,
  ThemedTextV2,
  ThemedTouchableOpacity,
  ThemedView,
  ThemedViewV2,
} from "@components/themed";
import { tailwind } from "@tailwind";
import { View } from "@components";
import { translate } from "@translations";
import { TokenIconGroupV2 } from "@components/TokenIconGroup";
import { IconButton } from "@components/IconButton";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { LoanParamList } from "@screens/AppNavigator/screens/Loans/LoansNavigator";
import { LoanVault } from "@store/loans";
import { LoanVaultActive } from "@defichain/whale-api-client/dist/api/loan";
import { TouchableOpacity } from "react-native";
import { openURL } from "@api/linking";
import { useDeFiScanContext } from "@shared-contexts/DeFiScanContext";
import { useVaultStatus } from "@screens/AppNavigator/screens/Loans/components/VaultStatusTag";
import { useNextCollateralizationRatio } from "@screens/AppNavigator/screens/Loans/hooks/NextCollateralizationRatio";
import { CollateralizationRatioDisplay } from "@screens/AppNavigator/screens/Loans/components/CollateralizationRatioDisplay";
import { TabKey } from "@screens/AppNavigator/screens/Loans/VaultDetail/components/VaultDetailTabSection";
import { useLoanOperations } from "@screens/AppNavigator/screens/Loans/hooks/LoanOperations";
import { VaultStatus } from "@screens/AppNavigator/screens/Loans/VaultStatusTypes";
import { getPrecisedTokenValue } from "@screens/AppNavigator/screens/Auctions/helpers/precision-token-value";
import { ButtonV2 } from "@components/ButtonV2";
import { NumericFormat as NumberFormat } from "react-number-format";
import { VaultBanner } from "./VaultBanner";
import { VaultSectionTextRowV2 } from "./VaultSectionTextRowV2";

export interface VaultCardProps extends React.ComponentProps<any> {
  vault: LoanVault;
  testID: string;
}

export function VaultCardV2(props: VaultCardProps): JSX.Element {
  const navigation = useNavigation<NavigationProp<LoanParamList>>();
  const vault = props.vault as LoanVaultActive;
  const vaultState = useVaultStatus(
    vault.state,
    new BigNumber(vault.informativeRatio),
    new BigNumber(vault.loanScheme.minColRatio),
    new BigNumber(vault.loanValue),
    new BigNumber(vault.collateralValue)
  );
  const nextCollateralizationRatio = useNextCollateralizationRatio(
    vault.collateralAmounts,
    vault.loanAmounts
  );
  const canUseOperations = useLoanOperations(vault?.state);
  const onCardPress = (): void => {
    navigation.navigate("VaultDetailScreen", {
      vaultId: vault.vaultId,
    });
  };
  // TODO: go to borrow screen instead of VaultDetailScreen
  const onBorrowPress = (): void => {
    navigation.navigate("VaultDetailScreen", {
      vaultId: vault.vaultId,
    });
  };
  const vaultEmpty = vaultState.status === VaultStatus.Empty;
  const vaultLiquidated = vaultState.status === VaultStatus.Liquidated;
  function vaultDescription(): string[] {
    let text = "";
    let type = "";
    let buttonLabel = "";
    switch (vaultState.status) {
      case VaultStatus.Liquidated:
        text = "Liquidated vault";
        type = VaultStatus.Liquidated;
        break;
      case VaultStatus.Empty:
        text = "Add collateral to borrow";
        type = VaultStatus.Empty;
        buttonLabel = "Add Collateral";
        break;
      default:
        break;
    }
    return [buttonLabel, text, type];
  }
  return (
    <View style={tailwind("mb-2")}>
      {vaultEmpty || vaultLiquidated ? (
        <VaultBanner
          buttonLabel={vaultDescription()[0]}
          description={vaultDescription()[1]}
          vaultId={vault.vaultId}
          onButtonPress={onBorrowPress}
          vaultType={vaultDescription()[2]}
          onCardPress={onCardPress}
        />
      ) : (
        <TouchableOpacity onPress={onCardPress}>
          <ThemedViewV2
            dark={tailwind("bg-mono-dark-v2-00")}
            light={tailwind("bg-mono-light-v2-00")}
            style={tailwind("px-5 py-4.5 rounded-lg-v2 border-0")}
            testID="vault_card"
          >
            <View style={tailwind("flex-row items-center")}>
              <View style={tailwind("flex-col")}>
                <TokenIconGroupV2
                  testID={`${props.testID}_collateral_token_group`}
                  symbols={vault.collateralAmounts?.map(
                    (collateral) => collateral.displaySymbol
                  )}
                  maxIconToDisplay={5}
                />
                <VaultSectionTextRowV2
                  testID={`${props.testID}_total_loan`}
                  prefix={
                    VaultStatus.Liquidated === vaultState.status ? "" : "$"
                  }
                  value={
                    VaultStatus.Liquidated === vaultState.status
                      ? "-"
                      : getPrecisedTokenValue(vault.loanValue) ?? "-"
                  }
                  lhs={translate("components/VaultCard", "Loan Available")}
                  isOraclePrice
                />
                <VaultSectionTextRowV2
                  testID={`${props.testID}_total_collateral`}
                  prefix={
                    VaultStatus.Liquidated === vaultState.status ? "" : "$"
                  }
                  value={
                    VaultStatus.Liquidated === vaultState.status
                      ? "-"
                      : getPrecisedTokenValue(vault.collateralValue)
                  }
                  lhs={translate("components/VaultCard", "Total collateral")}
                  isOraclePrice
                />
              </View>

              <View style={tailwind("flex-1 items-end")}>
                <ThemedTextV2
                  ellipsizeMode="middle"
                  numberOfLines={1}
                  style={[
                    tailwind("text-sm text-right"),
                    { minWidth: 10, maxWidth: 124 },
                  ]}
                  dark={tailwind("text-mono-dark-v2-700")}
                  light={tailwind("text-mono-light-v2-700")}
                >
                  {vault.vaultId}
                </ThemedTextV2>
                <NumberFormat
                  value={nextCollateralizationRatio?.toFixed(2)}
                  decimalScale={2}
                  thousandSeparator
                  displayType="text"
                  suffix="%"
                  renderText={(value) => (
                    <ThemedTextV2
                      dark={tailwind("text-mono-dark-v2-900")}
                      light={tailwind("text-mono-light-v2-900")}
                      style={tailwind("font-normal-v2 text-sm")}
                      testID={`${props.testID}_min_ratio`}
                    >
                      {value}
                    </ThemedTextV2>
                  )}
                />
                {/* TODO: CTA style for borrow button */}
                <ButtonV2
                  styleProps="mt-3 text-sm"
                  label="Borrow"
                  onPress={() => {
                    // TODO: should show to bottom sheet token list
                    navigation.navigate("VaultDetailScreen", {
                      vaultId: vault.vaultId,
                      tab: TabKey.Loans,
                    });
                  }}
                  testID="borrow_collateral"
                />
              </View>
            </View>
          </ThemedViewV2>
        </TouchableOpacity>
      )}
    </View>
  );
}
