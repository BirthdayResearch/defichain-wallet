import { PlaygroundApiClient } from '@defichain/playground-api-client'
import { useEffect, useState } from 'react'
import { EnvironmentNetwork } from '../environment'
import { Logging } from '../logging'
import { getNetwork } from '../storage'

let SINGLETON: PlaygroundApiClient | undefined

export function useCachedPlaygroundClient (): boolean {
  const [isLoaded, setLoaded] = useState(false)

  useEffect(() => {
    newPlaygroundClient().then((client) => {
      SINGLETON = client
      setLoaded(true)
    }).catch(Logging.error)
  }, [])

  return isLoaded
}

export function getPlaygroundClient (): PlaygroundApiClient {
  if (SINGLETON !== undefined) {
    return SINGLETON
  }

  throw new Error('useCachedPlaygroundClient() === true, hooks must be called before getPlaygroundClient()')
}

async function newPlaygroundClient (): Promise<PlaygroundApiClient> {
  const network = await getNetwork()

  switch (network) {
    case EnvironmentNetwork.RemotePlayground:
      return new PlaygroundApiClient({ url: 'https://playground.defichain.com' })
    case EnvironmentNetwork.LocalPlayground:
      return new PlaygroundApiClient({ url: 'http://localhost:19553' })
    default:
      throw new Error(`playground not available for '${network}'`)
  }
}
