import { tailwind } from '@tailwind'
import { getNativeIcon } from '@components/icons/assets'
import { ThemedText, ThemedView } from '@components/themed'

interface TokenIconProps {
  displaySymbol: string
  isLoanToken: boolean
}

export function TokenIconPair (props: {
  iconA: TokenIconProps
  iconB: TokenIconProps
}): JSX.Element {
  const { iconA, iconB } = props
  // icons
  const TokenIconA = getNativeIcon(iconA.displaySymbol, iconA.isLoanToken)
  const TokenIconB = getNativeIcon(iconB.displaySymbol, iconA.isLoanToken)

  return (
    <ThemedView
      dark={tailwind('bg-gray-800')}
      light={tailwind('bg-white')}
      style={tailwind('flex-row items-center mr-2')}
    >
      <TokenIconA style={tailwind('absolute -ml-1.5 mb-0.5 pb-0.5 p-px')} width={9} height={9} />
      <TokenIconB style={tailwind('mt-2')} width={9} height={9} />
      <ThemedText
        style={tailwind('ml-1')}
      >
        {`${iconA.displaySymbol}-${iconB.displaySymbol}`}
      </ThemedText>
    </ThemedView>
  )
}
