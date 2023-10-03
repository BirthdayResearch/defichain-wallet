import { translate } from "@translations";
import BigNumber from "bignumber.js";
import { ethers, providers, utils } from "ethers";
import { DfTxSigner } from "@waveshq/walletkit-ui/dist/store";
import { WhaleWalletAccount } from "@defichain/whale-api-wallet";
import {
  CTransactionSegWit,
  TransferDomain,
} from "@defichain/jellyfish-transaction";
import { ConvertDirection } from "@screens/enum";
import { parseUnits } from "ethers/lib/utils";
import TransferDomainV1 from "../../contracts/TransferDomainV1.json";

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

export async function transferDomainSigner(
  account: WhaleWalletAccount,
  sourceTokenId: string,
  targetTokenId: string,
  amount: BigNumber,
  convertDirection: ConvertDirection,
): Promise<CTransactionSegWit> {
  const dvmScript = await account.getScript();
  const dvmAddress = await account.getAddress();
  const evmScript = await account.getEvmScript();
  const evmAddress = await account.getEvmAddress();
  const builder = account.withTransactionBuilder();

  const isEvmToDvm = convertDirection === ConvertDirection.evmToDvm;

  const [sourceScript, dstScript] = isEvmToDvm
    ? [evmScript, dvmScript]
    : [dvmScript, evmScript];

  const [srcDomain, dstDomain] = isEvmToDvm
    ? [TRANSFER_DOMAIN_TYPE.EVM, TRANSFER_DOMAIN_TYPE.DVM]
    : [TRANSFER_DOMAIN_TYPE.DVM, TRANSFER_DOMAIN_TYPE.EVM];

  /* Start of EvmTx signer here */
  const tdFace = new utils.Interface(TransferDomainV1.abi);

  let data;
  const from = isEvmToDvm ? evmAddress : TD_CONTRACT_ADDR;
  const to = isEvmToDvm ? TD_CONTRACT_ADDR : evmAddress;
  // TODO: round off parsedAmount to 8 decimals
  const parsedAmount = parseUnits(amount.toString(), 18); // TODO: Get decimals from token contract
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

  // const ethRpc = new providers.JsonRpcProvider("http://localhost:19551"); // TODO: Uncomment
  const privateKey = await account.privateKey();
  const wallet = new ethers.Wallet(privateKey);

  /* TODO: Figure out CORS issue when using the ethRpc */
  const tx: providers.TransactionRequest = {
    to: TD_CONTRACT_ADDR,
    nonce: 0, // await ethRpc.getTransactionCount(from) // TODO: Remove hardcoded data
    chainId: 1133, // (await rpc.getNetwork()).chainId, // TODO: Remove hardcoded data
    data: data,
    value: 0,
    gasLimit: 0,
    gasPrice: 0,
    type: 0,
  };

  const evmtxSigned = (await wallet.signTransaction(tx)).substring(2); // rm prefix `0x`
  const evmTx = new Uint8Array(Buffer.from(evmtxSigned, "hex") || []);

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
          data: isEvmToDvm ? evmTx : new Uint8Array([]),
        },
        dst: {
          address: dstScript,
          domain: dstDomain,
          amount: {
            token: stripEvmSuffixFromTokenId(targetTokenId),
            amount: amount,
          },
          data: isEvmToDvm ? new Uint8Array([]) : evmTx,
        },
      },
    ],
  };

  const signed = await builder.account.transferDomain(
    transferDomain,
    dvmScript,
  );

  return new CTransactionSegWit(signed);
}

export function transferDomainCrafter(
  amount: BigNumber,
  convertDirection: ConvertDirection,
  sourceToken: TransferDomainToken,
  targetToken: TransferDomainToken,
  onBroadcast: () => any,
  onConfirmation: () => void,
  submitButtonLabel?: string,
): DfTxSigner {
  if (
    ![ConvertDirection.evmToDvm, ConvertDirection.dvmToEvm].includes(
      convertDirection,
    )
  ) {
    throw new Error("Unexpected transfer domain");
  }

  const [symbolA, symbolB] =
    convertDirection === ConvertDirection.dvmToEvm
      ? [sourceToken.displayTextSymbol, `${targetToken.displayTextSymbol}-EVM`]
      : [`${targetToken.displayTextSymbol}-EVM`, sourceToken.displayTextSymbol];

  return {
    sign: async (account: WhaleWalletAccount) =>
      await transferDomainSigner(
        account,
        sourceToken.tokenId,
        targetToken.tokenId,
        amount,
        convertDirection,
      ),
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

function stripEvmSuffixFromTokenId(tokenId: string) {
  if (tokenId.includes("-EVM")) {
    return Number(tokenId.replace("-EVM", ""));
  }
  return Number(tokenId);
}

/**
 *  Get DST20 contract address
 *  https://github.com/DeFiCh/ain/blob/f5a671362f9899080d0a0dddbbcdcecb7c19d9e3/lib/ain-contracts/src/lib.rs#L79
 */
function getAddressFromDST20TokenId(tokenId: number): string {
  const parsedTokenId = BigInt(tokenId);
  const numberStr = parsedTokenId.toString(16); // Convert parsedTokenId to hexadecimal
  const paddedNumberStr = numberStr.padStart(38, "0"); // Pad with zeroes to the left
  const finalStr = `ff${paddedNumberStr}`;
  const tokenContractAddess = utils.getAddress(finalStr);
  return tokenContractAddess;
}
