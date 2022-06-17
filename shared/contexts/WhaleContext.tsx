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
    // TODO: serviceProviderURL param to trigger network change when dispatch
    // by using provider on top of whalecontext
  }, [network, url])

  return (
    <WhaleApiClientContext.Provider value={client}>
      {props.children}
    </WhaleApiClientContext.Provider>
  )
}
// TODO: import type for serviceProviderURL 
function newWhaleAPIClient (network: EnvironmentNetwork, url: string): WhaleApiClient {
  // TODO: update to user's custom input URL 
  switch (network) {
    case EnvironmentNetwork.MainNet:
      return new WhaleApiClient({ url: 'https://ocean.defichain.com', network: 'mainnet', version: 'v0' })
    case EnvironmentNetwork.TestNet:
      return new WhaleApiClient({ url: 'https://ocean.defichain.com', network: 'testnet', version: 'v0' })
    case EnvironmentNetwork.RemotePlayground:
      return new WhaleApiClient({ url: url, network: 'regtest', version: 'v0' })
    case EnvironmentNetwork.LocalPlayground:
      return new WhaleApiClient({ url: 'http://localhost:19553', network: 'regtest', version: 'v0' })
  }
  // switch (network) {
  //   case EnvironmentNetwork.MainNet:
  //     return new WhaleApiClient({ url: 'https://ocean.defichain.com', network: 'mainnet', version: 'v0' })
  //   case EnvironmentNetwork.TestNet:
  //     return new WhaleApiClient({ url: 'https://ocean.defichain.com', network: 'testnet', version: 'v0' })
  //   case EnvironmentNetwork.RemotePlayground:
  //     return new WhaleApiClient({ url: 'https://playground.jellyfishsdk.com', network: 'regtest', version: 'v0' })
  //   case EnvironmentNetwork.LocalPlayground:
  //     return new WhaleApiClient({ url: 'http://localhost:19553', network: 'regtest', version: 'v0' })
  // }
}

// TODO: import type for serviceProviderURL 
function newWhaleRpcClient (network: EnvironmentNetwork, url: string): WhaleRpcClient {
  switch (network) {
    case EnvironmentNetwork.MainNet:
      return new WhaleRpcClient('https://ocean.defichain.com/v0/mainnet/rpc')
    case EnvironmentNetwork.TestNet:
      return new WhaleRpcClient('https://ocean.defichain.com/v0/testnet/rpc')
    case EnvironmentNetwork.RemotePlayground:
      return new WhaleRpcClient(url+'/v0/regtest/rpc')
    case EnvironmentNetwork.LocalPlayground:
      return new WhaleRpcClient('http://localhost:19553/v0/regtest/rpc')
  }
  // switch (network) {
  //   case EnvironmentNetwork.MainNet:
  //     return new WhaleRpcClient('https://ocean.defichain.com/v0/mainnet/rpc')
  //   case EnvironmentNetwork.TestNet:
  //     return new WhaleRpcClient('https://ocean.defichain.com/v0/testnet/rpc')
  //   case EnvironmentNetwork.RemotePlayground:
  //     return new WhaleRpcClient('https://playground.jellyfishsdk.com/v0/regtest/rpc')
  //   case EnvironmentNetwork.LocalPlayground:
  //     return new WhaleRpcClient('http://localhost:19553/v0/regtest/rpc')
  // }
}
