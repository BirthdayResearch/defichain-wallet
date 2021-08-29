import { NavigationProp, useNavigation } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { TouchableOpacity } from 'react-native'
import { HeaderFont } from '../../../../components'
import { HeaderTitle } from '../../../../components/HeaderTitle'
import { ThemedIcon } from '../../../../components/themed'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { AboutScreen } from './screens/AboutScreen'
import { ChangePinScreen } from './screens/ChangePinScreen'
import { CommunityScreen } from './screens/CommunityScreen'
import { ConfirmPinScreen } from './screens/ConfirmPinScreen'
import { NetworkSelectionScreen } from './screens/NetworkSelectionScreen'
import { RecoveryWordsScreen } from './screens/RecoveryWordsScreen'
import { SettingsScreen } from './SettingsScreen'

export interface SettingsParamList {
  SettingsScreen: undefined
  CommunityScreen: undefined
  RecoveryWordsScreen: { words: string[] }
  ChangePinScreen: { pinLength: number, words: string[] }
  ConfirmPinScreen: { pin: string, words: string[] }

  [key: string]: undefined | object
}

const SettingsStack = createStackNavigator<SettingsParamList>()

export function SettingsNavigator (): JSX.Element {
  const navigation = useNavigation<NavigationProp<SettingsParamList>>()

  return (
    <SettingsStack.Navigator screenOptions={{ headerTitleStyle: HeaderFont }}>
      <SettingsStack.Screen
        name='SettingsScreen'
        component={SettingsScreen}
        options={{
          headerTitle: () => <HeaderTitle text={translate('screens/SettingsNavigator', 'Settings')} />,
          headerRightContainerStyle: tailwind('px-2 py-2'),
          headerRight: (): JSX.Element => (
            <TouchableOpacity
              onPress={() => navigation.navigate('CommunityScreen')}
              testID='settings_community_button'
            >
              <ThemedIcon
                iconType='MaterialIcons' name='help-outline' size={24} light={tailwind('text-primary-500')}
                dark={tailwind('text-darkprimary-500')}
              />
            </TouchableOpacity>
          )
        }}
      />
      <SettingsStack.Screen
        name='CommunityScreen'
        component={CommunityScreen}
        options={{
          headerTitle: () => <HeaderTitle text={translate('screens/CommunityScreen', 'Community')} />,
          headerBackTitleVisible: false
        }}
      />
      <SettingsStack.Screen
        name='RecoveryWordsScreen'
        component={RecoveryWordsScreen}
        options={{
          headerTitle: () => <HeaderTitle text={translate('screens/Settings', 'Recovery Words')} />,
          headerBackTitleVisible: false
        }}
      />
      <SettingsStack.Screen
        name='AboutScreen'
        component={AboutScreen}
        options={{
          headerTitle: () => <HeaderTitle text={translate('screens/AboutScreen', 'About')} />,
          headerBackTitleVisible: false
        }}
      />
      <SettingsStack.Screen
        name='ChangePinScreen'
        component={ChangePinScreen}
        options={{
          headerTitle: translate('screens/AboutScreen', 'Create new passcode'),
          headerBackTitleVisible: false
        }}
      />
      <SettingsStack.Screen
        name='ConfirmPinScreen'
        component={ConfirmPinScreen}
        options={{
          headerTitle: translate('screens/ConfirmPinScreen', 'Verify passcode'),
          headerBackTitleVisible: false
        }}
      />
      <SettingsStack.Screen
        name='NetworkSelectionScreen'
        component={NetworkSelectionScreen}
        options={{
          headerTitle: translate('screens/NetworkSelectionScreen', 'Select network'),
          headerBackTitleVisible: false
        }}
      />
    </SettingsStack.Navigator>
  )
}
