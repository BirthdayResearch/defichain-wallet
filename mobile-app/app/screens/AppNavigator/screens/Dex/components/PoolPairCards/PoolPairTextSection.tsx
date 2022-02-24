import React from 'react'
import { View } from 'react-native'
import { ThemedText } from '@components/themed'
import { tailwind } from '@tailwind'
import { getNativeIcon } from '@components/icons/assets'

interface PoolPairTextSectionProps {
  symbolA: string
  symbolB: string
}

export const PoolPairTextSection = React.memo(({
  symbolA,
  symbolB
}: PoolPairTextSectionProps): JSX.Element => {
  const poolpairSymbol = `${symbolA}-${symbolB}`
  return (
    <View style={tailwind('flex-row items-center')}>
      <PoolPairIcon symbolA={symbolA} symbolB={symbolB} />
      <ThemedText
        style={tailwind('text-lg font-medium')}
        testID={`your_symbol_${poolpairSymbol}`}
      >
        {poolpairSymbol}
      </ThemedText>
    </View>
  )
})

export function PoolPairIcon (props: {
  symbolA: string
  symbolB: string
}): JSX.Element {
  const IconA = getNativeIcon(props.symbolA)
  const IconB = getNativeIcon(props.symbolB)
  return (
    <>
      <IconA height={24} width={24} style={tailwind('relative z-10 -mt-3')} />
      <IconB height={24} width={24} style={tailwind('-ml-4 mt-1 mr-2')} />
    </>
  )
}
