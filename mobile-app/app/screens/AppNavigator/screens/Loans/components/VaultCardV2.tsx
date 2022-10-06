import BigNumber from "bignumber.js";
import { ThemedTextV2, ThemedViewV2 } from "@components/themed";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { LoanParamList } from "@screens/AppNavigator/screens/Loans/LoansNavigator";
import { loanTokensSelector, LoanVault } from "@store/loans";
import {
  LoanToken,
  LoanVaultActive,
} from "@defichain/whale-api-client/dist/api/loan";
import { TouchableOpacity, View } from "react-native";
import { useVaultStatus } from "@screens/AppNavigator/screens/Loans/components/VaultStatusTag";
import { useNextCollateralizationRatio } from "@screens/AppNavigator/screens/Loans/hooks/NextCollateralizationRatio";
import { useLoanOperations } from "@screens/AppNavigator/screens/Loans/hooks/LoanOperations";
import { VaultStatus } from "@screens/AppNavigator/screens/Loans/VaultStatusTypes";
import { getPrecisedTokenValue } from "@screens/AppNavigator/screens/Auctions/helpers/precision-token-value";
import { NumericFormat as NumberFormat } from "react-number-format";
import { BottomSheetNavScreen } from "@components/BottomSheetWithNavV2";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { TokenIconGroupV2 } from "@components/TokenIconGroupV2";
import { LoanActionButton } from "./LoanActionButton";
import { VaultSectionTextRowV2 } from "./VaultSectionTextRowV2";
import { VaultBanner } from "./VaultBanner";

export interface VaultCardProps extends React.ComponentProps<any> {
  vault: LoanVault;
  testID: string;
  dismissModal: () => void;
  expandModal: () => void;
  setBottomSheetScreen: React.Dispatch<
    React.SetStateAction<BottomSheetNavScreen[]>
  >;
  setSnapPoints: React.Dispatch<
    React.SetStateAction<{
      ios: string[];
      android: string[];
    }>
  >;
  onBottomSheetLoansTokensListSelect: ({
    onPress,
    loanTokens,
  }: {
    onPress: (item: LoanToken) => void;
    loanTokens: LoanToken[];
  }) => void;
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

  const loanTokens = useSelector((state: RootState) =>
    loanTokensSelector(state.loans)
  );

  const onSelectLoanToken = (item: LoanToken) => {
    props.dismissModal();
    navigation.navigate({
      name: "BorrowLoanTokenScreen",
      params: {
        vault: vault,
        loanToken: item,
      },
      merge: true,
    });
  };

  const onBottomSheetLoansTokensListSelect = (): void => {
    props.onBottomSheetLoansTokensListSelect({
      onPress: onSelectLoanToken,
      loanTokens: loanTokens,
    });
  };

  const canUseOperations = useLoanOperations(vault?.state);
  const onCardPress = (): void => {
    navigation.navigate("VaultDetailScreen", {
      vaultId: vault.vaultId,
    });
  };

  const onAddCollateralPress = (): void => {
    navigation.navigate({
      name: "EditCollateralScreen",
      params: {
        vaultId: vault.vaultId,
      },
      merge: true,
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
          onButtonPress={onAddCollateralPress}
          vaultType={vaultDescription()[2]}
          onCardPress={onCardPress}
          testID={props.testID}
          vault={vault}
        />
      ) : (
        <TouchableOpacity onPress={onCardPress}>
          <ThemedViewV2
            dark={tailwind("bg-mono-dark-v2-00")}
            light={tailwind("bg-mono-light-v2-00")}
            style={tailwind("px-5 py-3.5 rounded-lg-v2 border-0")}
            testID={props.testID}
          >
            <View style={tailwind("flex-row items-center")}>
              <View style={tailwind("flex-col")}>
                <TokenIconGroupV2
                  testID={`${props.testID}_collateral_token_group`}
                  symbols={vault.collateralAmounts?.map(
                    (collateral) => collateral.displaySymbol
                  )}
                  maxIconToDisplay={6}
                  size={24}
                />
                <VaultSectionTextRowV2
                  customContainerStyle="mt-2"
                  testID={`${props.testID}_loan_available`}
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
                {canUseOperations && (
                  <LoanActionButton
                    label="Borrow"
                    testID="borrow_collateral"
                    style={tailwind("mt-3 px-9 bg-red-100")}
                    onPress={onBottomSheetLoansTokensListSelect}
                  />
                )}
              </View>
            </View>
          </ThemedViewV2>
        </TouchableOpacity>
      )}
    </View>
  );
}
