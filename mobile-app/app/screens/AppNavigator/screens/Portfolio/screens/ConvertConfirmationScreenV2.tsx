import { ThemedScrollViewV2, ThemedTextV2, ThemedViewV2 } from '@components/themed'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import { Dispatch, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued, transactionQueue } from '@store/transaction_queue'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { PortfolioParamList } from '../PortfolioNavigator'
import { ConversionMode } from './ConvertScreen'
import { NativeLoggingProps, useLogger } from '@shared-contexts/NativeLoggingProvider'
import { onTransactionBroadcast } from '@api/transaction/transaction_commands'
import { dfiConversionCrafter } from '@api/transaction/dfi_converter'
import { useAppDispatch } from '@hooks/useAppDispatch'
import { SummaryTitleV2 } from '@components/SummaryTitleV2'
import { SubmitButtonGroupV2 } from '@components/SubmitButtonGroupV2'
import { View } from 'react-native'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useAddressLabel } from '@hooks/useAddressLabel'
import { NumberRowV2 } from '@components/NumberRowV2'

type Props = StackScreenProps<PortfolioParamList, 'ConvertConfirmationScreen'>

export function ConvertConfirmationScreenV2 ({ route }: Props): JSX.Element {
  const {
    sourceUnit,
    sourceBalance,
    targetUnit,
    targetBalance,
    mode,
    amount,
    fee
  } = route.params
  const { address } = useWalletContext()
  const addressLabel = useAddressLabel(address)
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const dispatch = useAppDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>()
  const [isOnPage, setIsOnPage] = useState<boolean>(true)
  const logger = useLogger()

  useEffect(() => {
    setIsOnPage(true)
    return () => {
      setIsOnPage(false)
    }
  }, [])

  async function onSubmit (): Promise<void> {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }
    setIsSubmitting(true)
    await constructSignedConversionAndSend({
      mode,
      amount
    }, dispatch, () => {
      onTransactionBroadcast(isOnPage, navigation.dispatch)
    }, logger)
    setIsSubmitting(false)
  }

  function onCancel (): void {
    if (!isSubmitting) {
      navigation.navigate({
        name: 'Convert',
        params: {
          mode
        },
        merge: true
      })
    }
  }

  return (
    <ThemedScrollViewV2 style={tailwind('pb-4')}>
      <ThemedViewV2 style={tailwind('flex-col px-5 py-8')}>
        <SummaryTitleV2
          title={translate('screens/ConvertConfirmScreen', 'You are converting to {{unit}}', { unit: getDisplayUnit(targetUnit) })}
          amount={amount}
          testID='text_convert_amount'
          iconA='_UTXO'
          fromAddress={address}
          fromAddressLabel={addressLabel}
        />
        <NumberRowV2
          containerStyle={{
            style: tailwind('flex-row items-start w-full bg-transparent border-t-0.5 pt-5 mt-8'),
            light: tailwind('bg-transparent border-mono-light-v2-300'),
            dark: tailwind('bg-transparent border-mono-dark-v2-300')
          }}
          lhs={{
            value: translate('screens/ConvertConfirmScreen', 'Transaction fee'),
            testID: 'transaction_fee_label',
            themedProps: {
              light: tailwind('text-mono-light-v2-500'),
              dark: tailwind('text-mono-dark-v2-500')
            }
          }}
          rhs={{
            value: fee.toFixed(8),
            suffix: ' DFI',
            testID: 'transaction_fee_value',
            themedProps: {
              light: tailwind('text-mono-light-v2-900'),
              dark: tailwind('text-mono-dark-v2-900')
            }
          }}
        />

        <NumberRowV2
          containerStyle={{
            style: tailwind('flex-row items-start w-full bg-transparent mt-5'),
            light: tailwind('bg-transparent'),
            dark: tailwind('bg-transparent')
          }}
          lhs={{
            value: translate('screens/ConvertConfirmScreen', 'Resulting Tokens'),
            testID: 'resulting_tokens_label',
            themedProps: {
              light: tailwind('text-mono-light-v2-500'),
              dark: tailwind('text-mono-dark-v2-500')
            }
          }} rhs={{
          value: getResultingValue('Token', fee, sourceBalance, sourceUnit, targetBalance, targetUnit),
          suffix: ' DFI',
          testID: 'resulting_tokens_value',
          themedProps: {
            light: tailwind('text-mono-light-v2-900 font-semibold-v2'),
            dark: tailwind('text-mono-dark-v2-900 font-semibold-v2')
          }
        }}
        />

        <ThemedTextV2
          style={tailwind('w-full text-right text-sm font-normal-v2 mt-1')}
          light={tailwind('text-mono-light-v2-700')}
          dark={tailwind('text-mono-dark-v2-700')}
          testID='resulting_tokens_sub_value'
        >
          {
            `(${getResultingPercentage('Token', sourceBalance, sourceUnit, targetBalance)}%)`
          }
        </ThemedTextV2>

        <NumberRowV2
          containerStyle={{
            style: tailwind('flex-row items-start w-full bg-transparent mt-5'),
            light: tailwind('bg-transparent'),
            dark: tailwind('bg-transparent')
          }}
          lhs={{
            value: translate('screens/ConvertConfirmScreen', 'Resulting UTXO'),
            testID: 'resulting_utxo_label',
            themedProps: {
              light: tailwind('text-mono-light-v2-500'),
              dark: tailwind('text-mono-dark-v2-500')
            }
          }} rhs={{
          value: getResultingValue('UTXO', fee, sourceBalance, sourceUnit, targetBalance, targetUnit),
          suffix: ' DFI',
          testID: 'resulting_utxo_value',
          themedProps: {
            light: tailwind('text-mono-light-v2-900 font-semibold-v2'),
            dark: tailwind('text-mono-dark-v2-900 font-semibold-v2')
          }
        }}
        />

        <ThemedViewV2
          style={tailwind('w-full mt-1 pb-5 border-b-0.5')}
          light={tailwind('border-mono-light-v2-300')}
          dark={tailwind('border-mono-dark-v2-300')}
        >
          <ThemedTextV2
            style={tailwind('w-full text-right text-sm font-normal-v2')}
            light={tailwind('text-mono-light-v2-700')}
            dark={tailwind('text-mono-dark-v2-700')}
            testID='resulting_utxo_sub_value'
          >
            {
              `(${getResultingPercentage('UTXO', sourceBalance, sourceUnit, targetBalance)}%)`
            }
          </ThemedTextV2>
        </ThemedViewV2>

        <View style={tailwind('mt-20')}>
          <SubmitButtonGroupV2
            isDisabled={false}
            title='convert'
            label={translate('screens/ConvertConfirmScreen', 'Convert')}
            displayCancelBtn
            onSubmit={onSubmit}
            onCancel={onCancel}
          />
        </View>
      </ThemedViewV2>
    </ThemedScrollViewV2>
  )
}

