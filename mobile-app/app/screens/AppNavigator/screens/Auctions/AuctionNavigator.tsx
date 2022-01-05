import { createStackNavigator } from '@react-navigation/stack'
import { HeaderFont } from '@components/Text'
import { HeaderTitle } from '@components/HeaderTitle'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import { NetworkDetails } from '../Settings/screens/NetworkDetails'
import { AuctionsScreen } from './AuctionScreen'
import { AuctionDetailScreen } from './screens/AuctionDetailScreen'
import { LoanVaultLiquidated, LoanVaultLiquidationBatch } from '@defichain/whale-api-client/dist/api/loan'
import { PlaceBidScreen } from './screens/PlaceBidScreen'
import { ConfirmPlaceBidScreen } from './screens/ConfirmPlaceBidScreen'
import { AuctionsFaq } from './screens/AuctionsFaq'

export interface AuctionsParamList {
  AuctionsScreen: {}
  AuctionDetailScreen: {
    batch: LoanVaultLiquidationBatch
    vault: LoanVaultLiquidated
  }
  PlaceBidScreen: {
    batch: LoanVaultLiquidationBatch
    vault: LoanVaultLiquidated
  }
  ConfirmPlaceBidScreen: {
    batch: LoanVaultLiquidationBatch
    vault: LoanVaultLiquidated
    bidAmount: BigNumber
    estimatedFees: BigNumber
    totalAuctionValue: string
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
              text={translate('screens/AuctionScreen', 'Auctions')}
              containerTestID={headerContainerTestId}
            />
          )
        }}
      />

      <AuctionsStack.Screen
        component={AuctionDetailScreen}
        name='AuctionDetailScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/AuctionScreen', 'Auction details')}
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

      <AuctionsStack.Screen
        component={PlaceBidScreen}
        name='PlaceBidScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/AuctionScreen', 'Place Bid')}
              containerTestID={headerContainerTestId}
            />
          )
        }}
      />

      <AuctionsStack.Screen
        component={AuctionsFaq}
        name='AuctionsFaq'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('components/AuctionsFaq', 'Auctions FAQ')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <AuctionsStack.Screen
        component={ConfirmPlaceBidScreen}
        name='ConfirmPlaceBidScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/AuctionScreen', 'Confirm Place Bid')}
              containerTestID={headerContainerTestId}
            />
          )
        }}
      />
    </AuctionsStack.Navigator>
  )
}
