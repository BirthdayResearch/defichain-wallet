import { MaterialIcons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { OceanInterface } from '@components/OceanInterface/OceanInterface'
import { BalancesNavigator } from './screens/Balances/BalancesNavigator'
import { DexNavigator } from './screens/Dex/DexNavigator'
import { LoansNavigator } from './screens/Loans/LoansNavigator'
import { TransactionsNavigator } from './screens/Transactions/TransactionsNavigator'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
import { AuctionsNavigator } from './screens/Auctions/AuctionNavigator'

export interface BottomTabParamList {
  Balances: undefined
  Dex: undefined
  Transactions: undefined
  Settings: undefined

  [key: string]: undefined | object
}

const BottomTab = createBottomTabNavigator<BottomTabParamList>()

export function BottomTabNavigator (): JSX.Element {
  const { isFeatureAvailable } = useFeatureFlagContext()
  return (
    <>
      <OceanInterface />

      <BottomTab.Navigator
        initialRouteName='Balances'
        screenOptions={{
          headerShown: false,
          tabBarLabelPosition: 'below-icon',
          tabBarLabelStyle: tailwind('font-medium text-xs')
        }}
      >
        <BottomTab.Screen
          component={BalancesNavigator}
          name={translate('BottomTabNavigator', 'Balances')}
          options={{
            tabBarTestID: 'bottom_tab_balances',
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
    </>
  )
}

export const AppLinking = {
  Balances: {
    screens: {
      BalancesScreen: 'balances'
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
