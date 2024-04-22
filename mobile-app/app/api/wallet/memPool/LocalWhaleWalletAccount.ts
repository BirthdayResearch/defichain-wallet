import { WalletEllipticPair } from "@defichain/jellyfish-wallet";
import { WhaleWalletAccount } from "@defichain/whale-api-wallet";
import { WhaleApiClient } from "@defichain/whale-api-client";
import { Network } from "@defichain/jellyfish-network";
import { LocalWhalePrevoutProvider } from "./LocalWhalePrevoutProvider";

export class LocalWhaleWalletAccount extends WhaleWalletAccount {
  protected readonly prevoutProvider: LocalWhalePrevoutProvider;

  constructor(
    client: WhaleApiClient,
    walletEllipticPair: WalletEllipticPair,
    network: Network,
    prevoutSize: number = 200,
  ) {
    super(client, walletEllipticPair, network, prevoutSize);
    this.prevoutProvider = new LocalWhalePrevoutProvider(this, prevoutSize);
  }
}
