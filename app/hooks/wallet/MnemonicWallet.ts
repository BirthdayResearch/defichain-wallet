import { JellyfishWallet, WalletAccount, WalletHdNode } from '@defichain/jellyfish-wallet'
import { WhaleWalletAccountProvider } from '@defichain/whale-api-wallet'
import { getWhaleClient } from '../../middlewares/api/whale'
import { getNetworkOptions } from '../../middlewares/wallet/network'
import { MnemonicStorage } from './MnemonicStorage'

/**
 * @deprecated
 */
export async function getMnemonicWallet (): Promise<JellyfishWallet<WalletAccount, WalletHdNode>> {
  const client = getWhaleClient()
  const options = await getNetworkOptions()
  const mnemonic = new MnemonicStorage(options)
  const accountProvider = new WhaleWalletAccountProvider(client, options)
  const nodeProvider = await mnemonic.getHdNodeProvider()
  return new JellyfishWallet(nodeProvider, accountProvider)
}

/**
 * @deprecated
 */
export async function hasMnemonicWallet (): Promise<boolean> {
  return await MnemonicStorage.hasSeed()
}
