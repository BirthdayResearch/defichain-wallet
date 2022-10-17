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
  onPay: (item: LoanVaultTokenAmount) => void;
  onPaybackDUSD: () => void;
}): JSX.Element {
  const { vault, onPay, onPaybackDUSD } = props;
  return (
    <ThemedViewV2 style={tailwind("mx-5 mt-6")}>
      {vault.state === LoanVaultState.IN_LIQUIDATION &&
        vault.batches.map((batch) => (
          <PayLoanCard
            key={batch.loan.id}
            symbol={batch.loan.id}
            displaySymbol={batch.loan.displaySymbol}
            amount={batch.loan.amount}
            vaultState={LoanVaultState.IN_LIQUIDATION}
            loanToken={batch.loan}
          />
        ))}

      {vault.state !== LoanVaultState.IN_LIQUIDATION &&
        vault.loanValue !== "0" && (
          <ThemedTextV2
            light={tailwind("text-mono-light-v2-500")}
            dark={tailwind("text-mono-dark-v2-500")}
            style={tailwind("text-xs font-normal-v2 mb-2 px-5")}
          >
            {translate("screens/VaultDetailScreenLoansSection", "LOANS")}
          </ThemedTextV2>
        )}

      {vault.state !== LoanVaultState.IN_LIQUIDATION &&
        vault.loanAmounts.map((loan) => (
          <PayLoanCard
            key={loan.id}
            symbol={loan.symbol}
            displaySymbol={loan.displaySymbol}
            amount={loan.amount}
            interestAmount={
              vault.interestAmounts.find(
                (interest) => interest.symbol === loan.symbol
              )?.amount
            }
            vaultState={vault.state}
            vault={vault}
            loanToken={loan}
            onPay={() => onPay(loan)}
            onPaybackDUSD={onPaybackDUSD}
          />
        ))}
    </ThemedViewV2>
  );
}
