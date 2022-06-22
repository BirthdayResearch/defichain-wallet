import { useEffect, useMemo, useState } from 'react'
import { Platform, StyleProp, ViewStyle } from 'react-native'
import BigNumber from 'bignumber.js'
import Slider from '@react-native-community/slider'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { View } from '@components'
import { getNativeIcon } from '@components/icons/assets'
import { ThemedIcon, ThemedScrollView, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { WalletTextInput } from '@components/WalletTextInput'
import { PortfolioParamList } from '../PortfolioNavigator'
import { NumberRow } from '@components/NumberRow'
import { useTokenPrice } from '../hooks/TokenPrice'
import { InfoRow, InfoType } from '@components/InfoRow'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { hasTxQueued } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { RootState } from '@store'
import { useSelector } from 'react-redux'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useFutureSwapDate } from '../../Dex/hook/FutureSwap'

type Props = StackScreenProps<PortfolioParamList, 'WithdrawFutureSwapScreen'>

export function WithdrawFutureSwapScreen (props: Props): JSX.Element {
  const { futureSwap: { source, destination }, executionBlock } = props.route.params
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>()
  const client = useWhaleApiClient()
  const logger = useLogger()
  const { getTokenPrice } = useTokenPrice()
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const blockCount = useSelector((state: RootState) => state.block.count ?? 0)
  const { isEnded } = useFutureSwapDate(executionBlock, blockCount)
  const [amountToWithdraw, setAmountToWithdraw] = useState('0')
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))

  useEffect(() => {
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error)
  }, [])

  const { remainingAmount, remainingAmountInUSD } = useMemo(() => {
    return {
      remainingAmount: new BigNumber(source.amount).minus(BigNumber.max(amountToWithdraw, 0)).toFixed(8),
      remainingAmountInUSD: getTokenPrice(source.symbol, new BigNumber(source.amount).minus(BigNumber.max(amountToWithdraw, 0)), false)
    }
  }, [source, amountToWithdraw])

  const onAmountChange = (amount: string): void => {
    setAmountToWithdraw(amount)
  }

  const onSubmit = async (): Promise<void> => {
    navigation.navigate({
      name: 'ConfirmWithdrawFutureSwapScreen',
      params: {
        source: {
          amountToWithdraw: new BigNumber(amountToWithdraw),
          remainingAmount: new BigNumber(remainingAmount),
          remainingAmountInUSD: new BigNumber(remainingAmountInUSD),
          displaySymbol: source.displaySymbol,
          tokenId: source.tokenId,
          isLoanToken: source.isLoanToken
        },
        destination: {
          tokenId: destination.tokenId
        },
        fee,
        executionBlock
      },
      merge: true
    })
  }

  const rowStyle = {
    lhsThemedProps: {
      light: tailwind('text-gray-500'),
      dark: tailwind('text-gray-400')
    },
    rhsThemedProps: {
      light: tailwind('text-gray-900'),
      dark: tailwind('text-gray-50')
    }
  }

  return (
    <ThemedScrollView>
      <View style={tailwind('flex flex-row mt-3 mx-2')}>
        <TokenSelection
          label={translate('screens/WithdrawFutureSwapScreen', 'FROM')}
          symbol={source.displaySymbol}
        />
        <TokenSelection
          label={translate('screens/WithdrawFutureSwapScreen', 'TO')}
          symbol={destination.displaySymbol}
        />
      </View>

      <AmountSlider
        current={Number(amountToWithdraw)}
        maxValue={Number(source.amount)}
        onChange={onAmountChange}
        viewStyle={tailwind('p-4 mx-4 mt-4 rounded-t flex flex-col')}
      />
      <ThemedView
        dark={tailwind('bg-gray-800')}
        light={tailwind('bg-white')}
        style={tailwind('flex-row px-4 pb-4 mx-4 items-stretch rounded-b')}
      >
        <WalletTextInput
          inputType='numeric'
          onChange={(event) => {
            setAmountToWithdraw(event.nativeEvent.text)
          }}
          testID='text_input_percentage'
          placeholder={translate('screens/WithdrawFutureSwapScreen', 'Enter an amount')}
          value={amountToWithdraw}
          keyboardType='numeric'
          containerStyle='w-full'
          style={tailwind('flex-grow')}
          inlineText={{
            type: 'helper',
            text: <HelperText displayedValue={new BigNumber(amountToWithdraw).isNaN() ? '0' : amountToWithdraw} />
          }}
          displayClearButton
        >
          <TokenIcon icon={source.displaySymbol} />
        </WalletTextInput>
      </ThemedView>

      {!new BigNumber(amountToWithdraw).isNaN() && !new BigNumber(amountToWithdraw).isZero() &&
        <ThemedView
          dark={tailwind('bg-gray-800')}
          light={tailwind('bg-white')}
          style={tailwind('m-4 items-stretch rounded-b')}
        >
          <NumberRow
            lhs={translate('screens/WithdrawFutureSwapScreen', 'Amount to withdraw')}
            rhs={{
              value: new BigNumber(amountToWithdraw).toFixed(8),
              testID: 'text_amount_to_withdraw',
              suffixType: 'text',
              suffix: source.displaySymbol
            }}
            lhsThemedProps={rowStyle.lhsThemedProps}
            rhsThemedProps={rowStyle.rhsThemedProps}
            rhsUsdAmount={getTokenPrice(source.symbol, new BigNumber(amountToWithdraw), false)}
          />
          <NumberRow
            lhs={translate('screens/WithdrawFutureSwapScreen', 'Remaining amount')}
            rhs={{
              value: remainingAmount,
              testID: 'text_remaining_amount',
              suffixType: 'text',
              suffix: source.displaySymbol
            }}
            rhsUsdAmount={remainingAmountInUSD}
            lhsThemedProps={rowStyle.lhsThemedProps}
            rhsThemedProps={rowStyle.rhsThemedProps}
          />
          <InfoRow
            type={InfoType.EstimatedFee}
            value={fee.toFixed(8)}
            testID='text_fee'
            suffix='DFI'
            containerStyle={{
              style: tailwind('rounded-b p-4 flex-row items-start w-full'),
              dark: tailwind('bg-gray-800'),
              light: tailwind('bg-white')
            }}
            lhsThemedProps={rowStyle.lhsThemedProps}
            rhsThemedProps={rowStyle.rhsThemedProps}
          />
        </ThemedView>}

      <View style={tailwind('mb-2')}>
        <SubmitButtonGroup
          isDisabled={hasPendingJob || hasPendingBroadcastJob || new BigNumber(amountToWithdraw).isNaN() || new BigNumber(amountToWithdraw).isZero() || isEnded}
          label={translate('screens/WithdrawFutureSwapScreen', 'CONTINUE')}
          processingLabel={translate('screens/WithdrawFutureSwapScreen', 'CONTINUE')}
          onSubmit={onSubmit}
          title='submit'
          isProcessing={hasPendingJob || hasPendingBroadcastJob}
          displayCancelBtn={false}
        />
      </View>
    </ThemedScrollView>
  )
}

