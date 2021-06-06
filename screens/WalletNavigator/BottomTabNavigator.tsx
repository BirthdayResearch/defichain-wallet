import { Ionicons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import * as React from 'react'

import { BalancesNavigator } from './screens/BalancesScreen/BalancesScreen'
import { LiquidityNavigator } from './screens/LiquidityScreen/LiquidityScreen'
import { TransactionsNavigator } from './screens/TransactionsScreen/TransactionsScreen'
import { SettingsNavigator } from './screens/SettingsScreen/SettingsNavigator'
import { PathConfigMap } from '@react-navigation/core'
import { PrimaryColor } from '../../constants/Colors'

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
          tabBarIcon: ({ color }) => <TabBarIcon name='wallet' color={color} />
        }}
      />
      <BottomTab.Screen
        name='Liquidity'
        component={LiquidityNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name='pie-chart' color={color} />
        }}
      />
      <BottomTab.Screen
        name='Transactions'
        component={TransactionsNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name='time' color={color} />
        }}
      />
      <BottomTab.Screen
        name='Settings'
        component={SettingsNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name='settings' color={color} />
        }}
      />
    </BottomTab.Navigator>
  )
}

const BottomTab = createBottomTabNavigator<BottomTabParamList>()

export interface BottomTabParamList {
  Balances: undefined
  Liquidity: undefined
  Transactions: undefined
  Settings: undefined

  [key: string]: undefined | object
}

/**
 * @see https://icons.expo.fyi/ to filter => Ionicons
 */
function TabBarIcon (props: { name: React.ComponentProps<typeof Ionicons>['name'], color: string }): JSX.Element {
  return <Ionicons size={24} style={{ marginBottom: -3 }} {...props} />
}

export const WalletLinking: PathConfigMap = {
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
