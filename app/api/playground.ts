import { PlaygroundApiClient, PlaygroundRpcClient } from '@defichain/playground-api-client'
import { useEffect, useState } from 'react'
import { EnvironmentNetwork, getEnvironment } from '../environment'
import { Logging } from '../logging'
import { setNetwork } from '../storage'

let INSTANCE: PlaygroundApiClient | undefined

/**
 * use cached playground client,
 * will only be loaded if it is in non debug mode
 */
export function useCachedPlaygroundClient (): boolean {
  const [isLoaded, setLoaded] = useState(false)

  useEffect(() => {
    async function load (): Promise<void> {
      if (!getEnvironment().debug) {
        setLoaded(true)
        return
      }

      const localClient = newPlaygroundClient(EnvironmentNetwork.LocalPlayground)
      if (await isConnected(localClient)) {
        await setNetwork(EnvironmentNetwork.LocalPlayground)
        INSTANCE = localClient
        setLoaded(true)
        return
      }

      await setNetwork(EnvironmentNetwork.RemotePlayground)
      INSTANCE = newPlaygroundClient(EnvironmentNetwork.RemotePlayground)
      setLoaded(true)
    }

    load().catch(Logging.error)
  }, [])

  return isLoaded
}

export function getPlaygroundApiClient (): PlaygroundApiClient {
  if (INSTANCE !== undefined) {
    return INSTANCE
  }

  throw new Error('useCachedPlaygroundClient() === true, hooks must be called before getPlaygroundApiClient()')
}

export function getPlaygroundRpcClient (): PlaygroundRpcClient {
  const client = getPlaygroundApiClient()
  return new PlaygroundRpcClient(client)
}

async function isConnected (client: PlaygroundApiClient): Promise<boolean> {
  return await client.playground.info()
    .then(() => true)
    .catch(() => false)
}

function newPlaygroundClient (network: EnvironmentNetwork): PlaygroundApiClient {
  switch (network) {
    case EnvironmentNetwork.RemotePlayground:
      return new PlaygroundApiClient({ url: 'https://playground.defichain.com' })
    case EnvironmentNetwork.LocalPlayground:
      return new PlaygroundApiClient({ url: 'http://localhost:19553' })
    default:
      throw new Error(`playground not available for '${network}'`)
  }
}
