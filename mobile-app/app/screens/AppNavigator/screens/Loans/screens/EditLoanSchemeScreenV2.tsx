import {
  ThemedScrollView,
  ThemedScrollViewV2,
  ThemedSectionTitle,
  ThemedText,
  ThemedTextV2,
  ThemedViewV2,
  ThemedView,
} from "@components/themed";
import {
  LoanScheme,
  LoanVaultActive,
} from "@defichain/whale-api-client/dist/api/loan";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { View, Text } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { NumericFormat as NumberFormat } from "react-number-format";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { ascColRatioLoanScheme } from "@store/loans";
import { Button } from "@components/Button";
import { hasTxQueued } from "@store/transaction_queue";
import { hasTxQueued as hasBroadcastQueued } from "@store/ocean";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { getPrecisedTokenValue } from "@screens/AppNavigator/screens/Auctions/helpers/precision-token-value";
import { useVaultStatus, VaultStatusTag } from "../components/VaultStatusTag";
import {
  LoanSchemeOptions,
  WalletLoanScheme,
} from "../components/LoanSchemeOptions";
import { LoanParamList } from "../LoansNavigator";
import { VaultSectionTextRow } from "../components/VaultSectionTextRow";
import { useCollateralizationRatioColor } from "../hooks/CollateralizationRatio";

type Props = StackScreenProps<LoanParamList, "EditLoanSchemeScreen">;

export function EditLoanSchemeScreenV2({
  route,
  navigation,
}: Props): JSX.Element {
  const { vaultId } = route.params;
  const { vaults } = useSelector((state: RootState) => state.loans);
  const loanSchemes = useSelector((state: RootState) =>
    ascColRatioLoanScheme(state.loans)
  );
  const hasFetchedLoanSchemes = useSelector(
    (state: RootState) => state.loans.hasFetchedLoanSchemes
  );
  const [activeVault, setActiveVault] = useState<LoanVaultActive>();
  const [filteredLoanSchemes, setFilteredLoanSchemes] =
    useState<WalletLoanScheme[]>();
  const [selectedLoanScheme, setSelectedLoanScheme] = useState<LoanScheme>();
  const logger = useLogger();
  const client = useWhaleApiClient();
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001));

  // Continue button
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue)
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasBroadcastQueued(state.ocean)
  );
  const onSubmit = (): void => {
    if (
      selectedLoanScheme === undefined ||
      activeVault === undefined ||
      hasPendingJob ||
      hasPendingBroadcastJob
    ) {
      return;
    }

    navigation.navigate({
      name: "ConfirmEditLoanSchemeScreen",
      params: {
        vault: activeVault,
        loanScheme: selectedLoanScheme,
        fee: fee,
      },
    });
  };

  useEffect(() => {
    const v = vaults.find((v) => v.vaultId === vaultId) as LoanVaultActive;
    if (v === undefined) {
      return;
    }
    setActiveVault(v);

    const l = loanSchemes.find((l) => l.id === v.loanScheme.id);
    if (l === undefined || selectedLoanScheme !== undefined) {
      return;
    }

    setSelectedLoanScheme(l);
  }, [vaults, loanSchemes]);

  useEffect(() => {
    setFilteredLoanSchemes(
      loanSchemes.map((scheme) => {
        const loanscheme: WalletLoanScheme = {
          disabled:
            new BigNumber(activeVault?.collateralRatio ?? NaN).isGreaterThan(
              0
            ) &&
            new BigNumber(activeVault?.collateralRatio ?? NaN).isLessThan(
              scheme.minColRatio
            ),
          ...scheme,
        };
        return loanscheme;
      })
    );
  }, [activeVault]);

  useEffect(() => {
    client.fee
      .estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error);
  }, []);

  if (activeVault === undefined || filteredLoanSchemes === undefined) {
    return <></>;
  }

  return (
    <ThemedScrollViewV2 contentContainerStyle={tailwind("px-4 pt-0 pb-8 py-6")}>
      <VaultDetail vault={activeVault} />
      <ThemedTextV2
        light={tailwind("text-mono-light-v2-500")}
        dark={tailwind("text-mono-dark-v2-500")}
        style={tailwind("font-normal-v2 text-xs mx-5 mt-2")}
      >
        {translate(
          "screens/EditLoanSchemeScreen",
          "You can only select a scheme lower than your vault's current collateralization."
        )}
      </ThemedTextV2>

      <LoanSchemeOptions
        isLoading={!hasFetchedLoanSchemes}
        loanSchemes={filteredLoanSchemes}
        selectedLoanScheme={selectedLoanScheme}
        onLoanSchemePress={(scheme: LoanScheme) =>
          setSelectedLoanScheme(scheme)
        }
      />
      <Button
        disabled={
          selectedLoanScheme === undefined ||
          selectedLoanScheme.id === activeVault.loanScheme.id ||
          hasPendingJob ||
          hasPendingBroadcastJob
        }
        label={translate("screens/EditLoanSchemeScreen", "CONTINUE")}
        onPress={onSubmit}
        margin="mt-7 mb-2"
        testID="edit_loan_scheme_submit_button"
      />
      <ThemedText
        light={tailwind("text-gray-500")}
        dark={tailwind("text-gray-400")}
        style={tailwind("text-center text-xs")}
      >
        {translate(
          "screens/EditLoanSchemeScreen",
          "Confirm your vault details in next screen"
        )}
      </ThemedText>
    </ThemedScrollViewV2>
  );
}

