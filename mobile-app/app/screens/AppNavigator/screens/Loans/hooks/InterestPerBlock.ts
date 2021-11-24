import BigNumber from 'bignumber.js'
import { EnvironmentNetwork } from '@environment'
import { useNetworkContext } from '@shared-contexts/NetworkContext'

export function useInterestPerBlock (vaultInterest: BigNumber, loanTokenInterest: BigNumber, loanAmount: BigNumber): BigNumber {
  const { network } = useNetworkContext()
  const blocksPerDay = network === EnvironmentNetwork.MainNet || network === EnvironmentNetwork.TestNet ? 2880 : 144

  return vaultInterest.plus(loanTokenInterest).dividedBy(100).multipliedBy(loanAmount).dividedBy(
    new BigNumber(365).multipliedBy(blocksPerDay))
}
