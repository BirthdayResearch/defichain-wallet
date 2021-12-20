import { EnvironmentNetwork } from '@environment'
import { useNetworkContext } from '@shared-contexts/NetworkContext'

export function useBlocksPerDay (): number {
  const { network } = useNetworkContext()
  return network === EnvironmentNetwork.MainNet || network === EnvironmentNetwork.TestNet ? 2880 : 144
}
