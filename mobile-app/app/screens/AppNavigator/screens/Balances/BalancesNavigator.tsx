import { NavigationProp, useNavigation } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { WalletToken } from '@store/wallet'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { BarCodeScanner } from '@components/BarCodeScanner'
import { ConnectionStatus, HeaderTitle } from '@components/HeaderTitle'
import { getNativeIcon } from '@components/icons/assets'
import { ThemedText } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { NetworkDetails } from '../Settings/screens/NetworkDetails'
import { BalancesScreen } from './BalancesScreen'
import { ConvertConfirmationScreen } from './screens/ConvertConfirmationScreen'
import { ConversionMode, ConvertScreen } from './screens/ConvertScreen'
import { ReceiveScreen } from './screens/ReceiveScreen'
import { SendConfirmationScreen } from './screens/SendConfirmationScreen'
import { SendScreen } from './screens/SendScreen'
import { TokenDetailScreen } from './screens/TokenDetailScreen'
import { TokensVsUtxoScreen } from './screens/TokensVsUtxoScreen'

export interface BalanceParamList {
  BalancesScreen: undefined
  ReceiveScreen: undefined
  SendScreen: { token: WalletToken }
  SendConfirmationScreen: {
    token: WalletToken
    destination: string
    amount: BigNumber
    fee: BigNumber
  }
  TokenDetailScreen: { token: WalletToken }
  ConvertScreen: { mode: ConversionMode }
  ConvertConfirmationScreen: {
    amount: BigNumber
    mode: ConversionMode
    sourceUnit: string
    sourceBalance: BigNumber
    targetUnit: string
    targetBalance: BigNumber
    fee: BigNumber
  }
  BarCodeScanner: { onQrScanned: (value: string) => void }
  TokenVsUtxoScreen: undefined

  [key: string]: undefined | object
}

function BalanceActionButton (props: {
  title?: string
  onPress: () => void
  testID: string
}): JSX.Element {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={tailwind('px-2 py-1.5 ml-3 flex-row items-center')}
      testID={props.testID}
    >
      {
        props.title !== undefined && (
          <ThemedText
            dark={tailwind('text-darkprimary-500')}
            light={tailwind('text-primary-500')}
            style={tailwind('mx-1 font-semibold')}
          >
            {translate('screens/BalancesScreen', props.title)}
          </ThemedText>
        )
      }
    </TouchableOpacity>
  )
}

const BalanceStack = createStackNavigator<BalanceParamList>()

export function BalancesNavigator (): JSX.Element {
  const navigation = useNavigation<NavigationProp<BalanceParamList>>()
  const headerContainerTestId = 'balances_header_container'
  return (
    <BalanceStack.Navigator initialRouteName='BalancesScreen'>
      <BalanceStack.Screen
        component={BalancesScreen}
        name='BalancesScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/BalancesScreen', 'Balances')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false,
          headerRight: () => (
            <BalanceActionButton
              onPress={() => navigation.navigate('Receive')}
              testID='header_receive_balance'
              title='RECEIVE'
            />
          )
        }}
      />

      <BalanceStack.Screen
        component={ReceiveScreen}
        name='Receive'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/ReceiveScreen', 'Receive')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <BalanceStack.Screen
        component={SendScreen}
        name='Send'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/SendScreen', 'Send')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <BalanceStack.Screen
        component={SendConfirmationScreen}
        name='SendConfirmationScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/SendConfirmationScreen', 'Confirm Send')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <BalanceStack.Screen
        component={TokenDetailScreen}
        name='TokenDetail'
        options={({ route }: { route: any }) => ({
          headerTitle: () => {
            const token = route?.params?.token
            const Icon = getNativeIcon(token.avatarSymbol)
            return (
              <HeaderTitle containerTestID={headerContainerTestId}>
                <View style={tailwind('flex-row items-center')}>
                  <Icon />

                  <View style={tailwind('flex-col ml-2')}>
                    <ThemedText style={tailwind('font-semibold')}>
                      {token.displaySymbol}
                    </ThemedText>

                    <ConnectionStatus />
                  </View>
                </View>
              </HeaderTitle>
            )
          },
          headerBackTitleVisible: false
        })}
      />

      <BalanceStack.Screen
        component={ConvertScreen}
        name='Convert'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/ConvertScreen', 'Convert DFI')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <BalanceStack.Screen
        component={ConvertConfirmationScreen}
        name='ConvertConfirmationScreen'
        options={{
          headerBackTitleVisible: false,
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/ConvertConfirmScreen', 'Confirm DFI Conversion')}
              containerTestID={headerContainerTestId}
            />
          )
        }}
      />

      <BalanceStack.Screen
        component={BarCodeScanner}
        name='BarCodeScanner'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/ConvertScreen', 'Scan recipient QR')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <BalanceStack.Screen
        component={TokensVsUtxoScreen}
        name='TokensVsUtxo'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/ConvertScreen', 'UTXO vs Token')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <BalanceStack.Screen
        component={NetworkDetails}
        name='NetworkDetails'
        options={{
          headerTitle: translate('screens/NetworkDetails', 'Wallet Network'),
          headerBackTitleVisible: false,
          headerBackTestID: 'network_details_header_back'
        }}
      />
    </BalanceStack.Navigator>
  )
}
