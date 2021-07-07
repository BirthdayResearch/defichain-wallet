import { PlaygroundApiClient, PlaygroundRpcClient } from '@defichain/playground-api-client'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { EnvironmentNetwork, getEnvironment, isPlayground } from '../environment'
import { Logging } from '../middlewares/logging'
import { setNetwork } from '../middlewares/storage'
import { useNetworkContext } from './NetworkContext'

interface Playground {
  rpc: PlaygroundRpcClient
  api: PlaygroundApiClient
}

const PlaygroundContext = createContext<Playground>(undefined as any)

export function usePlaygroundContext (): Playground {
  return useContext(PlaygroundContext)
}

export function PlaygroundProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const { network } = useNetworkContext()

  const context = useMemo(() => {
    const api = newPlaygroundClient(network)
    const rpc = new PlaygroundRpcClient(api)
    return { api, rpc }
  }, [network])

  return (
    <PlaygroundContext.Provider value={context}>
      {props.children}
    </PlaygroundContext.Provider>
  )
}

/**
 * hooks to find connected playground
 * @return boolean when completed or found connected playground
 */
export function useConnectedPlayground (): boolean {
  const [isLoaded, setLoaded] = useState(false)

  useEffect(() => {
    const environment = getEnvironment()
    if (!environment.debug) {
      setLoaded(true)
      return
    }

    async function findPlayground (): Promise<void> {
      for (const network of environment.networks.filter(isPlayground)) {
        if (await isConnected(network)) {
          await setNetwork(network)
          setLoaded(true)
          return
        }
      }
    }

    findPlayground().catch(Logging.error)
  }, [])

  return isLoaded
}

async function isConnected (network: EnvironmentNetwork): Promise<boolean> {
  const client = newPlaygroundClient(network)
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
