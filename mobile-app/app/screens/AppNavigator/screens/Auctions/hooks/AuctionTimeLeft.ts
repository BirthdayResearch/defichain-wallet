import { EnvironmentNetwork } from '@environment'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import dayjs from 'dayjs'
import BigNumber from 'bignumber.js'
import { secondsToHmDisplay } from '../helpers/SecondstoHm'

interface AuctionTimeLeft {
  timeRemaining: string
  startTime: string
  blocksRemaining: number
  blocksPerAuction: number
}

export function useAuctionTime (liquidationHeight: number, blockCount: number): AuctionTimeLeft {
  const { network } = useNetworkContext()
  const blocksPerAuction = network === EnvironmentNetwork.MainNet || network === EnvironmentNetwork.TestNet ? 720 : 36
  const secondsPerBlock = network === EnvironmentNetwork.MainNet || network === EnvironmentNetwork.TestNet ? 30 : 3
  const blocksRemaining = BigNumber.max(liquidationHeight - blockCount, 0).toNumber()
  const timeSpent = blocksPerAuction - blocksRemaining
  return {
    timeRemaining: (blocksRemaining > 0) ? secondsToHmDisplay(blocksRemaining * secondsPerBlock) : '',
    startTime: timeSpent > 0 ? dayjs().subtract(timeSpent * secondsPerBlock, 's').format('h:mm a') : '',
    blocksRemaining,
    blocksPerAuction
  }
}
