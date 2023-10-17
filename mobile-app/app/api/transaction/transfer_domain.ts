import { translate } from "@translations";
import BigNumber from "bignumber.js";
import { ethers, providers, utils } from "ethers";
import { DfTxSigner } from "@waveshq/walletkit-ui/dist/store";
import { WhaleWalletAccount } from "@defichain/whale-api-wallet";
import {
  CTransactionSegWit,
  TransferDomain,
  Script,
} from "@defichain/jellyfish-transaction";
import { Prevout } from "@defichain/jellyfish-transaction-builder";
import { fromAddress, Eth } from "@defichain/jellyfish-address";
import { NetworkName } from "@defichain/jellyfish-network";
import { ConvertDirection } from "@screens/enum";
import TransferDomainV1 from "@shared-contracts/TransferDomainV1.json";

const TD_CONTRACT_ADDR = "0xdf00000000000000000000000000000000000001";

const TRANSFER_DOMAIN_TYPE = {
  DVM: 2,
  EVM: 3,
};

export interface TransferDomainToken {
  tokenId: string;
  displaySymbol: string;
  displayTextSymbol: string;
  balance: BigNumber;
}

interface TransferDomainSigner {
  account: WhaleWalletAccount;
  sourceTokenId: string;
  targetTokenId: string;
  amount: BigNumber;
  convertDirection: ConvertDirection;
  dvmAddress: string;
  evmAddress: string;
  chainId?: number;
  networkName: NetworkName;
  nonce: number;
}

export async function transferDomainSigner({
  account,
  sourceTokenId,
  targetTokenId,
  amount,
  convertDirection,
  dvmAddress,
  evmAddress,
  chainId,
  networkName,
  nonce,
}: TransferDomainSigner): Promise<CTransactionSegWit> {
  const dvmScript = fromAddress(dvmAddress, networkName)?.script as Script;
  const evmScript = Eth.fromAddress(evmAddress) as Script;
  const builder = account.withTransactionBuilder();

  const isEvmToDvm = convertDirection === ConvertDirection.evmToDvm;

  const [sourceScript, dstScript] = isEvmToDvm
    ? [evmScript, dvmScript]
    : [dvmScript, evmScript];

  const [srcDomain, dstDomain] = isEvmToDvm
    ? [TRANSFER_DOMAIN_TYPE.EVM, TRANSFER_DOMAIN_TYPE.DVM]
    : [TRANSFER_DOMAIN_TYPE.DVM, TRANSFER_DOMAIN_TYPE.EVM];

  const signedEvmTxData = await createSignedEvmTx({
    isEvmToDvm,
    sourceTokenId,
    targetTokenId,
    amount,
    dvmAddress,
    evmAddress,
    accountEvmAddress: await account.getEvmAddress(),
    privateKey: await account.privateKey(),
    chainId,
    nonce,
  });

  const transferDomain: TransferDomain = {
    items: [
      {
        src: {
          address: sourceScript,
          domain: srcDomain,
          amount: {
            token: stripEvmSuffixFromTokenId(sourceTokenId),
            amount: amount,
          },
          data: isEvmToDvm ? signedEvmTxData : new Uint8Array([]),
        },
        dst: {
          address: dstScript,
          domain: dstDomain,
          amount: {
            token: stripEvmSuffixFromTokenId(targetTokenId),
            amount: amount,
          },
          data: isEvmToDvm ? new Uint8Array([]) : signedEvmTxData,
        },
      },
    ],
  };

  const { utxos, walletOwnerDvmScript } = await getTransferDomainVin(
    account,
    networkName,
  );

  const signed = await builder.account.transferDomain(
    transferDomain,
    walletOwnerDvmScript,
    utxos,
  );
  return new CTransactionSegWit(signed);
}

async function getTransferDomainVin(
  account: WhaleWalletAccount,
  networkName: NetworkName,
): Promise<{ utxos: Prevout[]; walletOwnerDvmScript: Script }> {
  const walletOwnerDvmAddress = await account.getAddress();
  const walletOwnerDvmScript = fromAddress(walletOwnerDvmAddress, networkName)
    ?.script as Script;

  const utxoList = await account.client.address.listTransactionUnspent(
    walletOwnerDvmAddress,
  );

  const utxos: Prevout[] = [];
  if (utxoList.length > 0) {
    utxos.push({
      txid: utxoList[0].vout.txid,
      vout: utxoList[0].vout.n,
      value: new BigNumber(utxoList[0].vout.value),
      script: walletOwnerDvmScript,
      tokenId: utxoList[0].vout.tokenId ?? 0,
    });
  }

  return { utxos, walletOwnerDvmScript };
}

