import { SymbolIcon } from "@components/SymbolIcon";
import {
  ThemedIcon,
  ThemedScrollView,
  ThemedSectionTitle,
  ThemedText,
  ThemedView,
} from "@components/themed";
import { StackScreenProps } from "@react-navigation/stack";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { NumericFormat as NumberFormat } from "react-number-format";
import {
  BottomSheetNavScreen,
  BottomSheetWebWithNavV2,
  BottomSheetWithNavV2,
} from "@components/BottomSheetWithNavV2";
import {
  BottomSheetTokenList,
  TokenType,
} from "@components/BottomSheetTokenList";
import { useWhaleApiClient } from "@waveshq/walletkit-ui/dist/contexts";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { fetchCollateralTokens } from "@store/loans";
import {
  CollateralToken,
  LoanVaultActive,
  LoanVaultState,
  LoanVaultTokenAmount,
} from "@defichain/whale-api-client/dist/api/loan";
import { IconButton } from "@components/IconButton";
import { BottomSheetTokenListHeader } from "@components/BottomSheetTokenListHeader";
import { getCollateralPrice } from "@screens/AppNavigator/screens/Loans/hooks/CollateralPrice";
import {
  useVaultStatus,
  VaultStatusTag,
} from "@screens/AppNavigator/screens/Loans/components/VaultStatusTag";
import { useCollateralizationRatioColor } from "@screens/AppNavigator/screens/Loans/hooks/CollateralizationRatio";
import { useLoanOperations } from "@screens/AppNavigator/screens/Loans/hooks/LoanOperations";
import { ActiveUSDValue } from "@screens/AppNavigator/screens/Loans/VaultDetail/components/ActiveUSDValue";
import { getPrecisedTokenValue } from "@screens/AppNavigator/screens/Auctions/helpers/precision-token-value";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { useBottomSheet } from "@hooks/useBottomSheet";
import { VaultSectionTextRow } from "../components/VaultSectionTextRow";
import { LoanParamList } from "../LoansNavigator";
import { useCollateralTokenList } from "../hooks/CollateralTokenList";

type Props = StackScreenProps<LoanParamList, "EditCollateralScreen">;

export interface Collateral {
  collateralId: string;
  collateralFactor: BigNumber;
  amount: BigNumber;
  amountValue: BigNumber;
  vaultProportion: BigNumber;
  available: BigNumber;
}

export interface CollateralItem extends CollateralToken {
  available: BigNumber;
}

