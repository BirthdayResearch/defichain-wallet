
import { getNativeIcon } from '@components/icons/assets'
import { SvgProps } from 'react-native-svg'

export function SymbolIcon (props: {symbol: string, isLoanToken: boolean, styleProps?: SvgProps}): JSX.Element {
  const Icon = getNativeIcon(props.symbol, props.isLoanToken)
  return (
    <Icon width={16} height={16} {...props.styleProps} />
  )
}
