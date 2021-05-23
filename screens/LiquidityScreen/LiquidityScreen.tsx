import * as React from 'react'
import tailwind from 'tailwind-rn'
import { Text, View } from '../../components/Themed'
import { translate } from '../../translations'
import { createStackNavigator } from "@react-navigation/stack";
import { TabTwoParamList } from "../../types";

export default function LiquidityScreen (): JSX.Element {
  return (
    <View style={tailwind('flex-1 items-center justify-center')}>
      <Text style={tailwind('text-xl font-bold')}>
        {translate('screens/TabTwoScreen', 'Tab Two')}
      </Text>
      <View style={tailwind('w-4/5 h-px my-8')} lightColor='#eee' darkColor='rgba(255,255,255,0.1)' />
    </View>
  )
}

const TabTwoStack = createStackNavigator<TabTwoParamList>()

export function LiquidityNavigator (): JSX.Element {
  return (
    <TabTwoStack.Navigator>
      <TabTwoStack.Screen
        name='TabTwoScreen'
        component={LiquidityScreen}
        options={{ headerTitle: 'Tab Two Title' }}
      />
    </TabTwoStack.Navigator>
  )
}
