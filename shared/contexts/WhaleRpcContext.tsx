import { WhaleRpcClient } from '@defichain/whale-api-client'
import React, { createContext, useContext, useMemo } from 'react'
import { EnvironmentNetwork } from '@environment'
import { useNetworkContext } from '@shared-contexts/NetworkContext'

const WhaleRpcClientContext = createContext<WhaleRpcClient>(undefined as any)

export function useWhaleRpcClient (): WhaleRpcClient {
  return useContext(WhaleRpcClientContext)
}

export function WhaleRpcProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const { network } = useNetworkContext()

  const client = useMemo(() => {
    return newWhaleRpcClient(network)
  }, [network])

  return (
    <WhaleRpcClientContext.Provider value={client}>
      {props.children}
    </WhaleRpcClientContext.Provider>
  )
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
