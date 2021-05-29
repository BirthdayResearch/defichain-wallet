import * as React from 'react'
import tailwind from 'tailwind-rn'
import { createStackNavigator } from '@react-navigation/stack'
import { Text, View } from '../../components/Themed'
import { translate } from '../../translations'

export function TransactionsScreen (): JSX.Element {
  return (
    <View style={tailwind('flex-1 items-center justify-center')}>
      <Text style={tailwind('text-xl font-bold')}>
        {translate('screens/TransactionsScreen', 'Transactions Text %1')}
      </Text>
      <View style={tailwind('w-4/5 h-px my-8')} lightColor='#eee' darkColor='rgba(255,255,255,0.1)' />
    </View>
  )
}

export interface TransactionsParamList {
  TransactionsScreen: undefined

  [key: string]: undefined | object
}

const SettingsStack = createStackNavigator<TransactionsParamList>()

export function TransactionsNavigator (): JSX.Element {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen
        name='transactions'
        component={TransactionsScreen}
        options={{ headerTitle: translate('screens/TransactionsScreen', 'Transactions') }}
      />
    </SettingsStack.Navigator>
  )
}
