import React from 'react'
import BigNumber from 'bignumber.js'
import { ThemedText } from '@components/themed'
import { tailwind } from '@tailwind'
import { View } from '@components'
import NumberFormat from 'react-number-format'
import { StyleProp, ViewStyle } from 'react-native'

interface ActiveUsdValueProps {
  style?: StyleProp<ViewStyle>
  containerStyle?: StyleProp<ViewStyle>
  price: BigNumber
}

export function ActiveUsdValue (props: ActiveUsdValueProps): JSX.Element {
  return (
    <View style={[tailwind('flex flex-row items-center'), props.containerStyle]}>
      <NumberFormat
        value={props.price.toFixed(2)}
        thousandSeparator
        decimalScale={2}
        displayType='text'
        prefix='≈ $'
        renderText={(val: string) => (
          <ThemedText
            dark={tailwind('text-gray-400')}
            light={tailwind('text-gray-500')}
            style={[tailwind('text-xs'), props.style]}
            testID='text_outstanding_balance_usd'
          >
            {val}
          </ThemedText>
        )}
      />
    </View>
  )
}
