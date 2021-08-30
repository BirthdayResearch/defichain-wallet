import React, { createContext, useContext, useMemo } from 'react'
import { EnvironmentNetwork } from '../environment'
import { useNetworkContext } from './NetworkContext'

interface DeFiScanContextI {
  getTransactionUrl: (txid: string, rawtx?: string) => string
}

const DeFiScanContext = createContext<DeFiScanContextI>(undefined as any)

export function useDeFiScanContext (): DeFiScanContextI {
  return useContext(DeFiScanContext)
}

export function DeFiScanProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const { network } = useNetworkContext()

  const context: DeFiScanContextI = useMemo(() => {
    return {
      getTransactionUrl: (txid: string, rawtx?: string): string => {
        return getTxURLByNetwork(network, txid, rawtx)
      }
    }
  }, [network])

  return (
    <DeFiScanContext.Provider value={context}>
      {props.children}
    </DeFiScanContext.Provider>
  )
}

function getTxURLByNetwork (network: EnvironmentNetwork, txid: string, rawtx?: string): string {
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

  if (typeof rawtx === 'string' && rawtx.length !== 0) {
    if (network === EnvironmentNetwork.MainNet) {
      baseUrl += `?rawtx=${rawtx}`
    } else {
      baseUrl += `&rawtx=${rawtx}`
    }
  }

  return baseUrl
}
