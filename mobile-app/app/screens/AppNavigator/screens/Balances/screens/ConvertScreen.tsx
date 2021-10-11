import { InfoText } from '@components/InfoText'
import { InputHelperText } from '@components/InputHelperText'
import { WalletTextInput } from '@components/WalletTextInput'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { Logging } from '@api'
import { View } from '@components/index'
import { Button } from '@components/Button'
import { IconButton } from '@components/IconButton'
import { AmountButtonTypes, SetAmountButton } from '@components/SetAmountButton'
import { ThemedIcon, ThemedScrollView, ThemedSectionTitle, ThemedText, ThemedView } from '@components/themed'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useTokensAPI } from '@hooks/wallet/TokensAPI'
import { RootState } from '@store'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued } from '@store/transaction_queue'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
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
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
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
    return <></>
  }

  function convert (sourceToken: ConversionIO, targetToken: ConversionIO): void {
    if (hasPendingJob || hasPendingBroadcastJob) {
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
    <ThemedScrollView style={tailwind('w-full flex-col flex-1 px-4 py-8')} testID='convert_screen'>
      <ConversionIOCard
        balance={new BigNumber(sourceToken.amount)}
        current={amount}
        mode='input'
        onChange={setAmount}
        style={tailwind('mt-1')}
        unit={sourceToken.unit}
        title={translate('screens/ConvertScreen', 'How much {{symbol}} to convert?', { symbol: sourceToken.unit })}
        onClearButtonPress={() => setAmount('')}
      />

      <ToggleModeButton onPress={() => setMode(mode === 'utxosToAccount' ? 'accountToUtxos' : 'utxosToAccount')} />

      <ConversionReceiveCard
        current={BigNumber.maximum(new BigNumber(targetToken.amount).plus(convAmount), 0).toFixed(8)}
        unit={targetToken.unit}
        title={translate('screens/ConvertScreen', 'After conversion, you will receive')}
      />

      <TokenVsUtxosInfo />

      {isUtxoToAccount(mode) && <InfoText
        testID='convert_info_text'
        text={translate('screens/ConvertScreen', 'A small UTXO amount (0.1 DFI (UTXO)) is reserved for fees.')}
        style={tailwind('mt-0')}
                                />}

      <Button
        disabled={!canConvert(convAmount, sourceToken.amount) || hasPendingJob || hasPendingBroadcastJob}
        label={translate('components/Button', 'CONTINUE')}
        onPress={() => convert(sourceToken, targetToken)}
        testID='button_continue_convert'
        title='Convert'
        margin='mt-8'
      />
      <ThemedText
        light={tailwind('text-gray-600')}
        dark={tailwind('text-gray-300')}
        style={tailwind('mt-4 text-center text-sm')}
      >
        {translate('screens/ConvertScreen', 'Review full transaction details in the next screen')}
      </ThemedText>
    </ThemedScrollView>
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
    { ...source, unit: sourceUnit, amount: getConvertibleUtxoAmount(mode, source) },
    { ...target, unit: targetUnit }
  ]
}

function ConversionIOCard (props: { style?: StyleProp<ViewStyle>, mode: 'input' | 'output', unit: 'UTXO' | 'Token', current: string, balance: BigNumber, onChange: (amount: string) => void, title: string, onClearButtonPress: () => void }): JSX.Element {
  return (
    <View style={[tailwind('flex-col w-full'), props.style]}>
      <ThemedView
        dark={tailwind('')}
        light={tailwind('')}
        style={tailwind('flex-row w-full items-center')}
      >
        <WalletTextInput
          editable={props.mode === 'input'}
          onChange={event => {
            props.onChange(event.nativeEvent.text)
          }}
          placeholder={translate('screens/ConvertScreen', 'Enter an amount')}
          style={tailwind('flex-grow w-2/5 text-gray-500 px-1')}
          testID={`text_input_convert_from_${props.mode}`}
          value={props.current}
          inputType='numeric'
          title={props.title}
          titleTestID={`text_input_convert_from_${props.mode}_text`}
          displayClearButton={props.current !== ''}
          onClearButtonPress={props.onClearButtonPress}
        >
          {props.mode === 'input' &&
            <SetAmountButton
              amount={props.balance}
              onPress={props.onChange}
              type={AmountButtonTypes.half}
            />}

          {props.mode === 'input' &&
            <SetAmountButton
              amount={props.balance}
              onPress={props.onChange}
              type={AmountButtonTypes.max}
            />}
        </WalletTextInput>
      </ThemedView>
      <InputHelperText
        testID='source_balance'
        label={`${translate('screens/ConvertScreen', 'Available')}: `}
        content={props.balance.toFixed(8)}
        suffix=' DFI'
      />
    </View>
  )
}