function TokenSelection (props: { symbol?: string, label: string }): JSX.Element {
  const Icon = getNativeIcon(props.symbol ?? '')
  return (
    <View style={[tailwind('flex-grow mx-2'), { flexBasis: 0 }]}>
      <ThemedText
        dark={tailwind('text-gray-400')}
        light={tailwind('text-gray-500')}
        style={tailwind('text-xs pb-1')}
      >{props.label}
      </ThemedText>
      <ThemedTouchableOpacity
        testID={`token_select_button_${props.label}`}
        dark={tailwind('bg-gray-600 text-gray-500 border-0')}
        light={tailwind('bg-gray-200 border-0')}
        style={tailwind('flex flex-row items-center border rounded p-3')}
        disabled
      >
        {props.symbol === undefined &&
          <ThemedText
            dark={tailwind('text-gray-400')}
            light={tailwind('text-gray-500')}
            style={tailwind('text-sm leading-6')}
          >
            {translate('screens/WithdrawFutureSwapScreen', 'Select token')}
          </ThemedText>}

        {props.symbol !== undefined &&
          <>
            <Icon testID='tokenA_icon' height={17} width={17} />
            <ThemedText
              style={tailwind('ml-2')}
              dark={tailwind('text-gray-400')}
              light={tailwind('text-gray-500')}
            >{props.symbol}
            </ThemedText>
          </>}
        <ThemedIcon
          iconType='MaterialIcons'
          name='unfold-more'
          size={20}
          dark={tailwind('text-gray-400')}
          light={tailwind('text-gray-500')}
          style={[tailwind('text-center mt-0.5'), { marginLeft: 'auto' }]}
        />
      </ThemedTouchableOpacity>
    </View>
  )
}

function AmountSlider (props: { current: number, maxValue: number, onChange: (percentage: string) => void, viewStyle: StyleProp<ViewStyle> }): JSX.Element {
  return (
    <ThemedView
      dark={tailwind('bg-gray-800')}
      light={tailwind('bg-white')}
      style={props.viewStyle}
    >
      <Slider
        maximumValue={props.maxValue}
        minimumTrackTintColor='#ff00af'
        minimumValue={0}
        onSlidingComplete={(val) => props.onChange(new BigNumber(val).toFixed(8))}
        testID='slider_future_swap_screen'
        thumbTintColor='#ff00af'
        value={isNaN(props.current) ? 0 : props.current}
        style={tailwind({
          '-mb-2': Platform.OS !== 'web'
        })}
      />
      <View
        style={tailwind('flex flex-row justify-between mt-1')}
      >
        <ThemedText
          style={tailwind('text-xs')}
          dark={tailwind('text-gray-400')}
          light={tailwind('text-gray-500')}
        >0
        </ThemedText>
        <ThemedText
          style={tailwind('text-xs')}
          dark={tailwind('text-gray-400')}
          light={tailwind('text-gray-500')}
        >{props.maxValue.toFixed(8)}
        </ThemedText>
      </View>
    </ThemedView>
  )
}

function HelperText (props: { displayedValue: string }): JSX.Element {
  return (
    <ThemedView
      light={tailwind('bg-transparent')}
      dark={tailwind('bg-transparent')}
      style={tailwind('flex-row mt-2')}
    >
      <ThemedText
        style={tailwind('text-sm')}
        dark={tailwind('text-gray-400')}
        light={tailwind('text-gray-500')}
      >{`${translate('screens/WithdrawFutureSwapScreen', 'You are withdrawing')} `}
      </ThemedText>
      <ThemedText
        style={tailwind('text-sm font-semibold')}
        dark={tailwind('text-white')}
        light={tailwind('text-black')}
        testID='displayed_withdraw_amount'
      >{new BigNumber(props.displayedValue).toFixed(8)}
      </ThemedText>
    </ThemedView>
  )
}

export function TokenIcon (props: {
  icon: string
}): JSX.Element {
  const Icon = getNativeIcon(props.icon)

  return (
    <ThemedView
      dark={tailwind('bg-gray-800')}
      light={tailwind('bg-white')}
      style={tailwind('flex-row items-center mr-2')}
    >
      <Icon width={17} height={17} />
      <ThemedText
        style={tailwind('ml-1')}
      >
        {props.icon}
      </ThemedText>
    </ThemedView>
  )
}
