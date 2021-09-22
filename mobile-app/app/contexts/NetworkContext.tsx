import { NetworkName } from '@defichain/jellyfish-network'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { Logging, SecuredStoreAPI } from '@api'
import { getJellyfishNetwork } from '@api/wallet'
import { EnvironmentNetwork } from '@environment'

interface NetworkContextI {
  network: EnvironmentNetwork
  networkName: NetworkName
  updateNetwork: (network: EnvironmentNetwork) => Promise<void>
}

const NetworkContext = createContext<NetworkContextI>(undefined as any)

export function useNetworkContext (): NetworkContextI {
  return useContext(NetworkContext)
}

export function NetworkProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const [network, setNetwork] = useState<EnvironmentNetwork>()
  const [networkName, setNetworkName] = useState<NetworkName>()

  useEffect(() => {
    SecuredStoreAPI.getNetwork().then(async value => {
      setNetworkName(getJellyfishNetwork(value).name)
      setNetwork(value)
    }).catch(Logging.error)
  }, [])

  if (network === undefined || networkName === undefined) {
    return null
  }

  const context: NetworkContextI = {
    network: network,
    networkName: networkName,
    async updateNetwork (value: EnvironmentNetwork): Promise<void> {
      await SecuredStoreAPI.setNetwork(value)
      setNetworkName(getJellyfishNetwork(value).name)
      setNetwork(value)
    }
  }

  return (
    <NetworkContext.Provider value={context}>
      {props.children}
    </NetworkContext.Provider>
  )
}
