import { ThemedScrollViewV2 } from "@components/themed";
import { StackScreenProps } from "@react-navigation/stack";
import { useStyles } from "@tailwind";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { openURL } from "@api/linking";
import {
  fetchCollateralTokens,
  loanTokensSelector,
  LoanVault,
  vaultsSelector,
} from "@store/loans";
import { WalletAlert } from "@components/WalletAlert";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import {
  LoanToken,
  LoanVaultActive,
  LoanVaultState,
  LoanVaultTokenAmount,
} from "@defichain/whale-api-client/dist/api/loan";
import BigNumber from "bignumber.js";
import { useVaultStatus } from "@screens/AppNavigator/screens/Loans/components/VaultStatusTag";
import { useNextCollateralizationRatio } from "@screens/AppNavigator/screens/Loans/hooks/NextCollateralizationRatio";
import { useLoanOperations } from "@screens/AppNavigator/screens/Loans/hooks/LoanOperations";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import { useIsFocused } from "@react-navigation/native";
import { VaultDetailStatus } from "@screens/AppNavigator/screens/Loans/VaultDetail/components/VaultDetailStatus";
import { VaultActionButtons } from "@screens/AppNavigator/screens/Loans/VaultDetail/components/VaultActionButtons";
import {
  BottomSheetWebWithNavV2,
  BottomSheetWithNavV2,
} from "@components/BottomSheetWithNavV2";
import { useBottomSheet } from "@hooks/useBottomSheet";
import { BottomSheetLoanTokensList } from "@screens/AppNavigator/screens/Loans/components/BottomSheetLoanTokensList";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { CloseVaultButton } from "@screens/AppNavigator/screens/Loans/VaultDetail/components/CloseVaultButton";
import { VaultDetailSummary } from "@screens/AppNavigator/screens/Loans/VaultDetail/components/VaultDetailSummary";
import { useMaxLoan } from "@screens/AppNavigator/screens/Loans/hooks/MaxLoanAmount";
import { BottomSheetPayBackList } from "@screens/AppNavigator/screens/Loans/components/BottomSheetPayBackList";
import { useCollateralTokenList } from "@screens/AppNavigator/screens/Loans/hooks/CollateralTokenList";
import { CollateralItem } from "@screens/AppNavigator/screens/Loans/screens/EditCollateralScreen";
import {
  BottomSheetToken,
  BottomSheetTokenList,
  TokenType,
} from "@components/BottomSheetTokenList";
import { BottomSheetTokenListHeader } from "@components/BottomSheetTokenListHeader";
import { translate } from "@translations";
import { useDeFiScanContext } from "@shared-contexts/DeFiScanContext";
import { VaultDetailLoansRow } from "./components/VaultDetailLoansRow";
import { VaultDetailCollateralsRow } from "./components/VaultDetailCollateralsRow";
import { LoanParamList } from "../LoansNavigator";

type Props = StackScreenProps<LoanParamList, "VaultDetailScreen">;

