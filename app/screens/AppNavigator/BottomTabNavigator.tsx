import { MaterialIcons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import * as React from 'react'
import { OceanInterface } from '../../components/OceanInterface/OceanInterface'
import { tailwind } from '../../tailwind'
import { translate } from '../../translations'

import { BalancesNavigator } from './screens/Balances/BalancesNavigator'
import { DexNavigator } from './screens/Dex/DexNavigator'
import { SettingsNavigator } from './screens/Settings/SettingsNavigator'
import { TransactionsNavigator } from './screens/Transactions/TransactionsNavigator'

export interface BottomTabParamList {
  Balances: undefined
  Dex: undefined
  Transactions: undefined
  Settings: undefined

  [key: string]: undefined | object
}

const BottomTab = createBottomTabNavigator<BottomTabParamList>()

export function BottomTabNavigator (): JSX.Element {
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
                name='pie-chart'
                size={24}
              />
            )
          }}
        />

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

        <BottomTab.Screen
          component={SettingsNavigator}
          name={translate('BottomTabNavigator', 'Settings')}
          options={{
            tabBarTestID: 'bottom_tab_settings',
            tabBarIcon: ({ color }) => (
              <MaterialIcons
                color={color}
                name='settings'
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
