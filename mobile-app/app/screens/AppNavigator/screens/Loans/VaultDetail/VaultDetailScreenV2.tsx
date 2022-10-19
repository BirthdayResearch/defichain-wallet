import {
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedTouchableOpacityV2,
} from "@components/themed";
import { StackScreenProps } from "@react-navigation/stack";
import { tailwind } from "@tailwind";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import {
  fetchCollateralTokens,
  loanTokensSelector,
  LoanVault,
  vaultsSelector,
} from "@store/loans";
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
  BottomSheetNavScreen,
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
import { VaultDetailLoansRow } from "./components/VaultDetailLoansRow";
import { VaultDetailCollateralsRow } from "./components/VaultDetailCollateralsRow";
import { LoanParamList } from "../LoansNavigator";

type Props = StackScreenProps<LoanParamList, "VaultDetailScreen">;

export function VaultDetailScreenV2({ route, navigation }: Props): JSX.Element {
  const { isLight } = useThemeContext();
  const { vaultId } = route.params;
  const [vault, setVault] = useState<LoanVault>();
  const canUseOperations = useLoanOperations(vault?.state);
  const dispatch = useAppDispatch();
  const client = useWhaleApiClient();
  const blockCount = useSelector((state: RootState) => state.block.count);
  const isFocused = useIsFocused();
  const { collateralTokens } = useCollateralTokenList();

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
  const [bottomSheetScreen, setBottomSheetScreen] = useState<
    BottomSheetNavScreen[]
  >([]);
  const BottomSheetHeader = {
    headerStatusBarHeight: 2,
    headerTitle: "",
    headerBackTitleVisible: false,
    headerStyle: tailwind("rounded-t-xl-v2 border-b-0", {
      "bg-mono-light-v2-100": isLight,
      "bg-mono-dark-v2-100": !isLight,
    }),
    headerRight: (): JSX.Element => {
      return (
        <ThemedTouchableOpacityV2
          style={tailwind("mr-5", {
            "mt-4 -mb-4": Platform.OS === "ios",
            "mt-1.5": Platform.OS === "android",
          })}
          onPress={dismissModal}
          testID="close_bottom_sheet_button"
        >
          <ThemedIcon iconType="Feather" name="x-circle" size={22} />
        </ThemedTouchableOpacityV2>
      );
    },
    headerLeft: () => <></>,
  };
  const {
    bottomSheetRef,
    containerRef,
    dismissModal,
    expandModal,
    isModalDisplayed,
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

  const onAddPressed = () => {
    if (vault === undefined) {
      return;
    }

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
            navigateToAddRemoveCollateralScreen(item, true);
            dismissModal();
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
              onCloseButtonPress={dismissModal}
            />
          ),
        },
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
          onCloseButtonPress: dismissModal,
          loanTokens,
          isLight,
        }),
        option: {
          header: () => null, // not using BottomSheetHeader because it is having a very thin line above modal header in android only
        },
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
          onPress: (item: LoanVaultTokenAmount) => {
            dismissModal();
            navigateToPayScreen(item);
          },
          onPayDUSDPress: () => {},
          vault: vault,
          data: vault.loanAmounts,
          isLight: isLight,
        }),
        option: BottomSheetHeader,
      },
    ]);
    expandModal();
  };

  const navigateToPayScreen = (loanToken: LoanVaultTokenAmount) => {
    navigation.navigate({
      name: "PaybackLoanScreen",
      merge: true,
      params: {
        vault: vault,
        loanTokenAmount: loanToken,
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
          onAddPress={(collateralItem) => {
            navigateToAddRemoveCollateralScreen(collateralItem, true);
          }}
          onRemovePress={(collateralItem) => {
            navigateToAddRemoveCollateralScreen(collateralItem, false);
          }}
        />
        <VaultDetailLoansRow
          onPay={navigateToPayScreen}
          onPaybackDUSD={() => {}}
          vault={vault}
        />
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
