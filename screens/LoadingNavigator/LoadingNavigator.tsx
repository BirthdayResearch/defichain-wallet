import * as React from 'react'
import { View } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { LinkingOptions, NavigationContainer } from '@react-navigation/native'
import * as Linking from 'expo-linking'

export interface LoadingParamList {
  Loading: undefined

  [key: string]: undefined | object
}

const LoadingStack = createStackNavigator<LoadingParamList>()

export function LoadingNavigator (): JSX.Element {
  return (
    <NavigationContainer linking={LinkingConfiguration}>
      <LoadingStack.Navigator screenOptions={{ headerShown: false }}>
        <LoadingStack.Screen name='Loading' component={View} />
      </LoadingStack.Navigator>
    </NavigationContainer>
  )
}

const LinkingConfiguration: LinkingOptions = {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Loading: 'loading'
    }
  }
}
