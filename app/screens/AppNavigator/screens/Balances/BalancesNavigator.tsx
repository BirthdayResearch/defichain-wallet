import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { View } from 'react-native'
import { HeaderFont, Text } from '../../../../components'
import { BarCodeScanner } from '../../../../components/BarCodeScanner'
import { getTokenIcon } from '../../../../components/icons/tokens/_index'
import { WalletToken } from '../../../../store/wallet'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { BalancesScreen } from './BalancesScreen'
import { ConversionMode, ConvertScreen } from './ConvertScreen'
import { ReceiveScreen } from './screens/ReceiveScreen'
import { SendScreen } from './screens/SendScreen'
import { TokenDetailScreen } from './screens/TokenDetailScreen'
import { TokensVsUtxoScreen } from './screens/TokensVsUtxoScreen'

export interface BalanceParamList {
  BalancesScreen: undefined
  ReceiveScreen: undefined
  SendScreen: { token: WalletToken }
  TokenDetailScreen: { token: WalletToken }
  ConvertScreen: { mode: ConversionMode }
  BarCodeScanner: { onQrScanned: (value: string) => void }
  TokenVsUtxoScreen: undefined

  [key: string]: undefined | object
}

const BalanceStack = createStackNavigator<BalanceParamList>()

export function BalancesNavigator (): JSX.Element {
  return (
    <BalanceStack.Navigator screenOptions={{ headerTitleStyle: HeaderFont }}>
      <BalanceStack.Screen
        name='Balances'
        component={BalancesScreen}
        options={{
          headerTitle: translate('screens/BalancesScreen', 'Balances'),
          headerBackTitleVisible: false
        }}
      />
      <BalanceStack.Screen
        name='Receive'
        component={ReceiveScreen}
        options={{
          headerTitle: translate('screens/ReceiveScreen', 'Receive'),
          headerBackTitleVisible: false
        }}
      />
      <BalanceStack.Screen
        name='Send'
        component={SendScreen}
        options={{
          headerTitle: translate('screens/SendScreen', 'Send'),
          headerBackTitleVisible: false
        }}
      />
      <BalanceStack.Screen
        name='TokenDetail'
        component={TokenDetailScreen}
        options={({ route }: { route: any }) => ({
          headerBackTitleVisible: false,
          headerTitle: () => {
            const token = route?.params?.token
            const Icon = getTokenIcon(token.avatarSymbol)
            return (
              <View style={tailwind('flex-row items-center')}>
                <Icon />
                <Text style={tailwind('ml-2 font-semibold')}>{token.displaySymbol}</Text>
              </View>
            )
          }
        })}
      />
      <BalanceStack.Screen
        name='Convert'
        component={ConvertScreen}
        options={{
          headerTitle: translate('screens/ConvertScreen', 'Convert DFI'),
          headerBackTitleVisible: false
        }}
      />
      <BalanceStack.Screen
        name='BarCodeScanner'
        component={BarCodeScanner}
        options={{
          headerTitle: translate('screens/ConvertScreen', 'Scan recipient QR'),
          headerBackTitleVisible: false
        }}
      />
      <BalanceStack.Screen
        name='TokensVsUtxo'
        component={TokensVsUtxoScreen}
        options={{
          headerTitle: translate('screens/ConvertScreen', 'Tokens vs UTXO'),
          headerBackTitleVisible: false
        }}
      />
    </BalanceStack.Navigator>
  )
}
