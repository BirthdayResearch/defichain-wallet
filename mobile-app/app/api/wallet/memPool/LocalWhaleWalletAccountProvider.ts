import {
  WalletAccountProvider,
  WalletEllipticPair,
} from "@defichain/jellyfish-wallet";
import { WhaleApiClient } from "@defichain/whale-api-client";
import { Network } from "@defichain/jellyfish-network";

import { LocalWhaleWalletAccount } from "./LocalWhaleWalletAccount";

export class LocalWhaleWalletAccountProvider
  implements WalletAccountProvider<LocalWhaleWalletAccount>
{
  constructor(
    protected readonly client: WhaleApiClient,
    protected readonly network: Network,
  ) {}

  provide(walletEllipticPair: WalletEllipticPair): LocalWhaleWalletAccount {
    return new LocalWhaleWalletAccount(
      this.client,
      walletEllipticPair,
      this.network,
    );
  }
}
