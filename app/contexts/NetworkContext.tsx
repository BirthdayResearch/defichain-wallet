import { NetworkName } from '@defichain/jellyfish-network'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { Logging } from '../api/logging'
import * as storage from '../api/storage'
import { EnvironmentNetwork } from '../environment'

interface Network {
  network: EnvironmentNetwork
  networkName: NetworkName
  updateNetwork: (network: EnvironmentNetwork) => Promise<void>
  reloadNetwork: () => Promise<void>
}

const NetworkContext = createContext<Network>(undefined as any)

function networkMapper (network: EnvironmentNetwork): NetworkName {
  switch (network) {
    case EnvironmentNetwork.MainNet:
      return 'mainnet'
    case EnvironmentNetwork.TestNet:
      return 'testnet'
    case EnvironmentNetwork.LocalPlayground:
    case EnvironmentNetwork.RemotePlayground:
      return 'regtest'
  }
}

export function useNetworkContext (): Network {
  return useContext(NetworkContext)
}

export function NetworkProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const [network, setNetwork] = useState<EnvironmentNetwork | undefined>(undefined)

  useEffect(() => {
    storage.getNetwork().then(async value => {
      setNetwork(value)
    }).catch(Logging.error)
  }, [])

  if (network === undefined) {
    return null
  }

  const context: Network = {
    network: network,
    networkName: networkMapper(network),
    async updateNetwork (value: EnvironmentNetwork): Promise<void> {
      await storage.setNetwork(value)
      setNetwork(value)
    },
    async reloadNetwork (): Promise<void> {
      setNetwork(network)
    }
  }

  return (
    <NetworkContext.Provider value={context}>
      {props.children}
    </NetworkContext.Provider>
  )
}
