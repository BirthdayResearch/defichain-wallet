import React, { createContext, useContext, useMemo } from 'react'
import { EnvironmentNetwork } from '../environment'
import { useNetworkContext } from './NetworkContext'

interface DeFiScan {
  getTransactionUrl: (txid: string, hexTxId?: string) => string
}

const DeFiScanContext = createContext<DeFiScan>(undefined as any)

export function useDeFiScanContext (): DeFiScan {
  return useContext(DeFiScanContext)
}

export function DeFiScanProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const { network } = useNetworkContext()

  const context = useMemo(() => {
    const getTransactionUrl = (txid: string, hexTxId?: string): string => {
      return getTxURLByNetwork(network, txid, hexTxId)
    }

    return { getTransactionUrl }
  }, [network])

  return (
    <DeFiScanContext.Provider value={context}>
      {props.children}
    </DeFiScanContext.Provider>
  )
}

function getTxURLByNetwork (network: EnvironmentNetwork, txid: string, hexTxId?: string): string {
  let baseUrl = `https://defiscan.live/transactions/${txid}`

  switch (network) {
    case EnvironmentNetwork.MainNet:
      // no-op: network param not required for MainNet
      break

    case EnvironmentNetwork.TestNet:
      baseUrl += `?network=${EnvironmentNetwork.TestNet}`
      break

    case EnvironmentNetwork.LocalPlayground:
    case EnvironmentNetwork.RemotePlayground:
      baseUrl += `?network=${EnvironmentNetwork.RemotePlayground}`
      break
  }

  if (typeof hexTxId === 'string' && hexTxId.length !== 0) {
    baseUrl += `&rawtx=${hexTxId}`
  }

  return baseUrl.toString()
}
