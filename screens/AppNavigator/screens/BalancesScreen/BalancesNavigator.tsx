import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { View } from 'react-native'
import tailwind from 'tailwind-rn'
import { Text } from '../../../../components'
import { getTokenIcon } from '../../../../components/icons/tokens/_index'
import { getSymbolDisplay } from '../../../../store/wallet'
import { translate } from '../../../../translations'
import { BalancesScreen } from './BalancesScreen'
import { ReceiveScreen } from './ReceiveScreen/ReceiveScreen'
import { SendScreen } from './SendScreen/SendScreen'
import { TokenDetailScreen } from './TokenDetailScreen/TokenDetailScreen'

export interface BalanceParamList {
  BalancesScreen: undefined
  ReceiveScreen: undefined
  SendScreen: { token: AddressToken }
  TokenDetailScreen: { token: AddressToken }

  [key: string]: undefined | object
}

const BalanceStack = createStackNavigator<BalanceParamList>()

export function BalancesNavigator (): JSX.Element {
  return (
    <BalanceStack.Navigator>
      <BalanceStack.Screen
        name='Balances'
        component={BalancesScreen}
        options={{ headerTitle: translate('screens/BalancesScreen', 'Wallet Balances') }}
      />
      <BalanceStack.Screen
        name='Receive'
        component={ReceiveScreen}
        options={{ headerTitle: translate('screens/ReceiveScreen', 'Wallet Receive') }}
      />
      <BalanceStack.Screen
        name='Send'
        component={SendScreen}
        options={{
          headerTitle: translate('screens/SendScreen', 'Wallet Send'),
          headerBackTitleVisible: false
        }}
      />
      <BalanceStack.Screen
        name='TokenDetail'
        component={TokenDetailScreen}
        options={({ route }: { route: any }) => {
          return {
            headerTitle: () => {
              const token = route?.params?.token
              const Icon = getTokenIcon(token.symbol, token.id)
              return (
                <View style={tailwind('flex-row items-center')}>
                  <Icon />
                  <Text style={tailwind('ml-2')}>{getSymbolDisplay(token)}</Text>
                </View>
              )
            }
          }
        }}
      />
    </BalanceStack.Navigator>
  )
}
