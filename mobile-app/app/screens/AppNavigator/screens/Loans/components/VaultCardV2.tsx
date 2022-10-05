import BigNumber from "bignumber.js";
import {
  ThemedFlatListV2,
  ThemedIcon,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import { tailwind } from "@tailwind";
import { View } from "@components";
import { translate } from "@translations";
import { TokenIconGroupV2 } from "@components/TokenIconGroup";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { LoanParamList } from "@screens/AppNavigator/screens/Loans/LoansNavigator";
import { loanTokensSelector, LoanVault } from "@store/loans";
import {
  LoanToken,
  LoanVaultActive,
} from "@defichain/whale-api-client/dist/api/loan";
import { Platform, TouchableOpacity } from "react-native";
import { useVaultStatus } from "@screens/AppNavigator/screens/Loans/components/VaultStatusTag";
import { useNextCollateralizationRatio } from "@screens/AppNavigator/screens/Loans/hooks/NextCollateralizationRatio";
import { useLoanOperations } from "@screens/AppNavigator/screens/Loans/hooks/LoanOperations";
import { VaultStatus } from "@screens/AppNavigator/screens/Loans/VaultStatusTypes";
import { getPrecisedTokenValue } from "@screens/AppNavigator/screens/Auctions/helpers/precision-token-value";
import { NumericFormat as NumberFormat } from "react-number-format";
import {
  BottomSheetNavScreen,
  BottomSheetWebWithNavV2,
  BottomSheetWithNavV2,
} from "@components/BottomSheetWithNavV2";
import { memo, useState } from "react";
import { useBottomSheet } from "@hooks/useBottomSheet";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { LoanActionButton } from "./LoanActionButton";
import { VaultSectionTextRowV2 } from "./VaultSectionTextRowV2";
import { VaultBanner } from "./VaultBanner";
import { TokenNameText } from "../../Portfolio/components/TokenNameText";
import { TokenIcon } from "../../Portfolio/components/TokenIcon";
import { getActivePrice } from "../../Auctions/helpers/ActivePrice";

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

  // list of loanTokens
  const loanTokens = useSelector((state: RootState) =>
    loanTokensSelector(state.loans)
  );

  const { isLight } = useThemeContext();
  const [bottomSheetScreen, setBottomSheetScreen] = useState<
    BottomSheetNavScreen[]
  >([]);
  const modalSnapPoints = { ios: ["60%"], android: ["60%"] };
  const modalHeight = { height: "60%" };
  const {
    bottomSheetRef,
    containerRef,
    dismissModal,
    expandModal,
    isModalDisplayed,
  } = useBottomSheet();

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
          style={tailwind("mr-5 mt-4 -mb-4")}
          onPress={dismissModal}
          testID="close_bottom_sheet_button"
        >
          <ThemedIcon iconType="Feather" name="x-circle" size={22} />
        </ThemedTouchableOpacityV2>
      );
    },
    headerLeft: () => <></>,
  };
  const onSelectLoanToken = (item: LoanToken) => {
    dismissModal();
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
    setBottomSheetScreen([
      {
        stackScreenName: "LoanTokensList",
        component: BottomSheetLoanTokensList({
          onPress: onSelectLoanToken,
          loanTokens: loanTokens,
        }),
        option: BottomSheetHeader,
      },
    ]);
    expandModal();
  };

  // TODO @chloe: check where to use this
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
          testID={props.testID}
          vault={vault}
        />
      ) : (
        <TouchableOpacity onPress={onCardPress}>
          <ThemedViewV2
            dark={tailwind("bg-mono-dark-v2-00")}
            light={tailwind("bg-mono-light-v2-00")}
            style={tailwind("px-5 py-4.5 rounded-lg-v2 border-0 bg-red-200")}
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
                <LoanActionButton
                  label="Borrow"
                  testID="borrow_collateral"
                  style={tailwind("mt-3 px-9")}
                  onPress={onBottomSheetLoansTokensListSelect}
                />
              </View>
            </View>
          </ThemedViewV2>
        </TouchableOpacity>
      )}
      <BottomSheetWithNavV2
        modalRef={bottomSheetRef}
        screenList={bottomSheetScreen}
      />

      {Platform.OS === "web" && (
        <BottomSheetWebWithNavV2
          modalRef={containerRef}
          screenList={bottomSheetScreen}
          isModalDisplayed={isModalDisplayed}
          modalStyle={modalHeight}
        />
      )}
      {Platform.OS !== "web" && (
        <BottomSheetWithNavV2
          modalRef={bottomSheetRef}
          screenList={bottomSheetScreen}
          snapPoints={modalSnapPoints}
        />
      )}
    </View>
  );
}

