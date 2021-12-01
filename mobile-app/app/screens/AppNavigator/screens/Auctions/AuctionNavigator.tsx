import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { HeaderFont } from '@components/Text'
import { HeaderTitle } from '@components/HeaderTitle'
import { translate } from '@translations'
import { NetworkDetails } from '../Settings/screens/NetworkDetails'
import { AuctionsScreen } from './AuctionScreen'
import { BatchDetailScreen } from './BatchDetailScreen'
import { LoanVaultLiquidated, LoanVaultLiquidationBatch } from '@defichain/whale-api-client/dist/api/loan'

export interface AuctionsParamList {
  AuctionsScreen: {}
  BatchDetailScreen: {
    batch: LoanVaultLiquidationBatch
    vault: LoanVaultLiquidated
  }
  [key: string]: undefined | object
}

const AuctionsStack = createStackNavigator<AuctionsParamList>()

export function AuctionsNavigator (): JSX.Element {
  const headerContainerTestId = 'auctions_header_container'

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
              text={translate('screens/AuctionScreen', 'Auctions') + ' (Beta)'} // TODO: remove beta from title
              containerTestID={headerContainerTestId}
            />
          )
        }}
      />

      <AuctionsStack.Screen
        component={BatchDetailScreen}
        name='BatchDetailScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/AuctionScreen', 'Action details') + ' (Beta)'} // TODO: remove beta from title
              containerTestID={headerContainerTestId}
            />
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
