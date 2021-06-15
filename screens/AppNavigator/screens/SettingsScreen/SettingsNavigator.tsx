import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { translate } from '../../../../translations'
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
        name='SettingsScreen'
        component={SettingsScreen}
        options={{ headerTitle: translate('screens/SettingsNavigator', 'Settings') }}
      />

      {/* <SettingsStack.Screen */}
      {/*  name='PlaygroundScreen' */}
      {/*  component={PlaygroundScreen} */}
      {/*  options={{ */}
      {/*    headerTitle: translate('screens/SettingsNavigator', 'Playground'), */}
      {/*    headerBackTitleVisible: false, */}
      {/*  }} */}
      {/* /> */}
    </SettingsStack.Navigator>
  )
}
