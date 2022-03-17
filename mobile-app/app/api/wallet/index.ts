import { JellyfishWallet, WalletHdNode, WalletHdNodeProvider } from '@defichain/jellyfish-wallet'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { WhaleWalletAccount, WhaleWalletAccountProvider } from '@defichain/whale-api-wallet'
import { EnvironmentNetwork } from '@environment'
import { getJellyfishNetwork } from '@shared-api/wallet/network'

export function initJellyfishWallet<HdNode extends WalletHdNode> (provider: WalletHdNodeProvider<HdNode>, network: EnvironmentNetwork, client: WhaleApiClient): JellyfishWallet<WhaleWalletAccount, HdNode> {
  const accountProvider = new WhaleWalletAccountProvider(client, getJellyfishNetwork(network))
  return new JellyfishWallet(provider, accountProvider)
}

export * from './provider/mnemonic_encrypted'
export * from './provider/mnemonic_unprotected'
export * from './passcode_attempt'
export * from './persistence'
