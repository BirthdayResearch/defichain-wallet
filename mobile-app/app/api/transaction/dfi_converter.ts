import { translate } from "@translations";
import BigNumber from "bignumber.js";
import { DfTxSigner } from "@waveshq/walletkit-ui/dist/store";
import { WhaleWalletAccount } from "@defichain/whale-api-wallet";
import {
  CTransactionSegWit,
  TransactionSegWit,
} from "@defichain/jellyfish-transaction";
import { ConvertDirection } from "@screens/enum";

export type ConversionMode =
  | "utxosToAccount"
  | "accountToUtxos"
  | "evmToAccount"
  | "accountToEvm";

export async function dfiConversionSigner(
  account: WhaleWalletAccount,
  amount: BigNumber,
  mode: ConvertDirection
): Promise<CTransactionSegWit> {
  const script = await account.getScript();
  const builder = account.withTransactionBuilder();
  let signed: TransactionSegWit;
  if (mode === "utxosToAccount") {
    signed = await builder.account.utxosToAccount(
      {
        to: [
          {
            script,
            balances: [
              {
                token: 0,
                amount,
              },
            ],
          },
        ],
      },
      script
    );
  } else {
    signed = await builder.account.accountToUtxos(
      {
        from: script,
        balances: [
          {
            token: 0,
            amount,
          },
        ],
        mintingOutputsStart: 2, // 0: DfTx, 1: change, 2: minted utxos (mandated by jellyfish-tx)
      },
      script
    );
  }
  return new CTransactionSegWit(signed);
}

export function dfiConversionCrafter(
  amount: BigNumber,
  convertDirection: ConvertDirection,
  onBroadcast: () => any,
  onConfirmation: () => void,
  submitButtonLabel?: string
): DfTxSigner {
  if (
    ![
      ConvertDirection.accountToUtxos,
      ConvertDirection.utxosToAccount,
    ].includes(convertDirection)
  ) {
    throw new Error("Unexpected DFI conversion");
  }

  const [symbolA, symbolB] =
    convertDirection === ConvertDirection.utxosToAccount
      ? ["UTXO", translate("screens/OceanInterface", "tokens")]
      : [translate("screens/OceanInterface", "tokens"), "UTXO"];
  return {
    sign: async (account: WhaleWalletAccount) =>
      await dfiConversionSigner(account, amount, convertDirection),
    title: translate(
      "screens/ConvertConfirmScreen",
      "Convert {{amount}} DFI to {{target}}",
      {
        amount: amount.toFixed(8),
        target:
          convertDirection === ConvertDirection.utxosToAccount
            ? translate("screens/ConvertScreen", "tokens")
            : "UTXO",
      }
    ),
    drawerMessages: {
      preparing: translate("screens/OceanInterface", "Preparing to convert…"),
      waiting: translate(
        "screens/OceanInterface",
        "Converting {{amount}} DFI {{symbolA}} to {{symbolB}}",
        {
          symbolA: symbolA,
          symbolB: symbolB,
          amount: amount.toFixed(8),
        }
      ),
      complete: translate(
        "screens/OceanInterface",
        "{{amount}} DFI converted to {{symbolB}}",
        {
          symbolB: symbolB,
          amount: amount.toFixed(8),
        }
      ),
    },
    onBroadcast,
    onConfirmation,
    submitButtonLabel:
      submitButtonLabel !== undefined
        ? translate("screens/ConvertConfirmScreen", submitButtonLabel)
        : undefined,
  };
}
