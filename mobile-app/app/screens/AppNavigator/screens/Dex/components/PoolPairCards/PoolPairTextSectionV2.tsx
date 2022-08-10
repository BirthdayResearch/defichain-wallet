import React from 'react'
import { View } from 'react-native'
import { tailwind } from '@tailwind'
import { getNativeIcon } from '@components/icons/assets'

interface PoolPairTextSectionProps {
  symbolA: string
  symbolB: string
}

export const PoolPairTextSectionV2 = React.memo(({
  symbolA,
  symbolB
}: PoolPairTextSectionProps): JSX.Element => {
  return (
    <View style={tailwind('flex-row')}>
      <PoolPairIconV2 symbolA={symbolA} symbolB={symbolB} />
    </View>
  )
})
export function PoolPairIconV2 (props: {
  symbolA: string
  symbolB: string
}): JSX.Element {
  // To display dark pink DFI symbol for LP tokens
  const IconA = props.symbolA === 'DFI' ? getNativeIcon('_UTXO') : getNativeIcon(props.symbolA)
  const IconB = props.symbolB === 'DFI' ? getNativeIcon('_UTXO') : getNativeIcon(props.symbolB)
  return (
    <>
      <IconA height={36} width={36} style={tailwind('relative z-10')} />
      <IconB height={36} width={36} style={tailwind('-ml-3.5 mr-2')} />
    </>
  )
}
