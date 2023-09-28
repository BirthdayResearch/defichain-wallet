import { translate } from "@translations";
import BigNumber from "bignumber.js";
import { ethers, utils } from "ethers";
// import { providers } from "ethers"; // TODO: Uncomment
import { DfTxSigner } from "@waveshq/walletkit-ui/dist/store";
import { WhaleWalletAccount } from "@defichain/whale-api-wallet";
import {
  CTransactionSegWit,
  TransactionSegWit,
} from "@defichain/jellyfish-transaction";
import { ConvertDirection } from "@screens/enum";
import { parseUnits } from "ethers/lib/utils";
import TransferDomain from "../../contracts/TransferDomainImplV1.json";

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
  const evmScript = await account.getEvmScript();
  const evmAddress = await account.getEvmAddress();
  const builder = account.withTransactionBuilder();

  const [sourceScript, dstScript] =
    convertDirection === ConvertDirection.evmToDvm
      ? [evmScript, dvmScript]
      : [dvmScript, evmScript];

  const [srcDomain, dstDomain] =
    convertDirection === ConvertDirection.evmToDvm
      ? [TRANSFER_DOMAIN_TYPE.EVM, TRANSFER_DOMAIN_TYPE.DVM]
      : [TRANSFER_DOMAIN_TYPE.DVM, TRANSFER_DOMAIN_TYPE.EVM];

  console.log("YOHOOOOO TD SIGNER2:: ", { sourceTokenId, targetTokenId });
  console.log("YOHOOOOO TD SIGNER2:: ", {
    sourceTokenId,
    targetTokenId,
    toAddr: await account.getAddress(),
  });

  /**
   * TODO: Start of EvmTx signer here
   * */
  const TD_CONTRACT_ADDR = "0xdf00000000000000000000000000000000000001";
  const tdIFace = new utils.Interface(TransferDomain.abi);

  let data;
  const from = evmAddress;
  const to =
    convertDirection === ConvertDirection.evmToDvm
      ? TD_CONTRACT_ADDR
      : evmAddress;
  const parsedAmount = parseUnits(amount.toString(), 18);
  const vmAddress = await account.getAddress();
  console.log("YOHOOOOO TD SIGNER3:: ", {
    from,
    to,
    parsedAmount,
    vmAddress,
  });

  // const to = "0xb04Aa766ECe6F9e92c6E909DD99Bb1fA1c6C0412";
  if (sourceTokenId === "0" || targetTokenId === "0-EVM") {
    console.log("YOHOOOOO NATIVE DFI TOKEN....");
    data = tdIFace.encodeFunctionData("transfer", [
      from,
      to,
      parsedAmount,
      vmAddress,
    ]);
  } else {
    // DST20 - BTC
    console.log("YOHOOOOO NON-DFI TOKEN....");

    /**
     * TODO: Either construct the token address based on `ain` logic or add a config file to map the address for each token
     */
    const DST_20_CONTRACT_ADDR_BTC =
      "0xff00000000000000000000000000000000000001";
    data = tdIFace.encodeFunctionData("transferDST20", [
      DST_20_CONTRACT_ADDR_BTC,
      from,
      to,
      parsedAmount,
      vmAddress,
    ]);
  }

  // const ethRpc = new providers.JsonRpcProvider("http://localhost:19551"); // TODO: Uncomment
  const privateKey = await account.privateKey();
  const wallet = new ethers.Wallet(privateKey);
  console.log("YOHOOO-WALLETADDR: ", { address: wallet.address, privateKey });

  /* TODO: Figure out CORS issue when using the ethRpc
  const tx: any = {
    to: TD_CONTRACT_ADDR,
    nonce: await ethRpc.getTransactionCount(from),
    value: 0,
    chainId: (await ethRpc.getNetwork()).chainId,
    data: data,
    gasLimit: 100_000,
    gasPrice: (await ethRpc.getFeeData()).gasPrice, // base fee
  }; */
  const tx: any = {
    to: TD_CONTRACT_ADDR,
    nonce: 0,
    value: 0,
    chainId: 1133,
    data: data,
    gasLimit: 100_000,
    gasPrice: 1000, // base fee
  };

  const evmtxSigned = (await wallet.signTransaction(tx)).substring(2); // rm prefix `0x`
  const evmTx =
    new Uint8Array(Buffer.from(evmtxSigned, "hex")) || new Uint8Array([]);
  console.log("YOHOOOOO EVMTX: ", { evmTx });

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
            domain: srcDomain,
            data:
              convertDirection === ConvertDirection.evmToDvm
                ? evmTx
                : new Uint8Array([]),
          },
          dst: {
            address: dstScript,
            amount: {
              token: Number(targetTokenId),
              amount,
            },
            domain: dstDomain,
            data:
              convertDirection === ConvertDirection.dvmToEvm
                ? evmTx
                : new Uint8Array([]),
          },
        },
      ],
    },
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

  console.log("YOHOOOO TD CRAFTER");

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