async function constructSignedConversionAndSend ({
  mode,
  amount
}: { mode: ConversionMode, amount: BigNumber }, dispatch: Dispatch<any>, onBroadcast: () => void, logger: NativeLoggingProps): Promise<void> {
  try {
    dispatch(transactionQueue.actions.push(dfiConversionCrafter(amount, mode, onBroadcast)))
  } catch (e) {
    logger.error(e)
  }
}

function getResultingValue (desireUnit: string, fee: BigNumber, balanceA: BigNumber, unitA: string, balanceB: BigNumber, unitB: string): string {
  const balance = desireUnit === unitA ? balanceA : balanceB
  const unit = desireUnit === unitA ? unitA : unitB

  return BigNumber.max(balance.minus(unit === 'UTXO' ? fee : 0), 0).toFixed(8)
}

function getResultingPercentage (desireUnit: string, balanceA: BigNumber, unitA: string, balanceB: BigNumber): string {
  const amount = desireUnit === unitA ? balanceA : balanceB
  const totalAmount = balanceA.plus(balanceB)

  return new BigNumber(amount).div(totalAmount).multipliedBy(100).toFixed(2)
}

function getDisplayUnit (unit?: string): string | undefined {
  if (unit === 'Token') {
    return 'tokens'
  }
  return unit
}
