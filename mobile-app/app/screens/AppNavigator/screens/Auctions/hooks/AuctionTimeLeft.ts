import { EnvironmentNetwork } from '@environment'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { translate } from '@translations'
import dayjs from 'dayjs'
import { padStart } from 'lodash'

interface AuctionTimeLeft {
  timeRemaining: string
  startTime: string
  blocksRemaining: number
  blocksPerAuction: number
}

export function useAuctionTime (liquidationHeight: number, blockCount: number): AuctionTimeLeft {
  const { network } = useNetworkContext()
  const blocksPerAuction = network === EnvironmentNetwork.MainNet || network === EnvironmentNetwork.TestNet ? 720 : 36
  const blocksRemaining = liquidationHeight - blockCount
  const timeSpent = blocksPerAuction - blocksRemaining
  return {
    timeRemaining: (blocksRemaining > 0) ? secondsToHm(blocksRemaining * 30) : '',
    startTime: timeSpent > 0 ? dayjs().subtract(timeSpent * 30, 's').format('h:mm a') : '',
    blocksRemaining,
    blocksPerAuction
  }
}

export function secondsToHm (d: number): string {
  const h = Math.floor(d / 3600)
  const m = Math.floor(d % 3600 / 60)
  const hDisplay = h > 0 ? `${translate('components/BatchCard', '{{h}}h', { h })} ` : ''
  const mDisplay = m >= 0 ? translate('components/BatchCard', '{{m}}m', { m: h > 0 ? padStart(m.toString(), 2, '0') : m }) : ''
  return `${hDisplay}${mDisplay}`
}
