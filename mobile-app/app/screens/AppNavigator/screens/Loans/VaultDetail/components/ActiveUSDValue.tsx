import * as React from 'react'
import BigNumber from 'bignumber.js'
import { ThemedText } from '@components/themed'
import { tailwind } from '@tailwind'
import { View } from '@components'
import NumberFormat from 'react-number-format'
import { StyleProp, ViewStyle } from 'react-native'
import { getUSDPrecisedPrice } from '@screens/AppNavigator/screens/Auctions/helpers/usd-precision'

interface ActiveUSDValueProps {
  style?: StyleProp<ViewStyle>
  containerStyle?: StyleProp<ViewStyle>
  testId?: string
  price: BigNumber
  totalLiquidityText?: boolean
  label?: string
}

export const ActiveUSDValue = React.memo((props: ActiveUSDValueProps): JSX.Element => {
  return (
    <View style={[tailwind('flex flex-row items-center'), props.containerStyle]}>
      <NumberFormat
        value={getUSDPrecisedPrice(props.price)}
        thousandSeparator
        displayType='text'
        prefix='≈ $'
        renderText={(val: string) => (
          <ThemedText
            dark={tailwind('text-gray-400')}
            light={tailwind(['text-gray-500', { 'text-black': props.label === 'Total liquidity' }])}
            style={[tailwind('text-xs'), props.style]}
            testID={props.testId}
          >
            {val}
          </ThemedText>
        )}
      />
    </View>
  )
})
