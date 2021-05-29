import * as React from 'react'
import tailwind from 'tailwind-rn'
import { createStackNavigator } from '@react-navigation/stack'
import { Text, View } from '../../components/Themed'
import { translate } from '../../translations'

export function SettingsScreen (): JSX.Element {
  return (
    <View style={tailwind('flex-1 items-center justify-center')}>
      <Text style={tailwind('text-xl font-bold')}>
        {translate('screens/SettingsScreen', 'Settings')}
      </Text>
      <View style={tailwind('w-4/5 h-px my-8')} lightColor='#eee' darkColor='rgba(255,255,255,0.1)' />
    </View>
  )
}

export interface SettingsParamList {
  SettingsScreen: undefined

  [key: string]: undefined | object
}

const SettingsStack = createStackNavigator<SettingsParamList>()

export function SettingsNavigator (): JSX.Element {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen
        name='settings'
        component={SettingsScreen}
        options={{ headerTitle: translate('screens/SettingsScreen', 'Settings') }}
      />
    </SettingsStack.Navigator>
  )
}
