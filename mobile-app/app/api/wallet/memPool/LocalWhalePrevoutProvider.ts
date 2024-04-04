import { WhalePrevoutProvider } from "@defichain/whale-api-wallet";
import { Prevout } from "@defichain/jellyfish-transaction-builder";
import BigNumber from "bignumber.js";

interface LocalMempool {
  tx: Prevout;
  spend: boolean;
}

export class LocalWhalePrevoutProvider extends WhalePrevoutProvider {
  mempool: LocalMempool[] = []; // Local mempool

  async add(tx: Prevout): Promise<void> {
    this.mempool.push({
      tx: tx,
      spend: false,
    });
    // Loop through the mempool and set 'spend' to true if the input is spent
  }

  static selectCoins(prevouts: Prevout[], targetAmount: BigNumber): Prevout[] {
    // Sort UTXOs by amount (ascending)
    prevouts.sort((a: Prevout, b: Prevout) =>
      a.value.minus(b.value).toNumber(),
    );
    const selectedCoins: Prevout[] = [];
    let totalAmountSelected = new BigNumber(0);
    // Iterate through sorted UTXOs and select coins until totalAmountSelected >= targetAmount
    for (const prevout of prevouts) {
      selectedCoins.push(prevout);
      totalAmountSelected = totalAmountSelected.plus(prevout.value);

      if (totalAmountSelected.gte(targetAmount)) {
        break;
      }
    }
    // If totalAmountSelected is less than targetAmount, return all array
    if (totalAmountSelected.lt(targetAmount)) {
      return prevouts;
    }
    return selectedCoins;
  }

  async all(): Promise<Prevout[]> {
    const remotePrevouts = await super.all(); // Fetch prevouts from remote
    // mempool length=0
    // Balance of 50DFI (10DFI each)
    // unspent txn 5 [10,10,10,10,10]
    // 1. txn 25DFI => require 3 unspent txn
    // add these 3 unspent into mempool and keep 2 aside
    // 2. txn of 11 DFI => require 2 unspent txn
    // Here we still have 5 unspent in our hand
    // i.e. do filter out the one in mempool from unspent txn list
    // return remaining (i.e. 2txn in our case)
    // Filter out spent prevouts from the local mempool
    const localPrevouts = this.mempool
      .filter((m) => !m.spend)
      .map((m) => m.tx.txid);
    // Merge remote and local prevouts
    return remotePrevouts.filter(
      (each) => localPrevouts.indexOf(each.txid) === -1,
    );
  }

  async collect(minBalance: BigNumber): Promise<Prevout[]> {
    const remotePrevouts = await this.all(); // Fetch prevouts from remote
    const requiredPrevouts = LocalWhalePrevoutProvider.selectCoins(
      remotePrevouts,
      minBalance,
    );
    requiredPrevouts.forEach((each) => this.add(each));
    return requiredPrevouts;
  }
}
