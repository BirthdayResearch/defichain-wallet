import { MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { TouchableOpacity } from 'react-native'
import { HeaderFont } from '../../../../components'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { AboutScreen } from './screens/AboutScreen'
import { CommunityScreen } from './screens/CommunityScreen'
import { RecoveryWordsScreen } from './screens/RecoveryWordsScreen'
import { SettingsScreen } from './SettingsScreen'

export interface SettingsParamList {
  SettingsScreen: undefined
  CommunityScreen: undefined
  RecoveryWordsScreen: { words: string[] }

  [key: string]: undefined | object
}

const SettingsStack = createStackNavigator<SettingsParamList>()

export function SettingsNavigator (): JSX.Element {
  const navigation = useNavigation()

  return (
    <SettingsStack.Navigator screenOptions={{ headerTitleStyle: HeaderFont }}>
      <SettingsStack.Screen
        name='SettingsScreen'
        component={SettingsScreen}
        options={{
          headerTitle: translate('screens/SettingsNavigator', 'Settings'),
          headerRightContainerStyle: tailwind('px-2 py-2'),
          headerRight: (): JSX.Element => (
            <TouchableOpacity
              onPress={() => navigation.navigate('CommunityScreen')}
              testID='settings_community_button'
            >
              <MaterialIcons name='help-outline' size={24} style={tailwind('text-primary')} />
            </TouchableOpacity>
          )
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
      <SettingsStack.Screen
        name='RecoveryWordsScreen'
        component={RecoveryWordsScreen}
        options={{
          headerTitle: translate('screens/Settings', 'Recovery Words'),
          headerBackTitleVisible: false
        }}
      />
      <SettingsStack.Screen
        name='AboutScreen'
        component={AboutScreen}
        options={{
          headerTitle: translate('screens/AboutScreen', 'About'),
          headerBackTitleVisible: false
        }}
      />
    </SettingsStack.Navigator>
  )
}
