import { useNavigation } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { TouchableOpacity } from 'react-native'
import tailwind from 'tailwind-rn'
import { PrimaryColor, VectorIcon } from '../../../../constants/Theme'
import { translate } from '../../../../translations'
import { HelpScreen } from '../HelpScreen/HelpScreen'
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
        options={{ headerTitle: translate('screens/SettingsNavigator', 'Settings'), headerRight: () => <HelpButton /> }}
      />
      <SettingsStack.Screen
        name='help'
        component={HelpScreen}
        options={{
          headerTitle: translate('screens/HelpScreen', 'Help')
        }}
      />
    </SettingsStack.Navigator>
  )
}

function HelpButton (): JSX.Element {
  const navigation = useNavigation()
  return (
    <TouchableOpacity testID='settings_help_button' style={tailwind('m-2')} onPress={() => navigation.navigate('help')}>
      <VectorIcon name='help-outline' size={24} color={PrimaryColor} />
    </TouchableOpacity>
  )
}
