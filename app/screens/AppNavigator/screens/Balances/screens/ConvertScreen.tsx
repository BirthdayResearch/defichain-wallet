import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { MaterialIcons } from '@expo/vector-icons'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { ScrollView, StyleProp, TouchableOpacity, ViewStyle } from 'react-native'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { Logging } from '../../../../../api'
import { Text, View } from '../../../../../components'
import { Button } from '../../../../../components/Button'
import { getTokenIcon } from '../../../../../components/icons/tokens/_index'
import LoadingScreen from '../../../../../components/LoadingScreen'
import { NumberTextInput } from '../../../../../components/NumberTextInput'
import { SectionTitle } from '../../../../../components/SectionTitle'
import { AmountButtonTypes, SetAmountButton } from '../../../../../components/SetAmountButton'
import { useWhaleApiClient } from '../../../../../contexts/WhaleContext'
import { useTokensAPI } from '../../../../../hooks/wallet/TokensAPI'
import { RootState } from '../../../../../store'
import { hasTxQueued } from '../../../../../store/transaction_queue'
import { tailwind } from '../../../../../tailwind'
import { translate } from '../../../../../translations'
import { BalanceParamList } from '../BalancesNavigator'

export type ConversionMode = 'utxosToAccount' | 'accountToUtxos'
type Props = StackScreenProps<BalanceParamList, 'ConvertScreen'>

interface ConversionIO extends AddressToken {
  unit: 'UTXO' | 'Token'
}

export function ConvertScreen (props: Props): JSX.Element {
  const client = useWhaleApiClient()
  // global state
  const tokens = useTokensAPI()
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const navigation = useNavigation<NavigationProp<BalanceParamList>>()
  const [mode, setMode] = useState(props.route.params.mode)
  const [sourceToken, setSourceToken] = useState<ConversionIO>()
  const [targetToken, setTargetToken] = useState<ConversionIO>()
  const [convAmount, setConvAmount] = useState<string>('0')
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))

  const [amount, setAmount] = useState<string>('')

  useEffect(() => {
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(Logging.error)
  }, [])

  useEffect(() => {
    const [source, target] = getDFIBalances(mode, tokens)
    setSourceToken(source)
    setTargetToken(target)
    const conversion = new BigNumber(amount).isNaN() ? '0' : new BigNumber(amount).toString()
    setConvAmount(conversion)
  }, [mode, JSON.stringify(tokens), amount])

  if (sourceToken === undefined || targetToken === undefined) {
    return <LoadingScreen />
  }

  function convert (sourceToken: ConversionIO, targetToken: ConversionIO): void {
    if (hasPendingJob) {
      return
    }
    navigation.navigate({
      name: 'ConvertConfirmationScreen',
      params: {
        sourceUnit: sourceToken.unit,
        sourceBalance: BigNumber.maximum(new BigNumber(sourceToken.amount).minus(convAmount), 0),
        targetUnit: targetToken.unit,
        targetBalance: BigNumber.maximum(new BigNumber(targetToken.amount).plus(convAmount), 0),
        mode,
        amount: new BigNumber(amount),
        fee
      },
      merge: true
    })
  }

  return (
    <ScrollView style={tailwind('w-full flex-col flex-1 bg-gray-100')}>
      <ConversionIOCard
        style={tailwind('my-4 mt-1')}
        mode='input'
        current={amount}
        unit={sourceToken.unit}
        balance={new BigNumber(sourceToken.amount)}
        onChange={setAmount}
      />
      <ToggleModeButton onPress={() => setMode(mode === 'utxosToAccount' ? 'accountToUtxos' : 'utxosToAccount')} />
      <ConversionReceiveCard
        current={BigNumber.maximum(new BigNumber(targetToken.amount).plus(convAmount), 0).toFixed(8)}
        unit={targetToken.unit}
      />
      <TokenVsUtxosInfo />
      <Button
        testID='button_continue_convert'
        disabled={!canConvert(convAmount, sourceToken.amount) || hasPendingJob}
        title='Convert' onPress={() => convert(sourceToken, targetToken)}
        label={translate('components/Button', 'CONTINUE')}
      />
    </ScrollView>
  )
}

function getDFIBalances (mode: ConversionMode, tokens: AddressToken[]): [source: ConversionIO, target: ConversionIO] {
  const source: AddressToken = mode === 'utxosToAccount'
    ? tokens.find(tk => tk.id === '0_utxo') as AddressToken
    : tokens.find(tk => tk.id === '0') as AddressToken
  const sourceUnit = mode === 'utxosToAccount' ? 'UTXO' : 'Token'

  const target: AddressToken = mode === 'utxosToAccount'
    ? tokens.find(tk => tk.id === '0') as AddressToken
    : tokens.find(tk => tk.id === '0_utxo') as AddressToken
  const targetUnit = mode === 'utxosToAccount' ? 'Token' : 'UTXO'

  return [
    { ...source, unit: sourceUnit },
    { ...target, unit: targetUnit }
  ]
}