export function transferDomainCrafter({
  amount,
  convertDirection,
  sourceToken,
  targetToken,
  networkName,
  onBroadcast,
  onConfirmation,
  chainId,
  submitButtonLabel,
  dvmAddress,
  evmAddress,
  nonce,
}: {
  amount: BigNumber;
  convertDirection: ConvertDirection;
  sourceToken: TransferDomainToken;
  targetToken: TransferDomainToken;
  networkName: NetworkName;
  onBroadcast: () => any;
  onConfirmation: () => void;
  chainId?: number;
  submitButtonLabel?: string;
  dvmAddress: string;
  evmAddress: string;
  nonce: number;
}): DfTxSigner {
  if (
    ![ConvertDirection.evmToDvm, ConvertDirection.dvmToEvm].includes(
      convertDirection,
    )
  ) {
    throw new Error("Unexpected transfer domain");
  }

  const [symbolA, symbolB] =
    convertDirection === ConvertDirection.dvmToEvm
      ? [
          sourceToken.displayTextSymbol,
          `${targetToken.displayTextSymbol} (EVM)`,
        ]
      : [
          `${targetToken.displayTextSymbol} (EVM)`,
          sourceToken.displayTextSymbol,
        ];

  return {
    sign: async (account: WhaleWalletAccount) =>
      await transferDomainSigner({
        account,
        amount,
        convertDirection,
        networkName,
        sourceTokenId: sourceToken.tokenId,
        targetTokenId: targetToken.tokenId,
        dvmAddress,
        evmAddress,
        chainId,
        nonce,
      }),
    title: translate(
      "screens/ConvertConfirmScreen",
      "Convert {{amount}} {{symbolA}} to {{symbolB}} tokens",
      {
        amount: amount.toFixed(8),
        symbolA,
        symbolB,
      },
    ),
    drawerMessages: {
      preparing: translate("screens/OceanInterface", "Preparing to convert…"),
      waiting: translate(
        "screens/OceanInterface",
        "Converting {{amount}} {{symbolA}} to {{symbolB}} tokens",
        {
          symbolA: symbolA,
          symbolB: symbolB,
          amount: amount.toFixed(8),
        },
      ),
      complete: translate(
        "screens/OceanInterface",
        "{{amount}} {{symbolA}} converted to {{symbolB}} tokens",
        {
          symbolA: symbolA,
          symbolB: symbolB,
          amount: amount.toFixed(8),
        },
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

interface EvmTxSigner {
  isEvmToDvm: boolean;
  sourceTokenId: string;
  targetTokenId: string;
  amount: BigNumber;
  dvmAddress: string;
  evmAddress: string;
  accountEvmAddress: string;
  privateKey: Buffer;
  chainId?: number;
  nonce: number;
}

async function createSignedEvmTx({
  isEvmToDvm,
  sourceTokenId,
  targetTokenId,
  amount,
  dvmAddress,
  evmAddress,
  privateKey,
  chainId,
  nonce,
}: EvmTxSigner): Promise<Uint8Array> {
  let data;
  const tdFace = new utils.Interface(TransferDomainV1.abi);
  const from = isEvmToDvm ? evmAddress : TD_CONTRACT_ADDR;
  const to = isEvmToDvm ? TD_CONTRACT_ADDR : evmAddress;
  const parsedAmount = utils.parseUnits(
    amount.decimalPlaces(8, BigNumber.ROUND_DOWN).toString(),
    18,
  ); // TODO: Get decimals from token contract
  const vmAddress = dvmAddress;

  if (sourceTokenId === "0" || targetTokenId === "0") {
    /* For DFI, use `transfer` function */
    const transferDfi = [from, to, parsedAmount, vmAddress];
    data = tdFace.encodeFunctionData("transfer", transferDfi);
  } else {
    /* For DST20, use `transferDST20` function */
    const dst20TokenId = stripEvmSuffixFromTokenId(sourceTokenId);
    const contractAddress = getAddressFromDST20TokenId(dst20TokenId);
    const transferDST20 = [contractAddress, from, to, parsedAmount, vmAddress];
    data = tdFace.encodeFunctionData("transferDST20", transferDST20);
  }
  const wallet = new ethers.Wallet(privateKey);

  const tx: providers.TransactionRequest = {
    to: TD_CONTRACT_ADDR,
    nonce,
    chainId,
    data: data,
    value: 0,
    gasLimit: 0,
    gasPrice: 0,
    type: 0,
  };
  const evmtxSigned = (await wallet.signTransaction(tx)).substring(2); // rm prefix `0x`
  return new Uint8Array(Buffer.from(evmtxSigned, "hex") || []);
}

function stripEvmSuffixFromTokenId(tokenId: string) {
  if (tokenId.includes("_evm")) {
    return Number(tokenId.replace("_evm", ""));
  }
  return Number(tokenId);
}

/**
 *  Get DST20 contract address
 *  https://github.com/DeFiCh/ain/blob/f5a671362f9899080d0a0dddbbcdcecb7c19d9e3/lib/ain-contracts/src/lib.rs#L79
 */
export function getAddressFromDST20TokenId(tokenId: number | string): string {
  const parsedTokenId = BigInt(tokenId);
  const numberStr = parsedTokenId.toString(16); // Convert parsedTokenId to hexadecimal
  const paddedNumberStr = numberStr.padStart(38, "0"); // Pad with zeroes to the left
  const finalStr = `ff${paddedNumberStr}`;
  const tokenContractAddess = utils.getAddress(finalStr);
  return tokenContractAddess;
}
