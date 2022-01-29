import { RootState } from '@store'
import { tokenSelectorByDisplaySymbol } from '@store/wallet'
import { SvgProps } from 'react-native-svg'
import { useSelector } from 'react-redux'
import { DefaultLoanToken } from './DefaultLoanToken'
import { DefaultLPS } from './DefaultLPS'
import { DefaultToken } from './DefaultToken'

export function _Default (symbol: string): (props: SvgProps) => JSX.Element {
  const tokenDetail = useSelector((state: RootState) => tokenSelectorByDisplaySymbol(state.wallet, symbol))

  if (tokenDetail?.isLoanToken) {
    return DefaultLoanToken(symbol)
  }

  if (tokenDetail?.isLPS) {
    return DefaultLPS(tokenDetail.symbol)
  }

  return DefaultToken(symbol)
}
