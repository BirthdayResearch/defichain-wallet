import { tailwind } from '@tailwind'
import { getNativeIcon } from '@components/icons/assets'
import { PortfolioRowToken } from '../PortfolioScreen'
import { View } from 'react-native'
import { SvgProps } from 'react-native-svg'

interface TokenIconProps extends SvgProps {
  token: PortfolioRowToken
  testID: string
}

export function TokenIcon (props: TokenIconProps): JSX.Element {
  const { token, testID, ...otherProps } = props
  if (token.isLPS) {
    const [tokenA, tokenB] = token.displaySymbol.split('-')
    const TokenIconA = getNativeIcon(tokenA)
    const TokenIconB = getNativeIcon(tokenB)
    return (
      <View style={tailwind('flex-row items-center')} testID={testID}>
        <TokenIconA style={tailwind('relative')} {...otherProps} />
        <TokenIconB style={tailwind('-ml-4 -z-1')} {...otherProps} />
      </View>
    )
  }
  const Icon = getNativeIcon(token.displaySymbol)
  return (
    <Icon testID={testID} {...otherProps} />
  )
}
