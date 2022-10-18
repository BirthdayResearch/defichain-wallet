import { useLoanOperations } from "@screens/AppNavigator/screens/Loans/hooks/LoanOperations";
import BigNumber from "bignumber.js";
import { useFeatureFlagContext } from "@contexts/FeatureFlagContext";
import { TouchableOpacity, View } from "react-native";
import { tailwind } from "@tailwind";
import { ThemedTextV2, ThemedViewV2 } from "@components/themed";
import { SymbolIcon } from "@components/SymbolIcon";
import {
  LoanVaultActive,
  LoanVaultState,
  LoanVaultTokenAmount,
} from "@defichain/whale-api-client/dist/api/loan";
import { translate } from "@translations";
import { LoanActionButton } from "@screens/AppNavigator/screens/Loans/components/LoanActionButton";
import { LinearGradient } from "expo-linear-gradient";

interface PayLoanCardProps {
  symbol: string;
  displaySymbol: string;
  amount: string;
  interestAmount?: string;
  vaultState: LoanVaultState;
  vault?: LoanVaultActive;
  loanToken: LoanVaultTokenAmount;
  onPay?: () => void;
  onPaybackDUSD?: () => void;
}

export function PayLoanCard(props: PayLoanCardProps): JSX.Element {
  const canUseOperations = useLoanOperations(props.vault?.state);

  const { isFeatureAvailable } = useFeatureFlagContext();
  const hasDUSDCollateral =
    props.vault !== undefined &&
    props.vault?.collateralAmounts.some((col) => col.displaySymbol === "DUSD");
  const showPayWithDUSD =
    props.displaySymbol === "DUSD" &&
    isFeatureAvailable("unloop_dusd") &&
    hasDUSDCollateral;

  return (
    <View style={tailwind("mb-2")}>
      <ThemedViewV2
        light={tailwind("bg-mono-light-v2-00")}
        dark={tailwind("bg-mono-dark-v2-00")}
        style={tailwind(
          "py-4 px-5 flex flex-row items-center justify-between rounded-lg-v2",
          { "rounded-t-lg-v2": showPayWithDUSD }
        )}
      >
        <View style={tailwind("flex flex-row items-center")}>
          <SymbolIcon
            symbol={props.displaySymbol}
            styleHeight={36}
            styleWidth={36}
          />
          {/* eslint-disable react-native/no-raw-text */}
          <View style={tailwind("ml-2")}>
            <ThemedTextV2
              light={tailwind({
                "text-gray-300":
                  props.vaultState === LoanVaultState.IN_LIQUIDATION,
                "text-mono-light-v2-900":
                  props.vaultState !== LoanVaultState.IN_LIQUIDATION,
              })}
              dark={tailwind({
                "text-gray-700":
                  props.vaultState === LoanVaultState.IN_LIQUIDATION,
                "text-mono-dark-v2-900":
                  props.vaultState !== LoanVaultState.IN_LIQUIDATION,
              })}
              style={tailwind("text-sm font-semibold-v2")}
              testID={`loan_card_${props.displaySymbol}`}
            >
              {`${new BigNumber(props.amount).toFixed(8)} ${
                props.displaySymbol
              }`}
            </ThemedTextV2>
            <ThemedTextV2
              light={tailwind("text-mono-light-v2-700")}
              dark={tailwind("text-mono-dark-v2-700")}
              style={tailwind("text-xs font-normal-v2")}
            >
              {translate(
                "screens/VaultDetailScreenLoansSection",
                "{{value}} as interest",
                { value: new BigNumber(props.interestAmount ?? 0).toFixed(8) }
              )}
            </ThemedTextV2>
          </View>
        </View>

        {props.vault !== undefined && (
          <LoanActionButton
            label={translate("screens/VaultDetailScreenLoansSection", "Pay")}
            disabled={!canUseOperations}
            onPress={props.onPay}
            testID={`pay_${props.displaySymbol}_loan`}
          />
        )}
      </ThemedViewV2>
      {showPayWithDUSD && (
        <LoanActionDUSDButton onPaybackDUSD={props.onPaybackDUSD} />
      )}
    </View>
  );
}

function LoanActionDUSDButton({
  onPaybackDUSD,
}: {
  onPaybackDUSD?: () => void;
}): JSX.Element {
  return (
    <LinearGradient
      start={[0, 0]}
      end={[1, 1]}
      colors={[
        "#FF01AF",
        "#FB01AF",
        "#EF01B1",
        "#DB02B5",
        "#C004BA",
        "#9D06C0",
        "#7208C8",
        "#3F0BD1",
        "#0E0EDB",
      ]}
      locations={[0, 0.13, 0.26, 0.39, 0.52, 0.64, 0.77, 0.89, 1]}
      style={tailwind("py-2 rounded-b-lg-v2")}
    >
      <TouchableOpacity
        // testID="loan_card_DUSD_payback_dusd_loan"
        testID="pay_dusd_loan"
        onPress={onPaybackDUSD}
        activeOpacity={0.7}
      >
        <ThemedTextV2
          light={tailwind("text-mono-dark-v2-900")}
          dark={tailwind("text-mono-dark-v2-900")}
          style={tailwind("text-sm font-semibold-v2 text-center")}
        >
          {translate(
            "screens/VaultDetailScreenLoansSection",
            "Pay with DUSD collaterals"
          )}
        </ThemedTextV2>
      </TouchableOpacity>
    </LinearGradient>
  );
}
