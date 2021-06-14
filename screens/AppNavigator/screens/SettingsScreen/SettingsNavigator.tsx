import { useNavigation } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { TouchableOpacity } from 'react-native'
import tailwind from 'tailwind-rn'
import { PrimaryColor } from '../../../../constants/Theme'
import { translate } from '../../../../translations'
import * as React from 'react'
import { HelpScreen } from '../HelpScreen/HelpScreen'
import { SettingsScreen } from './SettingsScreen'
import { Ionicons } from '@expo/vector-icons'

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
        options={{
          headerTitle: translate('screens/SettingsScreen', 'Settings'),
          headerRight: () => <HelpButton />
        }}
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
      <Ionicons name='help-circle-outline' size={28} color={PrimaryColor} />
    </TouchableOpacity>
  )
}
