import { MaterialIcons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { PathConfigMap } from '@react-navigation/core'
import * as React from 'react'
import { OceanInterface } from '../../components/OceanInterface/OceanInterface'
import { tailwind } from '../../tailwind'
import { translate } from '../../translations'

import { BalancesNavigator } from './screens/Balances/BalancesNavigator'
import { DexNavigator } from './screens/Dex/DexNavigator'
import { SettingsNavigator } from './screens/Settings/SettingsNavigator'
import { TransactionsNavigator } from './screens/Transactions/TransactionsNavigator'
import { MasternodesNavigator } from './screens/Masternodes/MasternodesNavigator'

export interface BottomTabParamList {
  Balances: undefined
  Dex: undefined
  Transactions: undefined
  Masternodes: undefined
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
        tabBarOptions={{ adaptive: false, labelStyle: tailwind('font-medium text-xs') }}
      >
        <BottomTab.Screen
          name={translate('BottomTabNavigator', 'Balances')}
          component={BalancesNavigator}
          options={{
            tabBarTestID: 'bottom_tab_balances',
            tabBarIcon: ({ color }) => <MaterialIcons size={24} name='account-balance-wallet' color={color} />
          }}
        />
        <BottomTab.Screen
          name={translate('BottomTabNavigator', 'DEX')}
          component={DexNavigator}
          options={{
            tabBarTestID: 'bottom_tab_dex',
            tabBarIcon: ({ color }) => <MaterialIcons size={24} name='pie-chart' color={color} />
          }}
        />
        <BottomTab.Screen
          name={translate('BottomTabNavigator', 'Transactions')}
          component={TransactionsNavigator}
          options={{
            tabBarTestID: 'bottom_tab_transactions',
            tabBarIcon: ({ color }) => <MaterialIcons size={24} name='assignment' color={color} />
          }}
        />
        <BottomTab.Screen
          name={translate('BottomTabNavigator', 'MN')}
          component={MasternodesNavigator}
          options={{
            tabBarTestID: 'bottom_tab_masternodes',
            tabBarIcon: ({ color }) => <MaterialIcons size={24} name='dns' color={color} />
          }}
        />
        <BottomTab.Screen
          name={translate('BottomTabNavigator', 'Settings')}
          component={SettingsNavigator}
          options={{
            tabBarTestID: 'bottom_tab_settings',
            tabBarIcon: ({ color }) => <MaterialIcons size={24} name='settings' color={color} />
          }}
        />
      </BottomTab.Navigator>
    </>
  )
}

export const AppLinking: PathConfigMap = {
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
  Masternodes: {
    screens: {
      MasternodesScreen: 'masternodes'
    }
  },
  Settings: {
    screens: {
      SettingsScreen: 'settings',
      PlaygroundScreen: 'settings/playground'
    }
  }
}
