import { createStackNavigator } from '@react-navigation/stack'
import { translate } from '../../../../translations'
import * as React from 'react'
import { SettingsScreen } from './SettingsScreen'

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
