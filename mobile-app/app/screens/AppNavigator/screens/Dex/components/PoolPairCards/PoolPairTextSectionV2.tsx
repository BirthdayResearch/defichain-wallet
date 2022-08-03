import React from 'react'
import { View } from 'react-native'
import { tailwind } from '@tailwind'
import { getNativeIcon } from '@components/icons/assets'

interface PoolPairTextSectionProps {
  symbolA: string
  symbolB: string
  customSize?: number
}

export const PoolPairTextSectionV2 = React.memo(({
  symbolA,
  symbolB,
  customSize
}: PoolPairTextSectionProps): JSX.Element => {
  return (
    <View style={tailwind('flex-row')}>
      <PoolPairIconV2 symbolA={symbolA} symbolB={symbolB} customSize={customSize} />
    </View>
  )
})
export function PoolPairIconV2 (props: {
  symbolA: string
  symbolB: string
  customSize?: number
}): JSX.Element {
  // To display dark pink DFI symbol for LP tokens
  const IconA = props.symbolA === 'DFI' ? getNativeIcon('_UTXO') : getNativeIcon(props.symbolA)
  const IconB = props.symbolB === 'DFI' ? getNativeIcon('_UTXO') : getNativeIcon(props.symbolB)
  return (
    <>
      <IconA height={props.customSize ?? 40} width={props.customSize ?? 40} style={tailwind('relative z-10')} />
      <IconB height={props.customSize ?? 40} width={props.customSize ?? 40} style={tailwind('-ml-3.5 mr-2')} />
    </>
  )
}
