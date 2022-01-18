import { tailwind } from '@tailwind'
import { getNativeIcon } from '@components/icons/assets'
import { ThemedText, ThemedView } from '@components/themed'

export function TokenIconPair (props: {
  iconA: string
  iconB: string
}): JSX.Element {
  // icons
  const TokenIconA = getNativeIcon(props.iconA)
  const TokenIconB = getNativeIcon(props.iconB)

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
        {`${props.iconA}-${props.iconB}`}
      </ThemedText>
    </ThemedView>
  )
}
