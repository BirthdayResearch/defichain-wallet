import { WhaleApiClient } from '@defichain/whale-api-client'
import { useEffect, useState } from 'react'
import { EnvironmentNetwork } from '../environment'
import { Logging } from '../logging'
import { getNetwork } from '../storage'

let SINGLETON: WhaleApiClient | undefined

export function useCachedWhaleClient (): boolean {
  const [isLoaded, setLoaded] = useState(false)

  useEffect(() => {
    newWhaleClient().then((client) => {
      SINGLETON = client
      setLoaded(true)
    }).catch(Logging.error)
  }, [])

  return isLoaded
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
