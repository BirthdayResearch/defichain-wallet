import { createStackNavigator } from '@react-navigation/stack'
import { LegacyScreen } from './LegacyScreen'

export interface LegacyParamList {
  LegacyScreen: {}
  [key: string]: undefined | object
}

const LegacyStack = createStackNavigator<LegacyParamList>()

export function LegacyNavigator (): JSX.Element {
  return (
    <LegacyStack.Navigator
      initialRouteName='LegacyScreen'
      screenOptions={{
        headerBackTitleVisible: false
      }}
    >
      <LegacyStack.Screen
        component={LegacyScreen}
        name='LegacyScreen'
        options={{
          headerShown: false
        }}
      />
    </LegacyStack.Navigator>
  )
}