export function EditCollateralScreen({
  navigation,
  route,
}: Props): JSX.Element {
  const { vaultId } = route.params;
  const client = useWhaleApiClient();
  const [bottomSheetScreen, setBottomSheetScreen] = useState<
    BottomSheetNavScreen[]
  >([]);
  const [activeVault, setActiveVault] = useState<LoanVaultActive>();
  const dispatch = useAppDispatch();
  const canUseOperations = useLoanOperations(activeVault?.state);

  const { vaults } = useSelector((state: RootState) => state.loans);
  const { collateralTokens } = useCollateralTokenList();

  useEffect(() => {
    dispatch(fetchCollateralTokens({ client }));
  }, []);

  useEffect(() => {
    const v = vaults.find((v) => v.vaultId === vaultId) as LoanVaultActive;
    if (v !== undefined) {
      setActiveVault({ ...v });
    }
  }, [vaults]);

  const {
    bottomSheetRef,
    containerRef,
    dismissModal,
    expandModal,
    isModalDisplayed,
  } = useBottomSheet();

  if (activeVault === undefined) {
    return <></>;
  }

  return (
    <View style={tailwind("flex-1")} ref={containerRef}>
      <ThemedScrollView contentContainerStyle={tailwind("p-4 pt-0")}>
        <SectionTitle title="VAULT DETAILS" />
        <VaultIdSection vault={activeVault} />
        <AddCollateralButton
          disabled={!canUseOperations}
          onPress={() => {
            setBottomSheetScreen([
              {
                stackScreenName: "TokenList",
                component: BottomSheetTokenList({
                  tokenType: TokenType.CollateralItem,
                  vault: activeVault,
                  onTokenPress: async (item) => {
                    navigation.navigate({
                      name: "AddOrRemoveCollateralScreen",
                      params: {
                        vault: activeVault,
                        collateralItem: item,
                        collateralTokens,
                        isAdd: true,
                      },
                    });
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
          }}
        />
        {activeVault.collateralAmounts?.length > 0 && (
          <SectionTitle title="COLLATERAL" />
        )}
        {activeVault.collateralAmounts.map((collateral, index) => {
          const collateralItem = collateralTokens.find(
            (col) => col.token.id === collateral.id
          );
          if (collateralItem !== undefined) {
            const addOrRemoveParams = {
              vault: activeVault,
              collateralItem,
              collateralTokens,
            };
            return (
              <CollateralCard
                vault={activeVault}
                key={collateral.displaySymbol}
                collateralItem={collateralItem}
                totalCollateralValue={
                  new BigNumber(activeVault.collateralValue)
                }
                collateral={collateral}
                onAddPress={() => {
                  navigation.navigate({
                    name: "AddOrRemoveCollateralScreen",
                    params: { ...addOrRemoveParams, isAdd: true },
                  });
                }}
                onRemovePress={() => {
                  navigation.navigate({
                    name: "AddOrRemoveCollateralScreen",
                    params: { ...addOrRemoveParams, isAdd: false },
                  });
                }}
              />
            );
          } else {
            // TODO Add Skeleton Loader
            return <View key={index} />;
          }
        })}
      </ThemedScrollView>

      {Platform.OS === "web" && (
        <BottomSheetWebWithNavV2
          modalRef={containerRef}
          screenList={bottomSheetScreen}
          isModalDisplayed={isModalDisplayed}
          // eslint-disable-next-line react-native/no-inline-styles
          modalStyle={{
            position: "absolute",
            bottom: "0",
            height: "70%",
            width: "100%",
            zIndex: 50,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            overflow: "hidden",
          }}
        />
      )}
      {Platform.OS !== "web" && (
        <BottomSheetWithNavV2
          modalRef={bottomSheetRef}
          screenList={bottomSheetScreen}
          snapPoints={{
            ios: ["70%"],
            android: ["70%"],
          }}
        />
      )}
    </View>
  );
}

function SectionTitle(props: { title: string }): JSX.Element {
  return (
    <ThemedSectionTitle
      style={tailwind("text-xs pb-2 pt-4 font-medium")}
      text={translate("screens/EditCollateralScreen", props.title)}
    />
  );
}

function VaultIdSection(props: { vault: LoanVaultActive }): JSX.Element {
  const { vault } = props;
  const colRatio = new BigNumber(vault.informativeRatio);
  const minColRatio = new BigNumber(vault.loanScheme.minColRatio);
  const totalLoanAmount = new BigNumber(vault.loanValue);
  const totalCollateralValue = new BigNumber(vault.collateralValue);
  const vaultState = useVaultStatus(
    vault.state,
    colRatio,
    minColRatio,
    totalLoanAmount,
    totalCollateralValue
  );
  const colors = useCollateralizationRatioColor({
    colRatio,
    minColRatio,
    totalLoanAmount,
    totalCollateralValue,
  });
  return (
    <ThemedView
      light={tailwind("bg-white border-gray-200")}
      dark={tailwind("bg-gray-800 border-gray-700")}
      style={tailwind("border rounded px-4 py-3")}
    >
      <View style={tailwind("flex flex-row items-center mb-2")}>
        <View style={tailwind("flex flex-1 mr-5")}>
          <ThemedText
            style={tailwind("font-medium")}
            numberOfLines={1}
            testID="collateral_vault_id"
            ellipsizeMode="middle"
          >
            {vault.vaultId}
          </ThemedText>
        </View>
        <VaultStatusTag
          status={vaultState.status}
          testID="collateral_vault_tag"
        />
      </View>
      <VaultSectionTextRow
        testID="text_total_collateral_value"
        prefix="$"
        value={getPrecisedTokenValue(vault.collateralValue ?? 0)}
        lhs={translate(
          "screens/EditCollateralScreen",
          "Total collateral (USD)"
        )}
        isOraclePrice
      />
      <VaultSectionTextRow
        testID="text_total_loans_value"
        value={new BigNumber(vault.loanValue ?? 0).toFixed(2)}
        prefix="$"
        lhs={translate("screens/EditCollateralScreen", "Total loans (USD)")}
        isOraclePrice
      />
      <VaultSectionTextRow
        testID="text_col_ratio_value"
        value={new BigNumber(
          vault.informativeRatio === "-1" ? NaN : vault.informativeRatio
        ).toFixed(2)}
        suffix={
          vault.informativeRatio === "-1"
            ? translate("screens/EditCollateralScreen", "N/A")
            : "%"
        }
        suffixType="text"
        lhs={translate(
          "screens/EditCollateralScreen",
          "Collateralization ratio"
        )}
        rhsThemedProps={colors}
        info={{
          title: "Collateralization ratio",
          message:
            "The collateralization ratio represents the amount of collateral deposited in a vault in relation to the loan amount, expressed in percentage.",
        }}
      />
      <VaultSectionTextRow
        testID="text_min_col_ratio_value"
        value={new BigNumber(vault.loanScheme.minColRatio ?? 0).toFixed(2)}
        suffix="%"
        suffixType="text"
        lhs={translate(
          "screens/EditCollateralScreen",
          "Min. collateralization ratio"
        )}
        info={{
          title: "Min. collateralization ratio",
          message:
            "Minimum required collateralization ratio based on loan scheme selected. A vault will go into liquidation when the collateralization ratio goes below the minimum requirement.",
        }}
      />
      <VaultSectionTextRow
        testID="text_vault_interest_value"
        value={new BigNumber(vault.loanScheme.interestRate ?? 0).toFixed(2)}
        suffix="%"
        suffixType="text"
        lhs={translate("screens/EditCollateralScreen", "Vault interest (APR)")}
        info={{
          title: "Annual vault interest",
          message:
            "Annual vault interest rate based on the loan scheme selected.",
        }}
      />
    </ThemedView>
  );
}

interface CollateralCardProps {
  collateral: LoanVaultTokenAmount;
  onAddPress: () => void;
  onRemovePress: () => void;
  collateralItem: CollateralItem;
  totalCollateralValue: BigNumber;
  vault: LoanVaultActive;
}

function CollateralCard(props: CollateralCardProps): JSX.Element {
  const { collateral, collateralItem, totalCollateralValue, vault } = props;
  const canUseOperations = useLoanOperations(vault.state);
  const prices = getCollateralPrice(
    new BigNumber(collateral.amount),
    collateralItem,
    totalCollateralValue
  );
  return (
    <ThemedView
      light={tailwind("bg-white border-gray-200")}
      dark={tailwind("bg-gray-800 border-gray-700")}
      style={tailwind("border rounded p-4 mb-2")}
    >
      <ThemedView
        light={tailwind("bg-white border-gray-200")}
        dark={tailwind("bg-gray-800 border-gray-700")}
        style={tailwind(
          "flex flex-row items-center justify-between border-b pb-4 mb-2"
        )}
      >
        <View style={tailwind("flex flex-row items-center")}>
          <SymbolIcon
            symbol={collateral.displaySymbol}
            styleProps={tailwind("w-6 h-6")}
          />
          <ThemedText
            testID={`collateral_card_symbol_${collateral.displaySymbol}`}
            style={tailwind("font-medium ml-1 mr-2")}
          >
            {collateral.displaySymbol}
          </ThemedText>
        </View>
        <View style={tailwind("flex flex-row")}>
          <IconButton
            iconType="MaterialIcons"
            iconName="add"
            iconSize={20}
            disabled={!canUseOperations}
            onPress={() => props.onAddPress()}
            testID={`collateral_card_add_${collateral.displaySymbol}`}
          />
          <IconButton
            iconType="MaterialIcons"
            iconName="remove"
            iconSize={20}
            style={tailwind("ml-2")}
            disabled={
              !canUseOperations || vault.state === LoanVaultState.FROZEN
            }
            onPress={() => props.onRemovePress()}
            testID={`collateral_card_remove_${collateral.displaySymbol}`}
          />
        </View>
      </ThemedView>
      <View style={tailwind("flex flex-row justify-between")}>
        <View style={tailwind("w-8/12")}>
          <CardLabel text="Collateral amount (USD)" />
          <View style={tailwind("mt-0.5")}>
            <NumberFormat
              value={collateral.amount}
              thousandSeparator
              decimalScale={8}
              displayType="text"
              suffix={` ${collateral.displaySymbol}`}
              renderText={(val: string) => (
                <ThemedText
                  testID={`collateral_card_col_amount_${collateral.displaySymbol}`}
                  dark={tailwind("text-gray-50")}
                  light={tailwind("text-gray-900")}
                  style={tailwind("text-sm font-medium")}
                >
                  {val}
                </ThemedText>
              )}
            />
            <ActiveUSDValue
              price={prices.collateralPrice}
              testId={`collateral_card_col_amount_usd_${collateral.displaySymbol}`}
              isOraclePrice
            />
          </View>
        </View>
        <View style={tailwind("w-4/12 flex items-end")}>
          <CardLabel text="Vault %" />
          <NumberFormat
            value={prices.vaultShare.toFixed(2)}
            thousandSeparator
            decimalScale={2}
            displayType="text"
            suffix="%"
            renderText={(val: string) => (
              <ThemedView
                light={tailwind("bg-gray-100")}
                dark={tailwind("bg-gray-900")}
                style={tailwind("px-2 py-0.5 rounded")}
              >
                <ThemedText
                  light={tailwind("text-gray-900")}
                  dark={tailwind("text-gray-50")}
                  style={tailwind("text-sm font-medium")}
                  testID={`collateral_card_vault_share_${collateral.displaySymbol}`}
                >
                  {val}
                </ThemedText>
              </ThemedView>
            )}
          />
        </View>
      </View>
    </ThemedView>
  );
}

function CardLabel(props: { text: string }): JSX.Element {
  return (
    <ThemedText
      light={tailwind("text-gray-500")}
      dark={tailwind("text-gray-400")}
      style={tailwind("text-xs mb-1")}
    >
      {translate("screens/EditCollateralScreen", props.text)}
    </ThemedText>
  );
}

function AddCollateralButton(props: {
  disabled: boolean;
  onPress: () => void;
}): JSX.Element {
  return (
    <TouchableOpacity
      disabled={props.disabled}
      style={tailwind("mt-6 mb-3 flex flex-row justify-center")}
      onPress={props.onPress}
      testID="add_collateral_button"
    >
      <ThemedIcon
        iconType="MaterialIcons"
        name="add"
        size={14}
        light={tailwind({
          "text-primary-500": !props.disabled,
          "text-gray-300": props.disabled,
        })}
        dark={tailwind({
          "text-darkprimary-500": !props.disabled,
          "text-gray-600": props.disabled,
        })}
      />
      <ThemedText
        light={tailwind({
          "text-primary-500": !props.disabled,
          "text-gray-300": props.disabled,
        })}
        dark={tailwind({
          "text-darkprimary-500": !props.disabled,
          "text-gray-600": props.disabled,
        })}
        style={tailwind("pl-2.5 text-sm font-medium leading-4 mb-2")}
      >
        {translate("screens/EditCollateralScreen", "ADD TOKEN AS COLLATERAL")}
      </ThemedText>
    </TouchableOpacity>
  );
}
