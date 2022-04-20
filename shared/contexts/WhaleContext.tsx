import { WhaleApiClient } from '@defichain/whale-api-client'
import React, { createContext, useContext, useMemo } from 'react'
import { EnvironmentNetwork } from '@environment'
import { useNetworkContext } from '@shared-contexts/NetworkContext'

const WhaleApiClientContext = createContext<WhaleApiClient>(undefined as any)

export function useWhaleApiClient (): WhaleApiClient {
  return useContext(WhaleApiClientContext)
}

export function WhaleProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const { network } = useNetworkContext()

  const client = useMemo(() => {
    return newWhaleClient(network)
  }, [network])

  return (
    <WhaleApiClientContext.Provider value={client}>
      {props.children}
    </WhaleApiClientContext.Provider>
  )
}

function newWhaleClient (network: EnvironmentNetwork): WhaleApiClient {
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
