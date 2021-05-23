import * as React from 'react'
import { Button } from 'react-native'
import tailwind from 'tailwind-rn'
import { translate } from '../../translations'
import { Text, View } from '../../components/Themed'
import { getTokenIcon } from '../../components/icons/tokens/_index'
import { createStackNavigator } from "@react-navigation/stack";
import { TabOneParamList } from "../../types";

export default function BalancesScreen (): JSX.Element {
  const [count, setCount] = React.useState(0)

  const Icon = getTokenIcon('DFA')

  return (
    <View style={tailwind('flex-1 items-center justify-center')}>
      <Icon />
      <Button title='Click' onPress={() => setCount(count + 2)} />
      <Text testID='count'>
        Count: {count}
      </Text>
      <Text style={tailwind('text-xl font-bold')}>
        {translate('screens/TabOneScreen', 'Tab One TEST')}
      </Text>
      <View style={tailwind('w-4/5 h-px my-8')} lightColor='#eee' darkColor='rgba(255,255,255,0.1)' />
    </View>
  )
}

/**
 * Each tab has its own navigation stack, you can read more about this pattern here:
 * https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab
 */
const Balances = createStackNavigator<TabOneParamList>()

export function BalancesNavigator (): JSX.Element {
  return (
    <Balances.Navigator>
      <Balances.Screen
        name='TabOneScreen'
        component={BalancesScreen}
        options={{ headerTitle: 'Tab One Title' }}
      />
    </Balances.Navigator>
  )
}
