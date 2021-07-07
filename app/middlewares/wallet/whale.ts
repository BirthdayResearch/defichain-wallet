import { WhaleWalletAccountProvider } from '@defichain/whale-api-wallet'
import { getWhaleClient } from '../api/whale'
import { getJellyfishNetwork } from './network'

export async function getWhaleWalletAccountProvider (): Promise<WhaleWalletAccountProvider> {
  const network = await getJellyfishNetwork()
  const client = getWhaleClient()
  return new WhaleWalletAccountProvider(client, network)
}
