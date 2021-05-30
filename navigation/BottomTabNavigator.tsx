import { Ionicons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import * as React from 'react'

import { Colors } from '../constants/Colors'
import { useColorScheme } from '../hooks/design/useColorScheme'

import { BalancesNavigator } from '../screens/BalancesScreen/BalancesScreen'
import { LiquidityNavigator } from '../screens/LiquidityScreen/LiquidityScreen'
import { TransactionsNavigator } from '../screens/TransactionsScreen/TransactionsScreen'
import { SettingsNavigator } from '../screens/SettingsScreen/SettingsScreen'

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
  const colorScheme = useColorScheme()

  return (
    <BottomTab.Navigator
      initialRouteName='Balances'
      tabBarOptions={{
        activeTintColor: Colors[colorScheme].tint,
        adaptive: false
      }}
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
