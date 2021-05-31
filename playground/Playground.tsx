import { ScrollView, Text, View } from 'react-native'
import tailwind from 'tailwind-rn'
import React from 'react'
import { PlaygroundConnection } from './Sections/Playground.Connection'
import { PlaygroundWallet } from './Sections/Playground.Wallet'
import { PlaygroundToken } from './Sections/Playground.Token'
import { PlaygroundDex } from './Sections/Playground.Dex'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'

export function PlaygroundScreen (): JSX.Element {
  return (
    <ScrollView style={tailwind('p-4 bg-white')}>
      <View style={tailwind('p-3 bg-pink-100 rounded')}>
        <Text style={tailwind('text-xs font-medium')}>
          DeFi Playground is a specialized testing blockchain isolated from MainNet for testing DeFi applications.
          Assets are not real, it can be minted by anyone. Blocks are generated every 3 seconds, the chain resets daily.
        </Text>
      </View>

      <View style={tailwind('mt-4')}>
        <PlaygroundConnection />
      </View>

      <View style={tailwind('mt-4')}>
        <PlaygroundWallet />
      </View>
      <View style={tailwind('mt-4')}>
        <PlaygroundToken />
      </View>
      <View style={tailwind('mt-4')}>
        <PlaygroundDex />
      </View>
    </ScrollView>
  )
}

export interface PlaygroundParamList {
  PlaygroundScreen: undefined

  [key: string]: undefined | object
}

const PlaygroundStack = createStackNavigator<PlaygroundParamList>()

export function PlaygroundNavigator (): JSX.Element {
  return (
    <NavigationContainer>
      <PlaygroundStack.Navigator>
        <PlaygroundStack.Screen
          name='playground'
          component={PlaygroundScreen}
          options={{ headerTitle: 'DeFi Wallet x DeFi Playground' }}
        />
      </PlaygroundStack.Navigator>
    </NavigationContainer>
  )
}
