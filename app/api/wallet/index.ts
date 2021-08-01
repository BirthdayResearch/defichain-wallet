import { JellyfishWallet, WalletHdNode, WalletHdNodeProvider } from '@defichain/jellyfish-wallet'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { WhaleWalletAccount, WhaleWalletAccountProvider } from '@defichain/whale-api-wallet'
import { EnvironmentNetwork } from '../../environment'
import { getJellyfishNetwork } from './network'

/**
 * Whale JellyfishWallet connected to Whale APIs via the Ocean Infrastructure
 */
export type WhaleWallet = JellyfishWallet<WhaleWalletAccount, WalletHdNode>

export function initWhaleWallet (provider: WalletHdNodeProvider<WalletHdNode>, network: EnvironmentNetwork, client: WhaleApiClient): WhaleWallet {
  const accountProvider = new WhaleWalletAccountProvider(client, getJellyfishNetwork(network))
  return new JellyfishWallet(provider, accountProvider)
}

export * from './provider/mnemonic_encrypted'
export * from './provider/mnemonic_unprotected'
export * from './network'
export * from './passcode_attempt'
export * from './persistence'