function ConversionReceiveCard (props: { style?: StyleProp<ViewStyle>, unit: string, current: string, title: string }): JSX.Element {
  return (
    <View style={[tailwind('flex-col w-full'), props.style]}>
      <ThemedSectionTitle
        testID='text_input_convert_from_to_text'
        text={props.title}
      />

      <ThemedView
        dark={tailwind('bg-gray-800 border-b border-gray-700')}
        light={tailwind('bg-white border-b border-gray-200')}
        style={tailwind('w-full px-4 flex-row items-center')}
      >
        <View style={tailwind('flex flex-row flex-1 px-1 py-4 flex-wrap mr-2')}>
          <ThemedText>
            {translate('screens/ConvertScreen', 'Balance')}
            :

            {' '}
          </ThemedText>

          <NumberFormat
            decimalScale={8}
            displayType='text'
            renderText={(value: string) => (
              <ThemedText
                dark={tailwind('text-white text-opacity-70')}
                light={tailwind('text-gray-500')}
                style={tailwind('font-medium')}
                testID='target_balance'
              >
                {value}
              </ThemedText>
            )}
            suffix=' DFI'
            thousandSeparator
            value={props.current}
          />
        </View>
      </ThemedView>
    </View>
  )
}

function ToggleModeButton (props: { onPress: () => void }): JSX.Element {
  return (
    <View style={tailwind('justify-center items-center mt-2')}>
      <ThemedView
        light={tailwind('border-gray-200')}
        dark={tailwind('border-gray-700')}
        style={tailwind('border-b w-full relative top-2/4')}
      />
      <IconButton
        iconName='swap-vert'
        iconSize={24}
        iconType='MaterialIcons'
        onPress={props.onPress}
        testID='button_convert_mode_toggle'
      />
    </View>
  )
}

function TokenVsUtxosInfo (): JSX.Element {
  const navigation = useNavigation<NavigationProp<BalanceParamList>>()
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('TokensVsUtxo')
      }}
      style={tailwind('flex-row py-2 my-2 items-center justify-start')}
      testID='token_vs_utxo_info'
    >
      <ThemedIcon
        dark={tailwind('text-darkprimary-500')}
        iconType='MaterialIcons'
        light={tailwind('text-primary-500')}
        name='help'
        size={16}
      />

      <ThemedText
        dark={tailwind('text-darkprimary-500')}
        light={tailwind('text-primary-500')}
        style={tailwind('ml-1 text-sm font-medium px-1')}
      >
        {translate('screens/ConvertScreen', 'UTXO vs Token, what is the difference?')}
      </ThemedText>
    </TouchableOpacity>
  )
}

function canConvert (amount: string, balance: string): boolean {
  return new BigNumber(balance).gte(amount) && !(new BigNumber(amount).isZero()) && (new BigNumber(amount).isPositive())
}

function getConvertibleUtxoAmount (mode: ConversionMode, source: AddressToken): string {
  if (mode === 'accountToUtxos') {
    return source.amount
  }

  const utxoToReserve = '0.1'
  const leftover = new BigNumber(source.amount).minus(new BigNumber(utxoToReserve))
  return leftover.isLessThan(0) ? '0' : leftover.toFixed()
}

function isUtxoToAccount (mode: ConversionMode): boolean {
  return mode === 'utxosToAccount'
}
