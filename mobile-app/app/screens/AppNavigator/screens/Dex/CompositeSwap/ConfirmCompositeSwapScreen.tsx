import React, { Dispatch, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { tailwind } from '@tailwind'
import { StackScreenProps } from '@react-navigation/stack'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import BigNumber from 'bignumber.js'
import { RootState } from '@store'
import { firstTransactionSelector, hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { translate } from '@translations'
import { hasTxQueued, transactionQueue } from '@store/transaction_queue'
import { CompositeSwap, CTransactionSegWit } from '@defichain/jellyfish-transaction'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { onTransactionBroadcast } from '@api/transaction/transaction_commands'
import { NativeLoggingProps, useLogger } from '@shared-contexts/NativeLoggingProvider'
import { ThemedIcon, ThemedScrollView, ThemedSectionTitle, ThemedView } from '@components/themed'
import { TextRow } from '@components/TextRow'
import { NumberRow } from '@components/NumberRow'
import { FeeInfoRow } from '@components/FeeInfoRow'
import { PricesSection } from './components/PricesSection'
import { TransactionResultsRow } from '@components/TransactionResultsRow'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { SummaryTitle } from '@components/SummaryTitle'
import { getNativeIcon } from '@components/icons/assets'
import { DerivedTokenState } from './CompositeSwapScreen'
import { DexParamList } from '../DexNavigator'

type Props = StackScreenProps<DexParamList, 'ConfirmCompositeSwapScreen'>
export interface CompositeSwapForm {
  tokenFrom: DerivedTokenState
  tokenTo: DerivedTokenState
  amountFrom: BigNumber
  amountTo: BigNumber
}

export function ConfirmCompositeSwapScreen ({ route }: Props): JSX.Element {
  const {
    fee,
    pairs,
    priceRates,
    slippage,
    tokenA,
    tokenB,
    swap
  } = route.params
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const dispatch = useDispatch()
  const logger = useLogger()
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const currentBroadcastJob = useSelector((state: RootState) => firstTransactionSelector(state.ocean))

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOnPage, setIsOnPage] = useState<boolean>(true)

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
    console.log({ swap })
    await constructSignedSwapAndSend(swap, pairs, slippage, dispatch, () => {
      onTransactionBroadcast(isOnPage, navigation.dispatch)
    }, logger)
    setIsSubmitting(false)
  }

  function getSubmitLabel (): string {
    if (!hasPendingBroadcastJob && !hasPendingJob) {
      return 'CONFIRM SWAP'
    }
    if (hasPendingBroadcastJob && currentBroadcastJob !== undefined && currentBroadcastJob.submitButtonLabel !== undefined) {
      return currentBroadcastJob.submitButtonLabel
    }
    return 'SWAPPING'
  }

  function onCancel (): void {
    if (!isSubmitting) {
      navigation.navigate({
        name: 'CompositeSwap',
        params: {},
        merge: true
      })
    }
  }

  return (
    <ThemedScrollView style={tailwind('pb-4')}>
      <ThemedView
        dark={tailwind('bg-gray-800 border-b border-gray-700')}
        light={tailwind('bg-white border-b border-gray-300')}
        style={tailwind('flex-col px-4 py-8')}
      >
        <SummaryTitle
          amount={swap.amountFrom}
          suffixType='component'
          testID='text_swap_amount'
          title={translate('screens/ConfirmCompositePoolSwapScreen', 'You are swapping')}
        >
          <TokenAIcon height={24} width={24} style={tailwind('ml-1')} />
          <ThemedIcon iconType='MaterialIcons' name='arrow-right-alt' size={24} style={tailwind('px-1')} />
          <TokenBIcon height={24} width={24} />
        </SummaryTitle>
      </ThemedView>

      <ThemedSectionTitle
        testID='title_tx_detail'
        text={translate('screens/ConfirmCompositePoolSwapScreen', 'TRANSACTION DETAILS')}
      />
      <TextRow
        lhs={translate('screens/ConfirmCompositePoolSwapScreen', 'Transaction type')}
        rhs={{
          value: translate('screens/ConfirmCompositePoolSwapScreen', 'Swap'),
          testID: 'text_transaction_type'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <NumberRow
        lhs={translate('screens/ConfirmCompositePoolSwapScreen', 'Estimated to receive')}
        rhs={{
          testID: 'estimated_to_receive',
          value: swap.amountTo.toFixed(8),
          suffixType: 'text',
          suffix: swap.tokenTo.displaySymbol
        }}
      />
      <FeeInfoRow
        type='ESTIMATED_FEE'
        value={fee.toFixed(8)}
        testID='text_fee'
        suffix='DFI'
      />
      <NumberRow
        lhs={translate('screens/ConfirmCompositePoolSwapScreen', 'Slippage Tolerance')}
        rhs={{
          value: new BigNumber(slippage).times(100).toFixed(),
          suffix: '%',
          testID: 'slippage_fee',
          suffixType: 'text'
        }}
      />
      <PricesSection priceRates={priceRates} sectionTitle='PRICE DETAILS' />
      <TransactionResultsRow
        tokens={[
          {
            symbol: tokenA.displaySymbol,
            value: BigNumber.max(new BigNumber(tokenA.amount).minus(swap.amountFrom), 0).toFixed(8),
            suffix: tokenA.displaySymbol
          },
          {
            symbol: tokenB.displaySymbol,
            value: BigNumber.max(new BigNumber(tokenB.amount).plus(swap.amountTo), 0).toFixed(8),
            suffix: tokenB.displaySymbol
          }
        ]}
      />
      <SubmitButtonGroup
        isDisabled={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/ConfirmCompositePoolSwapScreen', 'CONFIRM SWAP')}
        isProcessing={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
        processingLabel={translate('screens/PoolSwapConfirmScreen', getSubmitLabel())}
        onCancel={onCancel}
        onSubmit={onSubmit}
        title='swap'
      />
    </ThemedScrollView>
  )
}

async function constructSignedSwapAndSend (
  cSwapForm: CompositeSwapForm,
  pairs: PoolPairData[],
  slippage: number,
  dispatch: Dispatch<any>,
  onBroadcast: () => void,
  logger: NativeLoggingProps
): Promise<void> {
  try {
    const maxPrice = cSwapForm.amountFrom.div(cSwapForm.amountTo).times(1 + slippage).decimalPlaces(8)
    const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
      const builder = account.withTransactionBuilder()
      const script = await account.getScript()
      const swap: CompositeSwap = {
        poolSwap: {
          fromScript: script,
          toScript: script,
          fromTokenId: Number(cSwapForm.tokenFrom.id === '0_unified' ? '0' : cSwapForm.tokenFrom.id),
          toTokenId: Number(cSwapForm.tokenTo.id === '0_unified' ? '0' : cSwapForm.tokenTo.id),
          fromAmount: cSwapForm.amountFrom,
          maxPrice
        },
        pools: pairs.map(pair => ({ id: Number(pair.id) }))
      }
      const dfTx = await builder.dex.compositeSwap(swap, script)

      return new CTransactionSegWit(dfTx)
    }

    dispatch(transactionQueue.actions.push({
      sign: signer,
      title: translate('screens/CompositeSwapConfirmScreen', 'Swapping Token'),
      description: translate('screens/CompositeSwapConfirmScreen', 'Swapping {{amountA}} {{symbolA}} to {{amountB}} {{symbolB}}', {
        amountA: cSwapForm.amountFrom.toFixed(8),
        symbolA: cSwapForm.tokenFrom.displaySymbol,
        amountB: cSwapForm.amountTo.toFixed(8),
        symbolB: cSwapForm.tokenTo.displaySymbol
      }),
      onBroadcast
    }))
  } catch (e) {
    logger.error(e)
  }
}
