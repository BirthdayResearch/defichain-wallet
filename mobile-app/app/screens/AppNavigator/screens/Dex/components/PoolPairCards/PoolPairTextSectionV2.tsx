import React from 'react'
import { View, ViewStyle, StyleProp } from 'react-native'
import { tailwind } from '@tailwind'
import { getNativeIcon } from '@components/icons/assets'

interface PoolPairTextSectionProps {
  symbolA: string
  symbolB: string
  iconSize?: number
  iconStyle?: StyleProp<ViewStyle>
}

export const PoolPairTextSectionV2 = React.memo(({
  symbolA,
  symbolB,
  iconSize = 40,
  iconStyle = tailwind('-ml-3.5 mr-2')
}: PoolPairTextSectionProps): JSX.Element => {
  return (
    <View style={tailwind('flex-row')}>
      <PoolPairIconV2
        symbolA={symbolA}
        symbolB={symbolB}
        iconSize={iconSize}
        iconStyle={iconStyle}
      />
    </View>
  )
})
export function PoolPairIconV2 (props: {
  symbolA: string
  symbolB: string
  iconSize: number
  iconStyle: StyleProp<ViewStyle>
}): JSX.Element {
  // To display dark pink DFI symbol for LP tokens
  const IconA = props.symbolA === 'DFI' ? getNativeIcon('_UTXO') : getNativeIcon(props.symbolA)
  const IconB = props.symbolB === 'DFI' ? getNativeIcon('_UTXO') : getNativeIcon(props.symbolB)
  return (
    <>
      <IconA height={props.iconSize} width={props.iconSize} style={tailwind('relative z-10')} />
      <IconB height={props.iconSize} width={props.iconSize} style={props.iconStyle} />
    </>
  )
}
