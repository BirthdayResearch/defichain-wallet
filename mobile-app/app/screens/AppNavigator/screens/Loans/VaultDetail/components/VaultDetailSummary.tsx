import { ThemedViewV2 } from "@components/themed";
import { tailwind } from "@tailwind";
import { NumberRowV2 } from "@components/NumberRowV2";
import { translate } from "@translations";
import { TextRowV2 } from "@components/TextRowV2";
import { useDeFiScanContext } from "@shared-contexts/DeFiScanContext";
import BigNumber from "bignumber.js";
import { getPrecisedCurrencyValue } from "@screens/AppNavigator/screens/Auctions/helpers/precision-token-value";

export interface VaultDetailSummaryProps {
  maxLoanAmount: BigNumber;
  totalCollateral: BigNumber;
  totalLoan: BigNumber;
  vaultId: string;
  interest: string;
  minColRatio: string;
}

export function VaultDetailSummary({
  maxLoanAmount,
  totalCollateral,
  totalLoan,
  vaultId,
  interest,
  minColRatio,
}: VaultDetailSummaryProps): JSX.Element {
  const { getVaultsUrl } = useDeFiScanContext();
  const titleThemedProps = {
    light: tailwind("text-mono-light-v2-500"),
    dark: tailwind("text-mono-dark-v2-500"),
  };

  return (
    <ThemedViewV2
      style={tailwind("flex-col border-0.5 rounded-lg-v2 mt-6 mx-5 p-5")}
      light={tailwind("border-mono-light-v2-300")}
      dark={tailwind("border-mono-dark-v2-300")}
      testID="vault_detail_summary"
    >
      <NumberRowV2
        lhs={{
          value: translate("screens/VaultDetailScreen", "Max loan amount"),
          testID: "max_loan_amount_label",
          themedProps: titleThemedProps,
          outerContainerStyle: tailwind("w-6/12"),
        }}
        rhs={{
          value: getPrecisedCurrencyValue(maxLoanAmount),
          testID: "max_loan_amount",
          prefix: "$",
          textStyle: tailwind("font-semibold-v2"),
        }}
        info={{
          title: translate("screens/VaultDetailScreen", "Max Loan Amount"),
          message: translate(
            "screens/VaultDetailScreen",
            "This is the current loan amount available for this vault."
          ),
          iconStyle: {
            light: tailwind("text-mono-light-v2-500"),
            dark: tailwind("text-mono-dark-v2-500"),
          },
        }}
      />
      <NumberRowV2
        lhs={{
          value: translate("screens/VaultDetailScreen", "Total collateral"),
          testID: "total_collateral_label",
          themedProps: titleThemedProps,
        }}
        rhs={{
          value: getPrecisedCurrencyValue(totalCollateral),
          testID: "total_collateral",
          prefix: "$",
        }}
        containerStyle={{
          style: tailwind(" flex-row items-start w-full bg-transparent mt-5"),
        }}
      />
      <NumberRowV2
        lhs={{
          value: translate("screens/VaultDetailScreen", "Total loan"),
          testID: "total_loan_label",
          themedProps: titleThemedProps,
        }}
        rhs={{
          value: getPrecisedCurrencyValue(totalLoan),
          testID: "total_loan",
          prefix: "$",
        }}
        containerStyle={{
          style: tailwind("flex-row items-start w-full bg-transparent mt-5"),
        }}
      />
      <TextRowV2
        lhs={{
          value: translate("screens/VaultDetailScreen", "Vault ID"),
          themedProps: titleThemedProps,
          outerContainerStyle: tailwind("flex-1"),
        }}
        rhs={{
          value: vaultId,
          openNewBrowserLink: getVaultsUrl(vaultId),
          themedProps: {
            light: tailwind("text-mono-light-v2-900"),
            dark: tailwind("text-mono-dark-v2-900"),
          },
          ellipsizeMode: "middle",
          numberOfLines: 1,
          outerContainerStyle: tailwind("flex-none w-5/12"),
          testID: "collateral_vault_id",
        }}
        containerStyle={{
          style: tailwind(
            "flex-row items-start w-full bg-transparent mt-5 pt-5 border-t-0.5"
          ),
          light: tailwind("bg-transparent border-mono-light-v2-300"),
          dark: tailwind("bg-transparent border-mono-dark-v2-300"),
        }}
      />
      <NumberRowV2
        lhs={{
          value: translate("screens/VaultDetailScreen", "Interest (APR)"),
          testID: "interest_label",
          themedProps: titleThemedProps,
        }}
        rhs={{
          value: interest,
          testID: "interest",
          suffix: "%",
        }}
        containerStyle={{
          style: tailwind("flex-row items-start w-full bg-transparent mt-5"),
        }}
      />
      <NumberRowV2
        lhs={{
          value: translate(
            "screens/VaultDetailScreen",
            "Min. collateral ratio"
          ),
          testID: "min_col_ratio_label",
          themedProps: titleThemedProps,
          outerContainerStyle: tailwind("w-7/12"),
        }}
        rhs={{
          value: minColRatio,
          testID: "min_col_ratio",
          suffix: "%",
        }}
        containerStyle={{
          style: tailwind("flex-row items-start w-full bg-transparent mt-5"),
        }}
        info={{
          title: translate(
            "screens/VaultDetailScreen",
            "Min. Collateral Ratio"
          ),
          message: translate(
            "screens/VaultDetailScreen",
            "This is the current min. col ratio set for this vault. The higher the percentage, the lower the vault interest will be. Min. collateral ratio can be changed anytime, under the 'Edit' button of this page."
          ),
          iconStyle: {
            light: tailwind("text-mono-light-v2-500"),
            dark: tailwind("text-mono-dark-v2-500"),
          },
        }}
      />
    </ThemedViewV2>
  );
}
