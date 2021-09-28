import React, { createContext, useContext, useMemo } from 'react'
import { EnvironmentNetwork } from '@environment'
import { useNetworkContext } from './NetworkContext'

interface DeFiScanContextI {
  getTransactionUrl: (txid: string, rawtx?: string) => string
  getBlocksUrl: (blockCount: number) => string
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
      },
      getBlocksUrl: (blockCount: number) => {
        return getBlocksURLByNetwork(network, blockCount)
      }
    }
  }, [network])

  return (
    <DeFiScanContext.Provider value={context}>
      {props.children}
    </DeFiScanContext.Provider>
  )
}

function getNetworkParams (network: EnvironmentNetwork): string {
  switch (network) {
    case EnvironmentNetwork.MainNet:
    // no-op: network param not required for MainNet
      return ''
    case EnvironmentNetwork.TestNet:
      return `?network=${EnvironmentNetwork.TestNet}`

    case EnvironmentNetwork.LocalPlayground:
    case EnvironmentNetwork.RemotePlayground:
      return `?network=${EnvironmentNetwork.RemotePlayground}`
    default:
      return ''
  }
}

function getTxURLByNetwork (network: EnvironmentNetwork, txid: string, rawtx?: string): string {
  let baseUrl = `https://defiscan.live/transactions/${txid}`

  baseUrl += getNetworkParams(network)

  if (typeof rawtx === 'string' && rawtx.length !== 0) {
    if (network === EnvironmentNetwork.MainNet) {
      baseUrl += `?rawtx=${rawtx}`
    } else {
      baseUrl += `&rawtx=${rawtx}`
    }
  }

  return baseUrl
}

function getBlocksURLByNetwork (network: EnvironmentNetwork, blockCount: number): string {
  const baseUrl = `https://defiscan.live/blocks/${blockCount}${getNetworkParams(network)}`
  return baseUrl
}
