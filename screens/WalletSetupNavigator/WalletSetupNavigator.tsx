import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { translate } from '../../translations'
import { LinkingOptions, NavigationContainer } from '@react-navigation/native'
import * as Linking from 'expo-linking'
import { WalletOnboardingScreen } from './screens/WalletOnboardingScreen'
import { Ionicons } from '@expo/vector-icons'
import { PrimaryColor } from '../../constants/Colors'

export interface WalletParamList {
  Setup: undefined

  [key: string]: undefined | object
}

const WalletStack = createStackNavigator<WalletParamList>()

export function WalletSetupNavigator (): JSX.Element {
  return (
    <NavigationContainer linking={LinkingConfiguration}>
      <WalletStack.Navigator initialRouteName='Setup'>
        <WalletStack.Screen
          name='Setup'
          component={WalletOnboardingScreen}
          options={{
            headerTitle: translate('screens/WalletOnboardingScreen', 'Wallets'),
            headerRight: (props): JSX.Element => {
              return <Ionicons name='add' size={28} color={PrimaryColor} />
            },
            headerRightContainerStyle: {
              paddingRight: 12
            }
          }}
        />
      </WalletStack.Navigator>
    </NavigationContainer>
  )
}

const LinkingConfiguration: LinkingOptions = {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Setup: 'setup'
    }
  }
}
