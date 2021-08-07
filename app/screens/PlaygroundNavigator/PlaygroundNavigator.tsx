import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { HeaderFont } from '../../components'
import { PlaygroundScreen } from './PlaygroundScreen'

export interface PlaygroundParamList {
  PlaygroundScreen: undefined

  [key: string]: undefined | object
}

const PlaygroundStack = createStackNavigator<PlaygroundParamList>()

export function PlaygroundNavigator (): JSX.Element {
  return (
    <PlaygroundStack.Navigator mode='modal' screenOptions={{ headerTitleStyle: HeaderFont }}>
      <PlaygroundStack.Screen
        name='PlaygroundScreen'
        component={PlaygroundScreen}
        options={{
          headerTitle: 'DeFi Testing',
          headerBackTitleVisible: false
        }}
      />
    </PlaygroundStack.Navigator>
  )
}
