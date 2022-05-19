import { EnvironmentNetwork } from '@environment'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { RootState } from '@store'
import { tokenSelectorByDisplaySymbol } from '@store/wallet'
import BigNumber from 'bignumber.js'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { secondsToDhmsDisplay } from '../../Auctions/helpers/SecondstoHm'

interface SwapType {
  fromTokenDisplaySymbol?: string
  toTokenDisplaySymbol?: string
}

export function useFutureSwap (props: SwapType): {
  isFutureSwapOptionEnabled: boolean
  oraclePriceText: '+5%' | '-5%' | ''
  isSourceLoanToken: boolean
} {
  const fromTokenDetail = useSelector((state: RootState) => tokenSelectorByDisplaySymbol(state.wallet, props.fromTokenDisplaySymbol ?? ''))
  const toTokenDetail = useSelector((state: RootState) => tokenSelectorByDisplaySymbol(state.wallet, props.toTokenDisplaySymbol ?? ''))

  const hasTokenDetails = fromTokenDetail !== undefined && toTokenDetail !== undefined
  if (hasTokenDetails && fromTokenDetail.isLoanToken && toTokenDetail.displaySymbol === 'DUSD') {
    return {
      isFutureSwapOptionEnabled: true,
      oraclePriceText: '+5%',
      isSourceLoanToken: true
    }
  } else if (hasTokenDetails && toTokenDetail.isLoanToken && fromTokenDetail.displaySymbol === 'DUSD') {
    return {
      isFutureSwapOptionEnabled: true,
      oraclePriceText: '-5%',
      isSourceLoanToken: false
    }
  }

  return {
    isFutureSwapOptionEnabled: false,
    oraclePriceText: '',
    isSourceLoanToken: false
  }
}

export function useFutureSwapDate (executionBlock: number, blockCount: number): {
  timeRemaining: string
  transactionDate: string
  isEnded: boolean
} {
  const { network } = useNetworkContext()
  const secondsPerBlock = network === EnvironmentNetwork.MainNet || network === EnvironmentNetwork.TestNet ? 30 : 3
  const blocksRemaining = BigNumber.max(executionBlock - blockCount, 0).toNumber()
  const blocksSeconds = blocksRemaining * secondsPerBlock
  return {
    timeRemaining: (blocksRemaining > 0) ? secondsToDhmsDisplay(blocksSeconds) : '',
    transactionDate: dayjs().add(blocksSeconds, 'second').format('MMM D, YYYY'),
    isEnded: blocksRemaining === 0
  }
}
