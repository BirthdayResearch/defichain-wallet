import React, { createContext, useContext, useEffect, useState } from 'react'
import { EnvironmentNetwork } from '../environment'
import { initWhaleClient } from '../middlewares/api/whale'
import { Logging } from '../middlewares/logging'
import * as storage from '../middlewares/storage'

interface Network {
  network: EnvironmentNetwork
  updateNetwork: (network: EnvironmentNetwork) => Promise<void>
  reloadNetwork: () => Promise<void>
}

const NetworkContext = createContext<Network>(undefined as any)

export function useNetworkContext (): Network {
  return useContext(NetworkContext)
}

export function NetworkContainer (props: React.PropsWithChildren<any>): JSX.Element | null {
  const [network, setNetwork] = useState<EnvironmentNetwork | undefined>(undefined)

  useEffect(() => {
    storage.getNetwork().then(async value => {
      await initWhaleClient()
      setNetwork(value)
    }).catch(Logging.error)
  }, [])

  if (network === undefined) {
    return null
  }

  const context: Network = {
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
    <NetworkContext.Provider value={context}>
      {props.children}
    </NetworkContext.Provider>
  )
}
