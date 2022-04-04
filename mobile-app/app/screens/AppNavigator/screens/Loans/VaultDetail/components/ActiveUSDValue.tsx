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
  lightTextStyle?: { [key: string]: string }
  darkTextStyle?: { [key: string]: string }
  containerStyle?: StyleProp<ViewStyle>
  testId?: string
  price: BigNumber
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
            dark={props.darkTextStyle ?? tailwind('text-gray-400')}
            light={props.lightTextStyle ?? tailwind('text-gray-500')}
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
