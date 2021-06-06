import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { translate } from '../../translations'
import { LinkingOptions, NavigationContainer, NavigationContainerRef } from '@react-navigation/native'
import * as Linking from 'expo-linking'
import { WalletOnboardingScreen } from './screens/WalletOnboardingScreen'
import { Ionicons } from '@expo/vector-icons'
import { PrimaryColor } from '../../constants/Colors'
import { TouchableOpacity } from 'react-native'
import { WalletAddScreen } from './screens/WalletAddScreen'

export interface WalletParamList {
  Setup: undefined

  [key: string]: undefined | object
}

const WalletStack = createStackNavigator<WalletParamList>()

export function WalletSetupNavigator (): JSX.Element {
  const navigationRef = React.useRef<NavigationContainerRef>(null)

  return (
    <NavigationContainer linking={LinkingConfiguration} ref={navigationRef}>
      <WalletStack.Navigator initialRouteName='Setup'>
        <WalletStack.Screen
          name='Setup'
          component={WalletOnboardingScreen}
          options={{
            headerTitle: translate('setup', 'Wallets'),
            headerRight: (): JSX.Element => (
              <TouchableOpacity onPress={() => navigationRef.current?.navigate('AddWallet')}>
                <Ionicons name='add' size={28} color={PrimaryColor} />
              </TouchableOpacity>
            ),
            headerRightContainerStyle: {
              paddingRight: 12
            }
          }}
        />
        <WalletStack.Screen
          name='AddWallet'
          component={WalletAddScreen}
          options={{
            headerTitle: translate('add-wallet', 'Add Wallet')
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
      Setup: 'setup/wallet',
      AddWallet: 'setup/wallet/add'
    }
  }
}
