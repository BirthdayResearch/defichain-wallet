import { useMemo } from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";
import BigNumber from "bignumber.js";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import {
  LoanToken,
  LoanVaultActive,
} from "@defichain/whale-api-client/dist/api/loan";
import { RootState } from "@store";
import { loanTokensSelector, LoanVault } from "@store/loans";
import { LoanParamList } from "@screens/AppNavigator/screens/Loans/LoansNavigator";
import { useVaultStatus } from "@screens/AppNavigator/screens/Loans/components/VaultStatusTag";
import { VaultStatus } from "@screens/AppNavigator/screens/Loans/VaultStatusTypes";
import { getPrecisedCurrencyValue } from "@screens/AppNavigator/screens/Auctions/helpers/precision-token-value";
import { VaultCardStatus } from "@screens/AppNavigator/screens/Loans/components/VaultCardStatus";
import { ThemedTouchableOpacityV2, ThemedViewV2 } from "@components/themed";
import { BottomSheetNavScreen } from "@components/BottomSheetWithNavV2";
import { TokenIconGroupV2 } from "@components/TokenIconGroupV2";
import { BottomSheetTokenListHeader } from "@components/BottomSheetTokenListHeader";
import {
  BottomSheetTokenList,
  TokenType,
} from "@components/BottomSheetTokenList";
import { VaultSectionTextRowV2 } from "./VaultSectionTextRowV2";
import { VaultBanner } from "./VaultBanner";
import { useCollateralTokenList } from "../hooks/CollateralTokenList";

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

export function VaultCard(props: VaultCardProps): JSX.Element {
  const navigation = useNavigation<NavigationProp<LoanParamList>>();
  const vault = props.vault as LoanVaultActive;
  const vaultState = useVaultStatus(
    vault.state,
    new BigNumber(vault.informativeRatio),
    new BigNumber(vault.loanScheme.minColRatio),
    new BigNumber(vault.loanValue),
    new BigNumber(vault.collateralValue)
  );

  const { collateralTokens } = useCollateralTokenList();
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

  const onCardPress = (): void => {
    navigation.navigate("VaultDetailScreen", {
      vaultId: vault.vaultId,
    });
  };

  const onAddCollateralPress = (): void => {
    props.setSnapPoints({ ios: ["70%"], android: ["70%"] });
    props.setBottomSheetScreen([
      {
        stackScreenName: "TokenList",
        component: BottomSheetTokenList({
          tokenType: TokenType.CollateralItem,
          vault: vault,
          onTokenPress: async (item) => {
            navigation.navigate({
              name: "AddOrRemoveCollateralScreen",
              params: {
                vault,
                collateralItem: item,
                collateralTokens,
                isAdd: true,
              },
            });
            props.dismissModal();
          },
        }),
        option: {
          headerTitle: "",
          headerBackTitleVisible: false,
          headerStyle: tailwind("rounded-t-xl-v2 border-b-0"),
          header: () => (
            <BottomSheetTokenListHeader
              headerLabel={translate(
                "screens/EditCollateralScreen",
                "Select Collateral"
              )}
              onCloseButtonPress={props.dismissModal}
            />
          ),
        },
      },
    ]);
    props.expandModal();
  };

  const { isVaultEmpty, isVaultLiquidated } = useMemo(() => {
    return {
      isVaultEmpty: vaultState.status === VaultStatus.Empty,
      isVaultLiquidated: vaultState.status === VaultStatus.Liquidated,
    };
  }, [vaultState.status]);

  const vaultBanner = useMemo(() => {
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
    return { buttonLabel, text, type };
  }, [vaultState.status]);

  return (
    <View style={tailwind("mb-2")}>
      {isVaultEmpty || isVaultLiquidated ? (
        <VaultBanner
          buttonLabel={vaultBanner.buttonLabel}
          description={vaultBanner.text}
          vaultId={vault.vaultId}
          onButtonPress={onAddCollateralPress}
          vaultType={vaultBanner.type}
          onCardPress={onCardPress}
          testID={`${props.testID}_${vaultBanner.type}`}
          vault={vault}
        />
      ) : (
        <ThemedTouchableOpacityV2
          onPress={onCardPress}
          style={tailwind("border-0")}
        >
          <View style={tailwind("flex-col")}>
            <ThemedViewV2
              dark={tailwind("bg-mono-dark-v2-00")}
              light={tailwind("bg-mono-light-v2-00")}
              style={tailwind(
                "flex-row p-5 rounded-lg-v2 border-0 items-center justify-between"
              )}
              testID={props.testID}
            >
              <View style={tailwind("flex-1 flex-col pr-2")}>
                <TokenIconGroupV2
                  testID={`${props.testID}_collateral_token_group`}
                  symbols={vault.collateralAmounts?.map(
                    (collateral) => collateral.displaySymbol
                  )}
                  maxIconToDisplay={6}
                  size={24}
                />
                <VaultSectionTextRowV2
                  testID={`${props.testID}_loan_available`}
                  prefix="$"
                  value={getPrecisedCurrencyValue(vault.loanValue) ?? "-"}
                  lhs={translate("components/VaultCard", "Total loans")}
                  isOraclePrice
                  customContainerStyle="mt-3"
                />
                <VaultSectionTextRowV2
                  testID={`${props.testID}_total_collateral`}
                  prefix="$"
                  value={getPrecisedCurrencyValue(vault.collateralValue)}
                  lhs={translate("components/VaultCard", "Total collateral")}
                  isOraclePrice
                  customContainerStyle="mt-2"
                />
              </View>

              <VaultCardStatus
                vault={vault}
                vaultStatus={vaultState.status}
                colRatio={vault.informativeRatio}
                minColRatio={vault.loanScheme.minColRatio}
                onButtonPressed={onBottomSheetLoansTokensListSelect}
                testID={props.testID}
              />
            </ThemedViewV2>
          </View>
        </ThemedTouchableOpacityV2>
      )}
    </View>
  );
}
