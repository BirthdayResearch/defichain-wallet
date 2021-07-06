import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { EnvironmentNetwork } from '../environment'
import { initWhaleClient } from '../middlewares/api/whale'
import { Logging } from '../middlewares/logging'
import * as storage from '../middlewares/storage'

interface NetworkContext {
  network: EnvironmentNetwork
  updateNetwork: (network: EnvironmentNetwork) => Promise<void>
  reloadNetwork: () => Promise<void>
}

const Network = createContext<NetworkContext>(undefined as any)

export function useNetworkContext (): NetworkContext {
  return useContext(Network)
}

export function NetworkContainer (props: { children: ReactNode }): JSX.Element | null {
  const [network, setNetwork] = useState<EnvironmentNetwork | undefined>(undefined)

  useEffect(() => {
    storage.getNetwork().then(value => {
      setNetwork(value)
    }).catch(Logging.error)
  }, [])

  if (network === undefined) {
    return null
  }

  const context: NetworkContext = {
    network: network,
    async updateNetwork (value: EnvironmentNetwork): Promise<void> {
      await storage.setNetwork(value)
      await initWhaleClient()
      setNetwork(value)
    },
    async reloadNetwork (): Promise<void> {
      setNetwork(network)
    }
  }

  return (
    <Network.Provider value={context}>
      {props.children}
    </Network.Provider>
  )
}
