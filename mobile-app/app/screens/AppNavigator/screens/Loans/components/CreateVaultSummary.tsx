import BigNumber from "bignumber.js";
import { ThemedViewV2 } from "@components/themed";
import { useStyles } from "@tailwind";
import { NumberRowV2 } from "@components/NumberRowV2";
import { translate } from "@translations";
import { useTokenPrice } from "@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice";

export enum ConversionStatus {
  Not_Required,
  Required,
  Processing,
  Completed,
}

interface CreateVaultSummaryProps {
  transactionFee: BigNumber;
  vaultFee: BigNumber;
  convertAmount?: BigNumber;
  conversionStatus: ConversionStatus;
}

export function CreateVaultSummary({
  transactionFee,
  vaultFee,
  convertAmount,
  conversionStatus,
}: CreateVaultSummaryProps): JSX.Element {
  const { tailwind } = useStyles();
  const { getTokenPrice } = useTokenPrice();

  return (
    <ThemedViewV2
      style={tailwind("flex-col border-0.5 rounded-lg-v2 mt-8 p-5")}
      light={tailwind("border-mono-light-v2-300")}
      dark={tailwind("border-mono-dark-v2-300")}
      testID="create_vault_summary"
    >
      {convertAmount !== undefined && (
        <ConvertSummary
          convertAmount={convertAmount}
          conversionStatus={conversionStatus}
        />
      )}
      <NumberRowV2
        lhs={{
          value: translate("screens/CreateVaultScreen", "Transaction fee"),
          themedProps: {
            light: tailwind("text-mono-light-v2-500"),
            dark: tailwind("text-mono-dark-v2-500"),
          },
          testID: "transaction_fee",
        }}
        rhs={{
          value: new BigNumber(transactionFee).toFixed(8),
          suffix: " DFI",
          testID: "transaction_fee_value",
          usdAmount: getTokenPrice("DFI", transactionFee),
          usdContainerStyle: tailwind("pt-1"),
          usdTextStyle: tailwind("text-sm"),
        }}
      />
      <NumberRowV2
        lhs={{
          value: translate("screens/CreateVaultScreen", "Vault fee"),
          themedProps: {
            light: tailwind("text-mono-light-v2-500"),
            dark: tailwind("text-mono-dark-v2-500"),
          },
          testID: "vault_fee",
        }}
        info={{
          title: translate("screens/CreateVaultScreen", "Vault Fee"),
          message: translate(
            "screens/CreateVaultScreen",
            "Vault fee will be used to create a new vault. After the vault is successfully closed, half of the fee deposited will be returned to your wallet, with the remaining half burned."
          ),
        }}
        rhs={{
          value: new BigNumber(vaultFee).toFixed(8),
          suffix: " DFI",
          testID: "vault_fee_value",
          usdAmount: getTokenPrice("DFI", vaultFee),
          usdContainerStyle: tailwind("pb-0 pt-1"),
          usdTextStyle: tailwind("text-sm"),
        }}
      />
    </ThemedViewV2>
  );
}

function ConvertSummary(props: {
  convertAmount: BigNumber;
  conversionStatus: ConversionStatus;
}): JSX.Element {
  const { tailwind } = useStyles();
  const isConverting = props.conversionStatus === ConversionStatus.Processing;

  return (
    <ThemedViewV2
      style={tailwind("border-b-0.5 mb-5 pb-5")}
      light={tailwind("border-mono-light-v2-300")}
      dark={tailwind("border-mono-dark-v2-300")}
    >
      <NumberRowV2
        containerStyle={{
          style: tailwind("flex-row items-start w-full bg-transparent"),
        }}
        lhs={{
          value: translate("screens/CreateVaultScreen", "Amount to convert"),
          testID: "amount_to_convert",
          themedProps: {
            light: tailwind("text-mono-light-v2-500"),
            dark: tailwind("text-mono-dark-v2-500"),
          },
        }}
        rhs={{
          value: props.convertAmount.toFixed(8),
          suffix: " DFI",
          testID: "amount_to_convert_value",
          themedProps: {
            light: tailwind("text-mono-light-v2-900"),
            dark: tailwind("text-mono-dark-v2-900"),
          },
          isConverting: isConverting,
        }}
      />
    </ThemedViewV2>
  );
}
