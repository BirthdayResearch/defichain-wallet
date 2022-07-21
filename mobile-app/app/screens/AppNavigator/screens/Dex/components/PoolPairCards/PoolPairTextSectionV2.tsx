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
  const DFIIcon = getNativeIcon('_UTXO')
  const isDFIToken = props.symbolB === 'DFI'
  const IconA = getNativeIcon(props.symbolA)
  const IconB = getNativeIcon(props.symbolB)
  return (
    <>
      {isDFIToken 
      ? (
        <>
          <IconA height={40} width={40} style={tailwind('relative z-10')} />
          <DFIIcon height={40} width={40} style={tailwind('-ml-3.5 mr-2')} />
        </>
      ) 
      : (
          <>
            <IconA height={40} width={40} style={tailwind('relative z-10')} />
            <IconB height={40} width={40} style={tailwind('-ml-3.5 mr-2')} />
          </>
        )
      }
    </>
  )
}
