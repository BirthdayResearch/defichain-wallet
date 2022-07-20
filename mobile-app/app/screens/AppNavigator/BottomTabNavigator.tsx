import { MaterialIcons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { OceanInterface } from '@components/OceanInterface/OceanInterface'
import { PortfolioNavigator } from './screens/Portfolio/PortfolioNavigator'
import { DexNavigator } from './screens/Dex/DexNavigator'
import { TransactionsNavigator } from './screens/Transactions/TransactionsNavigator'
import { AuctionsNavigator } from './screens/Auctions/AuctionNavigator'
import { DFXAPIContextProvider } from '@shared-contexts/DFXAPIContextProvider'
import { LoansNavigator } from './screens/Loans/LoansNavigator'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
import { useSelector } from 'react-redux'
import { RootState } from '@store'

export interface BottomTabParamList {
  Portfolio: undefined
  Dex: undefined
  Transactions: undefined
  Settings: undefined

  [key: string]: undefined | object
}

const BottomTab = createBottomTabNavigator<BottomTabParamList>()

export function BottomTabNavigator (): JSX.Element {
  const { isFeatureAvailable } = useFeatureFlagContext()
  const {
    vaults
  } = useSelector((state: RootState) => state.loans)

  return (
    <>
      <OceanInterface />

      <DFXAPIContextProvider>

        <BottomTab.Navigator
          initialRouteName='Portfolio'
          screenOptions={{
            headerShown: false,
            tabBarLabelPosition: 'below-icon',
            tabBarLabelStyle: tailwind('font-medium text-xs')
          }}
        >

          <BottomTab.Screen
            component={PortfolioNavigator}
            name={translate('BottomTabNavigator', 'Portfolio')}
            options={{
              tabBarLabel: translate('BottomTabNavigator', 'Portfolio'),
              tabBarTestID: 'bottom_tab_portfolio',
              tabBarIcon: ({ color }) => (
                <MaterialIcons
                  color={color}
                  name='account-balance-wallet'
                  size={24}
                />
              )
            }}
          />

          <BottomTab.Screen
            component={DexNavigator}
            name={translate('BottomTabNavigator', 'DEX')}
            options={{
              tabBarTestID: 'bottom_tab_dex',
              tabBarIcon: ({ color }) => (
                <MaterialIcons
                  color={color}
                  name='swap-horiz'
                  size={24}
                />
              )
            }}
          />

          {(isFeatureAvailable('loan') || (vaults?.length > 0)) && (
            <BottomTab.Screen
              component={LoansNavigator}
              name={translate('BottomTabNavigator', 'Loans')}
              options={{
              tabBarTestID: 'bottom_tab_loans',
              tabBarIcon: ({ color }) => (
                <MaterialIcons
                  color={color}
                  name='credit-card'
                  size={24}
                />
              )
            }}
            />
          )}

          {isFeatureAvailable('auction') && (
            <BottomTab.Screen
              component={AuctionsNavigator}
              name={translate('BottomTabNavigator', 'Auctions')}
              options={{
              tabBarTestID: 'bottom_tab_auctions',
              tabBarIcon: ({ color }) => (
                <MaterialIcons
                  color={color}
                  name='gavel'
                  size={24}
                />
              )
            }}
            />
          )}

          <BottomTab.Screen
            component={TransactionsNavigator}
            name={translate('BottomTabNavigator', 'Transactions')}
            options={{
              tabBarTestID: 'bottom_tab_transactions',
              tabBarIcon: ({ color }) => (
                <MaterialIcons
                  color={color}
                  name='history'
                  size={24}
                />
              )
            }}
          />
        </BottomTab.Navigator>
      </DFXAPIContextProvider>
    </>
  )
}

export const AppLinking = {
  Portfolio: {
    screens: {
      PortfolioScreen: 'portfolio'
    }
  },
  Dex: {
    screens: {
      DexScreen: 'dex'
    }
  },
  Transactions: {
    screens: {
      TransactionsScreen: 'transactions'
    }
  },
  Settings: {
    screens: {
      SettingsScreen: 'settings',
      PlaygroundScreen: 'settings/playground'
    }
  }
}
