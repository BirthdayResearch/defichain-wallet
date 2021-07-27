import { JellyfishWallet, WalletHdNode, WalletHdNodeProvider } from '@defichain/jellyfish-wallet'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { WhaleWalletAccount, WhaleWalletAccountProvider } from '@defichain/whale-api-wallet'
import { EnvironmentNetwork } from '../../../environment'
import { getJellyfishNetwork } from '../network'
import { WalletPersistenceData, WalletType } from '../persistence'
import { MnemonicEncrypted, PromptInterface } from './mnemonic_encrypted'
import { MnemonicUnprotected } from './mnemonic_unprotected'

/**
 * Whale JellyfishWallet connected to Whale APIs via the Ocean Infrastructure
 */
export type WhaleWallet = JellyfishWallet<WhaleWalletAccount, WalletHdNode>

export function initWhaleWallet (data: WalletPersistenceData<any>, network: EnvironmentNetwork, client: WhaleApiClient, promptInterface?: PromptInterface): WhaleWallet {
  const jellyfishNetwork = getJellyfishNetwork(network)

  const walletProvider = resolveProvider(data, network, promptInterface)
  const accountProvider = new WhaleWalletAccountProvider(client, jellyfishNetwork)

  return new JellyfishWallet(walletProvider, accountProvider)
}

/**
 * @param {WalletPersistenceData} data to resolve wallet provider for init
 * @param {EnvironmentNetwork} network
 */
function resolveProvider (data: WalletPersistenceData<any>, network: EnvironmentNetwork, promptInterface?: PromptInterface): WalletHdNodeProvider<WalletHdNode> {
  console.log('wallet type', data.type)
  switch (data.type) {
    case WalletType.MNEMONIC_UNPROTECTED:
      return MnemonicUnprotected.initProvider(data, network)

    case WalletType.MNEMONIC_ENCRYPTED:
      return MnemonicEncrypted.initProvider(data, network, promptInterface)
    default:
      throw new Error(`wallet ${data.type as string} not available`)
  }
}