function VaultDetail(props: { vault: LoanVaultActive }): JSX.Element {
  const { vault } = props;
  return (
    <View style={tailwind("")}>
      <ThemedTextV2
        light={tailwind("text-mono-light-v2-500")}
        dark={tailwind("text-mono-dark-v2-500")}
        style={tailwind("font-normal-v2 text-xs mx-5")}
      >
        {translate("screens/EditCollateralScreen", "VAULT DETAILS")}
      </ThemedTextV2>
      <ThemedViewV2
        light={tailwind("bg-mono-light-v2-00")}
        dark={tailwind("bg-mono-dark-v2-00")}
        style={tailwind("py-4.5 px-5 rounded-lg-v2 mt-2")}
      >
        <View style={tailwind("flex flex-row justify-between")}>
          <View style={tailwind("w-5/12")}>
            <ThemedTextV2
              light={tailwind("text-mono-light-v2-900")}
              dark={tailwind("text-mono-dark-v2-900")}
              style={tailwind("font-medium-v2 text-sm")}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {vault.vaultId}
            </ThemedTextV2>
            <ThemedTextV2
              light={tailwind("text-mono-light-v2-700")}
              dark={tailwind("text-mono-dark-v2-700")}
              style={tailwind("text-xs")}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {translate(
                "screens/EditCollateralScreen",
                "{{interestRate}}% Interest",
                {
                  interestRate: vault.loanScheme.interestRate,
                }
              )}
            </ThemedTextV2>
          </View>

          <View style={tailwind("items-end")}>
            <NumberFormat
              displayType="text"
              renderText={(val: string) => (
                <ThemedTextV2
                  light={tailwind("text-green-v2")}
                  dark={tailwind("text-green-v2")}
                  style={tailwind("text-sm font-semibold-v2")}
                >
                  {vault.informativeRatio === "-1"
                    ? translate("screens/EditCollateralScreen", "N/A")
                    : "%"}
                </ThemedTextV2>
              )}
              thousandSeparator
              value={new BigNumber(
                vault.informativeRatio === "-1" ? NaN : vault.informativeRatio
              ).toFixed(2)}
            />

            <NumberFormat
              displayType="text"
              suffix="%"
              prefix={translate("screens/EditCollateralScreen", "min. ")}
              renderText={(value: string) => (
                <ThemedTextV2
                  light={tailwind("text-mono-light-v2-700")}
                  dark={tailwind("text-mono-dark-v2-700")}
                  style={tailwind("text-xs font-normal-v2")}
                  testID="text_total_collateral_value"
                >
                  {value}
                </ThemedTextV2>
              )}
              thousandSeparator
              value={new BigNumber(vault.loanScheme.minColRatio ?? 0).toFixed(
                0
              )}
            />
          </View>
        </View>
      </ThemedViewV2>
    </View>
  );
}

function VaultSection(props: { vault: LoanVaultActive }): JSX.Element {
  const { vault } = props;
  const colRatio = new BigNumber(vault.informativeRatio);
  const minColRatio = new BigNumber(vault.loanScheme.minColRatio);
  const totalLoanValue = new BigNumber(vault.loanValue);
  const totalCollateralValue = new BigNumber(vault.collateralValue);
  const vaultState = useVaultStatus(
    vault.state,
    colRatio,
    minColRatio,
    totalLoanValue,
    totalCollateralValue
  );
  const colors = useCollateralizationRatioColor({
    colRatio,
    minColRatio,
    totalLoanAmount: totalLoanValue,
    totalCollateralValue,
  });
  return (
    <ThemedView
      light={tailwind("bg-white border-gray-200")}
      dark={tailwind("bg-gray-800 border-gray-700")}
      style={tailwind("border rounded px-4 py-3 mb-2")}
    >
      <View style={tailwind("mb-2 flex flex-row")}>
        <View style={tailwind("flex-1 mr-5")}>
          <ThemedText
            style={tailwind("font-medium")}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {vault.vaultId}
          </ThemedText>
        </View>
        <VaultStatusTag status={vaultState.status} />
      </View>
      <VaultSectionTextRow
        testID="text_total_collateral_value"
        value={getPrecisedTokenValue(vault.collateralValue ?? 0)}
        prefix="$"
        lhs={translate(
          "screens/EditCollateralScreen",
          "Total collateral (USD)"
        )}
        isOraclePrice
      />
      <VaultSectionTextRow
        testID="text_total_collateral_value"
        value={getPrecisedTokenValue(vault.loanValue ?? 0)}
        prefix="$"
        lhs={translate("screens/EditCollateralScreen", "Total loans (USD)")}
        isOraclePrice
      />
      <VaultSectionTextRow
        testID="text_total_collateral_value"
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
        testID="text_total_collateral_value"
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
    </ThemedView>
  );
}

function VaultDetails(props: {
  label: string;
  value: string;
  testId: string;
  suffix?: string;
  disabled?: boolean;
  containerStyle?: string;
}): JSX.Element {
  return (
    <View style={tailwind("flex-1 flex-row", props.containerStyle)}>
      <ThemedTextV2
        light={tailwind("text-mono-light-v2-700", {
          "text-opacity-30": props.disabled === true,
        })}
        dark={tailwind("text-mono-dark-v2-700", {
          "text-opacity-30": props.disabled === true,
        })}
        style={tailwind("text-sm font-normal-v2")}
      >
        {`${translate("components/LoanSchemeOptions", props.label)}:`}
      </ThemedTextV2>
      {/* <NumberFormat
        displayType="text"
        suffix={props.suffix}
        renderText={(value: string) => (
          <ThemedTextV2
            light={tailwind("text-mono-light-v2-900", {
              "text-opacity-30": props.disabled === true,
            })}
            dark={tailwind("text-mono-dark-v2-900", {
              "text-opacity-30": props.disabled === true,
            })}
            style={tailwind("text-sm font-semibold-v2 pl-1")}
            testID={props.testId}
          >
            {value}
          </ThemedTextV2>
        )}
        thousandSeparator
        value={props.value}
      /> */}
    </View>
  );
}
