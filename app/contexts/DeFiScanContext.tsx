import React, { useContext, useMemo, createContext } from 'react'
import { EnvironmentNetwork } from '../environment'
import { useNetworkContext } from './NetworkContext'

interface DeFiScan {
  getTransactionUrl: (txid: string) => string
}

const DeFiScanContext = createContext<DeFiScan>(undefined as any)

export function useDeFiScan (): DeFiScan {
  return useContext(DeFiScanContext)
}

export function DeFiScanProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const { network } = useNetworkContext()

  const context = useMemo(() => {
    const getTransactionUrl = (txid: string): string => {
      return getTxURLByNetwork(network, txid)
    }

    return { getTransactionUrl }
  }, [network])

  return (
    <DeFiScanContext.Provider value={context}>
      {props.children}
    </DeFiScanContext.Provider>
  )
}

function getTxURLByNetwork (network: EnvironmentNetwork, txid: string): string {
  const baseUrl = new URL(`https://defiscan.live/transactions/${txid}`)

  switch (network) {
    case EnvironmentNetwork.MainNet:
      // no-op: network param not required for MainNet
      break

    case EnvironmentNetwork.TestNet:
      baseUrl.searchParams.set('network', EnvironmentNetwork.TestNet)
      break

    case EnvironmentNetwork.LocalPlayground:
    case EnvironmentNetwork.RemotePlayground:
      baseUrl.searchParams.set('network', EnvironmentNetwork.RemotePlayground)
      break
  }

  return baseUrl.toString()
}
