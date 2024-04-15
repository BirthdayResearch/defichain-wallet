/* eslint-disable no-console */
import { WhalePrevoutProvider } from "@defichain/whale-api-wallet";
import { Prevout } from "@defichain/jellyfish-transaction-builder";
import BigNumber from "bignumber.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EnvironmentNetwork } from "@waveshq/walletkit-core";

const KEY = "WALLET.LOCAL_MEM_POOL";

function getKey(network: EnvironmentNetwork): string {
  return `${network}.${KEY}`;
}

async function setMemPool(
  value: LocalMempool[],
  network: EnvironmentNetwork,
): Promise<void> {
  await AsyncStorage.setItem(getKey(network), JSON.stringify(value));
}

async function getMemPool(
  network: EnvironmentNetwork,
): Promise<LocalMempool[]> {
  const val = await AsyncStorage.getItem(getKey(network));
  return val ? JSON.parse(val) : [];
}

interface LocalMempool {
  tx: Prevout;
  spend: boolean;
}

export class LocalWhalePrevoutProvider extends WhalePrevoutProvider {
  // mempool: LocalMempool[] = []; // Local mempool

  network: EnvironmentNetwork;

  constructor(account: any, size: number) {
    super(account, size);
    this.network = EnvironmentNetwork.MainNet;
    console.count("constructor");
  }

  async add(tx: Prevout): Promise<void> {
    const mempool = await getMemPool(this.network);

    mempool.push({
      tx: tx,
      spend: false,
    });
    await setMemPool(mempool, this.network);
    const localPrevouts = mempool.filter((m) => !m.spend).map((m) => m.tx.txid);
    console.log(localPrevouts);
    // TODO Loop through the mempool and set 'spend' to true if the input is spent
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

  // TODO
  // eslint-disable-next-line class-methods-use-this
  async sync(): Promise<void> {
    // Advanced feature.
    // Sync all local mempool into Whale, esp when there is rollback or unconfirmed that got lost.
  }

  async getTxOut(txId: string, index: number): Promise<any> {
    return await this.account.client.rpc.call("gettxout", [txId, index], {
      value: "bignumber",
    });
  }

  async all(): Promise<Prevout[]> {
    const remotePrevouts = await super.all(); // Fetch prevouts from remote
    const mempool = await getMemPool(this.network);

    const localPrevouts = mempool.filter((m) => !m.spend).map((m) => m.tx.txid);

    for (let i = 0; i < localPrevouts.length; i++) {
      const status = this.getTxOut(localPrevouts[i], 0);
      console.log({ status });
    }
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