function ConversionIOCard (props: { style?: StyleProp<ViewStyle>, mode: 'input' | 'output', unit: string, current: string, balance: BigNumber, onChange?: (amount: string) => void }): JSX.Element {
  const iconType = props.unit === 'UTXO' ? '_UTXO' : 'DFI'
  const titlePrefix = props.mode === 'input' ? 'CONVERT' : 'TO'
  const title = `${translate('screens/Convert', titlePrefix)} ${props.unit}`
  const DFIIcon = getTokenIcon(iconType)

  return (
    <View style={[tailwind('flex-col w-full'), props.style]}>
      <SectionTitle text={title.toUpperCase()} testID={`text_input_convert_from_${props.mode}_text`} />
      <View style={tailwind('flex-row w-full bg-white items-center pl-4 pr-4')}>
        <NumberTextInput
          placeholder={translate('screens/Convert', 'Enter an amount')}
          testID={`text_input_convert_from_${props.mode}`}
          value={props.current}
          style={tailwind('flex-1 mr-4 text-gray-500 px-1 py-4')}
          editable={props.mode === 'input'}
          onChange={event => {
            if (props.onChange !== undefined) {
              props.onChange(event.nativeEvent.text)
            }
          }}
        />
        <DFIIcon width={24} height={24} />
      </View>
      <View style={tailwind('w-full px-4 bg-white flex-row border-t border-gray-200 items-center')}>
        <View style={tailwind('flex flex-row flex-1 px-1 py-4 flex-wrap mr-2')}>
          <Text>{translate('screens/Convert', 'Balance')}: </Text>
          <NumberFormat
            value={props.balance.toFixed(8)} decimalScale={8} thousandSeparator displayType='text' suffix=' DFI'
            renderText={(value: string) => (
              <Text
                testID='source_balance'
                style={tailwind('font-medium text-gray-500')}
              >{value}
              </Text>
            )}
          />
        </View>
        {props.mode === 'input' && props.onChange &&
          <SetAmountButton type={AmountButtonTypes.half} onPress={props.onChange} amount={props.balance} />}
        {props.mode === 'input' && props.onChange &&
          <SetAmountButton type={AmountButtonTypes.max} onPress={props.onChange} amount={props.balance} />}
      </View>
    </View>
  )
}

function ConversionReceiveCard (props: { style?: StyleProp<ViewStyle>, unit: string, current: string }): JSX.Element {
  const iconType = props.unit === 'UTXO' ? '_UTXO' : 'DFI'
  const titlePrefix = 'TO'
  const title = `${translate('screens/Convert', titlePrefix)} ${props.unit.toUpperCase()}`
  const DFIIcon = getTokenIcon(iconType)

  return (
    <View style={[tailwind('flex-col w-full'), props.style]}>
      <SectionTitle text={title} testID='text_input_convert_from_to_text' />
      <View style={tailwind('w-full px-4 bg-white flex-row border-t border-gray-200 items-center')}>
        <View style={tailwind('flex flex-row flex-1 px-1 py-4 flex-wrap mr-2')}>
          <Text>{translate('screens/Convert', 'Balance')}: </Text>
          <NumberFormat
            value={props.current} decimalScale={8} thousandSeparator displayType='text' suffix=' DFI'
            renderText={(value: string) => (
              <Text
                testID='target_balance'
                style={tailwind('font-medium text-gray-500')}
              >{value}
              </Text>
            )}
          />
        </View>
        <DFIIcon width={24} height={24} />
      </View>
    </View>
  )
}

function ToggleModeButton (props: { onPress: () => void }): JSX.Element {
  return (
    <View style={tailwind('flex-row justify-center items-center')}>
      <TouchableOpacity
        testID='button_convert_mode_toggle'
        style={tailwind('border border-gray-300 rounded bg-white p-1')}
        onPress={props.onPress}
      >
        <MaterialIcons name='swap-vert' size={24} style={tailwind('text-primary')} />
      </TouchableOpacity>
    </View>
  )
}

function TokenVsUtxosInfo (): JSX.Element {
  const navigation = useNavigation<NavigationProp<BalanceParamList>>()
  return (
    <TouchableOpacity
      style={tailwind('flex-row px-4 py-2 my-2 items-center justify-start')}
      onPress={() => {
        navigation.navigate('TokensVsUtxo')
      }}
      testID='token_vs_utxo_info'
    >
      <MaterialIcons name='help' size={16} style={tailwind('text-primary')} />
      <Text
        style={tailwind('ml-1 text-primary text-sm font-medium')}
      >{translate('screens/ConvertScreen', 'Token vs UTXO, what is the difference?')}
      </Text>
    </TouchableOpacity>
  )
}

function canConvert (amount: string, balance: string): boolean {
  return new BigNumber(balance).gte(amount) && !(new BigNumber(amount).isZero()) && (new BigNumber(amount).isPositive())
}
