import BigNumber from 'bignumber.js'
import { useBlocksPerDay } from './BlocksPerDay'

export function useInterestPerBlock (vaultInterest: BigNumber, loanTokenInterest: BigNumber): BigNumber {
  const blocksPerDay = useBlocksPerDay()
  return vaultInterest.plus(loanTokenInterest).dividedBy(100).dividedBy(
    new BigNumber(365).multipliedBy(blocksPerDay))
}
