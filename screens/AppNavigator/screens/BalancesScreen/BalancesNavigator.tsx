import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { translate } from '../../../../translations'
import { BalancesScreen } from './BalancesScreen'
import { ReceiveScreen } from './ReceiveScreen/ReceiveScreen'
import { ConvertScreen, ConversionMode } from './ConvertScreen'

export interface BalanceParamList {
  BalancesScreen: undefined
  ReceiveScreen: undefined
  ConvertScreen: {
    mode: ConversionMode
  }

  [key: string]: undefined | object
}

const BalanceStack = createStackNavigator<BalanceParamList>()

export function BalancesNavigator (): JSX.Element {
  return (
    <BalanceStack.Navigator>
      <BalanceStack.Screen
        name='Balances'
        component={BalancesScreen}
        options={{ headerTitle: translate('screens/BalancesScreen', 'Wallet Balances') }}
      />
      <BalanceStack.Screen
        name='Receive'
        component={ReceiveScreen}
        options={{ headerTitle: translate('screens/ReceiveScreen', 'Receive') }}
      />
      <BalanceStack.Screen
        name='ConvertScreen' // only name it the same as ParamList will make intellisense work for navigation prop
        component={ConvertScreen}
        options={{ headerTitle: translate('screens/ConvertScreen', 'Convert') }}
      />
    </BalanceStack.Navigator>
  )
}
