import { ThemedTextV2, ThemedViewV2 } from "@components/themed";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { LoanVault } from "@store/loans";
import {
  LoanVaultState,
  LoanVaultTokenAmount,
} from "@defichain/whale-api-client/dist/api/loan";
import { PayLoanCard } from "@screens/AppNavigator/screens/Loans/components/PayLoanCard";

export function VaultDetailLoansRow(props: {
  vault: LoanVault;
  onPay: (
    item: LoanVaultTokenAmount,
    isPayDUSDUsingCollateral: boolean
  ) => void;
}): JSX.Element {
  const { vault, onPay } = props;
  return (
    <ThemedViewV2 style={tailwind("mx-5 mt-6")}>
      {vault.state === LoanVaultState.IN_LIQUIDATION &&
        vault.batches.map((batch) => (
          <PayLoanCard
            key={batch.loan.id}
            displaySymbol={batch.loan.displaySymbol}
            amount={batch.loan.amount}
            vaultState={LoanVaultState.IN_LIQUIDATION}
          />
        ))}

      {vault.state !== LoanVaultState.IN_LIQUIDATION &&
        vault.loanValue !== "0" && (
          <ThemedTextV2
            light={tailwind("text-mono-light-v2-500")}
            dark={tailwind("text-mono-dark-v2-500")}
            style={tailwind("text-xs font-normal-v2 mb-2 px-5")}
            testID="vault_detail_loans_section"
          >
            {translate("screens/VaultDetailScreenLoansSection", "LOANS")}
          </ThemedTextV2>
        )}

      {vault.state !== LoanVaultState.IN_LIQUIDATION &&
        vault.loanAmounts.map((loan) => (
          <PayLoanCard
            key={loan.id}
            displaySymbol={loan.displaySymbol}
            amount={loan.amount}
            interestAmount={
              vault.interestAmounts.find(
                (interest) => interest.symbol === loan.symbol
              )?.amount
            }
            vaultState={vault.state}
            vault={vault}
            onPay={() => onPay(loan, false)}
            onPaybackDUSD={() => onPay(loan, true)}
          />
        ))}
    </ThemedViewV2>
  );
}
