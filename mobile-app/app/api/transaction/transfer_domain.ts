import { translate } from "@translations";
import BigNumber from "bignumber.js";
import { DfTxSigner } from "@waveshq/walletkit-ui/dist/store";
import { WhaleWalletAccount } from "@defichain/whale-api-wallet";
import {
  CTransactionSegWit,
  TransactionSegWit,
} from "@defichain/jellyfish-transaction";
import { ConvertDirection } from "@screens/enum";

const TRANSFER_DOMAIN_TYPE = {
  DVM: 2,
  EVM: 3,
};

export async function transferDomainSigner(
  account: WhaleWalletAccount,
  sourceTokenId: string,
  targetTokenId: string,
  amount: BigNumber,
  convertDirection: ConvertDirection
): Promise<CTransactionSegWit> {
  const dvmScript = await account.getScript();
  const evmScript = await account.getEvmScript();
  const builder = account.withTransactionBuilder();

  const [sourceScript, dstScript] =
    convertDirection === ConvertDirection.evmToDvm
      ? [evmScript, dvmScript]
      : [dvmScript, evmScript];

  const signed: TransactionSegWit = await builder.account.transferDomain(
    {
      items: [
        {
          src: {
            address: sourceScript,
            amount: {
              token: Number(sourceTokenId),
              amount,
            },
            domain: TRANSFER_DOMAIN_TYPE.EVM,
          },
          dst: {
            address: dstScript,
            amount: {
              token: Number(targetTokenId),
              amount,
            },
            domain: TRANSFER_DOMAIN_TYPE.DVM,
          },
        },
      ],
    },
    dvmScript
  );

  return new CTransactionSegWit(signed);
}

export function transferDomainCrafter(
  amount: BigNumber,
  convertDirection: ConvertDirection,
  sourceToken: {
    tokenId: string;
    displaySymbol: string;
    balance: BigNumber;
  },
  targetToken: {
    tokenId: string;
    displaySymbol: string;
    balance: BigNumber;
  },
  onBroadcast: () => any,
  onConfirmation: () => void,
  submitButtonLabel?: string
): DfTxSigner {
  if (
    ![ConvertDirection.evmToDvm, ConvertDirection.dvmToEvm].includes(
      convertDirection
    )
  ) {
    throw new Error("Unexpected transfer domain");
  }

  const [symbolA, symbolB] =
    convertDirection === ConvertDirection.dvmToEvm
      ? [sourceToken.displaySymbol, targetToken.displaySymbol]
      : [targetToken.displaySymbol, sourceToken.displaySymbol];

  return {
    sign: async (account: WhaleWalletAccount) =>
      await transferDomainSigner(
        account,
        sourceToken.tokenId,
        targetToken.tokenId,
        amount,
        convertDirection
      ),
    title: translate(
      "screens/ConvertConfirmScreen",
      "Convert {{amount}} {{source}} to {{target}}",
      {
        amount: amount.toFixed(8),
        source: symbolA,
        target: symbolB,
      }
    ),
    drawerMessages: {
      preparing: translate("screens/OceanInterface", "Preparing to convert…"),
      waiting: translate(
        "screens/OceanInterface",
        "Converting {{amount}} {{symbolA}} to {{symbolB}}",
        {
          symbolA: symbolA,
          symbolB: symbolB,
          amount: amount.toFixed(8),
        }
      ),
      complete: translate(
        "screens/OceanInterface",
        "{{amount}} {{symbolA}} converted to {{symbolB}}",
        {
          symbolA: symbolA,
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