export function VaultDetailScreen({ route, navigation }: Props): JSX.Element {
  const { tailwind } = useStyles();
  const { isLight } = useThemeContext();
  const { vaultId } = route.params;
  const [vault, setVault] = useState<LoanVault>();
  const canUseOperations = useLoanOperations(vault?.state);
  const dispatch = useAppDispatch();
  const client = useWhaleApiClient();
  const blockCount = useSelector((state: RootState) => state.block.count);
  const isFocused = useIsFocused();
  const { collateralTokens } = useCollateralTokenList();
  const { getVaultsUrl } = useDeFiScanContext();

  const vaults = useSelector((state: RootState) => vaultsSelector(state.loans));
  const loanTokens = useSelector((state: RootState) =>
    loanTokensSelector(state.loans)
  );

  const inLiquidation = vault?.state === LoanVaultState.IN_LIQUIDATION;
  const totalLoanAmount = new BigNumber(
    inLiquidation || vault === undefined ? 0 : vault?.loanValue
  );
  const totalCollateralValue = new BigNumber(
    inLiquidation || vault === undefined ? 0 : vault?.collateralValue
  );
  const minColRatio = new BigNumber(
    vault === undefined ? 0 : vault?.loanScheme.minColRatio
  );
  const vaultState = useVaultStatus(
    vault?.state,
    new BigNumber(
      inLiquidation || vault === undefined ? 0 : vault?.informativeRatio
    ),
    minColRatio,
    totalLoanAmount,
    totalCollateralValue
  );
  const collateralAmounts =
    inLiquidation || vault === undefined ? [] : vault.collateralAmounts;
  const loanAmounts =
    inLiquidation || vault === undefined ? [] : vault.loanAmounts;
  const nextCollateralizationRatio = useNextCollateralizationRatio(
    collateralAmounts,
    loanAmounts
  );
  const maxLoanAmount = useMaxLoan({
    totalCollateralValue: totalCollateralValue,
    collateralAmounts: collateralAmounts,
    existingLoanValue: totalLoanAmount,
    minColRatio: minColRatio,
  });

  const [snapPoints, setSnapPoints] = useState({
    ios: ["75%"],
    android: ["70%"],
  });
  const getBottomSheetHeader = (label: string) => {
    return {
      headerStatusBarHeight: 2,
      headerTitle: "",
      headerBackTitleVisible: false,
      headerStyle: tailwind("rounded-t-xl-v2 border-b-0", {
        "bg-mono-light-v2-100": isLight,
        "bg-mono-dark-v2-100": !isLight,
      }),
      header: () => (
        <BottomSheetTokenListHeader
          headerLabel={label}
          onCloseButtonPress={dismissModal}
        />
      ),
    };
  };
  const {
    bottomSheetRef,
    containerRef,
    dismissModal,
    expandModal,
    isModalDisplayed,
    bottomSheetScreen,
    setBottomSheetScreen,
  } = useBottomSheet();

  useEffect(() => {
    const _vault = vaults.find((v) => v.vaultId === vaultId);
    if (_vault !== undefined) {
      setVault(_vault);
    }
  }, [vaults]);

  useEffect(() => {
    if (isFocused) {
      dispatch(fetchCollateralTokens({ client }));
    }
  }, [blockCount]);

  useEffect(() => {
    if (vault?.state === LoanVaultState.IN_LIQUIDATION) {
      WalletAlert({
        title: translate("components/VaultCard", "Liquidated vault"),
        message: translate(
          "screens/VaultDetailScreen",
          "Vault has been liquidated, and now available for auction. View your vault on DeFiScan for more details."
        ),
        buttons: [
          {
            text: translate("screens/Settings", "Go back"),
            style: "cancel",
            onPress: async () => {
              navigation.navigate("LoansScreen", {});
            },
          },
          {
            text: translate("screens/Settings", "View on Scan"),
            style: "destructive",
            onPress: async () => {
              openURL(getVaultsUrl(vaultId));
              navigation.navigate("LoansScreen", {});
            },
          },
        ],
      });
    }
  }, [vault?.state]);

  const onAddPressed = () => {
    if (vault === undefined) {
      return;
    }

<<<<<<< HEAD
function VaultIdSection({
  vault,
  testID,
}: {
  vault: LoanVault;
  testID: string;
}): JSX.Element {
  const { tailwind } = useStyles();
  const { getVaultsUrl } = useDeFiScanContext();
  const colRatio =
    vault.state === LoanVaultState.IN_LIQUIDATION ? 0 : vault.informativeRatio;
  const totalLoanAmount =
    vault.state === LoanVaultState.IN_LIQUIDATION ? 0 : vault.loanValue;
  const totalCollateralValue =
    vault.state === LoanVaultState.IN_LIQUIDATION ? 0 : vault.collateralValue;
  const vaultState = useVaultStatus(
    vault.state,
    new BigNumber(colRatio),
    new BigNumber(vault.loanScheme.minColRatio),
    new BigNumber(totalLoanAmount),
    new BigNumber(totalCollateralValue)
  );
  const collateralAmounts =
    vault.state === LoanVaultState.IN_LIQUIDATION
      ? []
      : vault.collateralAmounts;
  const loanAmounts =
    vault.state === LoanVaultState.IN_LIQUIDATION ? [] : vault.loanAmounts;
  const nextCollateralizationRatio = useNextCollateralizationRatio(
    collateralAmounts,
    loanAmounts
  );
  return (
    <>
      <ThemedView
        light={tailwind("bg-white")}
        dark={tailwind("bg-gray-800")}
        style={tailwind("flex flex-row items-center")}
      >
        <View style={tailwind("flex flex-1")}>
          <View style={tailwind("flex flex-row mb-2 items-center")}>
            <ThemedText
              light={tailwind("text-gray-400")}
              dark={tailwind("text-gray-500")}
              style={tailwind("text-xs mr-1")}
            >
              {translate("screens/VaultDetailScreen", "Vault ID")}
            </ThemedText>
            <VaultStatusTag
              status={vaultState.status}
              testID="vault_detail_status"
            />
          </View>
          <View style={tailwind("flex flex-row mb-2 items-center")}>
            <ThemedText
              testID="vault_detail_id"
              style={tailwind("text-sm font-semibold w-8/12 flex-1 mr-2")}
            >
              {vault.vaultId}
            </ThemedText>
            <TouchableOpacity
              onPress={async () =>
                await openURL(getVaultsUrl(vault.vaultId ?? ""))
              }
            >
              <ThemedIcon
                dark={tailwind("text-darkprimary-500")}
                iconType="MaterialIcons"
                light={tailwind("text-primary-500")}
                name="open-in-new"
                size={22}
                style={tailwind("-mr-1")}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
      {vault.state !== LoanVaultState.IN_LIQUIDATION &&
        vaultState.status !== VaultStatus.Empty &&
        vaultState.status !== VaultStatus.Ready && (
          <CollateralizationRatioDisplay
            collateralizationRatio={vault.informativeRatio}
            minCollateralizationRatio={vault.loanScheme.minColRatio}
            totalLoanAmount={vault.loanValue}
            nextCollateralizationRatio={nextCollateralizationRatio?.toFixed(8)}
            testID={testID}
          />
        )}
    </>
  );
}

function VaultInfoSection(props: { vault?: LoanVault }): JSX.Element | null {
  const { tailwind } = useStyles();
  if (props.vault === undefined) {
    return null;
  }
=======
    setSnapPoints({
      ios: ["75%"],
      android: ["70%"],
    });
    setBottomSheetScreen([
      {
        stackScreenName: "TokenList",
        component: BottomSheetTokenList({
          tokenType: TokenType.CollateralItem,
          vault: vault as LoanVaultActive,
          onTokenPress: async (item) => {
            dismissModal();
            navigateToAddRemoveCollateralScreen(item, true);
          },
        }),
        option: getBottomSheetHeader(
          translate("screens/EditCollateralScreen", "Select Collateral")
        ),
      },
    ]);
    expandModal();
  };

  const navigateToAddRemoveCollateralScreen = (
    collateralItem: CollateralItem | BottomSheetToken,
    isAdd: boolean
  ) => {
    const addOrRemoveParams = {
      vault: vault as LoanVaultActive,
      collateralItem,
      collateralTokens,
      isAdd,
    };
>>>>>>> 5c28d60af3872d5c833e2d689a45052416e1ed2a

    navigation.navigate({
      name: "AddOrRemoveCollateralScreen",
      params: addOrRemoveParams,
    });
  };

  const onBorrowPressed = () => {
    setSnapPoints({
      ios: ["75%"],
      android: ["70%"],
    });
    setBottomSheetScreen([
      {
        stackScreenName: "LoanTokensList",
        component: BottomSheetLoanTokensList({
          onPress: (item: LoanToken) => {
            dismissModal();
            navigation.navigate({
              name: "BorrowLoanTokenScreen",
              params: {
                vault: vault,
                loanToken: item,
              },
              merge: true,
            });
          },
          loanTokens,
          isLight,
        }),
        option: getBottomSheetHeader(
          translate("components/BottomSheetLoanTokensList", "Select Token")
        ),
      },
    ]);
    expandModal();
  };

  const onPayPressed = () => {
    if (vault === undefined || vault.state === LoanVaultState.IN_LIQUIDATION) {
      return;
    }

    setSnapPoints({
      ios: ["65%"],
      android: ["60%"],
    });
    setBottomSheetScreen([
      {
        stackScreenName: "PayTokensList",
        component: BottomSheetPayBackList({
          onPress: (
            item: LoanVaultTokenAmount,
            isPayDUSDUsingCollateral: boolean
          ) => {
            dismissModal();
            navigateToPayScreen(item, isPayDUSDUsingCollateral);
          },
          vault: vault,
          data: vault.loanAmounts,
          isLight: isLight,
        }),
        option: getBottomSheetHeader(
          translate("screens/VaultDetailScreen", "Select Loan")
        ),
      },
    ]);
    expandModal();
  };

  const navigateToPayScreen = (
    loanToken: LoanVaultTokenAmount,
    isPayDUSDUsingCollateral: boolean
  ) => {
    navigation.navigate({
      name: "PaybackLoanScreen",
      merge: true,
      params: {
        vault: vault,
        loanTokenAmount: loanToken,
        isPaybackDUSDUsingCollateral: isPayDUSDUsingCollateral,
      },
    });
  };

  const onEditPressed = () => {
    if (vault === undefined) {
      return;
    }

    navigation.navigate({
      name: "EditLoanSchemeScreen",
      params: {
        vaultId: vault.vaultId,
      },
      merge: true,
    });
  };

  const onCloseVaultPressed = () => {
    if (vault === undefined) {
      return;
    }

    navigation.navigate({
      name: "CloseVaultScreen",
      params: {
        vaultId: vault.vaultId,
      },
      merge: true,
    });
  };

  if (vault === undefined) {
    return <></>;
  }

  return (
    <View ref={containerRef} style={tailwind("flex-1")}>
      <ThemedScrollViewV2 contentContainerStyle={tailwind("w-full pb-12")}>
        <VaultDetailStatus
          vault={vault}
          vaultStatus={vaultState?.status}
          nextColRatio={nextCollateralizationRatio}
        />
        <VaultActionButtons
          vaultStatus={vaultState?.status}
          canUseOperations={canUseOperations}
          onAddPressed={onAddPressed}
          onBorrowPressed={onBorrowPressed}
          onPayPressed={onPayPressed}
          onEditPressed={onEditPressed}
        />
        <VaultDetailSummary
          maxLoanAmount={maxLoanAmount}
          totalCollateral={totalCollateralValue}
          totalLoan={totalLoanAmount}
          vaultId={vaultId}
          interest={vault?.loanScheme?.interestRate}
          minColRatio={vault?.loanScheme?.minColRatio}
        />
        <VaultDetailCollateralsRow
          vault={vault}
          collateralTokens={collateralTokens}
          vaultStatus={vaultState?.status}
          onAddPress={(collateralItem) => {
            navigateToAddRemoveCollateralScreen(collateralItem, true);
          }}
          onRemovePress={(collateralItem) => {
            navigateToAddRemoveCollateralScreen(collateralItem, false);
          }}
        />
        <VaultDetailLoansRow onPay={navigateToPayScreen} vault={vault} />
        <CloseVaultButton
          vaultStatus={vaultState?.status}
          canUseOperations={canUseOperations}
          onCloseVaultPressed={onCloseVaultPressed}
        />

        {Platform.OS === "web" ? (
          <BottomSheetWebWithNavV2
            modalRef={containerRef}
            screenList={bottomSheetScreen}
            isModalDisplayed={isModalDisplayed}
            // eslint-disable-next-line react-native/no-inline-styles
            modalStyle={{
              position: "absolute",
              bottom: "0",
              height: "404px",
              width: "375px",
              zIndex: 50,
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
              overflow: "hidden",
            }}
          />
        ) : (
          <BottomSheetWithNavV2
            modalRef={bottomSheetRef}
            screenList={bottomSheetScreen}
            snapPoints={snapPoints}
          />
        )}
      </ThemedScrollViewV2>
    </View>
  );
}
