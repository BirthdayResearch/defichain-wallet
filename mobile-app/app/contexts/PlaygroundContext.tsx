import { PlaygroundApiClient, PlaygroundRpcClient } from '@defichain/playground-api-client'
import { createContext, useContext, useMemo } from 'react'
import * as React from 'react'
import { EnvironmentNetwork, isPlayground } from '@environment'
import { useNetworkContext } from '@shared-contexts/NetworkContext'

interface PlaygroundContextI {
  rpc: PlaygroundRpcClient
  api: PlaygroundApiClient
}

const PlaygroundContext = createContext<PlaygroundContextI | undefined>(undefined)

export function usePlaygroundContext (): PlaygroundContextI {
  const context = useContext(PlaygroundContext)
  if (context !== undefined) {
    return context
  }

  throw new Error('Playground not configured')
}

export function PlaygroundProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const { network } = useNetworkContext()

  const context = useMemo(() => {
    if (!isPlayground(network)) {
      return undefined
    }

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

function newPlaygroundClient (network: EnvironmentNetwork): PlaygroundApiClient {
  switch (network) {
    case EnvironmentNetwork.RemotePlayground:
      return new PlaygroundApiClient({ url: 'https://playground.jellyfishsdk.com' })
    case EnvironmentNetwork.LocalPlayground:
      return new PlaygroundApiClient({ url: 'http://localhost:19553' })
    default:
      throw new Error(`playground not available for '${network}'`)
  }
}
