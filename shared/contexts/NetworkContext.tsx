import { NetworkName } from '@defichain/jellyfish-network'
import React, { createContext, useContext, useEffect, useState, PropsWithChildren } from 'react'
import { getJellyfishNetwork } from '@shared-api/wallet/network'
import { EnvironmentNetwork } from '@environment'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'

interface NetworkContextI {
  network: EnvironmentNetwork
  networkName: NetworkName
  updateNetwork: (network: EnvironmentNetwork) => Promise<void>
}

const NetworkContext = createContext<NetworkContextI>(undefined as any)

export function useNetworkContext (): NetworkContextI {
  return useContext(NetworkContext)
}

export interface NetworkProviderProps extends PropsWithChildren<{}> {
  api: {
    getNetwork: () => Promise<EnvironmentNetwork>
    setNetwork: (network: EnvironmentNetwork) => Promise<void>
  }
}

export function NetworkProvider (props: NetworkProviderProps): JSX.Element | null {
  const [network, setNetwork] = useState<EnvironmentNetwork>()
  const [networkName, setNetworkName] = useState<NetworkName>()
  const logger = useLogger()
  const { api } = props

  useEffect(() => {
    api.getNetwork().then(async (value: EnvironmentNetwork) => {
      setNetworkName(getJellyfishNetwork(value).name)
      setNetwork(value)
    }).catch(logger.error)
  }, [])

  if (network === undefined || networkName === undefined) {
    return null
  }

  const context: NetworkContextI = {
    network: network,
    networkName: networkName,
    async updateNetwork (value: EnvironmentNetwork): Promise<void> {
      await api.setNetwork(value)
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
