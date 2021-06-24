import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { translate } from '../../../../translations'
import { DexScreen } from './DexScreen'

export interface DexParamList {
  DexScreen: undefined
  AddLiquidity: {
    inputOnePreset: string
    inputTwoPreset: string
  }

  [key: string]: undefined | object
}

const DexStack = createStackNavigator<DexParamList>()

export function DexNavigator (): JSX.Element {
  return (
    <DexStack.Navigator>
      <DexStack.Screen
        name='DexScreen'
        component={DexScreen}
        options={{ headerTitle: translate('screens/DexScreen', 'Decentralized Exchange') }}
      />
      <DexStack.Screen
        name='AddLiquidity'
        component={DexScreen}
        options={{ headerTitle: translate('screens/DexScreen', 'Decentralized Exchange') }}
      />
    </DexStack.Navigator>
  )
}
