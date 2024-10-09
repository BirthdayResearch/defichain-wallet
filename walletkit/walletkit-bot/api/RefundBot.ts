/* eslint-disable no-console */
import {
  CTransactionSegWit,
  TransactionSegWit,
} from "@defichain/jellyfish-transaction";
import { WhaleWalletAccount } from "@defichain/whale-api-wallet";
import {
  EnvironmentNetwork,
  getJellyfishNetwork,
} from "@waveshq/walletkit-core";
import { BigNumber } from "bignumber.js";

import {
  createWallet,
  getAddressScript,
  getWhaleClient,
} from "./DeFiChainCore";

export interface HandlerProps {
  index: number; // index of wallet's derived from parent private keys
  refundAddress: string;
  claimAmount: string; // the amount that the user wants to be refunded
  tokenSymbol: string;
  urlNetwork: string;
  envNetwork: EnvironmentNetwork;
  mnemonic: string;
}

export async function handler(props: HandlerProps): Promise<void> {
  try {
    const {
      index,
      refundAddress,
      claimAmount,
      tokenSymbol,
      urlNetwork,
      mnemonic,
      envNetwork,
    } = props;

    const client = getWhaleClient(urlNetwork, envNetwork);
    const network = getJellyfishNetwork(envNetwork);
    const account = new WhaleWalletAccount(
      client,
      createWallet(urlNetwork, envNetwork, mnemonic, index),
      network,
    );

    // Checks for invalid arguments from the database
    if (Number(index) < 0) {
      throw new Error(`${index} not a valid index`);
    }

    if (
      new BigNumber(claimAmount).isLessThanOrEqualTo(0) ||
      new BigNumber(claimAmount).isNaN()
    ) {
      throw new Error(`Invalid claim amount: ${new BigNumber(claimAmount)}`);
    }

    if (tokenSymbol === undefined || tokenSymbol === "") {
      throw new Error(`Token symbol is undefined`);
    }

    // Gives back the id of the tokenSymbol
    // eslint-disable-next-line no-restricted-properties
    const tokenId = (await account.client.tokens.list()).find(
      (token) => token.symbol === tokenSymbol && token.isDAT, // to ensure that its DeFiChain's official token
    )?.id;

    if (tokenId === undefined) {
      throw new Error("tokenId is undefined");
    }

    const from = await account.getScript();
    const to = getAddressScript(refundAddress, envNetwork);
    // Allows support for UTXO transactions
    const builder = await account.withTransactionBuilder();

    const isDFI = tokenSymbol === "DFI"; // Assumed DFI UTXO

    let txn: TransactionSegWit;

    if (isDFI) {
      // Sends DFI UTXO, not Tokens back to refundAddress
      const fees = 0.001;
      const amountToClaim = new BigNumber(claimAmount);

      if (amountToClaim.isLessThanOrEqualTo(fees)) {
        throw new Error(`Not enough amount to cover txn fees`);
      } else {
        txn = await builder.utxo.send(amountToClaim.minus(fees), to, from);
      }
    } else {
      // Only sends Tokens
      txn = await builder.account.accountToAccount(
        {
          from,
          to: [
            {
              script: to,
              balances: [
                {
                  token: Number(tokenId),
                  amount: new BigNumber(claimAmount),
                },
              ],
            },
          ],
        },
        from,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow, no-inner-declarations
    async function broadcast(txn: TransactionSegWit): Promise<void> {
      const hex: string = new CTransactionSegWit(txn).toHex();
      const txId: string = await client.rawtx.send({ hex });

      return console.log(`Send TxId: ${txId}`); // added return for unit testing
    }

    await broadcast(txn);
  } catch (error) {
    console.log((error as Error).message);
  }
}
