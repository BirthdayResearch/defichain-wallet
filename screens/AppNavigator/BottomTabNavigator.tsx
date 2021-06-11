import { Ionicons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { PathConfigMap } from '@react-navigation/core'
import * as React from 'react'
import { PrimaryColor } from '../../constants/Theme'

import { BalancesNavigator } from './screens/BalancesScreen/BalancesNavigator'
import { LiquidityNavigator } from './screens/LiquidityScreen/LiquidityScreen'
import { SettingsNavigator } from './screens/SettingsScreen/SettingsNavigator'
import { TransactionsNavigator } from './screens/TransactionsScreen/TransactionsScreen'

export interface BottomTabParamList {
  Balances: undefined
  Liquidity: undefined
  Transactions: undefined
  Settings: undefined

  [key: string]: undefined | object
}

const BottomTab = createBottomTabNavigator<BottomTabParamList>()

/**
 * @see https://icons.expo.fyi/ to filter => Ionicons
 */
function TabBarIcon (props: { name: React.ComponentProps<typeof Ionicons>['name'], color: string }): JSX.Element {
  return <Ionicons size={24} style={{ marginBottom: -3 }} {...props} />
}

export function BottomTabNavigator (): JSX.Element {
  return (
    <BottomTab.Navigator
      initialRouteName='Balances'
      tabBarOptions={{ adaptive: false, activeTintColor: PrimaryColor }}
    >
      <BottomTab.Screen
        name='Balances'
        component={BalancesNavigator}
        options={{
          tabBarTestID: 'bottom_tab_balances',
          tabBarIcon: ({ color }) => <TabBarIcon name='wallet' color={color} />
        }}
      />
      <BottomTab.Screen
        name='Liquidity'
        component={LiquidityNavigator}
        options={{
          tabBarTestID: 'bottom_tab_liquidity',
          tabBarIcon: ({ color }) => <TabBarIcon name='pie-chart' color={color} />
        }}
      />
      <BottomTab.Screen
        name='Transactions'
        component={TransactionsNavigator}
        options={{
          tabBarTestID: 'bottom_tab_transactions',
          tabBarIcon: ({ color }) => <TabBarIcon name='time' color={color} />
        }}
      />
      <BottomTab.Screen
        name='Settings'
        component={SettingsNavigator}
        options={{
          tabBarTestID: 'bottom_tab_settings',
          tabBarIcon: ({ color }) => <TabBarIcon name='settings' color={color} />
        }}
      />
    </BottomTab.Navigator>
  )
}

export const AppLinking: PathConfigMap = {
  Balances: {
    screens: {
      BalancesScreen: 'balances'
    }
  },
  Liquidity: {
    screens: {
      LiquidityScreen: 'liquidity'
    }
  },
  Transactions: {
    screens: {
      TransactionsScreen: 'transactions'
    }
  },
  Settings: {
    screens: {
      SettingsScreen: 'settings'
    }
  }
}
