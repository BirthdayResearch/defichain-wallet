import {
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedText,
  ThemedTouchableOpacityV2,
  ThemedView,
} from "@components/themed";
import { StackScreenProps } from "@react-navigation/stack";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { useEffect, useState } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
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
  LoanVaultState,
} from "@defichain/whale-api-client/dist/api/loan";
import BigNumber from "bignumber.js";
import { useDeFiScanContext } from "@shared-contexts/DeFiScanContext";
import { openURL } from "@api/linking";
import {
  useVaultStatus,
  VaultStatusTag,
} from "@screens/AppNavigator/screens/Loans/components/VaultStatusTag";
import { CollateralizationRatioDisplay } from "@screens/AppNavigator/screens/Loans/components/CollateralizationRatioDisplay";
import { useNextCollateralizationRatio } from "@screens/AppNavigator/screens/Loans/hooks/NextCollateralizationRatio";
import { useLoanOperations } from "@screens/AppNavigator/screens/Loans/hooks/LoanOperations";
import { VaultStatus } from "@screens/AppNavigator/screens/Loans/VaultStatusTypes";
import { getPrecisedTokenValue } from "@screens/AppNavigator/screens/Auctions/helpers/precision-token-value";
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
import { useMaxLoanAmount } from "@screens/AppNavigator/screens/Loans/hooks/MaxLoanAmount";
import { VaultDetailTabSectionV2 } from "./components/VaultDetailTabSectionV2";
import { LoanParamList } from "../LoansNavigator";
import { ScrollButton } from "../components/ScrollableButton";

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
  const nextCollateralizationRatio = useNextCollateralizationRatio(
    inLiquidation || vault === undefined ? [] : vault.collateralAmounts,
    inLiquidation || vault === undefined ? [] : vault.loanAmounts
  );
  const maxLoanAmount = useMaxLoanAmount({
    totalCollateralValue: totalCollateralValue,
    existingLoanValue: totalLoanAmount,
    minColRatio: minColRatio,
    loanActivePrice: new BigNumber(1),
    interestPerBlock: new BigNumber(0),
  });

  const [snapPoints, setSnapPoints] = useState({
    ios: ["30%"],
    android: ["35%"],
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

  const onAddPressed = () => {};

  const onBorrowPressed = () => {
    setSnapPoints({
      ios: ["65%"],
      android: ["60%"],
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
        option: BottomSheetHeader,
      },
    ]);
    expandModal();
  };

  const onPayPressed = () => {};

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

        <VaultDetailTabSectionV2 vault={vault} />

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
