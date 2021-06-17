import { useNavigation } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { TouchableOpacity } from 'react-native'
import tailwind from 'tailwind-rn'
import { PrimaryColor, VectorIcon } from '../../../../constants/Theme'
import { translate } from '../../../../translations'
import { CommunityScreen } from './CommunityScreen'
import { SettingsScreen } from './SettingsScreen'

export interface SettingsParamList {
  SettingsScreen: undefined
  CommunityScreen: undefined

  [key: string]: undefined | object
}

const SettingsStack = createStackNavigator<SettingsParamList>()

export function SettingsNavigator (): JSX.Element {
  const navigation = useNavigation()

  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen
        name='SettingsScreen'
        component={SettingsScreen}
        options={{
          headerTitle: translate('screens/SettingsNavigator', 'Settings'),
          headerRightContainerStyle: tailwind('px-2 py-2'),
          headerRight: (): JSX.Element => {
            return (
              <TouchableOpacity onPress={() => navigation.navigate('CommunityScreen')} testID='settings_help_button'>
                <VectorIcon name='help-outline' size={24} color={PrimaryColor} />
              </TouchableOpacity>
            )
          }
        }}
      />
      <SettingsStack.Screen
        name='CommunityScreen'
        component={CommunityScreen}
        options={{
          headerTitle: translate('screens/CommunityScreen', 'Community'),
          headerBackTitleVisible: false
        }}
      />
    </SettingsStack.Navigator>
  )
}
