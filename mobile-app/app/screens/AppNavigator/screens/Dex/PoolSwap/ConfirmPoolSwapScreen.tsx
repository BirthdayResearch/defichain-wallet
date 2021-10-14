import { CTransactionSegWit, PoolSwap } from '@defichain/jellyfish-transaction/dist'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import React, { Dispatch, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NumberRow } from '@components/NumberRow'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { SummaryTitle } from '@components/SummaryTitle'
import { ThemedIcon, ThemedScrollView, ThemedSectionTitle } from '@components/themed'
import { RootState } from '@store'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued, transactionQueue } from '@store/transaction_queue'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { DexParamList } from '../DexNavigator'
import { DerivedTokenState } from './PoolSwapScreen'
import { getNativeIcon } from '@components/icons/assets'
import { EstimatedFeeInfo } from '@components/EstimatedFeeInfo'
import { NativeLoggingProps, useLogger } from '@shared-contexts/NativeLoggingProvider'
import { onTransactionBroadcast } from '@api/transaction/transaction_commands'

type Props = StackScreenProps<DexParamList, 'ConfirmPoolSwapScreen'>

export function ConfirmPoolSwapScreen ({ route }: Props): JSX.Element {
  const {
    tokenA,
    tokenB,
    fee,
    swap,
    pair,
    slippage,
    priceRateA,
    priceRateB
  } = route.params
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const dispatch = useDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const [isOnPage, setIsOnPage] = useState<boolean>(true)
  const logger = useLogger()
  const TokenAIcon = getNativeIcon(tokenA.displaySymbol)
  const TokenBIcon = getNativeIcon(tokenB.displaySymbol)

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
    await constructSignedSwapAndSend(swap, slippage, dispatch, () => {
      onTransactionBroadcast(isOnPage, navigation.dispatch)
    }, logger)
    setIsSubmitting(false)
  }

  function onCancel (): void {
    if (!isSubmitting) {
      navigation.navigate({
        name: 'PoolSwap',
        params: { pair },
        merge: true
      })
    }
  }

  return (
    <ThemedScrollView style={tailwind('pb-4')}>
      <SummaryTitle
        amount={swap.fromAmount}
        suffixType='component'
        testID='text_swap_amount'
        title={translate('screens/PoolSwapConfirmScreen', 'You are swapping')}
      >
        <TokenAIcon height={24} width={24} style={tailwind('ml-1')} />
        <ThemedIcon iconType='MaterialIcons' name='arrow-right-alt' size={24} style={tailwind('px-1')} />
        <TokenBIcon height={24} width={24} />
      </SummaryTitle>

      <ThemedSectionTitle
        testID='title_swap_detail'
        text={translate('screens/PoolSwapConfirmScreen', 'ESTIMATED BALANCE AFTER SWAP')}
      />
      <NumberRow
        lhs={translate('screens/PoolSwapConfirmScreen', '{{token}} balance', { token: tokenA.displaySymbol })}
        rhs={{
          testID: 'source_amount',
          value: BigNumber.max(new BigNumber(tokenA.amount).minus(swap.fromAmount), 0).toFixed(8),
          suffixType: 'text',
          suffix: tokenA.displaySymbol
        }}
      />
      <NumberRow
        lhs={translate('screens/PoolSwapConfirmScreen', '{{token}} balance', { token: tokenB.displaySymbol })}
        rhs={{
          testID: 'target_amount',
          value: BigNumber.max(new BigNumber(tokenB.amount).plus(swap.toAmount), 0).toFixed(8),
          suffixType: 'text',
          suffix: tokenB.displaySymbol
        }}
      />

      <ThemedSectionTitle
        testID='title_tx_detail'
        text={translate('screens/PoolSwapConfirmScreen', 'TRANSACTION DETAILS')}
      />

      <NumberRow
        lhs={translate('screens/PoolSwapConfirmScreen', 'Slippage Tolerance')}
        rhs={{
          value: new BigNumber(slippage).times(100).toFixed(),
          suffix: '%',
          testID: 'slippage_fee',
          suffixType: 'text'
        }}
      />
      <NumberRow
        lhs={translate('screens/PoolSwapConfirmScreen', '{{tokenA}} price per {{tokenB}}', {
          tokenA: tokenA.displaySymbol,
          tokenB: tokenB.displaySymbol
        })}
        rhs={{
          testID: 'price_a',
          value: priceRateA,
          suffixType: 'text',
          suffix: tokenA.displaySymbol
        }}
      />
      <NumberRow
        lhs={translate('screens/PoolSwapConfirmScreen', '{{tokenA}} price per {{tokenB}}', {
          tokenA: tokenB.displaySymbol,
          tokenB: tokenA.displaySymbol
        })}
        rhs={{
          testID: 'price_b',
          value: priceRateB,
          suffixType: 'text',
          suffix: tokenB.displaySymbol
        }}
      />

      <EstimatedFeeInfo
        lhs={translate('screens/PoolSwapConfirmScreen', 'Estimated fee')}
        rhs={{
          value: fee.toFixed(8),
          testID: 'text_fee',
          suffix: 'DFI (UTXO)'
        }}
      />

      <SubmitButtonGroup
        isDisabled={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/PoolSwapConfirmScreen', 'CONFIRM SWAP')}
        isSubmitting={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
        submittingLabel={translate('screens/PoolSwapConfirmScreen', 'SWAPPING')}
        onCancel={onCancel}
        onSubmit={onSubmit}
        title='swap'
      />
    </ThemedScrollView>
  )
}

export interface DexForm {
  fromToken: DerivedTokenState
  toToken: DerivedTokenState
  fromAmount: BigNumber
  toAmount: BigNumber
}

async function constructSignedSwapAndSend (
  dexForm: DexForm,
  slippage: number,
  dispatch: Dispatch<any>,
  onBroadcast: () => void,
  logger: NativeLoggingProps
): Promise<void> {
  try {
    const maxPrice = dexForm.fromAmount.div(dexForm.toAmount).times(1 + slippage).decimalPlaces(8)
    const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
      const builder = account.withTransactionBuilder()
      const script = await account.getScript()

      const swap: PoolSwap = {
        fromScript: script,
        toScript: script,
        fromTokenId: Number(dexForm.fromToken.id),
        toTokenId: Number(dexForm.toToken.id),
        fromAmount: dexForm.fromAmount,
        maxPrice
      }
      const dfTx = await builder.dex.poolSwap(swap, script)
      return new CTransactionSegWit(dfTx)
    }

    dispatch(transactionQueue.actions.push({
      sign: signer,
      title: translate('screens/PoolSwapConfirmScreen', 'Swapping Token'),
      description: translate('screens/PoolSwapConfirmScreen', 'Swapping {{amountA}} {{symbolA}} to {{amountB}} {{symbolB}}', {
        amountA: dexForm.fromAmount.toFixed(8),
        symbolA: dexForm.fromToken.displaySymbol,
        amountB: dexForm.toAmount.toFixed(8),
        symbolB: dexForm.toToken.displaySymbol
      }),
      onBroadcast
    }))
  } catch (e) {
    logger.error(e)
  }
}
