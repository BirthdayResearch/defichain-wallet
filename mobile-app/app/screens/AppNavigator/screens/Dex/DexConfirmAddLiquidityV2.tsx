import { CTransactionSegWit } from '@defichain/jellyfish-transaction'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { View } from 'react-native'
import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Dispatch } from 'redux'
import { SubmitButtonGroupV2 } from '@components/SubmitButtonGroupV2'
import { ThemedScrollViewV2, ThemedViewV2 } from '@components/themed'
import { RootState } from '@store'
import { firstTransactionSelector, hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued, transactionQueue } from '@store/transaction_queue'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { DexParamList } from './DexNavigator'
import { onTransactionBroadcast } from '@api/transaction/transaction_commands'
import { useAppDispatch } from '@hooks/useAppDispatch'
import { SummaryTitleV2 } from '@components/SummaryTitleV2'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useAddressLabel } from '@hooks/useAddressLabel'
import { NativeLoggingProps, useLogger } from '@shared-contexts/NativeLoggingProvider'
import { NumberRowV2 } from '@components/NumberRowV2'
import { useTokenPrice } from '../Portfolio/hooks/TokenPrice'

type Props = StackScreenProps<DexParamList, 'ConfirmAddLiquidity'>

export function ConfirmAddLiquidityScreenV2 ({ route }: Props): JSX.Element {
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const currentBroadcastJob = useSelector((state: RootState) => firstTransactionSelector(state.ocean))
  const {
    fee,
    percentage,
    tokenAAmount,
    tokenBAmount,
  } = route.params.summary
  const pair = route.params.pair
  const { conversion, pairInfo } = route.params
  const dispatch = useAppDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const lmTokenAmount = percentage.times(pair.totalLiquidity.token)
  const [isOnPage, setIsOnPage] = useState<boolean>(true)
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const logger = useLogger()
  const { address } = useWalletContext()
  const addressLabel = useAddressLabel(address)
  const { getTokenPrice } = useTokenPrice()

  const getUSDValue = (
    amount: BigNumber,
    symbol: string,
    isLPs: boolean = false
  ): BigNumber => {
    return getTokenPrice(symbol, amount, isLPs)
  }

  useEffect(() => {
    setIsOnPage(true)
    return () => {
      setIsOnPage(false)
    }
  }, [])

  async function addLiquidity(): Promise<void> {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }
    setIsSubmitting(true)
    await constructSignedAddLiqAndSend(
      {
        tokenASymbol: pair.tokenA.displaySymbol,
        tokenAId: Number(pair.tokenA.id),
        tokenAAmount,
        tokenBSymbol: pair.tokenB.displaySymbol,
        tokenBId: Number(pair.tokenB.id),
        tokenBAmount
      },
      dispatch,
      () => {
        onTransactionBroadcast(isOnPage, navigation.dispatch)
      },
      logger
    )
    setIsSubmitting(false)
  }

  function onCancel(): void {
    if (!isSubmitting) {
      navigation.navigate({
        name: 'AddLiquidity',
        params: { pair, pairInfo },
        merge: true
      })
    }
  }

  return (
    <ThemedScrollViewV2 style={tailwind('py-8 px-5')}>
      <ThemedViewV2
        dark={tailwind('bg-mono-dark-v2-100')}
        light={tailwind('bg-mono-light-v2-100')}
        style={tailwind('flex-col px-4 py-4 mb-4')}
      >
        <SummaryTitleV2
          iconA={pair.tokenA.displaySymbol}
          iconB={pair.tokenB.displaySymbol}
          fromAddress={address}
          amount={lmTokenAmount}
          testID='text_remove_amount'
          title={translate('screens/ConfirmAddLiquidity', 'You will receive LP tokens')}
          fromAddressLabel={addressLabel}
        />
      </ThemedViewV2>

      {conversion?.isConversionRequired === true && (
        <ThemedViewV2
          dark={tailwind('bg-mono-dark-v2-100 border-t-0.5 border-gray-700')}
          light={tailwind('bg-mono-light-v2-100 border-t-0.5 border-gray-300')}
          style={tailwind('py-5')}
        >
          <NumberRowV2
            lhs={{
              value: translate('screens/RemoveLiquidity', 'Amount to convert'),
              testID: 'transaction_fee',
              themedProps: {
                light: tailwind('text-mono-light-v2-500'),
                dark: tailwind('text-mono-dark-v2-500'),
              }
            }}
            rhs={{
              value: lmTokenAmount.toFixed(8),
              testID: `${pair.tokenA.displaySymbol}_to_supply`,
            }}
          />
        </ThemedViewV2>
      )}

      <ThemedViewV2
        dark={tailwind('bg-mono-dark-v2-100 border-t-0.5 border-gray-700')}
        light={tailwind('bg-mono-light-v2-100 border-t-0.5 border-gray-300')}
        style={tailwind('py-5')}
      >
        <View style={tailwind('mb-6')}>
          <NumberRowV2
            lhs={{
              value: translate('screens/RemoveLiquidity', 'Transaction fee'),
              testID: 'transaction_fee',
              themedProps: {
                light: tailwind('text-mono-light-v2-500'),
                dark: tailwind('text-mono-dark-v2-500'),
              }
            }}
            rhs={{
              value: `${fee.toFixed(8)} DFI`,
              testID: `${pair.tokenA.displaySymbol}_to_supply`,
              suffix: 'DFI'
            }}
          />
        </View>
        <NumberRowV2
          lhs={{
            value: translate('screens/RemoveLiquidity', 'Resulting pool share'),
            testID: 'transaction_fee',
            themedProps: {
              light: tailwind('text-mono-light-v2-500'),
              dark: tailwind('text-mono-dark-v2-500'),
            }
          }}
          rhs={{
            value: percentage.times(100).toFixed(8),
            testID: `${pair.tokenA.displaySymbol}_to_supply`,
            suffix: '%'
          }}
        />
      </ThemedViewV2>
      <ThemedViewV2
        dark={tailwind('bg-mono-dark-v2-100 border-t-0.5 border-b-0.5 border-gray-700')}
        light={tailwind('bg-mono-light-v2-100 border-t-0.5 border-b-0.5 border-gray-300')}
        style={tailwind('py-5')}
      >
        <NumberRowV2
          lhs={{
            value: translate('screens/RemoveLiquidity', '{{token}} to supply', {
              token: pair.tokenA.displaySymbol
            }),
            testID: `${pair.tokenA.displaySymbol}_token_to_supply`,
            themedProps: {
              light: tailwind('text-mono-light-v2-500'),
              dark: tailwind('text-mono-dark-v2-500'),
            }
          }}
          rhs={{
            value: BigNumber.max(tokenAAmount, 0).toFixed(8),
            testID: `${pair.tokenA.displaySymbol}_to_supply`,
            usdAmount: getUSDValue(tokenAAmount, pair.tokenA.displaySymbol)
          }}
        />
        <NumberRowV2
          lhs={{
            value: translate('screens/RemoveLiquidity', '{{token}} to supply', {
              token: pair.tokenB.displaySymbol
            }),
            testID: `${pair.tokenB.displaySymbol}_token_to_supply`,
            themedProps: {
              light: tailwind('text-mono-light-v2-500'),
              dark: tailwind('text-mono-dark-v2-500'),
            }
          }}
          rhs={{
            value: BigNumber.max(tokenBAmount, 0).toFixed(8),
            testID: `${pair.tokenB.displaySymbol}_to_supply`,
            usdAmount: getUSDValue(tokenBAmount, pair.tokenB.displaySymbol)
          }}
        />
        <NumberRowV2
          lhs={{
            value: translate('screens/RemoveLiquidity', 'Resulting LP tokens'),
            testID: 'resulting_LP_tokens',
            themedProps: {
              light: tailwind('text-mono-light-v2-500'),
              dark: tailwind('text-mono-dark-v2-500'),
            }
          }}
          rhs={{
            value: BigNumber.max(tokenBAmount, 0).toFixed(8),
            testID: 'resulting_LP_tokens_value',
            usdAmount: new BigNumber(lmTokenAmount),
            themedProps: {
              style: tailwind('font-bold-v2')
            }
          }}
        />
      </ThemedViewV2>

      <View style={tailwind('py-14')}>
        <SubmitButtonGroupV2
          isDisabled={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
          label={translate('screens/ConfirmRemoveLiquidity', 'Add liquidity')}
          isProcessing={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
          processingLabel={translate('screens/ConfirmRemoveLiquidity', 'REMOVING')}
          onSubmit={addLiquidity}
          onCancel={onCancel}
          displayCancelBtn
          title='remove'
        />
      </View>
    </ThemedScrollViewV2>
  )
}

async function constructSignedAddLiqAndSend (
  addLiqForm: { tokenASymbol: string, tokenAId: number, tokenAAmount: BigNumber, tokenBSymbol: string, tokenBId: number, tokenBAmount: BigNumber },
  dispatch: Dispatch<any>,
  onBroadcast: () => void,
  logger: NativeLoggingProps
): Promise<void> {
  try {
    const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
      const builder = account.withTransactionBuilder()
      const script = await account.getScript()

      const addLiq = {
        from: [{
          script,
          balances: [
            {
              token: addLiqForm.tokenAId,
              amount: addLiqForm.tokenAAmount
            },
            {
              token: addLiqForm.tokenBId,
              amount: addLiqForm.tokenBAmount
            }
          ]
        }],
        shareAddress: script
      }

      const dfTx = await builder.liqPool.addLiquidity(addLiq, script)
      return new CTransactionSegWit(dfTx)
    }

    dispatch(transactionQueue.actions.push({
      sign: signer,
      title: translate('screens/ConfirmAddLiq', 'Adding Liquidity'),
      description: translate('screens/ConfirmAddLiq', 'Adding {{amountA}} {{symbolA}} - {{amountB}} {{symbolB}}', {
        amountA: addLiqForm.tokenAAmount.toFixed(8),
        symbolA: addLiqForm.tokenASymbol,
        amountB: addLiqForm.tokenBAmount.toFixed(8),
        symbolB: addLiqForm.tokenBSymbol
      }),
      onBroadcast
    }))
  } catch (e) {
    logger.error(e)
  }
}
