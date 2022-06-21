import { WhaleApiClient, WhaleRpcClient } from '@defichain/whale-api-client'
import React, { createContext, useContext, useMemo } from 'react'
import { EnvironmentNetwork } from '@environment'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useServiceProviderContext } from '@contexts/StoreServiceProvider'

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
  const { url } = useServiceProviderContext()
  const client = useMemo(() => {
    return {
      whaleAPI: newWhaleAPIClient(network, url),
      whaleRPC: newWhaleRpcClient(network, url)
    }
  }, [network, url])

  return (
    <WhaleApiClientContext.Provider value={client}>
      {props.children}
    </WhaleApiClientContext.Provider>
  )
}
function newWhaleAPIClient (network: EnvironmentNetwork, url: string): WhaleApiClient {
  switch (network) {
    case EnvironmentNetwork.MainNet:
      return new WhaleApiClient({ url, network: 'mainnet', version: 'v0' })
    case EnvironmentNetwork.TestNet:
      return new WhaleApiClient({ url, network: 'testnet', version: 'v0' })
    case EnvironmentNetwork.RemotePlayground:
      return new WhaleApiClient({ url, network: 'regtest', version: 'v0' })
    case EnvironmentNetwork.LocalPlayground:
      return new WhaleApiClient({ url, network: 'regtest', version: 'v0' })
  }
}

function newWhaleRpcClient (network: EnvironmentNetwork, url: string): WhaleRpcClient {
  switch (network) {
    case EnvironmentNetwork.MainNet:
      return new WhaleRpcClient(`${url}/v0/mainnet/rpc`)
    case EnvironmentNetwork.TestNet:
      return new WhaleRpcClient(`${url}/v0/testnet/rpc`)
    case EnvironmentNetwork.RemotePlayground:
      return new WhaleRpcClient(`${url}/v0/regtest/rpc`)
    case EnvironmentNetwork.LocalPlayground:
      return new WhaleRpcClient(`${url}/v0/regtest/rpc`)
  }
}
