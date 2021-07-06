import { WhaleApiClient } from '@defichain/whale-api-client'
import { EnvironmentNetwork } from '../../environment'
import { getNetwork } from '../storage'

let SINGLETON: WhaleApiClient | undefined

export async function initWhaleClient (): Promise<WhaleApiClient> {
  SINGLETON = await newWhaleClient()
  return SINGLETON
}

export function getWhaleClient (): WhaleApiClient {
  if (SINGLETON !== undefined) {
    return SINGLETON
  }

  throw new Error('useCachedWhaleClient() === true, hooks must be called before getWhaleClient()')
}

async function newWhaleClient (): Promise<WhaleApiClient> {
  const network = await getNetwork()

  switch (network) {
    case EnvironmentNetwork.MainNet:
      return new WhaleApiClient({ url: 'https://ocean.defichain.com', network: 'mainnet' })
    case EnvironmentNetwork.TestNet:
      return new WhaleApiClient({ url: 'https://ocean.defichain.com', network: 'testnet' })
    case EnvironmentNetwork.RemotePlayground:
      return new WhaleApiClient({ url: 'https://playground.defichain.com', network: 'regtest' })
    case EnvironmentNetwork.LocalPlayground:
      return new WhaleApiClient({ url: 'http://localhost:19553', network: 'regtest' })
  }
}
