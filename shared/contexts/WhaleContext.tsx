import { WhaleApiClient, WhaleRpcClient } from '@defichain/whale-api-client'
import React, { createContext, useContext, useMemo } from 'react'
import { EnvironmentNetwork } from '@environment'
import { useNetworkContext } from '@shared-contexts/NetworkContext'

const WhaleApiClientContext = createContext<{
  whaleAPI: WhaleApiClient
  whaleRPC: WhaleRpcClient
}>(undefined as any)

export function useWhaleApiClient (): WhaleApiClient {
  return useContext(WhaleApiClientContext).whaleAPI
}

export function useWhaleRpcClient (): WhaleRpcClient {
  return useContext(WhaleApiClientContext).whaleRPC
}

export function WhaleProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const { network } = useNetworkContext()

  const client = useMemo(() => {
    return {
      whaleAPI: newWhaleAPIClient(network),
      whaleRPC: newWhaleRpcClient(network)
    }
  }, [network])

  return (
    <WhaleApiClientContext.Provider value={client}>
      {props.children}
    </WhaleApiClientContext.Provider>
  )
}

function newWhaleAPIClient (network: EnvironmentNetwork): WhaleApiClient {
  switch (network) {
    case EnvironmentNetwork.MainNet:
      return new WhaleApiClient({ url: 'https://ocean.defichain.com', network: 'mainnet', version: 'v0' })
    case EnvironmentNetwork.TestNet:
      return new WhaleApiClient({ url: 'https://ocean.defichain.com', network: 'testnet', version: 'v0' })
    case EnvironmentNetwork.RemotePlayground:
      return new WhaleApiClient({ url: 'https://playground.jellyfishsdk.com', network: 'regtest', version: 'v0' })
    case EnvironmentNetwork.LocalPlayground:
      return new WhaleApiClient({ url: 'http://localhost:19553', network: 'regtest', version: 'v0' })
  }
}

function newWhaleRpcClient (network: EnvironmentNetwork): WhaleRpcClient {
  switch (network) {
    case EnvironmentNetwork.MainNet:
      return new WhaleRpcClient('https://ocean.defichain.com/v0/mainnet/rpc')
    case EnvironmentNetwork.TestNet:
      return new WhaleRpcClient('https://ocean.defichain.com/v0/testnet/rpc')
    case EnvironmentNetwork.RemotePlayground:
      return new WhaleRpcClient('https://playground.jellyfishsdk.com/v0/regtest/rpc')
    case EnvironmentNetwork.LocalPlayground:
      return new WhaleRpcClient('http://localhost:19553/v0/regtest/rpc')
  }
}
