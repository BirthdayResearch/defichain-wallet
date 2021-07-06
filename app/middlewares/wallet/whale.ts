import { WhaleWalletAccountProvider } from '@defichain/whale-api-wallet'
import { getWhaleClient } from '../api/whale'
import { getNetworkOptions } from './network'

export async function getWhaleWalletAccountProvider (): Promise<WhaleWalletAccountProvider> {
  const network = await getNetworkOptions()
  const client = getWhaleClient()
  return new WhaleWalletAccountProvider(client, network)
}
