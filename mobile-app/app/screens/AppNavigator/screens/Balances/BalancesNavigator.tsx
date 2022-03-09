import { NavigationProp, useNavigation } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { WalletToken } from '@store/wallet'
import BigNumber from 'bignumber.js'
import { TouchableOpacity, View } from 'react-native'
import { BarCodeScanner } from '@components/BarCodeScanner'
import { ConnectionStatus, HeaderTitle } from '@components/HeaderTitle'
import { getNativeIcon } from '@components/icons/assets'
import { ThemedIcon, ThemedText } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { SettingsNavigator } from '../Settings/SettingsNavigator'
import { NetworkDetails } from '../Settings/screens/NetworkDetails'
import { BalancesScreen } from './BalancesScreen'
import { ConvertConfirmationScreen } from './screens/ConvertConfirmationScreen'
import { ConversionMode, ConvertScreen } from './screens/ConvertScreen'
import { ReceiveScreen } from './screens/ReceiveScreen'
import { SendConfirmationScreen } from './screens/SendConfirmationScreen'
import { SendScreen } from './screens/SendScreen'
import { TokenDetailScreen } from './screens/TokenDetailScreen'
import { TokensVsUtxoScreen } from './screens/TokensVsUtxoScreen'
import { AddressControlScreen } from './components/AddressControlScreen'

export interface BalanceParamList {
  BalancesScreen: undefined
  ReceiveScreen: undefined
  SendScreen: { token?: WalletToken }
  SendConfirmationScreen: {
    token: WalletToken
    destination: string
    amount: BigNumber
    fee: BigNumber
    conversion?: ConversionParam
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

export interface ConversionParam {
  isConversionRequired: boolean
  conversionAmount: BigNumber
  DFIUtxo: WalletToken
  DFIToken: WalletToken
}

const BalanceStack = createStackNavigator<BalanceParamList>()

export function BalancesNavigator (): JSX.Element {
  const navigation = useNavigation<NavigationProp<BalanceParamList>>()
  const headerContainerTestId = 'balances_header_container'
  return (
    <BalanceStack.Navigator
      initialRouteName='BalancesScreen'
      screenOptions={{
        headerTitleAlign: 'center'
      }}
    >
      <BalanceStack.Screen
        component={SettingsNavigator}
        name={translate('BalancesNavigator', 'Settings')}
        options={{
          headerShown: false
        }}
      />

      <BalanceStack.Screen
        component={BalancesScreen}
        name='BalancesScreen'
        options={{
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              testID='header_settings'
            >
              <ThemedIcon
                iconType='MaterialIcons'
                name='settings'
                size={28}
                style={tailwind('ml-2')}
                light={tailwind('text-primary-500')}
                dark={tailwind('text-darkprimary-500')}
              />
            </TouchableOpacity>
          ),
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/BalancesScreen', 'Portfolio')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
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
        component={AddressControlScreen}
        name='AddressControlScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/AddressControlScreen', 'Wallet Address')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerRightContainerStyle: tailwind('px-2 py-2'),
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
            const Icon = getNativeIcon(token.displaySymbol)
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
