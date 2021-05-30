import * as React from 'react'
import tailwind from 'tailwind-rn'
import { createStackNavigator } from '@react-navigation/stack'
import { Text, View } from '../../components/Themed'
import { translate } from '../../translations'

export default function WalletScreen (): JSX.Element {
  return (
    <View style={tailwind('flex-1 items-center justify-center')}>
      <Text style={tailwind('text-xl font-bold')}>
        {translate('screens/WalletScreen', 'Transactions Text %1')}
      </Text>
      <View style={tailwind('w-4/5 h-px my-8')} lightColor='#eee' darkColor='rgba(255,255,255,0.1)' />
    </View>
  )
}

export interface WalletParamList {
  WalletScreen: undefined

  [key: string]: undefined | object
}

const WalletStack = createStackNavigator<WalletParamList>()

export function WalletNavigator (): JSX.Element {
  return (
    <WalletStack.Navigator>
      <WalletStack.Screen
        name='wallet'
        component={WalletScreen}
        options={{ headerTitle: translate('screens/WalletScreen', 'Wallet') }}
      />
    </WalletStack.Navigator>
  )
}
