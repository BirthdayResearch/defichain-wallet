import { NavigationProp, useNavigation } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { TouchableOpacity } from 'react-native'
import { HeaderFont } from '@components/Text'
import { HeaderTitle } from '@components/HeaderTitle'
import { ThemedIcon } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { AboutScreen } from './screens/AboutScreen'
import { ChangePinScreen } from './screens/ChangePinScreen'
import { CommunityScreen } from './screens/CommunityScreen'
import { ConfirmPinScreen } from './screens/ConfirmPinScreen'
import { LanguageSelectionScreen } from './screens/LanguageSelectionScreen'
import { NetworkDetails } from './screens/NetworkDetails'
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
  const headerContainerTestId = 'setting_header_container'
  return (
    <SettingsStack.Navigator screenOptions={{ headerTitleStyle: HeaderFont }}>
      <SettingsStack.Screen
        component={SettingsScreen}
        name='SettingsScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/SettingsNavigator', 'Settings')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerRightContainerStyle: tailwind('px-2 py-2'),
          headerRight: (): JSX.Element => (
            <TouchableOpacity
              onPress={() => navigation.navigate('CommunityScreen')}
              testID='settings_community_button'
            >
              <ThemedIcon
                dark={tailwind('text-darkprimary-500')}
                iconType='MaterialIcons'
                light={tailwind('text-primary-500')}
                name='help-outline'
                size={24}
              />
            </TouchableOpacity>
          )
        }}
      />

      <SettingsStack.Screen
        component={CommunityScreen}
        name='CommunityScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/CommunityScreen', 'Community')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <SettingsStack.Screen
        component={RecoveryWordsScreen}
        name='RecoveryWordsScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/Settings', 'Recovery Words')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <SettingsStack.Screen
        component={AboutScreen}
        name='AboutScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/AboutScreen', 'About')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <SettingsStack.Screen
        component={ChangePinScreen}
        name='ChangePinScreen'
        options={{
          headerTitle: translate('screens/AboutScreen', 'Create new passcode'),
          headerBackTitleVisible: false
        }}
      />

      <SettingsStack.Screen
        component={ConfirmPinScreen}
        name='ConfirmPinScreen'
        options={{
          headerTitle: translate('screens/ConfirmPinScreen', 'Verify passcode'),
          headerBackTitleVisible: false
        }}
      />

      <SettingsStack.Screen
        component={NetworkSelectionScreen}
        name='NetworkSelectionScreen'
        options={{
          headerTitle: translate('screens/NetworkSelectionScreen', 'Select network'),
          headerBackTitleVisible: false
        }}
      />

      <SettingsStack.Screen
        component={LanguageSelectionScreen}
        name='LanguageSelectionScreen'
        options={{
          headerTitle: translate('screens/LanguageSelectionScreen', 'Select language'),
          headerBackTitleVisible: false
        }}
      />

      <SettingsStack.Screen
        component={NetworkDetails}
        name='NetworkDetails'
        options={{
          headerTitle: translate('screens/NetworkDetails', 'Wallet Network'),
          headerBackTitleVisible: false,
          headerBackTestID: 'network_details_header_back'
        }}
      />
    </SettingsStack.Navigator>
  )
}
