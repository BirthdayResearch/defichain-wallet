import { CTransactionSegWit, TransactionSegWit } from '@defichain/jellyfish-transaction'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { NavigationProp, StackActions, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useCallback, useState } from 'react'
import { TouchableOpacity, ScrollView } from 'react-native'
import tailwind from 'tailwind-rn'
import { Text, TextInput, View } from '../../../../components'
import { PrimaryColor, PrimaryColorStyle } from '../../../../constants/Theme'
import { useTokensAPI } from '../../../../hooks/wallet/TokensAPI'
import { BalanceParamList } from './BalancesNavigator'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { MaterialIcons } from '@expo/vector-icons'
import { PrimaryButton } from '../../../../components/PrimaryButton'
import { translate } from '../../../../translations'
import NumberFormat from 'react-number-format'
import { useWhaleApiClient } from '../../../../contexts/WhaleContext'
import { useWallet } from '../../../../contexts/WalletContext'

export type ConversionMode = 'utxosToAccount' | 'accountToUtxos'
type Props = StackScreenProps<BalanceParamList, 'ConvertScreen'>

interface ConversionIO extends AddressToken {
  unit: 'UTXOS' | 'Token'
}

export function ConvertScreen (props: Props): JSX.Element {
  const navigation = useNavigation<NavigationProp<BalanceParamList>>()

  const tokens = useTokensAPI()
  const [sourceToken, targetToken] = getDFIBalances(props.route.params.mode, tokens)

  const [amount, setAmount] = useState<string>('0')
  const convAmount = new BigNumber(amount).isNaN() ? '0' : new BigNumber(amount).toString()
  const resultBal = new BigNumber(targetToken.amount).plus(convAmount)
  const whaleApiClient = useWhaleApiClient()
  const account = useWallet().get(0)

  const convert = useCallback(() => {
    constructSignedConversionAndSend(
      whaleApiClient,
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
          unit={sourceToken.unit}
          balance={new BigNumber(sourceToken.amount)}
          onChange={(val) => {
            if (sourceToken.unit === 'UTXOS' && new BigNumber(val).eq(sourceToken.amount)) {
              setAmount(new BigNumber(val).minus(0.0001).toString()) // spare for fee
            } else {
              setAmount(val)
            }
          }}
        />
        <View style={tailwind('w-full justify-center items-center p-2')}>
          <MaterialIcons name='arrow-downward' size={16} color={PrimaryColor} />
        </View>
        <View style={tailwind('bg-white p-4 border-b border-gray-200 flex-row items-start w-full')}>
          <View style={tailwind('flex-1')}>
            <Text style={tailwind('font-medium')} testID='text_to_desc'>{`${translate('screens/Convert', 'To')}: `}</Text>
          </View>
          <View style={tailwind('flex-1')}>
            <NumberFormat
              value={convAmount} decimalScale={8} thousandSeparator displayType='text' suffix={` ${targetToken.unit}`}
              renderText={(value: string) => <Text testID='text_to_value' style={tailwind('font-medium text-gray-500')}>{value}</Text>}
            />
          </View>
        </View>
        <View style={tailwind('bg-white p-4 border-b border-gray-200 flex-row items-start w-full')}>
          <View style={tailwind('flex-1')}>
            <Text style={tailwind('font-medium')} testID='text_prev_desc'>{`${translate('screens/Convert', 'Previous')}: `}</Text>
          </View>
          <View style={tailwind('flex-1')}>
            <NumberFormat
              value={targetToken.amount} decimalScale={8} thousandSeparator displayType='text' suffix={` ${targetToken.unit}`}
              renderText={(value: string) => <Text testID='text_prev_value' style={tailwind('font-medium text-gray-500')}>{value}</Text>}
            />
          </View>
        </View>
        <View style={tailwind('bg-white p-4 border-b border-gray-200 flex-row items-start w-full')}>
          <View style={tailwind('flex-1')}>
            <Text style={tailwind('font-medium')} testID='text_prev_desc'>{`${translate('screens/Convert', 'Total')}: `}</Text>
          </View>
          <View style={tailwind('flex-1')}>
            <NumberFormat
              value={resultBal.toString()} decimalScale={8} thousandSeparator displayType='text' suffix={` ${targetToken.unit}`}
              renderText={(value: string) => <Text testID='text_total_value' style={tailwind('font-medium text-gray-500')}>{value}</Text>}
            />
          </View>
        </View>
      </ScrollView>
      <ContinueButton
        enabled={canConvert(convAmount, sourceToken.amount)}
        onPress={convert}
      />
    </View>
  )
}

function getDFIBalances (mode: ConversionMode, tokens: AddressToken[]): [source: ConversionIO, target: ConversionIO] {
  const source: AddressToken = mode === 'utxosToAccount'
    ? tokens.find(tk => tk.id === '0_utxo') as AddressToken
    : tokens.find(tk => tk.id === '0') as AddressToken
  const sourceUnit = mode === 'utxosToAccount' ? 'UTXOS' : 'Token'

  const target: AddressToken = mode === 'utxosToAccount'
    ? tokens.find(tk => tk.id === '0') as AddressToken
    : tokens.find(tk => tk.id === '0_utxo') as AddressToken
  const targetUnit = mode === 'utxosToAccount' ? 'Token' : 'UTXOS'

  return [
    { ...source, unit: sourceUnit },
    { ...target, unit: targetUnit }
  ]
}

function ConversionInput (props: { unit: string, current: string, balance: BigNumber, onChange: (amount: string) => void }): JSX.Element {
  return (
    <View style={tailwind('flex-col w-full h-32 items-center mt-4')}>
      <View style={tailwind('flex-col w-full h-8 bg-white justify-center')}>
        <Text style={tailwind('m-4')}>{translate('screens/Convert', 'From')}</Text>
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
          <Text>{translate('screens/Convert', 'Balance')}: </Text>
          <NumberFormat
            value={props.balance.toNumber()} decimalScale={8} thousandSeparator displayType='text'
            renderText={(value: string) => <Text style={tailwind('font-medium text-gray-500')}>{value}</Text>}
          />
        </View>
        <TouchableOpacity
          testID='button_max_convert_from'
          style={tailwind('flex w-12 mr-2')}
          onPress={() => { props.onChange(props.balance.toString()) }}
        >
          <Text style={[PrimaryColorStyle.text]}>{translate('components/max', 'MAX')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function ContinueButton (props: { enabled: boolean, onPress: () => void }): JSX.Element {
  return (
    <PrimaryButton testID='button_continue_convert' disabled={!props.enabled} title='Convert' onPress={props.onPress}>
      <Text style={tailwind('text-white font-bold')}>{translate('components/Button', 'CONTINUE')}</Text>
    </PrimaryButton>
  )
}

function canConvert (amount: string, balance: string): boolean {
  return new BigNumber(balance).gte(amount) && !(new BigNumber(amount).isZero())
}

async function constructSignedConversionAndSend (whaleAPI: WhaleApiClient, account: WhaleWalletAccount, mode: ConversionMode, amount: BigNumber): Promise<string> {
  const builder = account.withTransactionBuilder()

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

  const hex = new CTransactionSegWit(signed).toHex()
  return await whaleAPI.transactions.send({ hex })
}
