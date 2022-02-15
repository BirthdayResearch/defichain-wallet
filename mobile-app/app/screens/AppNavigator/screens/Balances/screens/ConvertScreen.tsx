import { InputHelperText } from '@components/InputHelperText'
import { WalletTextInput } from '@components/WalletTextInput'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { NavigationProp, useIsFocused, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { View } from '@components/index'
import { Button } from '@components/Button'
import { IconButton } from '@components/IconButton'
import { AmountButtonTypes, SetAmountButton } from '@components/SetAmountButton'
import { ThemedScrollView, ThemedSectionTitle, ThemedText, ThemedView } from '@components/themed'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { RootState } from '@store'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued } from '@store/transaction_queue'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { BalanceParamList } from '../BalancesNavigator'
import { ReservedDFIInfoText } from '@components/ReservedDFIInfoText'
import { FeeInfoRow } from '@components/FeeInfoRow'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { InfoTextLink } from '@components/InfoTextLink'
import { fetchTokens, tokensSelector } from '@store/wallet'
import { useWalletContext } from '@shared-contexts/WalletContext'

export type ConversionMode = 'utxosToAccount' | 'accountToUtxos'
type Props = StackScreenProps<BalanceParamList, 'ConvertScreen'>

interface ConversionIO extends AddressToken {
  unit: 'UTXO' | 'Token'
}

export function ConvertScreen (props: Props): JSX.Element {
  const client = useWhaleApiClient()
  const logger = useLogger()
  const dispatch = useDispatch()
  const { address } = useWalletContext()
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const blockCount = useSelector((state: RootState) => state.block.count)
  const isFocused = useIsFocused()

  // global state
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
    if (isFocused) {
      dispatch(fetchTokens({ client, address }))
    }
  }, [address, blockCount, isFocused])

  useEffect(() => {
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error)
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
    <ThemedScrollView style={tailwind('w-full flex-col flex-1 py-8')} testID='convert_screen'>
      <View style={tailwind('px-4')}>
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
          amount={new BigNumber(convAmount).toFixed(8)}
          balance={BigNumber.maximum(new BigNumber(targetToken.amount).plus(convAmount), 0).toFixed(8)}
          unit={targetToken.unit}
          title={translate('screens/ConvertScreen', 'After conversion, you will receive')}
        />

        <InfoTextLink
          text='UTXO vs Token, what is the difference?'
          textStyle={tailwind('text-sm')}
          containerStyle={tailwind('my-4')}
          onPress={() => navigation.navigate('TokensVsUtxo')}
          testId='token_vs_utxo_info'
        />

        {isUtxoToAccount(mode) && <ReservedDFIInfoText style={tailwind('mt-0')} />}
      </View>

      <ThemedSectionTitle
        testID='title_transaction_details'
        text={translate('screens/ConvertScreen', 'TRANSACTION DETAILS')}
        style={tailwind('px-4 mt-6 pb-2 text-xs text-gray-500 font-medium')}
      />
      <FeeInfoRow
        type='ESTIMATED_FEE'
        value={fee.toString()}
        testID='transaction_fee'
        suffix='DFI'
      />
      <ThemedText
        light={tailwind('text-gray-600')}
        dark={tailwind('text-gray-300')}
        style={tailwind('mt-2 px-4 text-sm')}
      >
        {translate('screens/ConvertScreen', 'Review full transaction details in the next screen')}
      </ThemedText>

      <Button
        disabled={!canConvert(convAmount, sourceToken.amount) || hasPendingJob || hasPendingBroadcastJob}
        label={translate('components/Button', 'CONTINUE')}
        onPress={() => convert(sourceToken, targetToken)}
        testID='button_continue_convert'
        title='Convert'
        margin='my-14 mx-4'
      />
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

function ConversionReceiveCard (props: { style?: StyleProp<ViewStyle>, unit: string, amount: string, balance: string, title: string }): JSX.Element {
  return (
    <View style={[tailwind('flex-col w-full mt-6'), props.style]}>
      <WalletTextInput
        editable={false}
        titleTestID='text_input_convert_from_to_text'
        title={props.title}
        inputType='numeric'
        value={`${props.amount} ${props.unit}`}
        style={tailwind('h-8')}
      />
      <InputHelperText
        testID='target_balance'
        label={`${translate('screens/ConvertScreen', 'You will have')}: `}
        content={props.balance}
        suffix={` ${props.unit}`}
      />
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
