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
import { LoanSchemeOptionsV2 } from "@screens/AppNavigator/screens/Loans/components/LoanSchemeOptionsV2";
import { ButtonV2 } from "@components/ButtonV2";
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
    <ThemedScrollViewV2 contentContainerStyle={tailwind("px-4 pt-0 pb-8 py-7")}>
      <VaultDetail vault={activeVault} />

      <ThemedTextV2
        light={tailwind("text-mono-light-v2-500")}
        dark={tailwind("text-mono-dark-v2-500")}
        style={tailwind("font-normal-v2 text-xs mx-5 mt-8")}
      >
        {translate("screens/EditCollateralScreen", "AVAILABLE SCHEMES")}
      </ThemedTextV2>
      <LoanSchemeOptionsV2
        loanSchemes={loanSchemes}
        isLoading={!hasFetchedLoanSchemes}
        selectedLoanScheme={selectedLoanScheme}
        onLoanSchemePress={(scheme: LoanScheme) =>
          setSelectedLoanScheme(scheme)
        }
        containerStyle={tailwind("mt-2")}
      />

      <View style={tailwind("pt-12 px-12")}>
        {selectedLoanScheme && (
          <ThemedTextV2
            style={tailwind("text-xs font-normal-v2 pb-5 text-center")}
            light={tailwind("text-mono-light-v2-500")}
            dark={tailwind("text-mono-dark-v2-500")}
            testID="action_message"
          >
            {translate(
              "screens/CreateVaultScreen",
              "Review full details in the next screen"
            )}
          </ThemedTextV2>
        )}
      </View>

      <ButtonV2
        disabled={
          selectedLoanScheme === undefined ||
          selectedLoanScheme.id === activeVault.loanScheme.id ||
          hasPendingJob ||
          hasPendingBroadcastJob
        }
        label={translate("screens/EditLoanSchemeScreen", "CONTINUE")}
        onPress={onSubmit}
        styleProps="mt-0 mx-7"
        testID="edit_loan_scheme_submit_button"
      />
    </ThemedScrollViewV2>
  );
}

function VaultDetail(props: { vault: LoanVaultActive }): JSX.Element {
  const { vault } = props;
  return (
    <View>
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
                    : `${val}%`}
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
    </View>
  );
}
