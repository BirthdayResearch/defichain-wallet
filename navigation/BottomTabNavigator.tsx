import { Ionicons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import * as React from 'react'

import Colors from '../constants/Colors'
import useColorScheme from '../hooks/useColorScheme'
import { BottomTabParamList } from '../types'
import { BalancesNavigator } from "../screens/BalancesScreen/BalancesScreen";
import { LiquidityNavigator } from '../screens/LiquidityScreen/LiquidityScreen'

const BottomTab = createBottomTabNavigator<BottomTabParamList>()

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon (props: { name: React.ComponentProps<typeof Ionicons>['name'], color: string }): JSX.Element {
  return <Ionicons size={30} style={{ marginBottom: -3 }} {...props} />
}

export default function BottomTabNavigator (): JSX.Element {
  const colorScheme = useColorScheme()

  return (
    <BottomTab.Navigator
      initialRouteName='TabOne'
      tabBarOptions={{ activeTintColor: Colors[colorScheme].tint }}
    >
      <BottomTab.Screen
        name='TabOne'
        component={BalancesNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name='wallet' color={color} />
        }}
      />
      <BottomTab.Screen
        name='TabTwo'
        component={LiquidityNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name='pie-chart' color={color} />
        }}
      />
    </BottomTab.Navigator>
  )
}
