import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { HeaderFont } from '@components/Text'
import { HeaderTitle } from '@components/HeaderTitle'
import { translate } from '@translations'
import { NetworkDetails } from '../Settings/screens/NetworkDetails'
import { AuctionsScreen } from './AuctionScreen'
import { TouchableOpacity } from 'react-native'
import { ThemedIcon } from '@components/themed'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { tailwind } from '@tailwind'

export interface AuctionsParamList {
  AuctionsScreen: {}
  [key: string]: undefined | object
}

const AuctionsStack = createStackNavigator<AuctionsParamList>()

export function AuctionsNavigator (): JSX.Element {
  const headerContainerTestId = 'auctions_header_container'
  const navigation = useNavigation<NavigationProp<AuctionsParamList>>()

  return (
    <AuctionsStack.Navigator
      initialRouteName='AuctionsScreen'
      screenOptions={{
        headerTitleAlign: 'center',
        headerTitleStyle: HeaderFont,
        headerBackTitleVisible: false
      }}
    >
      <AuctionsStack.Screen
        component={AuctionsScreen}
        name='AuctionScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/AuctionScreen', 'Auction') + ' (Beta)'} // TODO: remove beta from title
              containerTestID={headerContainerTestId}
            />
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate({
                name: 'CreateVaultScreen',
                params: {},
                merge: true
              })}
              testID='create_vault_header_button'
            >
              <ThemedIcon
                size={28}
                style={tailwind('mr-2')} light={tailwind('text-primary-500')}
                dark={tailwind('text-primary-500')} iconType='MaterialCommunityIcons' name='plus'
              />
            </TouchableOpacity>
          )
        }}
      />
      <AuctionsStack.Screen
        component={NetworkDetails}
        name='NetworkDetails'
        options={{
          headerTitle: translate('screens/NetworkDetails', 'Wallet Network'),
          headerBackTitleVisible: false,
          headerBackTestID: 'network_details_header_back'
        }}
      />
    </AuctionsStack.Navigator>
  )
}