const BottomSheetLoanTokensList = ({
  onPress,
  loanTokens,
}: // navigation
{
  onPress: (item: LoanToken) => void;
  loanTokens: LoanToken[];
  // navigation:
}): React.MemoExoticComponent<() => JSX.Element> =>
  memo(() => {
    return (
      <ThemedFlatListV2
        contentContainerStyle={tailwind("px-5 pb-12")}
        testID="swap_token_selection_screen"
        data={loanTokens}
        keyExtractor={(item) => item.tokenId}
        renderItem={({ item }: { item: LoanToken }): JSX.Element => {
          const currentPrice = getPrecisedTokenValue(
            getActivePrice(item.token.symbol, item.activePrice)
          );
          return (
            <ThemedTouchableOpacityV2
              style={tailwind(
                "flex flex-row p-5 mb-2 border-0 rounded-lg-v2 items-center justify-between"
              )}
              light={tailwind("bg-mono-light-v2-00")}
              dark={tailwind("bg-mono-dark-v2-00")}
              onPress={() => {
                onPress(item);
              }}
              // onPress={onPress}
              testID={`select_${item.token.displaySymbol}`}
            >
              <View style={tailwind("w-6/12 flex flex-row items-center pr-2")}>
                <TokenIcon
                  testID={`${item.token.displaySymbol}_icon`}
                  token={{
                    isLPS: item.token.isLPS,
                    displaySymbol: item.token.displaySymbol,
                  }}
                  size={36}
                />
                <TokenNameText
                  displaySymbol={item.token.displaySymbol}
                  name={item.token.name}
                  testID={item.token.displaySymbol}
                />
              </View>
              <View style={tailwind("flex-1 flex-wrap flex-col items-end")}>
                <NumberFormat
                  value={currentPrice}
                  thousandSeparator
                  displayType="text"
                  renderText={(value) => (
                    <ThemedTextV2
                      style={tailwind(
                        "w-full flex-wrap font-semibold-v2 text-sm text-right"
                      )}
                      testID={`select_${item.token.displaySymbol}_value`}
                    >
                      ${value}
                    </ThemedTextV2>
                  )}
                />
                <View style={tailwind("pt-1")}>
                  <NumberFormat
                    value={item.interest}
                    thousandSeparator
                    displayType="text"
                    renderText={(value) => (
                      <ThemedTextV2
                        style={tailwind(
                          "flex-wrap font-normal-v2 text-xs text-right"
                        )}
                        testID={`select_${item.token.displaySymbol}_sub_value`}
                        light={tailwind("text-mono-light-v2-700")}
                        dark={tailwind("text-mono-dark-v2-700")}
                      >
                        {value}
                      </ThemedTextV2>
                    )}
                    suffix="% interest"
                  />
                </View>
              </View>
            </ThemedTouchableOpacityV2>
          );
        }}
        ListHeaderComponent={
          <ThemedTextV2
            style={tailwind("text-xl font-normal-v2 pb-4")}
            light={tailwind("text-mono-light-v2-900")}
            dark={tailwind("text-mono-dark-v2-900")}
            testID="empty_search_result_text"
          >
            {translate("screens/SwapTokenSelectionScreen", "Select Token")}
          </ThemedTextV2>
        }
      />
    );
  });
