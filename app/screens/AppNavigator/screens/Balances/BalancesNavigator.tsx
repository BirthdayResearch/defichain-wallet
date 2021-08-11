import { MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { Share, TouchableOpacity, View } from 'react-native'
import { Logging } from '../../../../api'
import { Text } from '../../../../components'
import { BarCodeScanner } from '../../../../components/BarCodeScanner'
import { ConnectionStatus, HeaderTitle } from '../../../../components/HeaderTitle'
import { getTokenIcon } from '../../../../components/icons/tokens/_index'
import { useWalletAddressContext } from '../../../../contexts/WalletAddressContext'
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

function BalanceActionButton (props: {
  icon?: React.ComponentProps<typeof MaterialIcons>['name']
  title?: string
  onPress: () => void
  testID: string
}): JSX.Element {
  return (
    <TouchableOpacity
      testID={props.testID}
      style={[tailwind('px-2 py-1.5 ml-3 flex-row items-center')]}
      onPress={props.onPress}
    >
      {
        props.icon !== undefined && (
          <MaterialIcons name={props.icon} size={20} style={tailwind('text-primary')} />
        )
      }
      {
        props.title !== undefined && (
          <Text style={tailwind('mx-1 text-primary font-semibold')}>
            {translate('screens/BalancesScreen', props.title)}
          </Text>
        )
      }
    </TouchableOpacity>
  )
}

export async function onShare (address: string): Promise<void> {
  try {
    await Share.share({
      message: address
    })
  } catch (error) {
    Logging.error(error.message)
  }
}

const BalanceStack = createStackNavigator<BalanceParamList>()

export function BalancesNavigator (): JSX.Element {
  const { address } = useWalletAddressContext()
  const navigation = useNavigation()
  return (
    <BalanceStack.Navigator>
      <BalanceStack.Screen
        name='Balances'
        component={BalancesScreen}
        options={{
          headerTitleAlign: 'center',
          headerTitle: () => <HeaderTitle text={translate('screens/BalancesScreen', 'Balances')} />,
          headerBackTitleVisible: false,
          headerLeft: () => (
            <BalanceActionButton
              testID='header_share_balance' icon='share'
              onPress={async () => await onShare(address)}
            />
          ),
          headerRight: () => (
            <BalanceActionButton
              testID='header_receive_balance' title='RECEIVE'
              onPress={() => navigation.navigate('Receive')}
            />
          )
        }}
      />
      <BalanceStack.Screen
        name='Receive'
        component={ReceiveScreen}
        options={{
          headerTitle: () => <HeaderTitle text={translate('screens/ReceiveScreen', 'Receive')} />,
          headerBackTitleVisible: false
        }}
      />
      <BalanceStack.Screen
        name='Send'
        component={SendScreen}
        options={{
          headerTitle: () => <HeaderTitle text={translate('screens/SendScreen', 'Send')} />,
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
                <View style={tailwind('flex-col ml-2')}>
                  <Text style={tailwind('font-semibold')}>{token.displaySymbol}</Text>
                  <ConnectionStatus />
                </View>
              </View>
            )
          }
        })}
      />
      <BalanceStack.Screen
        name='Convert'
        component={ConvertScreen}
        options={{
          headerTitle: () => <HeaderTitle text={translate('screens/ConvertScreen', 'Convert DFI')} />,
          headerBackTitleVisible: false
        }}
      />
      <BalanceStack.Screen
        name='BarCodeScanner'
        component={BarCodeScanner}
        options={{
          headerTitle: () => <HeaderTitle text={translate('screens/ConvertScreen', 'Scan recipient QR')} />,
          headerBackTitleVisible: false
        }}
      />
      <BalanceStack.Screen
        name='TokensVsUtxo'
        component={TokensVsUtxoScreen}
        options={{
          headerTitle: () => <HeaderTitle text={translate('screens/ConvertScreen', 'Token vs UTXO')} />,
          headerBackTitleVisible: false
        }}
      />
    </BalanceStack.Navigator>
  )
}
