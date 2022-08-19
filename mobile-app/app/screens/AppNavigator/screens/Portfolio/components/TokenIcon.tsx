import { getNativeIcon } from '@components/icons/assets'
import { StyleProp, ViewProps } from 'react-native'
import { PoolPairIconV2 } from '../../Dex/components/PoolPairCards/PoolPairIconV2'

interface TokenIconProps {
  testID: string
  token: {
    isLPS?: boolean
    displaySymbol: string
  }
  size: number
  iconBStyle?: StyleProp<ViewProps>
}

export function TokenIcon (props: TokenIconProps): JSX.Element {
  const { token, testID, size, iconBStyle } = props
  if (token.isLPS === true) {
    const [tokenA, tokenB] = token.displaySymbol.split('-')
    return (
      <PoolPairIconV2 symbolA={tokenA} symbolB={tokenB} customSize={size} iconBStyle={iconBStyle} testID={testID} />
    )
  }
  const Icon = getNativeIcon(token.displaySymbol)
  return (
    <Icon testID={testID} width={size} height={size} />
  )
}
