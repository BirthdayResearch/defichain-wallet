import { RootState } from '@store'
import { tokenSelectorByDisplaySymbol } from '@store/wallet'
import { useSelector } from 'react-redux'

interface SwapType {
  fromTokenDisplaySymbol?: string
  toTokenDisplaySymbol?: string
}

export function useFutureSwap (props: SwapType): {
  isFutureSwapOptionEnabled: boolean
  oraclePriceText: string
} {
  const fromTokenDetail = useSelector((state: RootState) => tokenSelectorByDisplaySymbol(state.wallet, props.fromTokenDisplaySymbol ?? ''))
  const toTokenDetail = useSelector((state: RootState) => tokenSelectorByDisplaySymbol(state.wallet, props.toTokenDisplaySymbol ?? ''))

  const hasTokenDetails = fromTokenDetail !== undefined && toTokenDetail !== undefined
  if (hasTokenDetails && fromTokenDetail.isLoanToken && toTokenDetail.displaySymbol === 'DUSD') {
    return {
      isFutureSwapOptionEnabled: true,
      oraclePriceText: '+5%'
    }
  } else if (hasTokenDetails && toTokenDetail.isLoanToken && fromTokenDetail.displaySymbol === 'DUSD') {
    return {
      isFutureSwapOptionEnabled: true,
      oraclePriceText: '-5%'
    }
  }

  return {
    isFutureSwapOptionEnabled: false,
    oraclePriceText: ''
  }
}
