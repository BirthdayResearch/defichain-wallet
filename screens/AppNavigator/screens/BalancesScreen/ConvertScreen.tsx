import { P2WPKHTransactionBuilder } from '@defichain/jellyfish-transaction-builder'
import { CTransactionSegWit, TransactionSegWit } from '@defichain/jellyfish-transaction'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { NavigationProp, StackActions, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useCallback, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import tailwind from 'tailwind-rn'
import { Text, TextInput, View } from '../../../../components'
import { PrimaryColor, PrimaryColorStyle } from '../../../../constants/Theme'
import { useTokensAPI } from '../../../../hooks/wallet/TokensAPI'
import { BalanceParamList } from './BalancesNavigator'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { WhaleFeeRateProvider, WhalePrevoutProvider, WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { SmartBuffer } from 'smart-buffer'
import { useWhaleApiClient } from '../../../../hooks/api/useWhaleApiClient'
import { useWalletAPI } from '../../../../hooks/wallet/WalletAPI'
import { Ionicons } from '@expo/vector-icons'

export type ConversionMode = 'utxosToAccount' | 'accountToUtxos'
type Props = StackScreenProps<BalanceParamList, 'ConvertScreen'>

export function ConvertScreen (props: Props): JSX.Element {
  // ease syntax: true = utxo -> account, fasel = account -> utxo
  const mode = props.route.params.mode === 'utxosToAccount'
  const navigation = useNavigation<NavigationProp<BalanceParamList>>()

  // this component state
  const [amount, setAmount] = useState<string>('0')

  // gather required data
  const tokens = useTokensAPI()
  const sourceToken: AddressToken = mode
    ? tokens.find(tk => tk.id === '0_utxo') as AddressToken
    : tokens.find(tk => tk.id === '0') as AddressToken

  const targetToken: AddressToken = mode
    ? tokens.find(tk => tk.id === '0') as AddressToken
    : tokens.find(tk => tk.id === '0_utxo') as AddressToken

  const outputUnit = mode ? 'Token' : 'UTXOS'
  const convAmount = new BigNumber(amount).isNaN() ? '0' : new BigNumber(amount).toString()
  const resultBal = new BigNumber(targetToken.amount).plus(convAmount)

  const whaleAPI = useWhaleApiClient()
  const WalletAPI = useWalletAPI()
  const account = WalletAPI.getWallet().get(0) as WhaleWalletAccount

  const convert = useCallback(() => {
    constructSignedConversionAndSend(
      whaleAPI,
      account,
      props.route.params.mode,
      new BigNumber(amount)
    ).then(() => {
      navigation.dispatch(StackActions.popToTop())
    }).catch(e => console.log(e)) // TODO: display error
  }, [amount])

  return (
    <View style={tailwind('w-full h-full')}>
      <ScrollView style={tailwind('w-full flex-col flex-1 bg-gray-100')}>
        <ConversionInput
          current={amount}
          unit={mode ? 'UTXOS' : 'Token'}
          balance={new BigNumber(sourceToken.amount)}
          onChange={(val) => {
            if (mode && new BigNumber(val).eq(sourceToken.amount)) {
              setAmount(new BigNumber(val).minus(0.0001).toString()) // spare for fee
            } else {
              setAmount(val)
            }
          }}
        />
        <View style={tailwind('w-full justify-center items-center p-2')}>
          <Ionicons name='arrow-down' size={16} color={PrimaryColor} />
        </View>
        <TextRow lhs='To: ' rhs={`${convAmount} ${outputUnit}`} testID='output_to' />
        <TextRow lhs='Previous: ' rhs={`${targetToken.amount} ${outputUnit}`} testID='output_bal' />
        <TextRow lhs='Total: ' rhs={`${resultBal.toString()} ${outputUnit}`} testID='output_total' />
      </ScrollView>
      <View style={tailwind('w-full h-16')}>
        <ContinueButton
          enabled={canConvert(convAmount, sourceToken.amount)}
          onPress={convert}
        />
      </View>
    </View>
  )
}

function ConversionInput (props: { unit: string, current: string, balance: BigNumber, onChange: (amount: string) => void }): JSX.Element {
  return (
    <View style={tailwind('flex-col w-full h-32 items-center mt-4')}>
      <View style={tailwind('flex-col w-full h-8 bg-white justify-center')}>
        <Text style={tailwind('m-4')}>From</Text>
      </View>
      <View style={tailwind('flex-row w-full h-12 bg-white justify-center p-4')}>
        <TextInput
          testID='text_input_convert_from'
          value={props.current}
          style={tailwind('flex-1 mr-4 text-gray-500')}
          keyboardType='numeric'
          onChange={event => props.onChange(event.nativeEvent.text)}
        />
        <Text>{props.unit}</Text>
      </View>
      <View style={tailwind('w-full bg-white flex-row border-t border-gray-200 h-12 items-center')}>
        <View style={tailwind('flex flex-row flex-1 ml-4')}>
          <Text>Balance: </Text>
          <Text style={tailwind('text-gray-500')}>{props.balance.toString()}</Text>
        </View>
        <TouchableOpacity
          style={tailwind('flex w-12 mr-2')}
          onPress={() => { props.onChange(props.balance.toString()) }}
        >
          <Text style={[PrimaryColorStyle.text]}>MAX</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function TextRow (props: { lhs: string, rhs: string, testID?: string }): JSX.Element {
  return (
    <View style={tailwind('bg-white p-4 border-b border-gray-200 flex-row items-start w-full')}>
      <View style={tailwind('flex-1')}>
        <Text style={tailwind('font-medium')} testID={`text_row_${props.testID ?? ''}_lhs`}>{props.lhs}</Text>
      </View>
      <View style={tailwind('flex-1')}>
        <Text style={tailwind('font-medium')} testID={`text_row_${props.testID ?? ''}_rhs`}>{props.rhs}</Text>
      </View>
    </View>
  )
}

function ContinueButton (props: { enabled: boolean, onPress: () => void }): JSX.Element {
  const buttonColor = props.enabled ? PrimaryColorStyle.bg : { backgroundColor: 'gray' }
  return (
    <TouchableOpacity
      testID='button_continue'
      style={[tailwind('m-2 p-3 rounded flex-row justify-center'), buttonColor]}
      onPress={props.onPress}
      disabled={!props.enabled}
    >
      <Text style={[tailwind('text-white font-bold')]}>Continue</Text>
    </TouchableOpacity>
  )
}

function canConvert (amount: string, balance: string): boolean {
  return new BigNumber(balance).gte(amount) && !(new BigNumber(amount).isZero())
}

async function constructSignedConversionAndSend (whaleAPI: WhaleApiClient, account: WhaleWalletAccount, mode: ConversionMode, amount: BigNumber): Promise<string> {
  const feeRate = new WhaleFeeRateProvider(whaleAPI)
  const prevout = new WhalePrevoutProvider(account, 50)
  const builder = new P2WPKHTransactionBuilder(feeRate, prevout, {
    // @ts-expect-error
    get: (_) => account.hdNode
  })

  const script = await account.getScript()
  let signed: TransactionSegWit
  if (mode === 'utxosToAccount') {
    signed = await builder.account.utxosToAccount({
      to: [{
        script,
        balances: [
          { token: 0, amount }
        ]
      }]
    }, script)
  } else {
    signed = await builder.account.accountToUtxos({
      from: script,
      balances: [
        { token: 0, amount }
      ],
      mintingOutputsStart: 2 // 0: DfTx, 1: change, 2: minted utxos (mandated by jellyfish-tx)
    }, script)
  }

  const buffer = new SmartBuffer()
  new CTransactionSegWit(signed).toBuffer(buffer)
  return await whaleAPI.transactions.send({ hex: buffer.toString('hex') })
}
