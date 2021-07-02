import { NetworkName } from '../../store/network'
import { getNetwork, Network } from '@defichain/jellyfish-network'
import { WhaleWalletAccount, WhaleWalletAccountProvider } from '@defichain/whale-api-wallet'
import { JellyfishWallet, WalletHdNode } from '@defichain/jellyfish-wallet'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { MnemonicStorage } from './MnemonicStorage'

export async function getMnemonicWallet (
  whaleApiClient: WhaleApiClient,
  networkName: NetworkName
): Promise<JellyfishWallet<WhaleWalletAccount, WalletHdNode>> {
  const network = parseNetwork(networkName)
  const mnemonic = new MnemonicStorage(network)
  const accountProvider = new WhaleWalletAccountProvider(whaleApiClient, network)
  const nodeProvider = await mnemonic.getHdNodeProvider()
  return new JellyfishWallet(nodeProvider, accountProvider)
}

export async function hasMnemonicWallet (): Promise<boolean> {
  return await MnemonicStorage.hasSeed()
}

function parseNetwork (name: NetworkName): Network {
  switch (name) {
    case 'playground':
      return getNetwork('regtest')
    case 'mainnet':
    case 'testnet':
    case 'regtest':
      return getNetwork(name)
  }
}
