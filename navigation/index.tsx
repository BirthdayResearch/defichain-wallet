import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'

import { NotFoundScreen } from '../screens/NotFoundScreen'
import { BottomTabNavigator } from './BottomTabNavigator'
import { LinkingConfiguration } from './LinkingConfiguration'
import { useColorScheme } from '../hooks/useColorScheme'

// If you are not familiar with React Navigation, we recommend going through the
// "Fundamentals" guide: https://reactnavigation.org/docs/getting-started
export function Navigation (): JSX.Element {
  const colorScheme = useColorScheme()

  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
    >
      <RootNavigator />
    </NavigationContainer>
  )
}

export interface RootStackParamList {
  Root: undefined
  NotFound: undefined

  [key: string]: undefined | object
}

const Stack = createStackNavigator<RootStackParamList>()

function RootNavigator (): JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='Root' component={BottomTabNavigator} />
      <Stack.Screen name='NotFound' component={NotFoundScreen} options={{ title: 'Oops!' }} />
    </Stack.Navigator>
  )
}
