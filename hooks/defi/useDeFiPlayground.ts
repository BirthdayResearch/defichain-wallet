import * as React from 'react'
import { PlaygroundApiClient, PlaygroundRpcClient } from '@defichain/playground-api-client'

type ProviderType = 'localhost' | undefined

export const Playground: {
  rpcClient?: PlaygroundRpcClient
  provider: ProviderType
} = {
  rpcClient: undefined,
  provider: undefined
}

async function loadPlaygroundRpcClient (): Promise<void> {
  const api = new PlaygroundApiClient({ url: 'http://localhost:19553' })
  try {
    await api.rpc.call('getblockchaininfo', [], 'number')
    Playground.provider = 'localhost'
    Playground.rpcClient = new PlaygroundRpcClient(api)
  } catch (ignored) {
    console.warn(ignored)
  }
}

export default function useDeFiPlayground (): boolean {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false)

  React.useEffect(() => {
    loadPlaygroundRpcClient().finally(() => {
      setLoadingComplete(true)
    })
  }, [])

  return isLoadingComplete
}
