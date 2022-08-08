import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { View } from '@components'
import {
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedSectionTitleV2,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2
} from '@components/themed'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { RootState } from '@store'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued } from '@store/transaction_queue'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { PortfolioParamList } from '../PortfolioNavigator'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { tokensSelector } from '@store/wallet'
import { getNativeIcon } from '@components/icons/assets'
import { ButtonV2 } from '@components/ButtonV2'
import { AmountButtonTypes, TransactionCard } from '@components/TransactionCard'
import { useToast } from 'react-native-toast-notifications'
import { TransactionCardWalletTextInputV2 } from '@components/TransactionCardWalletTextInputV2'

export type ConversionMode = 'utxosToAccount' | 'accountToUtxos'
type Props = StackScreenProps<PortfolioParamList, 'ConvertScreen'>

interface ConversionIO extends AddressToken {
  unit: 'UTXO' | 'Token'
}

export function ConvertScreenV2 (props: Props): JSX.Element {
  const client = useWhaleApiClient()
  const logger = useLogger()
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const toast = useToast()
  const [showToast, setShowToast] = useState(false)
  const [percentageType, setPercentageType] = useState<string | undefined>()
  const TOAST_DURATION = 2000

  // global state
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>()
  const [mode, setMode] = useState(props.route.params.mode)
  const [sourceToken, setSourceToken] = useState<ConversionIO>()
  const [targetToken, setTargetToken] = useState<ConversionIO>()
  const [convAmount, setConvAmount] = useState<string>('0')
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const [amount, setAmount] = useState<string>('')
  const [hasError, setHasError] = useState<boolean>(false)
  const [showMaxUTXOWarning, setShowMaxUTXOWarning] = useState<boolean>(false)
  const [transactionCardStatus, setTransactionCardStatus] = useState<'error' | 'active' | undefined>()
  const [isInputFocus, setIsInputFocus] = useState<boolean>(false)

  useEffect(() => {
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error)
  }, [])

  useEffect(() => {
    const [source, target] = getDFIBalances(mode, tokens)
    setSourceToken(source)
    setTargetToken(target)
    const sourceNum = new BigNumber(source?.amount !== undefined && source.amount !== '' ? source.amount : 0)
    const conversionNum = new BigNumber(amount).isNaN() ? new BigNumber(0) : new BigNumber(amount)
    const conversion = conversionNum.toString()
    setConvAmount(conversion)
    setHasError(conversionNum.gt(sourceNum))
    setShowMaxUTXOWarning(isUtxoToAccount(mode) && !sourceNum.isZero() && conversionNum.toFixed(8) === sourceNum.toFixed(8))
  }, [mode, JSON.stringify(tokens), amount])

  useEffect(() => {
    setTransactionCardStatus(hasError ? 'error' : isInputFocus ? 'active' : undefined)
  }, [hasError, isInputFocus])

  useEffect(() => {
    if (showToast && percentageType !== undefined) {
      const isMax = percentageType === AmountButtonTypes.max
      const toastMessage = isMax ? 'Max available {{unit}} entered' : '{{percent}} of available {{unit}} entered'
      const toastOption = {
        unit: getDisplayUnit(sourceToken?.unit),
        percent: percentageType
      }
      toast.show(translate('screens/ConvertScreen', toastMessage, toastOption), {
        type: 'wallet_toast',
        placement: 'top',
        duration: TOAST_DURATION
      })
      setTimeout(() => setShowToast(false), TOAST_DURATION)
    } else {
      toast.hideAll()
    }
  }, [showToast])

  if (sourceToken === undefined || targetToken === undefined) {
    return <></>
  }

  function convert (sourceToken: ConversionIO, targetToken: ConversionIO): void {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }
    navigation.navigate({
      name: 'ConvertConfirmationScreenV2',
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

  function onPercentagePress (amount: string, type: AmountButtonTypes): void {
    setAmount(amount)
    setPercentageType(type)
    setShowToast(true)
  }

  function onTogglePress (): void {
    setMode(isUtxoToAccount(mode) ? 'accountToUtxos' : 'utxosToAccount')
    setAmount('')
  }

  return (
    <ThemedScrollViewV2 style={tailwind('w-full flex-col flex-1')} testID='convert_screen'>
      <View style={tailwind('items-center px-5 pb-16')}>
        <ConvertToggleButton onPress={onTogglePress} />

        <ThemedTextV2 style={tailwind('font-semibold-v2 text-lg mt-2')}>
          {translate('screens/ConvertScreen', 'Convert DFI')}
        </ThemedTextV2>

        <ConversionLabel sourceUnit={sourceToken.unit} targetUnit={targetToken.unit} />

        <View style={tailwind('w-full flex-col mt-6')}>
          <ThemedSectionTitleV2
            testID='convert_title'
            text={translate('screens/ConvertScreen', 'I WANT TO CONVERT')}
          />
          <TransactionCard
            maxValue={new BigNumber(sourceToken.amount)} status={transactionCardStatus}
            onChange={onPercentagePress}
            containerStyle={tailwind('border-t-0.5')}
          >
            <TransactionCardWalletTextInputV2
              inputType='numeric'
              displayClearButton={amount !== ''}
              displayFocusStyle
              onChangeText={setAmount}
              value={amount}
              hasBottomSheet={false}
              onFocus={() => setIsInputFocus(true)}
              onBlur={() => setIsInputFocus(false)}
              onClearButtonPress={() => setAmount('')}
              inputContainerStyle={tailwind('pb-5 pt-3 px-0')}
              placeholder='0.00'
              testID='convert_input'
            />
          </TransactionCard>
          <ThemedTextV2
            style={tailwind('font-normal-v2 text-xs px-5 pt-2')}
            light={tailwind('text-mono-light-v2-500', {
              'text-red-v2': hasError,
              'text-orange-v2': showMaxUTXOWarning && !hasError
            })}
            dark={tailwind('text-mono-dark-v2-500', {
              'text-red-v2': hasError,
              'text-orange-v2': showMaxUTXOWarning && !hasError
            })}
            testID='source_balance'
          >
            {
              translate('screens/ConvertScreen', hasError
                ? 'Insufficient balance'
                : showMaxUTXOWarning
                  ? 'A small amount of UTXO is reserved for fees'
                  : 'Available: {{amount}} {{unit}}', {
                amount: new BigNumber(sourceToken.amount).toFixed(8),
                unit: getDisplayUnit(sourceToken.unit)
              })
            }
          </ThemedTextV2>
        </View>

        {canConvert(convAmount, sourceToken.amount) && (
          <View style={tailwind('flex-col w-full')}>
            <ConversionResultCard
              unit={getDisplayUnit(targetToken.unit)} oriTargetAmount={targetToken.amount}
              totalTargetAmount={BigNumber.maximum(new BigNumber(targetToken.amount).plus(convAmount), 0).toFixed(8)}
            />

            <ThemedTextV2
              style={tailwind('font-normal-v2 text-xs text-center pt-12 pb-5')}
              light={tailwind('text-mono-light-v2-500')} dark={tailwind('text-mono-dark-v2-500')}
            >
              {`${translate('screens/ConvertScreen', 'Review full details in the next screen')}`}
            </ThemedTextV2>
          </View>
        )}

        <View style={tailwind('w-full px-7', { 'mt-56': !canConvert(convAmount, sourceToken.amount) })}>
          <ButtonV2
            fill='fill' label={translate('components/Button', 'Continue')}
            disabled={!canConvert(convAmount, sourceToken.amount) || hasPendingJob || hasPendingBroadcastJob}
            styleProps='w-full'
            onPress={() => convert(sourceToken, targetToken)}
            testID='button_continue_convert'
          />
        </View>
      </View>
    </ThemedScrollViewV2>
  )
}

function getDFIBalances (mode: ConversionMode, tokens: AddressToken[]): [source: ConversionIO, target: ConversionIO] {
  const source: AddressToken = isUtxoToAccount(mode)
    ? tokens.find(tk => tk.id === '0_utxo') as AddressToken
    : tokens.find(tk => tk.id === '0') as AddressToken
  const sourceUnit = isUtxoToAccount(mode) ? 'UTXO' : 'Token'

  const target: AddressToken = isUtxoToAccount(mode)
    ? tokens.find(tk => tk.id === '0') as AddressToken
    : tokens.find(tk => tk.id === '0_utxo') as AddressToken
  const targetUnit = isUtxoToAccount(mode) ? 'Token' : 'UTXO'

  return [
    {
      ...source,
      unit: sourceUnit,
      amount: getConvertibleUtxoAmount(mode, source)
    },
    {
      ...target,
      unit: targetUnit
    }
  ]
}

function ConvertToggleButton (props: { onPress: () => void }): JSX.Element {
  const UTXOIcon = getNativeIcon('_UTXO')
  return (
    <ThemedTouchableOpacityV2
      style={tailwind('border-0 pt-12 items-center flex-wrap')}
      onPress={props.onPress} testID='button_convert_mode_toggle'
    >
      <UTXOIcon height={64} width={64} />
      <ThemedViewV2
        style={tailwind('absolute bottom-0 w-8 h-8 rounded-full items-center justify-center right-0 -mr-4')}
        light={tailwind('bg-mono-light-v2-900')} dark={tailwind('bg-mono-dark-v2-900')}
      >
        <ThemedIcon
          iconType='MaterialCommunityIcons' name='arrow-u-left-top' size={20}
          light={tailwind('text-mono-dark-v2-900')} dark={tailwind('text-mono-light-v2-900')}
        />
      </ThemedViewV2>
    </ThemedTouchableOpacityV2>
  )
}

function ConversionLabel (props: { sourceUnit: string, targetUnit: string }): JSX.Element {
  return (
    <View style={tailwind('mt-1 flex-row items-center')}>
      <ThemedTextV2
        style={tailwind('font-normal-v2 text-xs')} testID='convert_source'
        light={tailwind('text-mono-light-v2-700')} dark={tailwind('text-mono-dark-v2-700')}
      >
        {`(${translate('screens/ConvertScreen', props.sourceUnit)}`}
      </ThemedTextV2>
      <ThemedIcon
        iconType='Feather' name='arrow-right' style={tailwind('px-1')}
        light={tailwind('text-mono-light-v2-700')} dark={tailwind('text-mono-dark-v2-700')}
      />
      <ThemedTextV2
        style={tailwind('font-normal-v2 text-xs')} testID='convert_target'
        light={tailwind('text-mono-light-v2-700')} dark={tailwind('text-mono-dark-v2-700')}
      >
        {`${translate('screens/ConvertScreen', props.targetUnit)})`}
      </ThemedTextV2>
    </View>
  )
}

function ConversionResultCard (props: { unit: string | undefined, oriTargetAmount: string, totalTargetAmount: string }): JSX.Element {
  return (
    <ThemedViewV2
      style={tailwind('flex-col w-full p-5 mt-6 rounded-lg-v2 border-0.5')} testID='convert_result_card'
      light={tailwind('border-mono-light-v2-300')} dark={tailwind('border-mono-dark-v2-300')}
    >
      <ThemedViewV2
        style={tailwind('flex-row border-b-0.5 items-center pb-5')}
        light={tailwind('border-mono-light-v2-300')} dark={tailwind('border-mono-dark-v2-300')}
      >
        <ThemedTextV2
          style={tailwind('font-normal-v2 text-sm pr-2')} testID='convert_available_label'
          light={tailwind('text-mono-light-v2-500')} dark={tailwind('text-mono-dark-v2-500')}
        >
          {`${translate('screens/ConvertScreen', 'Available {{unit}}', { unit: props.unit })}`}
        </ThemedTextV2>
        <ThemedTextV2
          style={tailwind('flex-1 font-normal-v2 text-sm text-right')} testID='convert_available_amount'
          light={tailwind('text-mono-light-v2-800')} dark={tailwind('text-mono-dark-v2-800')}
        >
          {new BigNumber(props.oriTargetAmount).toFixed(8)}
        </ThemedTextV2>
      </ThemedViewV2>
      <ThemedViewV2 style={tailwind('flex-row items-center pt-5')}>
        <ThemedTextV2
          style={tailwind('font-normal-v2 text-sm pr-2')} testID='convert_resulting_label'
          light={tailwind('text-mono-light-v2-500')} dark={tailwind('text-mono-dark-v2-500')}
        >
          {`${translate('screens/ConvertScreen', 'Resulting {{unit}}', { unit: props.unit })}`}
        </ThemedTextV2>
        <ThemedTextV2
          style={tailwind('flex-1 font-semibold-v2 text-sm text-right')} testID='convert_result_amount'
          light={tailwind('text-mono-light-v2-800')} dark={tailwind('text-mono-dark-v2-800')}
        >
          {/* {BigNumber.maximum(new BigNumber(props.targetAmount).plus(props.convertAmount), 0).toFixed(8)} */}
          {/* {new BigNumber(props.totalTargetAmount).toFixed(8)} */}
          {props.totalTargetAmount}
        </ThemedTextV2>
      </ThemedViewV2>
    </ThemedViewV2>
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

function getDisplayUnit (unit?: string): string | undefined {
  if (unit === 'Token') {
    return 'tokens'
  }
  return unit
}
