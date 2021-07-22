import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { HeaderFont } from '../../components/Text'
import { PlaygroundScreen } from './PlaygroundScreen'

export interface PlaygroundParamList {
  PlaygroundScreen: undefined

  [key: string]: undefined | object
}

const PlaygroundStack = createStackNavigator<PlaygroundParamList>()

export function PlaygroundNavigator (): JSX.Element {
  return (
    <PlaygroundStack.Navigator mode='modal' screenOptions={HeaderFont}>
      <PlaygroundStack.Screen
        name='PlaygroundScreen'
        component={PlaygroundScreen}
        options={{
          headerTitle: 'DeFi Playground',
          headerBackTitleVisible: false
        }}
      />
    </PlaygroundStack.Navigator>
  )
}
